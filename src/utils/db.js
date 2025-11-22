import mongoose from 'mongoose';

export async function connectDB() {
  // Keep simple local/default connection; still allow override via MONGODB_URI/MONGO_URI
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/energy';

  mongoose.set('strictQuery', true);
  await mongoose.connect(uri, { dbName: 'energy' });
  global.__MONGO_CONNECTED__ = true;
  console.log('MongoDB connected:', uri);
}
