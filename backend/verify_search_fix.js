
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const mongoUri = process.env.MONGO_URI;

async function verify() {
  try {
    await mongoose.connect(mongoUri);
    console.log('Connected');

    const searchDate = "2026-03-26";
    const [y, m, d] = searchDate.split("-").map(Number);
    
    // Simulate the new logic
    const dayStart = new Date(y, m - 1, d);
    const queryStart = new Date(dayStart);
    queryStart.setDate(queryStart.getDate() - 1);
    
    console.log(`Searching for schedules >= ${queryStart.toISOString()}`);

    const schedules = await mongoose.connection.db.collection('schedules').find({
      date: { $gte: queryStart }
    }).limit(10).toArray();

    console.log(`Found ${schedules.length} candidate schedules`);

    const filtered = schedules.filter(s => {
        const sDate = new Date(s.date);
        return sDate.getFullYear() === y &&
               sDate.getMonth() === m - 1 &&
               sDate.getDate() === d;
    });

    console.log(`Found ${filtered.length} schedules matching local date ${searchDate}`);
    if (filtered.length > 0) {
        console.log('Sample matching schedule:', {
            id: filtered[0]._id,
            date: filtered[0].date.toISOString()
        });
    }

    await mongoose.connection.close();
  } catch (err) {
    console.error(err);
  }
}

verify();
