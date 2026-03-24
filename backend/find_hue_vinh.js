
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const mongoUri = process.env.MONGO_URI;

async function findHueVinhBookings() {
  await mongoose.connect(mongoUri);
  const Booking = mongoose.model('Booking', new mongoose.Schema({}, { collection: 'bookings', strict: false }));
  const Station = mongoose.model('Station', new mongoose.Schema({ station_name: String }, { collection: 'stations' }));

  const [hue, vinh] = await Promise.all([
    Station.findOne({ station_name: { $regex: /Huế/i } }),
    Station.findOne({ station_name: { $regex: /Vinh/i } })
  ]);

  if (!hue || !vinh) {
    console.log("Could not find stations for Huế or Vinh");
  } else {
    const bookings = await Booking.find({
      departure_station_id: hue._id,
      arrival_station_id: vinh._id
    }).sort({ createdAt: -1 }).lean();
    
    console.log(`Found ${bookings.length} bookings for Huế -> Vinh:`);
    console.log(JSON.stringify(bookings.map(b => ({
      code: b.booking_code,
      status: b.status,
      createdAt: b.createdAt
    })), null, 2));
  }
  await mongoose.connection.close();
}

findHueVinhBookings().catch(err => {
  console.error(err);
  process.exit(1);
});
