import mongoose from "mongoose";
import { redisClient } from "../config/redis";
import { getIO } from "../config/socket";
import { Seat } from "../models/seat.model";

const LOCK_TTL_SECONDS = 5 * 60;
const LOCK_PREFIX = "seat_lock";

type SeatLockRecord = {
  trainId: string;
  scheduleId: string;
  seatId: string;
  userId: string;
  depOrder: number;
  arrOrder: number;
  expiresAt: number;
};

const normalizeRange = (start: number, end: number) => ({
  start: Math.min(start, end),
  end: Math.max(start, end),
});

export const rangesOverlap = (
  startA: number,
  endA: number,
  startB: number,
  endB: number
) => {
  const rangeA = normalizeRange(startA, endA);
  const rangeB = normalizeRange(startB, endB);
  return Math.max(rangeA.start, rangeB.start) < Math.min(rangeA.end, rangeB.end);
};

const buildSeatLockKey = (
  trainId: string,
  seatId: string,
  depOrder: number,
  arrOrder: number,
  userId: string
) => `${LOCK_PREFIX}:${trainId}:${seatId}:${depOrder}:${arrOrder}:${userId}`;

const listLockKeys = async (pattern: string) => {
  return await redisClient.keys(pattern);
};

const deleteKeys = async (keys: string[]) => {
  if (keys.length === 0) return;
  await redisClient.sendCommand(["DEL", ...keys]);
};

const readLockRecord = async (key: string): Promise<SeatLockRecord | null> => {
  const raw = await redisClient.get(key);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as SeatLockRecord;
  } catch {
    return null;
  }
};

const getSeatLocks = async (
  trainId: string,
  seatId: string
): Promise<Array<{ key: string; record: SeatLockRecord }>> => {
  const keys = await listLockKeys(`${LOCK_PREFIX}:${trainId}:${seatId}:*`);
  const lockEntries: Array<{ key: string; record: SeatLockRecord }> = [];

  for (const key of keys) {
    const record = await readLockRecord(key);
    if (!record) continue;
    lockEntries.push({ key, record });
  }

  return lockEntries;
};

const emitSeatEvent = (
  eventName: "seat-locked" | "seat-unlocked" | "seat-booked",
  trainId: string,
  scheduleId: string,
  seatId: string,
  seatNumber: string,
  depOrder: number,
  arrOrder: number,
  expiresAt?: number
) => {
  try {
    getIO()
      .to(`train:${trainId}`)
      .emit(eventName, {
        trainId,
        scheduleId,
        seatId,
        seatNumber,
        depOrder,
        arrOrder,
        expiresAt,
      });
  } catch (error) {
    console.error("Socket emit error:", error);
  }
};

export const lockSeat = async (
  trainId: string,
  scheduleId: string,
  seatId: string,
  userId: string,
  depOrder: number,
  arrOrder: number
): Promise<{ success: boolean; expiresAt?: number }> => {
  const seat = await Seat.findById(seatId);
  if (!seat) return { success: false };

  if (seat.status === "booked") {
    return { success: false };
  }

  const activeLocks = await getSeatLocks(trainId, seatId);
  for (const { record } of activeLocks) {
    if (
      record.userId !== userId &&
      rangesOverlap(depOrder, arrOrder, record.depOrder, record.arrOrder)
    ) {
      return { success: false };
    }
  }

  const expiresAt = Date.now() + LOCK_TTL_SECONDS * 1000;
  const lockKey = buildSeatLockKey(trainId, seatId, depOrder, arrOrder, userId);
  const lockValue: SeatLockRecord = {
    trainId,
    scheduleId,
    seatId,
    userId,
    depOrder,
    arrOrder,
    expiresAt,
  };

  await redisClient.set(lockKey, JSON.stringify(lockValue), {
    EX: LOCK_TTL_SECONDS,
  });

  emitSeatEvent(
    "seat-locked",
    trainId,
    scheduleId,
    seatId,
    seat.seat_number,
    depOrder,
    arrOrder,
    expiresAt
  );

  return { success: true, expiresAt };
};

export const unlockSeat = async (
  trainId: string,
  scheduleId: string,
  seatId: string,
  userId: string
): Promise<boolean> => {
  const seat = await Seat.findById(seatId);
  if (!seat) return true;

  const activeLocks = await getSeatLocks(trainId, seatId);
  const ownedLockKeys = activeLocks
    .filter(({ record }) => record.userId === userId)
    .map(({ key }) => key);

  if (ownedLockKeys.length === 0) {
    return false;
  }

  await deleteKeys(ownedLockKeys);

  const ownedLock = activeLocks.find(({ record }) => record.userId === userId)?.record;
  emitSeatEvent(
    "seat-unlocked",
    trainId,
    scheduleId,
    seatId,
    seat.seat_number,
    ownedLock?.depOrder ?? 0,
    ownedLock?.arrOrder ?? 0
  );
  return true;
};

export const unlockBatch = async (
  trainId: string,
  scheduleId: string,
  seatIds: string[],
  userId: string
): Promise<string[]> => {
  const unauthorizedSeats: string[] = [];

  for (const seatId of seatIds) {
    const seat = await Seat.findById(seatId);
    if (!seat) continue;

    const activeLocks = await getSeatLocks(trainId, seatId);
    const ownedLocks = activeLocks.filter(({ record }) => record.userId === userId);

    if (ownedLocks.length === 0) {
      if (activeLocks.length > 0) {
        unauthorizedSeats.push(seat.seat_number);
      }
      continue;
    }

    await deleteKeys(ownedLocks.map(({ key }) => key));
    for (const { record } of ownedLocks) {
      emitSeatEvent(
        "seat-unlocked",
        trainId,
        scheduleId,
        seatId,
        seat.seat_number,
        record.depOrder,
        record.arrOrder
      );
    }
  }

  return unauthorizedSeats;
};

export const releaseSeatLocks = async (
  trainId: string,
  seatIds: string[],
  userId: string
): Promise<void> => {
  for (const seatId of seatIds) {
    const activeLocks = await getSeatLocks(trainId, seatId);
    const ownedKeys = activeLocks
      .filter(({ record }) => record.userId === userId)
      .map(({ key }) => key);

    if (ownedKeys.length > 0) {
      await deleteKeys(ownedKeys);
    }
  }
};

export const emitSeatBooked = (
  trainId: string,
  scheduleId: string,
  seatId: string,
  seatNumber: string,
  depOrder: number,
  arrOrder: number
) => {
  emitSeatEvent(
    "seat-booked",
    trainId,
    scheduleId,
    seatId,
    seatNumber,
    depOrder,
    arrOrder
  );
};

export const emitSeatLockedState = (
  trainId: string,
  scheduleId: string,
  seatId: string,
  seatNumber: string,
  depOrder: number,
  arrOrder: number
) => {
  emitSeatEvent(
    "seat-locked",
    trainId,
    scheduleId,
    seatId,
    seatNumber,
    depOrder,
    arrOrder
  );
};

export const unlockSeatByIdForUser = async (
  seatId: string,
  userId: string
): Promise<{ success: boolean; forbidden: boolean }> => {
  const seat = await Seat.findById(seatId);
  if (!seat) {
    return { success: true, forbidden: false };
  }

  const keys = await listLockKeys(`${LOCK_PREFIX}:*:${seatId}:*`);
  const ownedKeys: string[] = [];
  let hasForeignLock = false;
  let unlockedRecords = new Map<
    string,
    { trainId: string; scheduleId: string; depOrder: number; arrOrder: number }
  >();

  for (const key of keys) {
    const record = await readLockRecord(key);
    if (!record) continue;

    if (record.userId === userId) {
      ownedKeys.push(key);
      unlockedRecords.set(key, {
        trainId: record.trainId,
        scheduleId: record.scheduleId,
        depOrder: record.depOrder,
        arrOrder: record.arrOrder,
      });
    } else {
      hasForeignLock = true;
    }
  }

  if (ownedKeys.length === 0) {
    return { success: false, forbidden: hasForeignLock };
  }

  await deleteKeys(ownedKeys);
  for (const { trainId, scheduleId, depOrder, arrOrder } of unlockedRecords.values()) {
    emitSeatEvent(
      "seat-unlocked",
      trainId,
      scheduleId,
      seatId,
      seat.seat_number,
      depOrder,
      arrOrder
    );
  }

  return { success: true, forbidden: false };
};

export const checkSeatLock = async (
  trainId: string,
  seatId: string,
  userId?: string,
  depOrder?: number,
  arrOrder?: number
): Promise<boolean> => {
  const activeLocks = await getSeatLocks(trainId, seatId);
  if (activeLocks.length === 0) {
    return false;
  }

  for (const { record } of activeLocks) {
    const overlaps =
      depOrder == null || arrOrder == null
        ? true
        : rangesOverlap(depOrder, arrOrder, record.depOrder, record.arrOrder);

    if (!overlaps) continue;

    if (userId) {
      if (record.userId === userId) {
        return true;
      }
      continue;
    }

    return true;
  }

  return false;
};

export const checkSeatLocksBulk = async (
  trainId: string,
  seatIds: string[],
  depOrder?: number,
  arrOrder?: number
): Promise<Record<string, boolean>> => {
  const result: Record<string, boolean> = {};

  for (const seatId of seatIds) {
    result[seatId] = await checkSeatLock(
      trainId,
      seatId,
      undefined,
      depOrder,
      arrOrder
    );
  }

  return result;
};

export const hasBookedSeatConflict = async (
  scheduleId: string,
  seatId: string,
  depOrder: number,
  arrOrder: number
): Promise<boolean> => {
  const { BookingPassenger } = await import("../models/bookingpassenger.model");
  const { Station } = await import("../models/station.model");

  const bookingPassengers = await BookingPassenger.find({
    seat_id: new mongoose.Types.ObjectId(seatId),
    status: { $in: ["reserved", "confirmed", "paid"] },
  })
    .populate({
      path: "booking_id",
      match: {
        schedule_id: new mongoose.Types.ObjectId(scheduleId),
        status: { $in: ["pending", "confirmed", "paid"] },
      },
    })
    .lean();

  const activeBookings = bookingPassengers
    .map((bp: any) => bp.booking_id)
    .filter(Boolean);

  if (activeBookings.length === 0) {
    return false;
  }

  const stationIds = Array.from(
    new Set(
      activeBookings.flatMap((booking: any) => [
        booking.departure_station_id?.toString(),
        booking.arrival_station_id?.toString(),
      ])
    )
  ).filter(Boolean) as string[];

  const stations = await Station.find({ _id: { $in: stationIds } })
    .select("_id station_order")
    .lean();
  const stationOrderMap = new Map(
    stations.map((station: any) => [station._id.toString(), station.station_order])
  );

  return activeBookings.some((booking: any) => {
    const bookingDepOrder = stationOrderMap.get(
      booking.departure_station_id?.toString()
    );
    const bookingArrOrder = stationOrderMap.get(
      booking.arrival_station_id?.toString()
    );

    if (bookingDepOrder == null || bookingArrOrder == null) {
      return false;
    }

    return rangesOverlap(depOrder, arrOrder, bookingDepOrder, bookingArrOrder);
  });
};
