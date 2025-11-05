import mongoose from 'mongoose';

const FeedbackSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true, maxlength: 2000 },
    rating: { type: Number, required: true, min: 1, max: 5 },
    householdId: { type: String, index: true },
  },
  { timestamps: true, collection: 'feedbacks' }
);

export default mongoose.model('Feedback', FeedbackSchema);
