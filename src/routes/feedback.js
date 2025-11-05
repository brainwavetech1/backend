import express from 'express';
import Feedback from '../models/Feedback.js';
import { asyncHandler } from '../utils/error.js';

const router = express.Router();

// POST /api/feedback - create a feedback entry
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const { name, location, message, rating, householdId } = req.body || {};
    if (!name || !location || !message || !rating) {
      res.status(400);
      throw new Error('name, location, message and rating are required');
    }
    const doc = await Feedback.create({ name, location, message, rating, householdId });
    res.status(201).json({ message: 'Feedback sent successfully', id: doc._id });
  })
);

// Optional: GET /api/feedback - list feedback (basic)
router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const list = await Feedback.find({}).sort({ createdAt: -1 }).limit(200).lean();
    res.json(list);
  })
);

export default router;
