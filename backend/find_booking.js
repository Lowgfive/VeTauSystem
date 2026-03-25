
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const mongoUri = process.env.MONGO_URI;

async function findSpecificBooking() {
  await mongoose.connect(mongoUri);
  const Booking = mongoose.model('Booking', new mongoose.Schema({}, { collection: 'bookings', strict: false }));
  const Station = mongoose.model('Station', new mongoose.Schema({ station_name: String }, { collection: 'stations' }));
  const Schedule = mongoose.model('Schedule', new mongoose.Schema({ date: Date, departure_time: String, arrival_time: String }, { collection: 'schedules', strict: false }));

  const b = await Booking.findOne({ booking_code: 'BKMN3XXYYK304' }).lean();
  
  if (!b) {
    console.log("Booking BKMN3XXYYK304 not found");
  } else {
    const [dep, arr, s] = await Promise.all([
      Station.findById(b.departure_station_id),
      Station.findById(b.arrival_station_id),
      Schedule.findById(b.schedule_id)
    ]);
    console.log(JSON.stringify({
      code: b.booking_code,
      departure: dep?.station_name,
      arrival: arr?.station_name,
      schedule_date: s?.date,
      schedule_id: b.schedule_id,
      createdAt: b.createdAt
    }, null, 2));
  }
  await mongoose.connection.close();
}

findSpecificBooking().catch(err => {
  console.error(err);
  process.exit(1);
});
