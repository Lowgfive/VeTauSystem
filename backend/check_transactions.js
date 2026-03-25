
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const mongoUri = process.env.MONGO_URI;

async function checkTransactions() {
  try {
    await mongoose.connect(mongoUri);
    console.log('Connected');

    const transactions = await mongoose.connection.db.collection('transactions')
      .find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray();

    const fs = require('fs');
    fs.writeFileSync('tx_results.json', JSON.stringify({ transactions, bookings }, null, 2));

    await mongoose.connection.close();
  } catch (err) {
    console.error('Error:', err);
  }
}

checkTransactions();
