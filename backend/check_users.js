
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

async function checkUser() {
  try {
    if (!process.env.MONGO_URI) {
        console.error('MONGO_URI not found in .env');
        process.exit(1);
    }
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    const db = mongoose.connection.db;
    const users = await db.collection('users').find().toArray();
    
    console.log('--- All Users in Database ---');
    users.forEach(u => {
      console.log(`- Name: ${u.name}, Email: ${u.email}, Role: ${u.role}`);
    });
    console.log('----------------------------');
    
    await mongoose.disconnect();
  } catch (err) {
    console.error('Error:', err);
  }
}

checkUser();
