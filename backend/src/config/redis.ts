import { createClient } from "redis";

let activeClient: any;

const createMockRedis = () => {
  const store = new Map<string, any>();
  console.log("🛠️  Using In-Memory Mock Redis");
  return {
    connect: async () => {},
    on: () => {},
    set: async (key: string, value: string, options?: any) => {
      if (options?.NX && store.has(key)) return null;
      store.set(key, value);
      if (options?.EX) {
        setTimeout(() => store.delete(key), options.EX * 1000);
      }
      return "OK";
    },
    get: async (key: string) => store.get(key) ?? null,
    del: async (key: string): Promise<number> => {
      const existed = store.has(key);
      store.delete(key);
      return existed ? 1 : 0;
    },
    isMock: true,
  };
};

const mockClient = createMockRedis();
activeClient = mockClient;

/**
 * Connect to Redis server with fallback to mock
 */
export const connectRedis = async () => {
  try {
    const client = createClient({
      url: process.env.REDIS_URL || "redis://localhost:6379",
      socket: {
        connectTimeout: 1000,
        reconnectStrategy: false,
      }
    });
    
    client.on("error", (err) => {
      // Silence errors after fallback
    });

    await Promise.race([
        client.connect(),
        new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 1500))
    ]);
    
    activeClient = client;
    console.log("✅ Redis connected successfully");
  } catch (err) {
    console.warn("⚠️ Redis connection failed (switching to Mock Redis):", (err as Error).message);
    activeClient = mockClient;
  }
};

// Export a proxy that always points to the active client
export const redisClient = new Proxy({} as any, {
  get: (_target, prop) => {
    return (activeClient as any)[prop];
  },
});
