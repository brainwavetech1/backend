import { Queue, Worker, QueueEvents } from 'bullmq';
import Prediction from '../models/Prediction.js';
import Report from '../models/Report.js';
import { getBullConnection } from '../lib/redis.js';

let queue;
let events;
let worker;

export function initPredictionQueue() {
  if (queue) return { queue, events };
  const connection = getBullConnection();
  if (!connection) {
    console.warn('[queue] Redis not configured, prediction queue disabled');
    return { queue: null, events: null };
  }
  queue = new Queue('prediction-report', connection);
  events = new QueueEvents('prediction-report', connection);
  worker = new Worker(
    'prediction-report',
    async (job) => {
      const payload = job.data;
      const prediction = await Prediction.create(payload);
      let report = null;
      if (payload?.householdData || payload?.appliances) {
        report = await Report.create({
          ...payload,
          tariffBracket: payload.tariffBracket ?? payload.tariff_bracket,
          tariff_bracket: payload.tariff_bracket ?? payload.tariffBracket,
          timestamp: payload.timestamp ? new Date(payload.timestamp) : new Date(),
          ownerId: payload.ownerId,
        });
      }
      return { prediction, report };
    },
    {
      ...connection,
      concurrency: Number(process.env.PREDICTION_QUEUE_CONCURRENCY || 3),
    }
  );
  worker.on('failed', (job, err) => {
    console.error(`[queue] prediction job ${job?.id} failed`, err);
  });
  return { queue, events };
}

export async function enqueuePrediction(payload) {
  const { queue: q } = initPredictionQueue();
  if (!q) return null;
  return q.add('prediction-report', payload, {
    attempts: Number(process.env.PREDICTION_JOB_ATTEMPTS || 3),
    backoff: { type: 'exponential', delay: 3000 },
    removeOnComplete: true,
    removeOnFail: true,
  });
}

export function getPredictionQueueEvents() {
  initPredictionQueue();
  return events;
}
