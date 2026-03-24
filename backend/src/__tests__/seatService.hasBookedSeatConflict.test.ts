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

jest.mock("../models/bookingpassenger.model", () => ({
  BookingPassenger: {
    find: jest.fn(),
  },
}));

jest.mock("../models/station.model", () => ({
  Station: {
    find: jest.fn(),
  },
}));

import { BookingPassenger } from "../models/bookingpassenger.model";
import { Station } from "../models/station.model";
import { hasBookedSeatConflict } from "../services/seat.service";

const mockedBookingPassenger = BookingPassenger as jest.Mocked<typeof BookingPassenger>;
const mockedStation = Station as jest.Mocked<typeof Station>;
const SCHEDULE_ID = "507f191e810c19729de860ea";

const createPopulateLeanQuery = (result: unknown) => {
  const query: any = {};
  query.populate = jest.fn().mockReturnValue(query);
  query.lean = jest.fn().mockResolvedValue(result);
  return query;
};

const createSelectLeanQuery = (result: unknown) => {
  const query: any = {};
  query.select = jest.fn().mockReturnValue(query);
  query.lean = jest.fn().mockResolvedValue(result);
  return query;
};

const makeBooking = (depStationId?: string | null, arrStationId?: string | null) => ({
  departure_station_id: depStationId,
  arrival_station_id: arrStationId,
});

describe("seat.service hasBookedSeatConflict", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test.each([
    ["J1 no booking passengers", [], [], 5, 9, false],
    [
      "J2 forward overlap",
      [{ booking_id: makeBooking("dep-5", "arr-8") }],
      [
        { _id: "dep-5", station_order: 5 },
        { _id: "arr-8", station_order: 8 },
      ],
      5,
      9,
      true,
    ],
    [
      "J3 no overlap",
      [{ booking_id: makeBooking("dep-1", "arr-3") }],
      [
        { _id: "dep-1", station_order: 1 },
        { _id: "arr-3", station_order: 3 },
      ],
      5,
      9,
      false,
    ],
    [
      "J4 adjacent only",
      [{ booking_id: makeBooking("dep-5", "arr-8") }],
      [
        { _id: "dep-5", station_order: 5 },
        { _id: "arr-8", station_order: 8 },
      ],
      8,
      12,
      false,
    ],
    ["J5 cancelled booking filtered out", [{ booking_id: null }], [], 5, 9, false],
    ["J6 booking populate miss", [{ booking_id: null }], [], 5, 9, false],
    [
      "J7 missing station in map",
      [{ booking_id: makeBooking("dep-x", "arr-x") }],
      [],
      5,
      9,
      false,
    ],
    [
      "J8 reverse overlap",
      [{ booking_id: makeBooking("dep-9", "arr-5") }],
      [
        { _id: "dep-9", station_order: 9 },
        { _id: "arr-5", station_order: 5 },
      ],
      8,
      3,
      true,
    ],
    [
      "J9 reverse disjoint",
      [{ booking_id: makeBooking("dep-9", "arr-8") }],
      [
        { _id: "dep-9", station_order: 9 },
        { _id: "arr-8", station_order: 8 },
      ],
      5,
      3,
      false,
    ],
    [
      "J10 one overlap among many",
      [
        { booking_id: makeBooking("dep-5", "arr-8") },
        { booking_id: makeBooking("dep-1", "arr-3") },
      ],
      [
        { _id: "dep-5", station_order: 5 },
        { _id: "arr-8", station_order: 8 },
        { _id: "dep-1", station_order: 1 },
        { _id: "arr-3", station_order: 3 },
      ],
      5,
      9,
      true,
    ],
  ])("%s", async (_name, bookingPassengers, stations, depOrder, arrOrder, expected) => {
    mockedBookingPassenger.find.mockReturnValue(
      createPopulateLeanQuery(bookingPassengers) as any
    );
    mockedStation.find.mockReturnValue(createSelectLeanQuery(stations) as any);

    await expect(
      hasBookedSeatConflict(SCHEDULE_ID, "507f1f77bcf86cd799439011", depOrder, arrOrder)
    ).resolves.toBe(expected);
  });
});
