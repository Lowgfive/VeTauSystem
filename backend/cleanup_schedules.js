
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const mongoUri = process.env.MONGO_URI;

async function cleanupSchedules() {
  await mongoose.connect(mongoUri);
  const Train = mongoose.model('Train', new mongoose.Schema({ train_code: String, direction: String }, { collection: 'trains' }));
  const Schedule = mongoose.model('Schedule', new mongoose.Schema({ train_id: mongoose.Schema.Types.ObjectId, route_id: mongoose.Schema.Types.ObjectId }, { collection: 'schedules' }));
  const Route = mongoose.model('Route', new mongoose.Schema({
    departure_station_id: mongoose.Schema.Types.ObjectId,
    arrival_station_id: mongoose.Schema.Types.ObjectId
  }, { collection: 'routes' }));
  const Station = mongoose.model('Station', new mongoose.Schema({ station_order: Number }, { collection: 'stations' }));

  const trains = await Train.find({ train_code: { $in: ['SE1', 'SE2'] } }).lean();
  
  for (const train of trains) {
    console.log(`Checking schedules for ${train.train_code} (${train.direction})...`);
    const schedules = await Schedule.find({ train_id: train._id }).lean();
    let deletedCount = 0;

    for (const s of schedules) {
      const route = await Route.findById(s.route_id).lean();
      if (!route) continue;

      const [dep, arr] = await Promise.all([
        Station.findById(route.departure_station_id).lean(),
        Station.findById(route.arrival_station_id).lean()
      ]);

      if (!dep || !arr) continue;

      const routeDirection = dep.station_order < arr.station_order ? "forward" : "backward";
      
      if (routeDirection !== train.direction) {
        console.log(`  Deleting invalid ${routeDirection} schedule for ${train.direction} train ${train.train_code}: ${s._id}`);
        await Schedule.deleteOne({ _id: s._id });
        deletedCount++;
      }
    }
    console.log(`Finished ${train.train_code}. Deleted ${deletedCount} invalid schedules.`);
  }

  await mongoose.connection.close();
}

cleanupSchedules().catch(err => {
  console.error(err);
  process.exit(1);
});
