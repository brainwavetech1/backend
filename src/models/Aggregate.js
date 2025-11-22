import mongoose from 'mongoose';

const AggregateSchema = new mongoose.Schema(
  {
    date: { type: String, index: true },
    totalHouseholds: Number,
    avgConsumption: Number,
    avgBill: Number,
    anomaliesFlagged: Number,
    generatedAt: { type: Date, default: Date.now },
  },
  { collection: 'aggregates', timestamps: true }
);

export default mongoose.model('Aggregate', AggregateSchema);
