const mongoose = require('mongoose');
require('dotenv').config();

async function check() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const db = mongoose.connection.db;
    
    const bookings = await db.collection('bookings').find({}).sort({createdAt: -1}).limit(5).toArray();
    console.log("== BOOKINGS ==");
    bookings.forEach(b => {
      console.log(`ID: ${b._id}, status: ${b.status}, txnRef: ${b.payment_txn_ref}, method: ${b.payment_method}`);
    });

    const transactions = await db.collection('transactions').find({}).sort({createdAt: -1}).limit(5).toArray();
    console.log("== TRANSACTIONS ==");
    transactions.forEach(t => {
      console.log(`ID: ${t._id}, status: ${t.status}, txnRef: ${t.payment_txn_ref}, bookingId: ${t.booking_id}, type: ${t.type}`);
    });
    
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}
check();
