import express from 'express';
import Report from '../models/Report.js';
import { asyncHandler } from '../utils/error.js';

const router = express.Router();

// Create report directly
router.post('/', asyncHandler(async (req, res) => {
  const report = await Report.create(req.body);
  res.status(201).json(report);
}));

// Get all reports with optional filters
router.get('/', asyncHandler(async (req, res) => {
  const { ownerId, userId, limit } = req.query;
  const query = {};
  if (ownerId) query.ownerId = ownerId;
  if (userId) query.user = userId;
  const q = Report.find(query).sort('-createdAt');
  if (limit) q.limit(Number(limit));
  const reports = await q;
  res.json(reports);
}));

// Get single report by id
router.get('/:id', asyncHandler(async (req, res) => {
  const report = await Report.findById(req.params.id);
  if (!report) return res.status(404).json({ message: 'Report not found' });
  res.json(report);
}));

export default router;
