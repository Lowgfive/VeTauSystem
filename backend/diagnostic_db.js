
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const mongoUri = process.env.MONGO_URI;

async function checkData() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('Connected successfully');

    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Collections in DB:', collections.map(c => c.name));

    const schedules = await mongoose.connection.db.collection('schedules').find({}).limit(10).toArray();
    console.log('Schedules Sample:', JSON.stringify(schedules, null, 2));

    await mongoose.connection.close();
  } catch (err) {
    console.error('Error:', err);
  }
}

checkData();
