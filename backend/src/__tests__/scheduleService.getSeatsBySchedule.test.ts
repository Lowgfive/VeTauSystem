jest.mock("../models/schedule.model", () => ({
  Schedule: {
    findById: jest.fn(),
  },
}));

jest.mock("../models/booking.model", () => ({
  __esModule: true,
  default: {
    find: jest.fn(),
  },
}));

jest.mock("../models/bookingpassenger.model", () => ({
  BookingPassenger: {
    find: jest.fn(),
  },
}));

jest.mock("../models/station.model", () => ({
  Station: {
    findById: jest.fn(),
  },
}));

jest.mock("../services/train.service", () => ({
  getSeatsByTrain: jest.fn(),
}));

jest.mock("../services/seat.service", () => ({
  checkSeatLocksBulk: jest.fn(),
}));

import ScheduleService from "../services/schedule.service";
import { Schedule } from "../models/schedule.model";
import BookingModel from "../models/booking.model";
import { BookingPassenger } from "../models/bookingpassenger.model";
import { Station } from "../models/station.model";
import { getSeatsByTrain } from "../services/train.service";
import * as seatLockService from "../services/seat.service";

const mockedSchedule = Schedule as jest.Mocked<typeof Schedule>;
const mockedBookingModel = BookingModel as jest.Mocked<typeof BookingModel>;
const mockedBookingPassenger = BookingPassenger as jest.Mocked<typeof BookingPassenger>;
const mockedStation = Station as jest.Mocked<typeof Station>;
const mockedGetSeatsByTrain = getSeatsByTrain as jest.MockedFunction<typeof getSeatsByTrain>;
const mockedCheckSeatLocksBulk =
  seatLockService.checkSeatLocksBulk as jest.MockedFunction<typeof seatLockService.checkSeatLocksBulk>;

const createQuery = (result: unknown, methods: Array<"select" | "populate" | "sort" | "lean">) => {
  const query: any = {};

  for (const method of methods) {
    if (method === "lean") {
      query.lean = jest.fn().mockResolvedValue(result);
    } else {
      query[method] = jest.fn().mockReturnValue(query);
    }
  }

  return query;
};

const stationsById: Record<string, { _id: string; station_order: number }> = {
  "station-1": { _id: "station-1", station_order: 1 },
  "station-3": { _id: "station-3", station_order: 3 },
  "station-5": { _id: "station-5", station_order: 5 },
  "station-8": { _id: "station-8", station_order: 8 },
  "station-9": { _id: "station-9", station_order: 9 },
  "station-12": { _id: "station-12", station_order: 12 },
  "station-15": { _id: "station-15", station_order: 15 },
};

const seat = {
  _id: "seat-1",
  seat_number: "1A",
  carriage_id: "car-1",
  seat_type: "soft_seat",
};

const baseSeatMap = {
  carriages: [{ _id: "car-1" }],
  seatsByCarriage: {
    "car-1": [seat],
  },
};

const makeBookingPassenger = ({
  seatId = "seat-1",
  seatNumber = "1A",
  depStationId,
  arrStationId,
}: {
  seatId?: string;
  seatNumber?: string;
  depStationId: any;
  arrStationId: any;
}) => ({
  seat_id: { _id: seatId, seat_number: seatNumber },
  seatInfo: { seatNumber },
  booking_id: {
    _id: "booking-1",
    departure_station_id: depStationId,
    arrival_station_id: arrStationId,
  },
});

describe("ScheduleService.getSeatsBySchedule", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "warn").mockImplementation(() => {});

    mockedSchedule.findById.mockReturnValue(
      createQuery({ _id: "schedule-1", train_id: { _id: "train-1" } }, ["populate", "lean"]) as any
    );
    mockedGetSeatsByTrain.mockResolvedValue(baseSeatMap as any);
    mockedCheckSeatLocksBulk.mockResolvedValue({ "seat-1": false });
    mockedBookingModel.find.mockReturnValue(
      createQuery([{ _id: "booking-1" }], ["select", "lean"]) as any
    );
    mockedBookingPassenger.find.mockReturnValue(
      createQuery([], ["select", "populate", "lean"]) as any
    );
    mockedStation.findById.mockImplementation((id: string) => {
      const station = stationsById[id];
      return createQuery(station, ["select", "lean"]) as any;
    });
  });

  describe("Group G", () => {
    it("G1 returns available when there are no bookings and no segment filter", async () => {
      mockedBookingModel.find.mockReturnValue(createQuery([], ["select", "lean"]) as any);

      const result = await ScheduleService.getSeatsBySchedule("507f1f77bcf86cd799439011");

      expect(result.seats[0].status).toBe("available");
    });

    it("G2 returns booked when there is a booking and no segment filter", async () => {
      mockedBookingPassenger.find.mockReturnValue(
        createQuery(
          [
            makeBookingPassenger({
              depStationId: stationsById["station-8"],
              arrStationId: stationsById["station-5"],
            }),
          ],
          ["select", "populate", "lean"]
        ) as any
      );

      const result = await ScheduleService.getSeatsBySchedule("507f1f77bcf86cd799439011");

      expect(result.seats[0].status).toBe("booked");
    });
  });

  describe("Groups H and I", () => {
    test.each([
      [
        "H1 bug case overlap",
        { dep: "station-8", arr: "station-5" },
        { dep: "station-9", arr: "station-5" },
        "booked",
      ],
      [
        "H2 no overlap",
        { dep: "station-1", arr: "station-3" },
        { dep: "station-5", arr: "station-9" },
        "available",
      ],
      [
        "H3 adjacent only",
        { dep: "station-5", arr: "station-8" },
        { dep: "station-8", arr: "station-9" },
        "available",
      ],
      [
        "H4 booking covers full route",
        { dep: "station-1", arr: "station-15" },
        { dep: "station-5", arr: "station-9" },
        "booked",
      ],
      [
        "H5 query covers booking",
        { dep: "station-5", arr: "station-9" },
        { dep: "station-1", arr: "station-15" },
        "booked",
      ],
      [
        "H6 reverse overlap",
        { dep: "station-9", arr: "station-5" },
        { dep: "station-8", arr: "station-1" },
        "booked",
      ],
      [
        "H7 reverse disjoint",
        { dep: "station-9", arr: "station-8" },
        { dep: "station-5", arr: "station-1" },
        "available",
      ],
      [
        "I1 whole route both directions",
        { dep: "station-1", arr: "station-15" },
        { dep: "station-15", arr: "station-1" },
        "booked",
      ],
      [
        "I2 same route opposite directions",
        { dep: "station-5", arr: "station-9" },
        { dep: "station-9", arr: "station-5" },
        "booked",
      ],
      [
        "I3 outbound and return disjoint",
        { dep: "station-1", arr: "station-5" },
        { dep: "station-9", arr: "station-8" },
        "available",
      ],
      [
        "I4 reverse disjoint segments",
        { dep: "station-8", arr: "station-9" },
        { dep: "station-5", arr: "station-1" },
        "available",
      ],
      [
        "I5 reverse overlap on return",
        { dep: "station-5", arr: "station-8" },
        { dep: "station-9", arr: "station-5" },
        "booked",
      ],
    ])("%s", async (_name, booking, query, expected) => {
      mockedBookingPassenger.find.mockReturnValue(
        createQuery(
          [
            makeBookingPassenger({
              depStationId: stationsById[booking.dep],
              arrStationId: stationsById[booking.arr],
            }),
          ],
          ["select", "populate", "lean"]
        ) as any
      );

      const result = await ScheduleService.getSeatsBySchedule(
        "507f1f77bcf86cd799439011",
        query.dep,
        query.arr
      );

      expect(result.seats[0].status).toBe(expected);
    });

    it("H8 ignores cancelled booking status because booking query filters it out", async () => {
      mockedBookingModel.find.mockReturnValue(createQuery([], ["select", "lean"]) as any);

      const result = await ScheduleService.getSeatsBySchedule(
        "507f1f77bcf86cd799439011",
        "station-9",
        "station-5"
      );

      expect(result.seats[0].status).toBe("available");
    });

    it("H9 ignores cancelled booking passenger because BP query filters it out", async () => {
      mockedBookingPassenger.find.mockReturnValue(createQuery([], ["select", "populate", "lean"]) as any);

      const result = await ScheduleService.getSeatsBySchedule(
        "507f1f77bcf86cd799439011",
        "station-9",
        "station-5"
      );

      expect(result.seats[0].status).toBe("available");
    });

    it("H10 falls back to booked when station_order is missing", async () => {
      mockedBookingPassenger.find.mockReturnValue(
        createQuery(
          [
            makeBookingPassenger({
              depStationId: "station-8",
              arrStationId: "station-5",
            }),
          ],
          ["select", "populate", "lean"]
        ) as any
      );

      const result = await ScheduleService.getSeatsBySchedule(
        "507f1f77bcf86cd799439011",
        "station-9",
        "station-5"
      );

      expect(result.seats[0].status).toBe("booked");
    });

    it("H11 marks seat booked when one booking overlaps among many", async () => {
      mockedBookingPassenger.find.mockReturnValue(
        createQuery(
          [
            makeBookingPassenger({
              depStationId: stationsById["station-8"],
              arrStationId: stationsById["station-5"],
            }),
            makeBookingPassenger({
              depStationId: stationsById["station-1"],
              arrStationId: stationsById["station-3"],
            }),
          ],
          ["select", "populate", "lean"]
        ) as any
      );

      const result = await ScheduleService.getSeatsBySchedule(
        "507f1f77bcf86cd799439011",
        "station-9",
        "station-5"
      );

      expect(result.seats[0].status).toBe("booked");
    });

    it("H12 marks seat locked when only overlapping Redis lock exists", async () => {
      mockedBookingPassenger.find.mockReturnValue(createQuery([], ["select", "populate", "lean"]) as any);
      mockedCheckSeatLocksBulk.mockResolvedValue({ "seat-1": true });

      const result = await ScheduleService.getSeatsBySchedule(
        "507f1f77bcf86cd799439011",
        "station-9",
        "station-5"
      );

      expect(result.seats[0].status).toBe("locked");
    });

    it("H13 keeps booked status over locked status", async () => {
      mockedBookingPassenger.find.mockReturnValue(
        createQuery(
          [
            makeBookingPassenger({
              depStationId: stationsById["station-8"],
              arrStationId: stationsById["station-5"],
            }),
          ],
          ["select", "populate", "lean"]
        ) as any
      );
      mockedCheckSeatLocksBulk.mockResolvedValue({ "seat-1": true });

      const result = await ScheduleService.getSeatsBySchedule(
        "507f1f77bcf86cd799439011",
        "station-9",
        "station-5"
      );

      expect(result.seats[0].status).toBe("booked");
    });
  });
});
