import Prediction from '../models/Prediction.js';
import Report from '../models/Report.js';
import { enqueuePrediction, getPredictionQueueEvents } from '../queues/predictionQueue.js';

async function persistPrediction(payload) {
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
}

export async function handlePrediction(payload) {
  const job = await enqueuePrediction(payload);
  if (job) {
    try {
      const events = getPredictionQueueEvents();
      return await job.waitUntilFinished(events, Number(process.env.PREDICTION_JOB_TIMEOUT || 15000));
    } catch (err) {
      console.error('[prediction] queue wait failed, falling back to inline processing', err.message);
    }
  }
  return persistPrediction(payload);
}
