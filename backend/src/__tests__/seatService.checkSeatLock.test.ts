jest.mock("../config/redis", () => ({
  redisClient: {
    keys: jest.fn(),
    get: jest.fn(),
    sendCommand: jest.fn(),
    set: jest.fn(),
  },
}));

jest.mock("../config/socket", () => ({
  getIO: jest.fn(() => ({
    to: jest.fn(() => ({
      emit: jest.fn(),
    })),
  })),
}));

jest.mock("../models/seat.model", () => ({
  Seat: {
    findById: jest.fn(),
  },
}));

import { redisClient } from "../config/redis";
import {
  checkSeatLock,
  checkSeatLocksBulk,
} from "../services/seat.service";

const mockedRedis = redisClient as jest.Mocked<typeof redisClient>;
type LockQuery = {
  userId?: string;
  depOrder?: number;
  arrOrder?: number;
};

const makeLock = (overrides: Partial<Record<string, unknown>> = {}) => ({
  trainId: "train-1",
  scheduleId: "schedule-1",
  seatId: "seat-1",
  userId: "user-1",
  depOrder: 5,
  arrOrder: 8,
  expiresAt: Date.now() + 60_000,
  ...overrides,
});

describe("seat.service checkSeatLock/checkSeatLocksBulk", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("checkSeatLock", () => {
    it("D1 returns false when no lock exists", async () => {
      mockedRedis.keys.mockResolvedValue([]);

      await expect(checkSeatLock("train-1", "seat-1", undefined, 5, 9)).resolves.toBe(false);
    });

    it("D2 returns false when key exists but value is null", async () => {
      mockedRedis.keys.mockResolvedValue(["k1"]);
      mockedRedis.get.mockResolvedValue(null);

      await expect(checkSeatLock("train-1", "seat-1", undefined, 5, 9)).resolves.toBe(false);
    });

    it("D3 returns false when value is invalid JSON", async () => {
      mockedRedis.keys.mockResolvedValue(["k1"]);
      mockedRedis.get.mockResolvedValue("bad-json");

      await expect(checkSeatLock("train-1", "seat-1", undefined, 5, 9)).resolves.toBe(false);
    });

    test.each([
      [
        "E1 overlap without userId",
        [makeLock({ userId: "U2", depOrder: 5, arrOrder: 8 })],
        { depOrder: 5, arrOrder: 9 },
        true,
      ],
      [
        "E2 no overlap",
        [makeLock({ userId: "U2", depOrder: 1, arrOrder: 3 })],
        { depOrder: 5, arrOrder: 9 },
        false,
      ],
      [
        "E3 adjacent segments",
        [makeLock({ userId: "U2", depOrder: 5, arrOrder: 8 })],
        { depOrder: 8, arrOrder: 12 },
        false,
      ],
      [
        "E4 missing dep/arr fallback to locked",
        [makeLock({ userId: "U2", depOrder: 5, arrOrder: 8 })],
        {},
        true,
      ],
      [
        "E5 lock owned by querying user",
        [makeLock({ userId: "U1", depOrder: 5, arrOrder: 8 })],
        { userId: "U1", depOrder: 5, arrOrder: 9 },
        true,
      ],
      [
        "E6 lock owned by different user when querying own lock",
        [makeLock({ userId: "U2", depOrder: 5, arrOrder: 8 })],
        { userId: "U1", depOrder: 5, arrOrder: 9 },
        false,
      ],
      [
        "E7 multiple locks with one overlapping",
        [
          makeLock({ seatId: "seat-1", userId: "U2", depOrder: 5, arrOrder: 8 }),
          makeLock({ seatId: "seat-1", userId: "U3", depOrder: 1, arrOrder: 3 }),
        ],
        { depOrder: 5, arrOrder: 9 },
        true,
      ],
      [
        "E8 reverse overlap",
        [makeLock({ userId: "U2", depOrder: 9, arrOrder: 5 })],
        { depOrder: 8, arrOrder: 3 },
        true,
      ],
      [
        "E9 reverse disjoint",
        [makeLock({ userId: "U2", depOrder: 9, arrOrder: 8 })],
        { depOrder: 5, arrOrder: 3 },
        false,
      ],
    ])("%s", async (_name, records, query: LockQuery, expected) => {
      mockedRedis.keys.mockResolvedValue(records.map((_, index) => `key-${index}`));
      mockedRedis.get.mockImplementation(async (...args: any[]) => {
        const key = String(args[args.length - 1]);
        const index = Number(key.split("-").pop());
        return JSON.stringify(records[index]);
      });

      await expect(
        checkSeatLock(
          "train-1",
          "seat-1",
          query.userId as string | undefined,
          query.depOrder as number | undefined,
          query.arrOrder as number | undefined
        )
      ).resolves.toBe(expected);
    });
  });

  describe("checkSeatLocksBulk", () => {
    it("F1 returns mixed lock state for multiple seats", async () => {
      mockedRedis.keys.mockImplementation(async (...args: any[]) => {
        const pattern = String(args[args.length - 1]);
        if (pattern.includes(":seat-A:")) return ["key-a"];
        return [];
      });
      mockedRedis.get.mockResolvedValue(
        JSON.stringify(makeLock({ seatId: "seat-A", userId: "U2", depOrder: 5, arrOrder: 8 }))
      );

      await expect(
        checkSeatLocksBulk("train-1", ["seat-A", "seat-B", "seat-C"], 5, 9)
      ).resolves.toEqual({
        "seat-A": true,
        "seat-B": false,
        "seat-C": false,
      });
    });

    it("F2 returns empty object for empty seat list", async () => {
      await expect(checkSeatLocksBulk("train-1", [], 5, 9)).resolves.toEqual({});
    });

    it("F3 returns all locked when every seat overlaps", async () => {
      mockedRedis.keys.mockImplementation(async (...args: any[]) => {
        const pattern = String(args[args.length - 1]);
        if (pattern.includes(":seat-A:")) return ["key-a"];
        if (pattern.includes(":seat-B:")) return ["key-b"];
        return [];
      });
      mockedRedis.get.mockImplementation(async (...args: any[]) => {
        const key = String(args[args.length - 1]);
        if (key === "key-a") {
          return JSON.stringify(makeLock({ seatId: "seat-A", userId: "U2", depOrder: 5, arrOrder: 8 }));
        }

        return JSON.stringify(makeLock({ seatId: "seat-B", userId: "U3", depOrder: 6, arrOrder: 9 }));
      });

      await expect(checkSeatLocksBulk("train-1", ["seat-A", "seat-B"], 5, 9)).resolves.toEqual({
        "seat-A": true,
        "seat-B": true,
      });
    });
  });
});
