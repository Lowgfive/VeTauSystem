
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const mongoUri = process.env.MONGO_URI;

async function checkSE2() {
  await mongoose.connect(mongoUri);
  const Train = mongoose.model('Train', new mongoose.Schema({}, { collection: 'trains', strict: false }));
  const se2 = await Train.findOne({ train_code: 'SE2' }).lean();
  console.log(JSON.stringify(se2, null, 2));
  await mongoose.connection.close();
}

checkSE2().catch(err => {
  console.error(err);
  process.exit(1);
});
