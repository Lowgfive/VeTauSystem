import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/train-system';

async function checkData() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to DB');

    const Train = mongoose.connection.db.collection('trains');
    const trains = await Train.find({}).toArray();
    console.log('Trains in DB:', JSON.stringify(trains, null, 2));

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

checkData();
