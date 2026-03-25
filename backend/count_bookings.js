
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const mongoUri = process.env.MONGO_URI;

async function countBookings() {
  await mongoose.connect(mongoUri);
  const Booking = mongoose.model('Booking', new mongoose.Schema({}, { collection: 'bookings', strict: false }));
  const count = await Booking.countDocuments();
  console.log(`Total bookings: ${count}`);
  
  const all = await Booking.find().sort({ createdAt: -1 }).limit(15).lean();
  console.log(JSON.stringify(all.map(a => ({ code: a.booking_code, stations: `${a.departure_station_id} -> ${a.arrival_station_id}`, status: a.status, created: a.createdAt })), null, 2));
  
  await mongoose.connection.close();
}

countBookings().catch(err => {
  console.error(err);
  process.exit(1);
});
