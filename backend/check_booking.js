
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const mongoUri = process.env.MONGO_URI;

async function checkBooking() {
  await mongoose.connect(mongoUri);
  const Booking = mongoose.model('Booking', new mongoose.Schema({
    booking_code: String,
    departure_station_id: mongoose.Schema.Types.ObjectId,
    arrival_station_id: mongoose.Schema.Types.ObjectId,
    schedule_id: mongoose.Schema.Types.ObjectId,
    status: String
  }, { collection: 'bookings' }));

  const Station = mongoose.model('Station', new mongoose.Schema({
    station_name: String
  }, { collection: 'stations' }));

  const booking = await Booking.findOne({ booking_code: 'MKMN3XXYYK304' }).lean();
  if (!booking) {
    console.log("Booking not found");
  } else {
    const [dep, arr] = await Promise.all([
      Station.findById(booking.departure_station_id),
      Station.findById(booking.arrival_station_id)
    ]);
    console.log(JSON.stringify({
      booking,
      departure: dep?.station_name,
      arrival: arr?.station_name
    }, null, 2));
  }
  await mongoose.connection.close();
}

checkBooking().catch(err => {
  console.error(err);
  process.exit(1);
});
