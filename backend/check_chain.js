
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

async function checkChain() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected');

    const searchDate = "2026-03-26";
    const [y, m, d] = searchDate.split("-").map(Number);
    const targetDateStr = "2026-03-25T17:00:00.000Z";

    // 1. Find a train (e.g., SE1)
    const train = await mongoose.connection.db.collection('trains').findOne({ train_code: 'SE1' });
    if (!train) {
        console.log('SE1 not found');
        return;
    }
    console.log('Found Train:', train.train_code, 'ID:', train._id);

    // 2. Find all schedules for this train around that date
    const schedules = await mongoose.connection.db.collection('schedules').find({
        train_id: train._id
    }).toArray();

    console.log(`Total schedules for SE1: ${schedules.length}`);

    // Groups by arrival_time/departure_time to see the sequence
    const matchingSchedules = schedules.filter(s => {
        const sDate = new Date(s.date);
        // We are looking for the chain starting on March 26
        // But some segments might fall on March 27 if it's a long journey
        return sDate >= new Date(2026, 2, 25) && sDate <= new Date(2026, 2, 28);
    });

    console.log(`Schedules in window: ${matchingSchedules.length}`);

    // Sort by date and departure_time
    matchingSchedules.sort((a, b) => {
        const da = new Date(a.date);
        const [ha, ma] = a.departure_time.split(':').map(Number);
        da.setHours(ha, ma);
        
        const db = new Date(b.date);
        const [hb, mb] = b.departure_time.split(':').map(Number);
        db.setHours(hb, mb);
        
        return da - db;
    });

    matchingSchedules.forEach((s, i) => {
        console.log(`[${i}] Date: ${s.date.toISOString()} | Route: ${s.route_id} | Dep: ${s.departure_time} | Arr: ${s.arrival_time}`);
    });

    await mongoose.connection.close();
  } catch (err) {
    console.error(err);
  }
}

checkChain();
