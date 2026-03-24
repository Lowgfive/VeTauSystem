
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const mongoUri = process.env.MONGO_URI;

async function checkStationsData() {
  await mongoose.connect(mongoUri);
  const Station = mongoose.model('Station', new mongoose.Schema({
    station_name: String,
    station_code: String,
    station_order: Number
  }, { collection: 'stations' }));

  const allStations = await Station.find().sort({ station_order: 1 }).lean();
  
  const byName = {};
  allStations.forEach(s => {
    if (!byName[s.station_name]) byName[s.station_name] = [];
    byName[s.station_name].push(s);
  });

  console.log("Duplicate Station Names:");
  for (const name in byName) {
    if (byName[name].length > 1) {
      console.log(`${name}:`, JSON.stringify(byName[name], null, 2));
    }
  }

  console.log("\nAll Stations:");
  console.log(JSON.stringify(allStations.map(s => ({ name: s.station_name, order: s.station_order })), null, 2));

  await mongoose.connection.close();
}

checkStationsData().catch(err => {
  console.error(err);
  process.exit(1);
});
