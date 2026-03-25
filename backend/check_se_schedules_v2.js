
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config({ path: path.join(__dirname, '.env') });

const mongoUri = process.env.MONGO_URI;

async function checkTrainSchedules() {
  await mongoose.connect(mongoUri);
  const Train = mongoose.model('Train', new mongoose.Schema({}, { collection: 'trains', strict: false }));
  const Schedule = mongoose.model('Schedule', new mongoose.Schema({}, { collection: 'schedules', strict: false }));
  const Station = mongoose.model('Station', new mongoose.Schema({ station_name: String, station_order: Number }, { collection: 'stations' }));
  const Route = mongoose.model('Route', new mongoose.Schema({}, { collection: 'routes', strict: false }));

  const seTrains = await Train.find({ train_code: { $in: ['SE1', 'SE2'] } }).lean();
  let output = `Trains found: ${JSON.stringify(seTrains.map(t => ({ id: t._id, code: t.train_code })))}\n`;

  for (const train of seTrains) {
    output += `\nSchedules for ${train.train_code}:\n`;
    const schedules = await Schedule.find({ train_id: train._id }).limit(20).lean();
    
    for (const s of schedules) {
      const route = await Route.findById(s.route_id).lean();
      const [dep, arr] = await Promise.all([
        Station.findById(route?.departure_station_id),
        Station.findById(route?.arrival_station_id)
      ]);
      output += ` - Schedule ${s._id}: ${dep?.station_name} (${dep?.station_order}) -> ${arr?.station_name} (${arr?.station_order}) [${s.date.toISOString().split('T')[0]}]\n`;
    }
  }

  fs.writeFileSync('output_schedules_utf8.txt', output);
  console.log("Done writing to output_schedules_utf8.txt");
  await mongoose.connection.close();
}

checkTrainSchedules().catch(err => {
  console.error(err);
  process.exit(1);
});
