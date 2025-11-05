import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { connectDB } from './utils/db.js';
import { notFound, errorHandler } from './utils/error.js';

// Routes
import usersRouter from './routes/users.js';
import predictionsRouter from './routes/predictions.js';
import reportsRouter from './routes/reports.js';
import aiRouter from './routes/ai.js';
import feedbackRouter from './routes/feedback.js';
import authRouter from './routes/auth.js';

dotenv.config();

const app = express();

// Basic security and parsing
app.use(helmet());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// CORS: allow all origins (use with care in production)
app.use(cors());
// Preflight for all routes
app.options('*', cors());

// Logging
app.use(morgan('dev'));

// Health endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', db: (global.__MONGO_CONNECTED__ ? 'connected' : 'disconnected') });
});

// API routes
app.use('/api/users', usersRouter);
app.use('/api/auth', authRouter);
app.use('/api/predictions', predictionsRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/ai', aiRouter);
app.use('/api/feedback', feedbackRouter);

// 404 and error handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 4000;

// Connect DB then start server
connectDB().then(() => {
  app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
}).catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

export default app;
