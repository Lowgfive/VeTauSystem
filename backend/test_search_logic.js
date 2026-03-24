
require('ts-node').register({ transpileOnly: true });
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { SearchService } = require('./src/services/search.service');
const { connectRedis } = require('./src/config/redis');

dotenv.config();

async function testApi() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('DB connected');
    await connectRedis();
    console.log('Redis connected');

    const result = await SearchService.searchTrain(
      "Hà Nội",
      "Sài Gòn",
      "2026-03-26",
      undefined,
      1,
      10,
      "HN",
      "SG"
    );

    console.log("RESULT ONEWAY =>", JSON.stringify(result, null, 2));

    process.exit(0);
  } catch (err) {
    console.error("FATAL ERROR =>", err);
    process.exit(1);
  }
}

testApi();
