import fetch from 'node-fetch';
import pRetry from 'p-retry';
import { enqueueAiCall, getAiQueueEvents } from '../queues/aiQueue.js';
import { getCached, setCached } from '../lib/cache.js';

const AI_API_BASE = process.env.AI_API_BASE || 'https://seahorse-app-8xk3k.ondigitalocean.app';

async function directAiRequest(method, path, body, cacheKey) {
  const attempt = async () => {
    const res = await fetch(`${AI_API_BASE}${path}`, {
      method,
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    });
    const text = await res.text();
    if (!res.ok) throw new Error(text || 'AI service error');
    if (cacheKey) await setCached('ai:' + cacheKey, { method, path, body }, { status: res.status, body: text }, Number(process.env.AI_CACHE_TTL || 600));
    return { status: res.status, body: text };
  };
  return pRetry(attempt, {
    retries: Number(process.env.AI_RETRY_COUNT || 3),
    factor: 2,
    minTimeout: 1000,
  });
}

export async function callAi(method, path, body, options = {}) {
  const cacheKey = options.cacheKey;
  if (cacheKey) {
    const cached = await getCached('ai:' + cacheKey, { method, path, body });
    if (cached) return cached;
  }
  const payload = { method, path, body, cacheKey };
  const job = await enqueueAiCall(payload);
  if (job) {
    try {
      const events = getAiQueueEvents();
      return await job.waitUntilFinished(events, Number(process.env.AI_JOB_TIMEOUT || 20000));
    } catch (err) {
      console.error('[ai] queue wait failed, falling back to direct call', err.message);
    }
  }
  return directAiRequest(method, path, body, cacheKey);
}
