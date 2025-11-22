import express from 'express';
import User from '../models/User.js';
import { asyncHandler } from '../utils/error.js';

const router = express.Router();

// Create user
router.post('/', asyncHandler(async (req, res) => {
  const user = await User.create(req.body);
  res.status(201).json(user);
}));

// List users
router.get('/', asyncHandler(async (_req, res) => {
  const users = await User.find().sort('-createdAt');
  res.json(users);
}));

// Get by id
router.get('/:id', asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
}));

// Update
router.put('/:id', asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
}));

// Delete
router.delete('/:id', asyncHandler(async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json({ message: 'User deleted' });
}));

// Find by email
router.get('/by-email/:email', asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.params.email.toLowerCase() });
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
}));

export default router;
