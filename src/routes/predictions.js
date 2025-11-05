import express from 'express';
import Prediction from '../models/Prediction.js';
import Report from '../models/Report.js';
import { asyncHandler } from '../utils/error.js';

const router = express.Router();

// Create prediction (and optionally persist a report snapshot)
router.post('/', asyncHandler(async (req, res) => {
  const payload = req.body || {};

  // Save prediction
  const prediction = await Prediction.create(payload);

  // Also create a report snapshot if asked or if it looks like report data is present
  const createReport = payload?.householdData || payload?.appliances;
  let reportDoc = null;
  if (createReport) {
    reportDoc = await Report.create({
      ...payload,
      tariffBracket: payload.tariffBracket ?? payload.tariff_bracket,
      tariff_bracket: payload.tariff_bracket ?? payload.tariffBracket,
      timestamp: payload.timestamp ? new Date(payload.timestamp) : new Date(),
      ownerId: payload.ownerId,
    });
  }

  res.status(201).json({ prediction, report: reportDoc });
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
