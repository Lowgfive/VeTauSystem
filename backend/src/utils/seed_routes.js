const { MongoClient, ObjectId } = require('mongodb');
const uri = "mongodb://127.0.0.1:27017/BookingSystem";

async function run() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const database = client.db('BookingSystem');
    const routes = database.collection('routes');

    // Tìm lộ trình xuôi: Hà Nội -> Sài Gòn
    const hnId = new ObjectId("69b57c238852270aa06c6abc");
    const sgId = new ObjectId("69b57c238852270aa06c6abe");

    const existingForward = await routes.findOne({ departure_station_id: hnId, arrival_station_id: sgId });
    if (existingForward) {
        // Kiểm tra xem có lộ trình ngược chưa
        const existingBackward = await routes.findOne({ departure_station_id: sgId, arrival_station_id: hnId });
        if (!existingBackward) {
            console.log('Adding missing backward route: Ga Sài Gòn -> Ga Hà Nội');
            await routes.insertOne({
                departure_station_id: sgId,
                arrival_station_id: hnId,
                distance: existingForward.distance,
                hour: existingForward.hour,
                createdAt: new Date(),
                updatedAt: new Date()
            });
            console.log('Done!');
        } else {
            console.log('Backward route already exists.');
        }
    } else {
        console.log('Forward route not found, skipping check for backward.');
    }

  } finally {
    await client.close();
  }
}
run().catch(console.dir);
