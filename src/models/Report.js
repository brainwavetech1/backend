import mongoose from 'mongoose';

const PredictionApplianceSchema = new mongoose.Schema({
  name: String,
  consumption: String,
  bill: String,
  percentage: String,
  powerWatts: Number,
}, { _id: false });

const HouseholdDataSchema = new mongoose.Schema({
  region: String,
  incomeLevel: String,
  householdSize: mongoose.Schema.Types.Mixed,
  monthlyBudget: mongoose.Schema.Types.Mixed,
}, { _id: false });

const ReportSchema = new mongoose.Schema({
  ownerId: { type: String, index: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  timestamp: { type: Date, default: Date.now },
  consumption: mongoose.Schema.Types.Mixed,
  bill: mongoose.Schema.Types.Mixed,
  total_kwh: Number,
  total_bill: Number,
  tariffBracket: String,
  tariff_bracket: String, // allow either
  householdData: HouseholdDataSchema,
  household_size: Number,
  region: String,
  income_level: String,
  budget: Number,
  appliances: [PredictionApplianceSchema],
  breakdown: { type: Array, default: [] },
  ai_recommendations: { type: Array, default: [] },
  report_id: String,
}, { timestamps: true, collection: 'reports' });

export default mongoose.model('Report', ReportSchema);
