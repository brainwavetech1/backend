import mongoose from 'mongoose';

const PredictionApplianceSchema = new mongoose.Schema({
  name: String,
  consumption: String, // as displayed text (kWh string)
  bill: String, // RWF string
  percentage: String,
  powerWatts: Number,
}, { _id: false });

const HouseholdDataSchema = new mongoose.Schema({
  region: String,
  incomeLevel: String,
  householdSize: mongoose.Schema.Types.Mixed, // string or number
  monthlyBudget: mongoose.Schema.Types.Mixed,
}, { _id: false });

const PredictionSchema = new mongoose.Schema({
  ownerId: { type: String, index: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  // Display metrics
  consumption: String,
  bill: String,
  tariffBracket: String,
  budgetStatus: String,
  budgetDifference: Number,
  message: String,
  appliances: [PredictionApplianceSchema],
  householdData: HouseholdDataSchema,
  timestamp: { type: Date, default: Date.now },
  total_kwh: Number,
  total_bill: Number,
  report_id: String,
  ai_recommendations: { type: Array, default: [] },
}, { timestamps: true, collection: 'predictions' });

export default mongoose.model('Prediction', PredictionSchema);
