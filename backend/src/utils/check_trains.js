const { MongoClient } = require('mongodb');
const uri = "mongodb://localhost:27017/train-system";

async function run() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const database = client.db('BookingSystem');
    const trains = database.collection('trains');
    const allTrains = await trains.find({}).toArray();
    console.log('Found trains:', JSON.stringify(allTrains, null, 2));
  } finally {
    await client.close();
  }
}
run().catch(console.dir);
