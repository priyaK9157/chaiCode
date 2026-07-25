import Redis from "ioredis";

const redisUrl = process.env.REDIS_URL;
let redis = null;

if (redisUrl) {
  console.log(`🔌 [Redis] Initializing client connecting to: ${redisUrl}`);
  redis = new Redis(redisUrl, {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
      if (times > 10) {
        console.warn("⚠️ [Redis] Reached max retry attempts. Disabling client.");
        return null; // Stop retrying
      }
      return Math.min(times * 200, 5000);
    },
  });

  redis.on("connect", () => {
    console.log("✅ [Redis] Client successfully connected");
  });

  redis.on("error", (err) => {
    console.error("❌ [Redis] Client error:", err.message);
  });
} else {
  console.log("⚠️ [Redis] REDIS_URL not configured. Caching is disabled (falling back to database).");
  // Export a mock object that behaves like Redis but resolves silently
  redis = {
    get: async () => null,
    setex: async () => null,
    del: async () => null,
  };
}

export default redis;
