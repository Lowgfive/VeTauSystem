
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const mongoUri = process.env.MONGO_URI;

async function auditRecentBookings() {
  await mongoose.connect(mongoUri);
  const Booking = mongoose.model('Booking', new mongoose.Schema({}, { collection: 'bookings', strict: false }));
  const Station = mongoose.model('Station', new mongoose.Schema({ station_name: String }, { collection: 'stations' }));

  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
  const bookings = await Booking.find({ createdAt: { $gte: twoHoursAgo } }).lean();
  
  const results = await Promise.all(bookings.map(async b => {
    const [dep, arr] = await Promise.all([
      Station.findById(b.departure_station_id),
      Station.findById(b.arrival_station_id)
    ]);
    return {
      code: b.booking_code,
      departure: dep?.station_name,
      arrival: arr?.station_name,
      status: b.status,
      createdAt: b.createdAt
    };
  }));

  console.log(JSON.stringify(results, null, 2));
  await mongoose.connection.close();
}

auditRecentBookings().catch(err => {
  console.error(err);
  process.exit(1);
});
