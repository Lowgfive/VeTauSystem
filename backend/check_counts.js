
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const mongoUri = process.env.MONGO_URI;

async function checkRemainingSchedules() {
  await mongoose.connect(mongoUri);
  const Train = mongoose.model('Train', new mongoose.Schema({ train_code: String }, { collection: 'trains' }));
  const Schedule = mongoose.model('Schedule', new mongoose.Schema({}, { collection: 'schedules', strict: false }));
  
  const seTrains = await Train.find({ train_code: { $in: ['SE1', 'SE2'] } }).lean();
  
  for (const t of seTrains) {
    const count = await Schedule.countDocuments({ train_id: t._id });
    console.log(`Train ${t.train_code}: ${count} schedules remaining.`);
    
    if (count > 0) {
      const sample = await Schedule.findOne({ train_id: t._id }).sort({ date: 1 }).lean();
      console.log(`  Sample date: ${sample.date.toISOString()}`);
    }
  }
  
  await mongoose.connection.close();
}

checkRemainingSchedules().catch(err => {
  console.error(err);
  process.exit(1);
});
