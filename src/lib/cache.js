import crypto from 'crypto';
import { getRedisClient } from './redis.js';

const memoryCache = new Map();
const defaultTtl = Number(process.env.CACHE_TTL_SECONDS || 300);

function buildKey(namespace, payload) {
  const hash = crypto.createHash('sha1').update(JSON.stringify(payload || {})).digest('hex');
  return `${namespace}:${hash}`;
}

export async function getCached(namespace, payload) {
  const key = buildKey(namespace, payload);
  const redis = await getRedisClient();
  if (redis) {
    const hit = await redis.get(key);
    return hit ? JSON.parse(hit) : null;
  }
  const entry = memoryCache.get(key);
  if (!entry) return null;
  if (entry.expire < Date.now()) {
    memoryCache.delete(key);
    return null;
  }
  return entry.value;
}

export async function setCached(namespace, payload, value, ttlSeconds = defaultTtl) {
  const key = buildKey(namespace, payload);
  const redis = await getRedisClient();
  const ttl = ttlSeconds || defaultTtl;
  if (redis) {
    await redis.set(key, JSON.stringify(value), 'EX', ttl);
    return;
  }
  memoryCache.set(key, { value, expire: Date.now() + ttl * 1000 });
}

export async function clearNamespace(namespace) {
  const redis = await getRedisClient();
  if (redis) {
    const pattern = `${namespace}:*`;
    const keys = await redis.keys(pattern);
    if (keys.length) await redis.del(keys);
    return;
  }
  [...memoryCache.keys()].forEach((key) => {
    if (key.startsWith(`${namespace}:`)) memoryCache.delete(key);
  });
}
