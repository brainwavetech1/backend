import express from 'express';
import fetch from 'node-fetch';
import { callAi } from '../services/aiService.js';

const router = express.Router();

// Base URL of the FastAPI AI service. Defaults to the deployed DigitalOcean URL if not provided.
const AI_API_BASE = process.env.AI_API_BASE || 'https://seahorse-app-8xk3k.ondigitalocean.app';

// Health proxy to AI service
router.get('/health', async (_req, res) => {
  try {
    const r = await fetch(`${AI_API_BASE}/health`, { headers: { 'Accept': 'application/json' } });
    const text = await r.text();
    let json;
    try { json = JSON.parse(text); } catch { json = { raw: text }; }
    res.status(r.status).json(json);
  } catch (err) {
    res.status(503).json({ status: 'offline', message: `AI service not reachable at ${AI_API_BASE}/health`, error: String(err) });
  }
});

// Clustering batch proxy
router.post('/clustering/batch', async (req, res) => {
  try {
    const result = await callAi('POST', '/api/clustering/batch', req.body, { cacheKey: 'cluster-batch' });
    res.status(result.status).type('application/json').send(result.body);
  } catch (err) {
    res.status(502).json({ status: 'error', message: 'Failed to reach AI clustering endpoint', error: String(err) });
  }
});

// Prediction proxy (household predictions)
router.post('/predict', async (req, res) => {
  try {
    const result = await callAi('POST', '/predict', req.body);
    res.status(result.status).type('application/json').send(result.body);
  } catch (err) {
    res.status(502).json({ status: 'error', message: 'Failed to reach AI predict endpoint', error: String(err) });
  }
});

// Timeseries status proxy
router.get('/timeseries/status', async (_req, res) => {
  try {
    const result = await callAi('GET', '/api/timeseries/status', null, { cacheKey: 'timeseries-status' });
    res.status(result.status).type('application/json').send(result.body);
  } catch (err) {
    res.status(502).json({ status: 'error', message: 'Failed to reach AI timeseries status endpoint', error: String(err) });
  }
});

// Timeseries forecast proxy
router.post('/timeseries/forecast', async (req, res) => {
  try {
    const result = await callAi('POST', '/api/timeseries/forecast', req.body, { cacheKey: 'timeseries-forecast' });
    res.status(result.status).type('application/json').send(result.body);
  } catch (err) {
    res.status(502).json({ status: 'error', message: 'Failed to reach AI timeseries forecast endpoint', error: String(err) });
  }
});

export default router;
