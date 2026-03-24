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

import { rangesOverlap } from "../services/seat.service";

describe("rangesOverlap", () => {
  test.each([
    ["A1 identical", 5, 9, 5, 9, true],
    ["A2 B inside A", 5, 9, 6, 8, true],
    ["A3 A inside B", 6, 8, 5, 9, true],
    ["A4 overlap at start", 5, 8, 7, 12, true],
    ["A5 overlap at end", 7, 12, 5, 9, true],
    ["A6 adjacent", 5, 8, 8, 12, false],
    ["A7 disjoint A before B", 1, 5, 6, 9, false],
    ["A8 disjoint B before A", 6, 9, 1, 5, false],
    ["A9 empty range", 5, 5, 5, 9, false],
    ["B1 same reverse route", 9, 5, 9, 5, true],
    ["B2 forward vs reverse overlap", 5, 9, 8, 3, true],
    ["B3 reverse vs forward overlap", 8, 3, 5, 9, true],
    ["B4 reverse disjoint", 9, 8, 5, 3, false],
    ["B5 reverse overlap", 9, 5, 8, 3, true],
    ["B6 reverse adjacent", 9, 8, 8, 5, false],
    ["C1 bug case HP1 vs HP2", 9, 5, 8, 5, true],
    ["C2 reverse bug case", 5, 9, 5, 8, true],
    ["C3 no overlap HP1 after HP2", 9, 12, 5, 8, false],
    ["C4 no overlap HP1 before HP2", 1, 3, 5, 9, false],
    ["C5 one station touch only", 8, 9, 5, 8, false],
    ["C6 whole route vs sub-segment", 1, 15, 5, 9, true],
  ])("%s", (_name, depA, arrA, depB, arrB, expected) => {
    expect(rangesOverlap(depA, arrA, depB, arrB)).toBe(expected);
  });
});
