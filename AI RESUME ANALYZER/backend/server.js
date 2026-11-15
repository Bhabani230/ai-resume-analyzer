import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import analyzeRoutes from './routes/analyzeRoutes.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/resume_analyzer';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    backend: 'Express + Node.js',
    mongoConnected: mongoose.connection.readyState === 1,
    aiServiceUrl: process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000',
  });
});

// API Routes
app.use('/api', analyzeRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    name: 'AI Resume Analyzer - Backend API',
    status: 'running',
    endpoints: {
      health: 'GET /api/health',
      analyze: 'POST /api/analyze',
      history: 'GET /api/history',
      historyItem: 'GET /api/history/:id',
    },
  });
});

// Connect to MongoDB with graceful handling
const connectDatabase = async () => {
  try {
    // 3 second serverSelectionTimeout so backend starts immediately even if MongoDB is not local
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`[MongoDB] Connected successfully to: ${MONGODB_URI}`);
  } catch (err) {
    console.warn(
      `[MongoDB] Notice: Could not connect to MongoDB at ${MONGODB_URI}. In-memory fallback will be used for history. (${err.message})`
    );
  }
};

// Start Express Server
const startServer = async () => {
  await connectDatabase();

  app.listen(PORT, () => {
    console.log(`[Backend] Express server running on http://localhost:${PORT}`);
    console.log(`[Backend] AI Service forwarding to: ${process.env.AI_SERVICE_URL || 'http://localhost:8000'}`);
  });
};

startServer();
