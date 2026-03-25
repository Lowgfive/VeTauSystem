
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const mongoUri = process.env.MONGO_URI;

async function checkTrainSchedules() {
  await mongoose.connect(mongoUri);
  const Train = mongoose.model('Train', new mongoose.Schema({}, { collection: 'trains', strict: false }));
  const Schedule = mongoose.model('Schedule', new mongoose.Schema({}, { collection: 'schedules', strict: false }));
  const Station = mongoose.model('Station', new mongoose.Schema({ station_name: String, station_order: Number }, { collection: 'stations' }));
  const Route = mongoose.model('Route', new mongoose.Schema({}, { collection: 'routes', strict: false }));

  const seTrains = await Train.find({ train_code: { $in: ['SE1', 'SE2'] } }).lean();
  console.log("Trains found:", seTrains.map(t => ({ id: t._id, code: t.train_code })));

  for (const train of seTrains) {
    console.log(`\nSchedules for ${train.train_code}:`);
    const schedules = await Schedule.find({ train_id: train._id }).limit(10).lean();
    
    for (const s of schedules) {
      const route = await Route.findById(s.route_id).lean();
      const [dep, arr] = await Promise.all([
        Station.findById(route?.departure_station_id),
        Station.findById(route?.arrival_station_id)
      ]);
      console.log(` - Schedule ${s._id}: ${dep?.station_name} (${dep?.station_order}) -> ${arr?.station_name} (${arr?.station_order}) [${s.date.toISOString().split('T')[0]}]`);
    }
  }

  await mongoose.connection.close();
}

checkTrainSchedules().catch(err => {
  console.error(err);
  process.exit(1);
});
