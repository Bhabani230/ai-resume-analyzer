import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, X, Sparkles, AlertCircle, Loader2, ArrowRight } from 'lucide-react';

const SAMPLE_JOB_DESCRIPTION = `Senior Full-Stack Engineer (React & Python)

We are seeking an experienced Full-Stack Software Engineer to build scalable cloud applications.

Requirements:
- 4+ years of professional experience building web applications with React, TypeScript, and modern state management.
- Strong backend experience with Python (FastAPI, Flask, or Django) or Node.js (Express).
- Experience designing RESTful APIs, microservices, and database schemas (PostgreSQL, MongoDB).
- Familiarity with cloud platforms (AWS, GCP), Docker containerization, and CI/CD pipelines.
- Proven track record of optimizing performance, writing unit/integration tests, and collaborating with cross-functional teams.
- Excellent communication skills and mentoring junior developers.`;

export default function UploadForm({ onAnalyze, isLoading, error }) {
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [validationError, setValidationError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    setValidationError('');
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (!selected.name.toLowerCase().endsWith('.pdf') && selected.type !== 'application/pdf') {
        setValidationError('Please select a valid PDF file.');
        return;
      }
      setFile(selected);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setValidationError('');
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const dropped = e.dataTransfer.files[0];
      if (!dropped.name.toLowerCase().endsWith('.pdf') && dropped.type !== 'application/pdf') {
        setValidationError('Please drop a valid PDF file.');
        return;
      }
      setFile(dropped);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setValidationError('');

    if (!file) {
      setValidationError('Please upload your resume in PDF format.');
      return;
    }
    if (!jobDescription.trim() || jobDescription.trim().length < 20) {
      setValidationError('Please enter a target job description (at least 20 characters).');
      return;
    }

    onAnalyze(file, jobDescription);
  };

  const handleRemoveFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleInsertSample = () => {
    setJobDescription(SAMPLE_JOB_DESCRIPTION);
    setValidationError('');
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Intro Header */}
      <div className="mb-8 text-center sm:text-left">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
          Audit Your Resume with AI
        </h1>
        <p className="mt-2 text-sm sm:text-base text-slate-600">
          Upload your resume PDF and paste the target job description to get a realistic ATS compatibility score,
          keyword gap analysis, and quantified bullet point rewrites.
        </p>
      </div>

      {/* Error Banners */}
      {(validationError || error) && (
        <div className="mb-6 p-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm font-medium">
            {validationError || error}
          </div>
        </div>
      )}

      {/* Main Upload Form Card */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 sm:p-8 space-y-6">
          {/* Step 1: File Upload */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              1. Upload Resume (PDF format)
            </label>

            {!file ? (
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                  dragActive
                    ? 'border-indigo-600 bg-indigo-50/50'
                    : 'border-slate-300 hover:border-slate-400 bg-slate-50/50 hover:bg-slate-50'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="flex flex-col items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-medium text-slate-700">
                    <span className="text-indigo-600 hover:text-indigo-500 font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-slate-500 mt-1">PDF document only (up to 10MB)</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between p-4 rounded-lg border border-slate-200 bg-slate-50">
                <div className="flex items-center gap-3 truncate">
                  <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="truncate">
                    <p className="text-sm font-medium text-slate-800 truncate">{file.name}</p>
                    <p className="text-xs text-slate-500">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  disabled={isLoading}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-200 transition-colors"
                  title="Remove file"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Step 2: Job Description */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="job-description" className="block text-sm font-semibold text-slate-700">
                2. Target Job Description
              </label>
              <button
                type="button"
                onClick={handleInsertSample}
                disabled={isLoading}
                className="text-xs font-medium text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1 hover:underline"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Fill sample job description</span>
              </button>
            </div>
            <textarea
              id="job-description"
              rows={7}
              value={jobDescription}
              onChange={(e) => {
                setJobDescription(e.target.value);
                setValidationError('');
              }}
              placeholder="Paste the complete job posting here (job title, key requirements, qualifications, and responsibilities)..."
              disabled={isLoading}
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent text-slate-800 placeholder-slate-400 bg-white resize-y"
            />
            <p className="text-xs text-slate-500 mt-1.5">
              The more comprehensive the job description, the more accurate the ATS keyword matching will be.
            </p>
          </div>
        </div>

        {/* Submit Action Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-500">
            Powered by <strong className="font-semibold text-slate-700">Google Gemini Flash</strong> via strict structured schema
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-lg shadow-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Analyzing Resume with AI...</span>
              </>
            ) : (
              <>
                <span>Analyze Resume</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
