const { MongoClient } = require('mongodb');
const uri = "mongodb://127.0.0.1:27017/BookingSystem";

async function run() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const database = client.db('BookingSystem');
    
    const stations = await database.collection('stations').find({}).sort({station_order: 1}).toArray();
    console.log('--- STATIONS ---');
    stations.forEach(s => console.log(`${s.station_order}: ${s.station_name} (${s._id})`));

    const routes = await database.collection('routes').find({}).toArray();
    console.log('\n--- ROUTES ---');
    routes.forEach(r => {
      console.log(`${r.departure_station_id} -> ${r.arrival_station_id} (hour: ${r.hour})`);
    });

    const schedules = await database.collection('schedules').find({}).toArray();
    console.log(`\n Total schedules: ${schedules.length}`);
    if (schedules.length > 0) {
        console.log('Sample schedule:', JSON.stringify(schedules[0], null, 2));
    }

  } finally {
    await client.close();
  }
}
run().catch(console.dir);
