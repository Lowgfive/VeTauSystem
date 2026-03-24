
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const mongoUri = process.env.MONGO_URI;

async function checkSpecificBooking() {
  await mongoose.connect(mongoUri);
  const Booking = mongoose.model('Booking', new mongoose.Schema({}, { collection: 'bookings', strict: false }));
  const Schedule = mongoose.model('Schedule', new mongoose.Schema({}, { collection: 'schedules', strict: false }));
  const Train = mongoose.model('Train', new mongoose.Schema({}, { collection: 'trains', strict: false }));
  const Station = mongoose.model('Station', new mongoose.Schema({ station_name: String }, { collection: 'stations' }));

  const booking = await Booking.findOne({ booking_code: 'BKMN4QX6XK68E' }).lean();
  if (!booking) {
    console.log("Booking not found");
  } else {
    const schedule = await Schedule.findById(booking.schedule_id).lean();
    const train = schedule ? await Train.findById(schedule.train_id).lean() : null;
    const [dep, arr] = await Promise.all([
      Station.findById(booking.departure_station_id),
      Station.findById(booking.arrival_station_id)
    ]);
    
    console.log(JSON.stringify({
      booking: {
        code: booking.booking_code,
        departure_id: booking.departure_station_id,
        arrival_id: booking.arrival_station_id,
        status: booking.status
      },
      departure_name: dep?.station_name,
      arrival_name: arr?.station_name,
      schedule: {
        id: schedule?._id,
        train_id: schedule?.train_id,
        route_id: schedule?.route_id
      },
      train: {
        code: train?.train_code,
        name: train?.train_name
      }
    }, null, 2));
  }
  await mongoose.connection.close();
}

checkSpecificBooking().catch(err => {
  console.error(err);
  process.exit(1);
});
