
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const mongoUri = process.env.MONGO_URI;

async function checkStations() {
  await mongoose.connect(mongoUri);
  const Station = mongoose.model('Station', new mongoose.Schema({
    station_name: String,
    station_code: String,
    station_order: Number
  }, { collection: 'stations' }));

  const stations = await Station.find({
    station_name: { $in: [/Hà Nội/i, /Sài Gòn/i, /Huế/i, /Vinh/i] }
  }).sort({ station_order: 1 });

  console.log(JSON.stringify(stations, null, 2));
  await mongoose.connection.close();
}

checkStations().catch(err => {
  console.error(err);
  process.exit(1);
});
