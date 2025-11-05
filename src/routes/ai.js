import express from 'express';
import fetch from 'node-fetch';

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
    const r = await fetch(`${AI_API_BASE}/api/clustering/batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(req.body),
    });
    const text = await r.text();
    res.status(r.status).type('application/json').send(text);
  } catch (err) {
    res.status(502).json({ status: 'error', message: 'Failed to reach AI clustering endpoint', error: String(err) });
  }
});

// Prediction proxy (household predictions)
router.post('/predict', async (req, res) => {
  try {
    const r = await fetch(`${AI_API_BASE}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(req.body),
    });
    const text = await r.text();
    res.status(r.status).type('application/json').send(text);
  } catch (err) {
    res.status(502).json({ status: 'error', message: 'Failed to reach AI predict endpoint', error: String(err) });
  }
});

// Timeseries status proxy
router.get('/timeseries/status', async (_req, res) => {
  try {
    const r = await fetch(`${AI_API_BASE}/api/timeseries/status`, { headers: { 'Accept': 'application/json' } });
    const text = await r.text();
    res.status(r.status).type('application/json').send(text);
  } catch (err) {
    res.status(502).json({ status: 'error', message: 'Failed to reach AI timeseries status endpoint', error: String(err) });
  }
});

// Timeseries forecast proxy
router.post('/timeseries/forecast', async (req, res) => {
  try {
    const r = await fetch(`${AI_API_BASE}/api/timeseries/forecast`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(req.body),
    });
    const text = await r.text();
    res.status(r.status).type('application/json').send(text);
  } catch (err) {
    res.status(502).json({ status: 'error', message: 'Failed to reach AI timeseries forecast endpoint', error: String(err) });
  }
});

export default router;
