import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { Station } from '../models/station.model';
import { Route } from '../models/route.model';
import { Schedule } from '../models/schedule.model';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/BookingSystem';

async function check() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to DB');

    const depName = "Hà Nội";
    const arrName = "Ninh Bình";

    const depStation = await Station.findOne({ station_name: new RegExp(`^(Ga\\s+)?${depName}$`, "i") });
    const arrStation = await Station.findOne({ station_name: new RegExp(`^(Ga\\s+)?${arrName}$`, "i") });

    console.log('Departure Station:', depStation);
    console.log('Arrival Station:', arrStation);

    if (!depStation || !arrStation) {
      console.log('One of the stations not found');
      return;
    }

    const direction = depStation.station_order < arrStation.station_order ? 1 : -1;
    const minOrder = Math.min(depStation.station_order, arrStation.station_order);
    const maxOrder = Math.max(depStation.station_order, arrStation.station_order);

    const stations = await Station.find({
      station_order: { $gte: minOrder, $lte: maxOrder }
    }).sort({ station_order: direction });

    console.log('Stations in between:', stations.map(s => `${s.station_name} (Order: ${s.station_order})`));

    const segments = [];
    for (let i = 0; i < stations.length - 1; i++) {
      segments.push({
        departure_station_id: stations[i]._id,
        arrival_station_id: stations[i + 1]._id
      });
    }
    console.log('Required Segments:', segments.length);

    const routes = await Route.find({ $or: segments });
    console.log('Found Routes:', routes.length);
    routes.forEach(r => {
        const d = stations.find(s => s._id.toString() === r.departure_station_id.toString());
        const a = stations.find(s => s._id.toString() === r.arrival_station_id.toString());
        console.log(`Route: ${d?.station_name} -> ${a?.station_name} (_id: ${r._id})`);
    });

    const routeIds = routes.map(r => r._id);
    const dateStr = "2026-03-27";
    const dayStart = new Date(dateStr + "T00:00:00.000Z");
    const dayEnd = new Date(dateStr + "T23:59:59.999Z");

    const schedules = await Schedule.find({
      route_id: { $in: routeIds },
      date: { $gte: dayStart, $lte: dayEnd }
    }).populate('train_id');

    console.log('Total Schedules found for these routes on this date:', schedules.length);

    const trainMap = new Map();
    schedules.forEach((s: any) => {
      const trainId = s.train_id?._id?.toString() || s.train_id?.toString();
      if (!trainMap.has(trainId)) trainMap.set(trainId, []);
      trainMap.get(trainId).push(s);
    });

    console.log('Trains found:', trainMap.size);
    for (const [trainId, trainSchedules] of trainMap.entries()) {
        console.log(`Train ${trainId} has ${trainSchedules.length} schedules. Covers routes:`, trainSchedules.map((ts: any) => ts.route_id.toString()));
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

check();
