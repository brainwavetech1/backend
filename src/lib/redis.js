import IORedis from 'ioredis';

let client;

export function getRedisConnectionOptions() {
  const url = process.env.REDIS_URL || process.env.REDIS_TLS_URL;
  if (!url) return null;
  return {
    maxRetriesPerRequest: null,
    enableOfflineQueue: true,
    lazyConnect: true,
    tls: url.startsWith('rediss://') ? {} : undefined,
  };
}

export async function getRedisClient() {
  if (client) return client;
  const opts = getRedisConnectionOptions();
  if (!opts) return null;
  client = new IORedis(process.env.REDIS_URL || process.env.REDIS_TLS_URL, opts);
  client.on('error', (err) => {
    console.error('[redis] connection error', err.message);
  });
  client.on('connect', () => {
    console.log('[redis] connected');
  });
  try {
    await client.connect();
  } catch (err) {
    console.error('[redis] failed to connect, features disabled', err.message);
    client = null;
    return null;
  }
  return client;
}

export function getBullConnection() {
  const opts = getRedisConnectionOptions();
  if (!opts) return null;
  return {
    connection: {
      ...opts,
      url: process.env.REDIS_URL || process.env.REDIS_TLS_URL,
    },
  };
}
