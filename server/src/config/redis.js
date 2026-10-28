// Optional Redis client with graceful in-memory fallback
const config = require('./index');

class CacheManager {
  constructor() {
    this.memoryStore = new Map();
    this.isRedis = false;
    this.client = null;

    if (config.redisUrl) {
      try {
        const IORedis = require('ioredis');
        this.client = new IORedis(config.redisUrl, {
          maxRetriesPerRequest: 1,
          enableOfflineQueue: false,
        });

        this.client.on('connect', () => {
          this.isRedis = true;
          console.log('[Redis] Connected to Redis server.');
        });

        this.client.on('error', (err) => {
          console.warn('[Redis] Connection error, using memory fallback:', err.message);
          this.isRedis = false;
        });
      } catch (err) {
        console.log('[Redis] ioredis not available or error loading, using memory fallback.');
      }
    } else {
      console.log('[Cache] Using high-performance in-memory presence and cache manager.');
    }
  }

  async get(key) {
    if (this.isRedis && this.client) {
      try {
        return await this.client.get(key);
      } catch {
        return this.memoryStore.get(key) || null;
      }
    }
    return this.memoryStore.get(key) || null;
  }

  async set(key, value, ttlSeconds = null) {
    if (this.isRedis && this.client) {
      try {
        if (ttlSeconds) {
          return await this.client.set(key, value, 'EX', ttlSeconds);
        }
        return await this.client.set(key, value);
      } catch {
        // Fallback to memory
      }
    }
    this.memoryStore.set(key, value);
    if (ttlSeconds) {
      setTimeout(() => this.memoryStore.delete(key), ttlSeconds * 1000);
    }
    return 'OK';
  }

  async del(key) {
    if (this.isRedis && this.client) {
      try {
        await this.client.del(key);
      } catch {
        // Fallback
      }
    }
    this.memoryStore.delete(key);
    return 1;
  }
}

module.exports = new CacheManager();
