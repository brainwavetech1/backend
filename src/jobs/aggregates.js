import Aggregate from '../models/Aggregate.js';
import Report from '../models/Report.js';
import Prediction from '../models/Prediction.js';

export async function buildNightlyAggregate() {
  const today = new Date().toISOString().slice(0, 10);
  const reports = await Report.find({ createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } }).lean();
  if (!reports.length) {
    await Aggregate.create({ date: today, totalHouseholds: 0, avgConsumption: 0, avgBill: 0, anomaliesFlagged: 0 });
    return;
  }
  const totalConsumption = reports.reduce((sum, r) => sum + Number(r.total_kwh || r.consumption || 0), 0);
  const totalBill = reports.reduce((sum, r) => sum + Number(r.total_bill || r.bill || 0), 0);
  const anomalies = await Prediction.countDocuments({ message: /anomaly/i, createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } });
  await Aggregate.findOneAndUpdate(
    { date: today },
    {
      date: today,
      totalHouseholds: reports.length,
      avgConsumption: totalConsumption / reports.length,
      avgBill: totalBill / reports.length,
      anomaliesFlagged: anomalies,
      generatedAt: new Date(),
    },
    { upsert: true }
  );
}
