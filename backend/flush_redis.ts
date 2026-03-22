import { createClient } from "redis";
const client = createClient();
client.connect().then(async () => {
  await client.flushAll();
  console.log("Redis cache cleared");
  process.exit(0);
}).catch(console.error);
