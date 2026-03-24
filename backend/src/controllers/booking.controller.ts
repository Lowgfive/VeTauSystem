import { Response } from "express";
import mongoose from "mongoose";
import { AuthRequest } from "../middlewares/auth.middleware";
import BookingModel from "../models/booking.model";
import { BookingPassenger } from "../models/bookingpassenger.model";
import { Passenger } from "../models/passenger.model";
import { Route } from "../models/route.model";
import { Schedule } from "../models/schedule.model";
import { Seat } from "../models/seat.model";
import { Station } from "../models/station.model";
import * as seatLockService from "../services/seat.service";
import { asyncHandler } from "../utils/asyncHandler";
import {
  calculateBaseRoutePrice,
  getSeatTypeMultiplier,
} from "../utils/pricing";

export const createBooking = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { scheduleId, seats, departureStationId, arrivalStationId } =
      req.body as {
        scheduleId: string;
        departureStationId?: string;
        arrivalStationId?: string;
        totalAmount: number;
        seats: {
          seat_id: string;
          full_name: string;
          id_number: string;
          dob?: string;
          gender?: string;
          ticket_price: number;
          passenger_type?: string;
          discount_rate?: number;
          base_price?: number;
          insurance?: number;
        }[];
      };
    const userId = req.user?.userId;

    if (!scheduleId || !Array.isArray(seats) || seats.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Thieu scheduleId hoac danh sach ghe",
      });
    }

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Can dang nhap de dat ve",
      });
    }

    const schedule: any = await Schedule.findById(scheduleId)
      .populate("train_id")
      .populate("route_id");

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: "Khong tim thay chuyen tau",
      });
    }

    const trainId = String((schedule.train_id as any)?._id || schedule.train_id);

    const resolvedDepartureStationId =
      departureStationId || schedule.route_id?.departure_station_id?.toString();
    const resolvedArrivalStationId =
      arrivalStationId || schedule.route_id?.arrival_station_id?.toString();

    if (!resolvedDepartureStationId || !resolvedArrivalStationId) {
      return res.status(400).json({
        success: false,
        message: "Thieu ga di hoac ga den cua hanh trinh",
      });
    }

    const [depStation, arrStation] = await Promise.all([
      Station.findById(resolvedDepartureStationId).select("station_order").lean(),
      Station.findById(resolvedArrivalStationId).select("station_order").lean(),
    ]);

    if (!depStation || !arrStation) {
      return res.status(400).json({
        success: false,
        message: "Khong xac dinh duoc ga cua hanh trinh",
      });
    }

    const stationRange = await Station.find({
      station_order: {
        $gte: Math.min(depStation.station_order, arrStation.station_order),
        $lte: Math.max(depStation.station_order, arrStation.station_order),
      },
    })
      .sort({ station_order: depStation.station_order < arrStation.station_order ? 1 : -1 })
      .select("_id")
      .lean();

    if (stationRange.length < 2) {
      return res.status(400).json({
        success: false,
        message: "Khong tim thay tuyen hop le cho booking",
      });
    }

    const routeSegments = [];
    for (let i = 0; i < stationRange.length - 1; i++) {
      routeSegments.push({
        departure_station_id: stationRange[i]._id,
        arrival_station_id: stationRange[i + 1]._id,
      });
    }

    const routes = await Route.find({ $or: routeSegments }).lean();
    const orderedRoutes = routeSegments.map((segment) =>
      routes.find(
        (route) =>
          route.departure_station_id.toString() ===
            segment.departure_station_id.toString() &&
          route.arrival_station_id.toString() ===
            segment.arrival_station_id.toString()
      )
    );

    if (orderedRoutes.some((route) => !route)) {
      return res.status(400).json({
        success: false,
        message: "Khong du du lieu tuyen de tinh gia",
      });
    }

    const routeDocs = orderedRoutes.filter(Boolean);
    const routeBasePrice = calculateBaseRoutePrice(routeDocs as any);
    const insuranceFee = 1000;
    const validSeatsData: any[] = [];

    const getDiscountRate = (type?: string) => {
      if (type === "Tre em") return 0.25;
      if (type === "Sinh vien") return 0.1;
      if (type === "Nguoi cao tuoi") return 0.15;
      if (type === "Trẻ em") return 0.25;
      if (type === "Sinh viên") return 0.1;
      if (type === "Người cao tuổi") return 0.15;
      return 0;
    };

    let calculatedTotalAmount = 0;

    for (const seatReq of seats) {
      const { seat_id, full_name, id_number, dob, gender, passenger_type } =
        seatReq;

      const seat = await Seat.findById(seat_id);
      if (!seat) {
        return res.status(404).json({
          success: false,
          message: `Khong tim thay ghe ID: ${seat_id}`,
        });
      }

      const seatNumber = seat.seat_number;

      const hasOwnedLock = await seatLockService.checkSeatLock(
        trainId,
        seat_id,
        userId,
        Math.min(depStation.station_order, arrStation.station_order),
        Math.max(depStation.station_order, arrStation.station_order)
      );
      if (!hasOwnedLock) {
        return res.status(409).json({
          success: false,
          message: `Ghe ${seatNumber} chua duoc giu cho hoac da het han. Vui long chon lai.`,
        });
      }

      const isBooked = await BookingPassenger.findOne({
        seat_id: seat._id,
        status: { $in: ["reserved", "confirmed", "paid"] },
      }).populate({
        path: "booking_id",
        match: { schedule_id: scheduleId },
      });

      if (isBooked && isBooked.booking_id) {
        return res.status(409).json({
          success: false,
          message: `Ghe ${seatNumber} da duoc dat`,
        });
      }

      const actualBasePrice = Math.round(
        routeBasePrice * getSeatTypeMultiplier(seat.seat_type || "soft_seat")
      );
      const actualDiscountRate = getDiscountRate(passenger_type);
      const actualTicketPrice =
        actualBasePrice * (1 - actualDiscountRate) + insuranceFee;

      calculatedTotalAmount += actualTicketPrice;

      validSeatsData.push({
        seat_id: seat._id,
        seat_number: seatNumber,
        full_name,
        id_number,
        dob,
        gender,
        passenger_type,
        discount_rate: actualDiscountRate,
        base_price: actualBasePrice,
        insurance: insuranceFee,
        ticket_price: actualTicketPrice,
      });
    }

    const bookingCode =
      "BK" +
      Date.now().toString(36).toUpperCase() +
      Math.random().toString(36).substring(2, 5).toUpperCase();

    const booking = await BookingModel.create({
      user_id: new mongoose.Types.ObjectId(userId),
      schedule_id: new mongoose.Types.ObjectId(scheduleId),
      booking_code: bookingCode,
      total_amount: calculatedTotalAmount,
      departure_station_id: new mongoose.Types.ObjectId(resolvedDepartureStationId),
      arrival_station_id: new mongoose.Types.ObjectId(resolvedArrivalStationId),
      status: "pending",
    } as any);

    const bookingPassengers = [];

    for (const validSeat of validSeatsData) {
      let passenger = await Passenger.findOne({ id_number: validSeat.id_number });
      if (!passenger) {
        passenger = await Passenger.create({
          full_name: validSeat.full_name,
          id_number: validSeat.id_number,
          dob: validSeat.dob || null,
          gender: validSeat.gender || "Unknown",
        });
      }

      const bookingPassenger = await BookingPassenger.create({
        booking_id: booking._id,
        passenger_id: passenger._id,
        seat_id: validSeat.seat_id,
        ticket_price: validSeat.ticket_price,
        status: "reserved",
        pricing: {
          basePrice: validSeat.base_price,
          discountRate: validSeat.discount_rate || 0,
          insurance: validSeat.insurance || 0,
          promotion: 0,
          totalAmount: validSeat.ticket_price,
        },
      });

      bookingPassengers.push(bookingPassenger);
    }

    const seatIds = validSeatsData.map((validSeat) => String(validSeat.seat_id));
    await seatLockService.releaseSeatLocks(trainId, seatIds, userId);
    for (const validSeat of validSeatsData) {
      seatLockService.emitSeatBooked(
        trainId,
        scheduleId,
        String(validSeat.seat_id),
        validSeat.seat_number,
        depStation.station_order,
        arrStation.station_order
      );
    }

    return res.status(201).json({
      success: true,
      message: "Dat cho thanh cong. Vui long thanh toan de hoan tat.",
      data: { booking, bookingPassengers },
    });
  }
);

export const getMyBookings = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user?.userId;

    const bookings = await BookingModel.find({ user_id: userId })
      .populate("departure_station_id")
      .populate("arrival_station_id")
      .populate({
        path: "schedule_id",
        populate: [
          { path: "train_id" },
          {
            path: "route_id",
            populate: [
              { path: "departure_station_id" },
              { path: "arrival_station_id" },
            ],
          },
        ],
      })
      .sort({ createdAt: -1 })
      .lean();

    const bookingsWithPassengers = await Promise.all(
      bookings.map(async (booking) => {
        const passengers = await BookingPassenger.find({ booking_id: booking._id })
          .populate("passenger_id")
          .populate("seat_id");
        return { ...booking, booking_passengers: passengers };
      })
    );

    res.status(200).json({
      success: true,
      message: "Danh sach ve cua ban",
      data: bookingsWithPassengers,
    });
  }
);

export const getAllBookings = asyncHandler(
  async (_req: AuthRequest, res: Response) => {
    const bookings = await BookingModel.find()
      .populate({ path: "user_id", select: "name email phone" })
      .populate("departure_station_id")
      .populate("arrival_station_id")
      .populate({
        path: "schedule_id",
        populate: [
          { path: "train_id" },
          {
            path: "route_id",
            populate: [
              { path: "departure_station_id" },
              { path: "arrival_station_id" },
            ],
          },
        ],
      })
      .sort({ createdAt: -1 })
      .lean();

    const bookingsWithPassengers = await Promise.all(
      bookings.map(async (booking) => {
        const passengers = await BookingPassenger.find({ booking_id: booking._id })
          .populate("passenger_id")
          .populate("seat_id");
        return { ...booking, booking_passengers: passengers };
      })
    );

    res.status(200).json({
      success: true,
      message: "Danh sach tat ca ve",
      data: bookingsWithPassengers,
    });
  }
);
