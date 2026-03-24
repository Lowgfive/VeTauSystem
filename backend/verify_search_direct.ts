
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { SearchService } from './src/services/search.service';
import { redisClient } from './src/config/redis';

dotenv.config();

async function test() {
  try {
    console.log('Connecting to DB...');
    await mongoose.connect(process.env.MONGO_URI!);
    console.log('DB Connected');

    // Skip redis for this test to see fresh results
    (SearchService as any).searchTrainOriginal = SearchService.searchTrain;
    
    const result = await (SearchService as any).searchOneWay(
        "Hà Nội",
        "Sài Gòn",
        "2026-03-26",
        10,
        0,
        "HN",
        "SG"
    );

    console.log('Search Result:', JSON.stringify(result, null, 2));

    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

test();
