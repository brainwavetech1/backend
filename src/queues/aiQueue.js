import { Queue, Worker, QueueEvents } from 'bullmq';
import fetch from 'node-fetch';
import pRetry from 'p-retry';
import { getBullConnection } from '../lib/redis.js';
import { setCached } from '../lib/cache.js';

const AI_API_BASE = process.env.AI_API_BASE || 'https://seahorse-app-8xk3k.ondigitalocean.app';

let queue;
let events;
let worker;

async function callAiEndpoint({ method, path, body, cacheKey }) {
  const fn = async () => {
    const response = await fetch(`${AI_API_BASE}${path}`, {
      method,
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    });
    const text = await response.text();
    if (!response.ok) {
      throw new pRetry.AbortError(JSON.stringify({ status: response.status, body: text }));
    }
    if (cacheKey) {
      await setCached('ai:' + cacheKey, { method, path, body }, { status: response.status, body: text }, Number(process.env.AI_CACHE_TTL || 600));
    }
    return { status: response.status, body: text };
  };
  try {
    return await pRetry(fn, {
      retries: Number(process.env.AI_RETRY_COUNT || 3),
      factor: 2,
      minTimeout: 1000,
    });
  } catch (err) {
    if (err instanceof pRetry.AbortError) {
      const parsed = JSON.parse(err.message || '{}');
      return { status: parsed.status || 500, body: parsed.body || 'AI service error' };
    }
    throw err;
  }
}

export function initAiQueue() {
  if (queue) return { queue, events };
  const connection = getBullConnection();
  if (!connection) {
    console.warn('[queue] Redis not configured, AI queue disabled');
    return { queue: null, events: null };
  }
  queue = new Queue('ai-proxy', connection);
  events = new QueueEvents('ai-proxy', connection);
  worker = new Worker(
    'ai-proxy',
    async (job) => {
      return callAiEndpoint(job.data);
    },
    {
      ...connection,
      concurrency: Number(process.env.AI_QUEUE_CONCURRENCY || 5),
    }
  );
  worker.on('failed', (job, err) => {
    console.error(`[queue] AI job ${job?.id} failed`, err);
  });
  return { queue, events };
}

export async function enqueueAiCall(data) {
  const { queue: q } = initAiQueue();
  if (!q) return null;
  return q.add('ai-proxy', data, {
    attempts: Number(process.env.AI_JOB_ATTEMPTS || 4),
    backoff: { type: 'exponential', delay: 2000 },
    removeOnComplete: true,
    removeOnFail: true,
  });
}

export function getAiQueueEvents() {
  initAiQueue();
  return events;
}
