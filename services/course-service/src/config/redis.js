import Redis from "ioredis";

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

console.log(`🔌 [Redis] Initializing client connecting to: ${redisUrl}`);

const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    const delay = Math.min(times * 100, 3000);
    return delay;
  },
});

redis.on("connect", () => {
  console.log("✅ [Redis] Client successfully connected");
});

redis.on("error", (err) => {
  console.error("❌ [Redis] Client error:", err.message);
});

export default redis;
