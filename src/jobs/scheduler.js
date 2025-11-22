import cron from 'node-cron';
import { buildNightlyAggregate } from './aggregates.js';
import { runBackup } from './backup.js';
import { enqueueAiCall } from '../queues/aiQueue.js';

export function startSchedulers() {
  if (process.env.DISABLE_CRON === 'true') {
    console.log('[cron] disabled via env');
    return;
  }

  cron.schedule(process.env.AGGREGATE_CRON || '5 2 * * *', async () => {
    console.log('[cron] nightly aggregate job start');
    try {
      await buildNightlyAggregate();
      console.log('[cron] nightly aggregate job finished');
    } catch (err) {
      console.error('[cron] nightly aggregate job failed', err);
    }
  });

  cron.schedule(process.env.BACKUP_CRON || '0 3 * * *', () => {
    console.log('[cron] backup job start');
    runBackup();
  });

  cron.schedule(process.env.CLUSTERING_CRON || '30 2 * * *', async () => {
    console.log('[cron] clustering refresh start');
    try {
      const queued = await enqueueAiCall({ method: 'POST', path: '/api/clustering/batch', body: { mode: 'nightly' }, cacheKey: 'nightly-cluster' });
      if (queued) console.log('[cron] clustering refresh queued');
      else console.warn('[cron] clustering refresh skipped (queue unavailable)');
    } catch (err) {
      console.error('[cron] clustering refresh failed', err);
    }
  });
}
