
import { createClient } from 'redis';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

async function flush() {
  const client = createClient({
    url: `redis://${process.env.REDIS_HOST || '127.0.0.1'}:${process.env.REDIS_PORT || 6379}`
  });

  client.on('error', (err) => console.log('Redis Client Error', err));

  await client.connect();
  console.log('Connected to Redis');
  
  await client.flushDb();
  console.log('Redis DB flushed successfully');
  
  await client.quit();
}

flush().catch(console.error);
