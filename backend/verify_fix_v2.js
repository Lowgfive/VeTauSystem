
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const mongoUri = process.env.MONGO_URI;

async function verifySearchFix() {
  await mongoose.connect(mongoUri);
  
  const Schedule = mongoose.model('Schedule', new mongoose.Schema({
      train_id: mongoose.Schema.Types.ObjectId,
      route_id: mongoose.Schema.Types.ObjectId
  }, { collection: 'schedules' }));
  const Train = mongoose.model('Train', new mongoose.Schema({ train_code: String, direction: String }, { collection: 'trains' }));
  const Station = mongoose.model('Station', new mongoose.Schema({ station_name: String, station_order: Number }, { collection: 'stations' }));
  const Route = mongoose.model('Route', new mongoose.Schema({ 
    departure_station_id: mongoose.Schema.Types.ObjectId,
    arrival_station_id: mongoose.Schema.Types.ObjectId 
  }, { collection: 'routes' }));

  const se2 = await Train.findOne({ train_code: 'SE2' });
  if (!se2) {
    console.log("SE2 train not found");
    await mongoose.connection.close();
    return;
  }

  console.log("Checking if SE2 has any Southbound segments left...");
  const se2Schedules = await Schedule.find({ train_id: se2._id }).lean();
  
  let invalidCount = 0;
  for (const s of se2Schedules) {
    const route = await Route.findById(s.route_id).lean();
    if (!route) continue;

    const [dep, arr] = await Promise.all([
      Station.findById(route.departure_station_id),
      Station.findById(route.arrival_station_id)
    ]);
    
    if (dep && arr && dep.station_order < arr.station_order) {
       invalidCount++;
       console.log(`  Found Northbound train with Southbound segment: ${dep.station_name} -> ${arr.station_name}`);
    }
  }
  
  if (invalidCount === 0) {
    console.log("SUCCESS: SE2 has no Southbound segments.");
  } else {
    console.log(`FAILURE: SE2 still has ${invalidCount} Southbound segments.`);
  }

  await mongoose.connection.close();
}

verifySearchFix().catch(err => {
  console.error("Script Error:", err);
  process.exit(1);
});
