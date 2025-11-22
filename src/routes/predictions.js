import express from 'express';
import Prediction from '../models/Prediction.js';
import Report from '../models/Report.js';
import { asyncHandler } from '../utils/error.js';
import { handlePrediction } from '../services/predictionService.js';
import { clearNamespace } from '../lib/cache.js';

const router = express.Router();

// Create prediction (and optionally persist a report snapshot)
router.post('/', asyncHandler(async (req, res) => {
  const payload = req.body || {};
  const result = await handlePrediction(payload);
  await clearNamespace('reports');
  res.status(201).json(result);
}));

// List predictions (filter by ownerId or user)
router.get('/', asyncHandler(async (req, res) => {
  const { ownerId, userId } = req.query;
  const query = {};
  if (ownerId) query.ownerId = ownerId;
  if (userId) query.user = userId;
  const docs = await Prediction.find(query).sort('-createdAt');
  res.json(docs);
}));

// Get by id
router.get('/:id', asyncHandler(async (req, res) => {
  const doc = await Prediction.findById(req.params.id);
  if (!doc) return res.status(404).json({ message: 'Prediction not found' });
  res.json(doc);
}));

export default router;
