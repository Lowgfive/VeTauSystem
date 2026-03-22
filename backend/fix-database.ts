import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function fixDatabase() {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/BookingSystem';
  try {
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    if (!db) throw new Error('DB not found');
    const collection = db.collection('stations');
    
    // 1. Drop all non-standard indexes
    const indexes = await collection.indexes();
    console.log('Current indexes:', indexes.map(i => i.name));

    for (const idx of indexes) {
      if (idx.name && idx.name !== '_id_') {
        console.log(`Dropping index: ${idx.name}`);
        try {
          await collection.dropIndex(idx.name);
        } catch (e) {
          console.error(`Failed to drop index ${idx.name}:`, e);
        }
      }
    }

    // 2. Update existing records
    const stations = await collection.find({}).toArray();
    console.log(`Processing ${stations.length} stations...`);

    for (const s of stations) {
      const updates: any = {};
      
      // Ensure is_active is true if not set
      if (s.is_active === undefined) {
        updates.is_active = true;
      }

      // Ensure station_code is set (required and unique)
      if (!s.station_code) {
        // Generate a code based on name or order
        const namePart = s.station_name ? s.station_name.substring(0, 3).toUpperCase() : 'STN';
        const orderPart = s.station_order || Math.floor(Math.random() * 1000);
        updates.station_code = `${namePart}${orderPart}`;
      }

      // Ensure station_type is set (default ground)
      if (!s.station_type) {
        updates.station_type = 'ground';
      }

      if (Object.keys(updates).length > 0) {
        console.log(`Updating station ${s.station_name || s._id}:`, updates);
        await collection.updateOne({ _id: s._id }, { $set: updates });
      }
    }

    console.log('Database fix completed.');
    await mongoose.disconnect();
  } catch (err) {
    console.error('Error fixing database:', err);
  }
}

fixDatabase();
