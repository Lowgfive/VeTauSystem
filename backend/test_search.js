
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const { SearchService } = require('./src/services/search.service');

dotenv.config({ path: path.join(__dirname, '.env') });

const mongoUri = process.env.MONGO_URI;

async function testSearch() {
  await mongoose.connect(mongoUri);
  const result = await SearchService.searchTrain(
    "Hà Nội", "Sài Gòn", "2026-03-15", undefined, 1, 10, "HN", "SG"
  );
  
  if (!result.success) {
    console.log("Search failed:", result.message);
  } else {
    console.log(`Found ${result.data.departureTrips.length} departure trips.`);
    result.data.departureTrips.forEach(t => {
      console.log(` - Train ${t.train?.train_code || t.train_id}: ${t.departure_station} (${t.departure_station_id}) -> ${t.arrival_station} (${t.arrival_station_id}) @ ${t.departure_time}`);
    });
  }
  await mongoose.connection.close();
}

testSearch().catch(err => {
  console.error(err);
  process.exit(1);
});
