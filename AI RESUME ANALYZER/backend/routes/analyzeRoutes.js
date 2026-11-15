import express from 'express';
import multer from 'multer';
import axios from 'axios';
import FormData from 'form-data';
import mongoose from 'mongoose';
import Analysis from '../models/Analysis.js';

const router = express.Router();

// Multer memory storage - keeps PDF in buffer without touching disk
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || file.originalname.toLowerCase().endsWith('.pdf')) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are supported.'));
    }
  },
});

// Fallback in-memory store in case MongoDB is offline during local testing
const inMemoryStore = [];

/**
 * Helper to check whether MongoDB is connected
 */
const isMongoConnected = () => mongoose.connection.readyState === 1;

/**
 * POST /api/analyze
 * Accepts: PDF file (multipart) + job_description (string)
 * Forwards to FastAPI AI Service and persists result in database
 */
router.post('/analyze', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No resume PDF file uploaded. Please provide a PDF.',
      });
    }

    const jobDescription = req.body.job_description || req.body.jobDescription || '';
    if (!jobDescription.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Job description is required for ATS comparison.',
      });
    }

    // Prepare multipart form data for Python FastAPI ai-service
    const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000';
    const formData = new FormData();

    formData.append('file', req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype || 'application/pdf',
    });
    formData.append('job_description', jobDescription);

    // Call Python FastAPI AI Service
    let aiResponse;
    try {
      aiResponse = await axios.post(`${aiServiceUrl}/analyze`, formData, {
        headers: {
          ...formData.getHeaders(),
        },
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
        timeout: 120000, // 2-minute timeout for large documents
      });
    } catch (apiErr) {
      const status = apiErr.response?.status || 502;
      const detail = apiErr.response?.data?.detail || apiErr.message;
      return res.status(status).json({
        success: false,
        message: `AI Service error: ${detail}`,
      });
    }

    const report = aiResponse.data;
    const cleanSnippet = jobDescription.trim().slice(0, 140) + (jobDescription.length > 140 ? '...' : '');

    let savedRecord = null;

    // Persist to MongoDB if connected, else fallback to in-memory store
    if (isMongoConnected()) {
      try {
        const record = new Analysis({
          fileName: req.file.originalname,
          jobSnippet: cleanSnippet,
          atsScore: report.ats_score,
          report: report,
        });
        savedRecord = await record.save();
      } catch (dbErr) {
        console.warn('[Database] Failed to save in MongoDB, using memory fallback:', dbErr.message);
      }
    }

    if (!savedRecord) {
      savedRecord = {
        _id: 'mem_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
        fileName: req.file.originalname,
        jobSnippet: cleanSnippet,
        atsScore: report.ats_score,
        report: report,
        createdAt: new Date().toISOString(),
      };
      inMemoryStore.unshift(savedRecord);
    }

    return res.status(200).json({
      success: true,
      message: 'Resume analysis completed successfully.',
      data: report,
      record: savedRecord,
    });
  } catch (error) {
    console.error('Error in /api/analyze:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal server error occurred during analysis.',
    });
  }
});

/**
 * GET /api/history
 * Returns list of previous resume scans
 */
router.get('/history', async (req, res) => {
  try {
    if (isMongoConnected()) {
      const records = await Analysis.find().sort({ createdAt: -1 }).limit(50);
      return res.status(200).json({
        success: true,
        count: records.length,
        history: records,
      });
    }

    // Return in-memory fallback records
    return res.status(200).json({
      success: true,
      count: inMemoryStore.length,
      history: inMemoryStore,
    });
  } catch (error) {
    console.error('Error fetching history:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve scan history.',
    });
  }
});

/**
 * GET /api/history/:id
 * Returns a single analysis report by its ID
 */
router.get('/history/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (isMongoConnected() && mongoose.isValidObjectId(id)) {
      const record = await Analysis.findById(id);
      if (record) {
        return res.status(200).json({ success: true, data: record });
      }
    }

    const memoryItem = inMemoryStore.find((item) => item._id === id);
    if (memoryItem) {
      return res.status(200).json({ success: true, data: memoryItem });
    }

    return res.status(404).json({
      success: false,
      message: 'Analysis record not found.',
    });
  } catch (error) {
    console.error('Error retrieving record:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve record.',
    });
  }
});

/**
 * DELETE /api/history/:id
 * Deletes a single analysis record by its ID
 */
router.delete('/history/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (isMongoConnected() && mongoose.isValidObjectId(id)) {
      await Analysis.findByIdAndDelete(id);
    }

    const index = inMemoryStore.findIndex((item) => item._id === id);
    if (index !== -1) {
      inMemoryStore.splice(index, 1);
    }

    return res.status(200).json({
      success: true,
      message: 'Record deleted successfully.',
    });
  } catch (error) {
    console.error('Error deleting record:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete record.',
    });
  }
});

export default router;
