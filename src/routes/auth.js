import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { asyncHandler } from '../utils/error.js';

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Helper to shape safe user object
const publicUser = (u) => ({
  id: u._id,
  firstName: u.firstName,
  lastName: u.lastName,
  email: u.email,
  phone: u.phone,
  houseLocation: u.houseLocation,
  profileImage: u.profileImage,
  role: u.role,
  createdAt: u.createdAt,
  updatedAt: u.updatedAt,
});

// POST /api/auth/register
router.post('/register', asyncHandler(async (req, res) => {
  const { firstName, lastName = '', email, password, phone, houseLocation, profileImage, role } = req.body || {};
  if (!firstName || !email || !password) {
    return res.status(400).json({ message: 'firstName, email and password are required' });
  }

  const existing = await User.findOne({ email: String(email).toLowerCase() });
  if (existing) {
    return res.status(409).json({ message: 'Email already registered' });
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  const user = await User.create({
    firstName,
    lastName,
    email: String(email).toLowerCase(),
    phone,
    houseLocation,
    profileImage,
    role: role && ['Admin', 'Household User'].includes(role) ? role : 'Household User',
    passwordHash,
  });

  const token = jwt.sign({ sub: user._id, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  res.status(201).json({ user: publicUser(user), token });
}));

// POST /api/auth/login
router.post('/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ message: 'email and password are required' });
  }

  const user = await User.findOne({ email: String(email).toLowerCase() });
  if (!user || !user.passwordHash) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = jwt.sign({ sub: user._id, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  res.json({ user: publicUser(user), token });
}));

export default router;
