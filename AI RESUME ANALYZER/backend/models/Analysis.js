import mongoose from 'mongoose';

/**
 * Analysis Schema
 * Stores historical resume ATS evaluations including candidate score,
 * filename, target job snippet, and full structured report.
 */
const AnalysisSchema = new mongoose.Schema(
  {
    fileName: {
      type: String,
      required: true,
      trim: true,
    },
    jobSnippet: {
      type: String,
      required: true,
      trim: true,
    },
    atsScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    report: {
      ats_score: Number,
      candidate_summary: String,
      matched_skills: [String],
      missing_keywords: [String],
      formatting_issues: [String],
      bullet_improvements: [
        {
          original: String,
          improved: String,
          reason: String,
        },
      ],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const Analysis = mongoose.model('Analysis', AnalysisSchema);

export default Analysis;
