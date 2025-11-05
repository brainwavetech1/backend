import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  // Frontend sends a single "Your name" field -> map to firstName
  firstName: { type: String, required: true, trim: true },
  // Optional in the current UI
  lastName: { type: String, trim: true, default: '' },
  email: { type: String, required: true, unique: true, lowercase: true, index: true, trim: true },
  phone: { type: String, default: null },
  houseLocation: { type: String, default: null },
  profileImage: { type: String, default: null },
  role: { type: String, enum: ['Admin', 'Household User'], default: 'Household User' },
  // Store password securely as a hash; optional for legacy docs
  passwordHash: { type: String },
}, { timestamps: true, collection: 'users' });

export default mongoose.model('User', UserSchema);
