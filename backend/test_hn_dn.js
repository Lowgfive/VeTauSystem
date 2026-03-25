
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const mongoUri = process.env.MONGO_URI;

async function testSearchHNtoDN() {
  await mongoose.connect(mongoUri);
  
  // Note: We'd normally use SearchService but it's TypeScript.
  // Let's do a quick DB check to see if the required segments exist for SE1 on March 25.
  
  const Train = mongoose.model('Train', new mongoose.Schema({ train_code: String }, { collection: 'trains' }));
  const Schedule = mongoose.model('Schedule', new mongoose.Schema({ 
    train_id: mongoose.Schema.Types.ObjectId,
    route_id: mongoose.Schema.Types.ObjectId,
    date: Date
  }, { collection: 'schedules' }));
  const Station = mongoose.model('Station', new mongoose.Schema({ station_name: String, station_order: Number }, { collection: 'stations' }));
  const Route = mongoose.model('Route', new mongoose.Schema({ 
    departure_station_id: mongoose.Schema.Types.ObjectId,
    arrival_station_id: mongoose.Schema.Types.ObjectId 
  }, { collection: 'routes' }));

  const se1 = await Train.findOne({ train_code: 'SE1' });
  const hn = await Station.findOne({ station_name: /Hà Nội/i });
  const dn = await Station.findOne({ station_name: /Đà Nẵng/i });
  
  console.log(`Checking journey for SE1 (${se1._id}) from ${hn.station_name} to ${dn.station_name} on 2026-03-25...`);
  
  // Find all routes from HN (1) to DN (9)
  const stations = await Station.find({ 
    station_order: { $gte: hn.station_order, $lte: dn.station_order } 
  }).sort({ station_order: 1 });
  
  const routeIds = [];
  for (let i = 0; i < stations.length - 1; i++) {
    const route = await Route.findOne({ 
      departure_station_id: stations[i]._id, 
      arrival_station_id: stations[i+1]._id 
    });
    if (route) routeIds.push(route._id);
  }
  
  console.log(`Need ${routeIds.length} segments.`);
  
  const dayStart = new Date(2026, 2, 25); // March 25
  const dayEnd = new Date(2026, 2, 26);
  
  const foundSchedules = await Schedule.find({
    train_id: se1._id,
    route_id: { $in: routeIds },
    date: { $gte: dayStart, $lte: new Date(2026, 2, 28) } // Window
  }).lean();
  
  console.log(`Found ${foundSchedules.length} candidate schedules for SE1.`);
  
  // Group by date to see if they fit a single journey
  const dateMap = {};
  foundSchedules.forEach(s => {
    const dStr = s.date.toISOString().split('T')[0];
    if (!dateMap[dStr]) dateMap[dStr] = [];
    dateMap[dStr].push(s);
  });
  
  for (const date in dateMap) {
    console.log(`Date ${date}: ${dateMap[date].length} segments.`);
  }

  await mongoose.connection.close();
}

testSearchHNtoDN().catch(err => {
  console.error(err);
  process.exit(1);
});
