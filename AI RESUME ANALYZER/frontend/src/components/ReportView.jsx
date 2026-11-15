import React, { useState } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Copy, 
  Check, 
  ArrowLeft, 
  FileText, 
  Award, 
  Sparkles, 
  Wrench,
  HelpCircle
} from 'lucide-react';

export default function ReportView({ data, fileName, onBackToForm }) {
  const [copiedIndex, setCopiedIndex] = useState(null);

  if (!data) return null;

  const {
    ats_score = 0,
    candidate_summary = '',
    matched_skills = [],
    missing_keywords = [],
    formatting_issues = [],
    bullet_improvements = [],
  } = data;

  const handleCopyBullet = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Score styling logic
  const getScoreColor = (score) => {
    if (score >= 80) return { stroke: '#059669', badgeBg: 'bg-emerald-100 text-emerald-800', label: 'Strong Match' };
    if (score >= 60) return { stroke: '#4f46e5', badgeBg: 'bg-indigo-100 text-indigo-800', label: 'Good Potential' };
    if (score >= 40) return { stroke: '#d97706', badgeBg: 'bg-amber-100 text-amber-800', label: 'Moderate Match' };
    return { stroke: '#dc2626', badgeBg: 'bg-rose-100 text-rose-800', label: 'Needs Improvement' };
  };

  const scoreMeta = getScoreColor(ats_score);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Navigation & Metadata */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <button
            type="button"
            onClick={onBackToForm}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Analyze another resume</span>
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">ATS Audit Report</h1>
            {fileName && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                <FileText className="w-3 h-3 text-slate-500" />
                {fileName}
              </span>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 shadow-sm transition-colors"
        >
          <span>Print / Save PDF</span>
        </button>
      </div>

      {/* Main Grid: Score & Executive Summary */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* ATS Score Card */}
        <div className="md:col-span-4 bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col items-center justify-center text-center">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Overall ATS Compatibility
          </span>

          <div className="relative w-36 h-36 flex items-center justify-center my-2">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                className="stroke-slate-100"
                strokeWidth="8"
                fill="none"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke={scoreMeta.stroke}
                strokeWidth="8"
                strokeLinecap="round"
                fill="none"
                strokeDasharray={251.2}
                strokeDashoffset={251.2 - (251.2 * ats_score) / 100}
                style={{ transition: 'stroke-dashoffset 1s ease-out' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-extrabold text-slate-800 tracking-tight">{ats_score}</span>
              <span className="text-xs text-slate-400 font-medium">out of 100</span>
            </div>
          </div>

          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold mt-2 ${scoreMeta.badgeBg}`}>
            {scoreMeta.label}
          </span>
          <p className="text-xs text-slate-500 mt-3 max-w-[220px]">
            Calculated across keyword density, experience relevance, and structural parsing.
          </p>
        </div>

        {/* Candidate Executive Summary */}
        <div className="md:col-span-8 bg-white rounded-xl border border-slate-200 p-6 sm:p-7 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Award className="w-5 h-5 text-indigo-600" />
              <h2 className="text-base font-semibold text-slate-800">Candidate Executive Summary</h2>
            </div>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              {candidate_summary || 'No summary provided.'}
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 grid grid-cols-3 gap-4 text-center">
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-xs text-slate-500 font-medium">Matched Skills</span>
              <p className="text-lg font-bold text-emerald-700">{matched_skills.length}</p>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-xs text-slate-500 font-medium">Missing Keywords</span>
              <p className="text-lg font-bold text-amber-700">{missing_keywords.length}</p>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-xs text-slate-500 font-medium">Bullet Rewrites</span>
              <p className="text-lg font-bold text-indigo-700">{bullet_improvements.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Skills & Keywords Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Matched Skills */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <h3 className="text-base font-semibold text-slate-800">Matched Skills</h3>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              {matched_skills.length} Found
            </span>
          </div>

          {matched_skills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {matched_skills.map((skill, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200/60"
                >
                  {skill}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500 italic">No direct keyword matches detected in this resume.</p>
          )}
        </div>

        {/* Missing Keywords */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <h3 className="text-base font-semibold text-slate-800">Missing Target Keywords</h3>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
              {missing_keywords.length} Recommended
            </span>
          </div>

          {missing_keywords.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {missing_keywords.map((kw, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200/60"
                >
                  + {kw}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500 italic">Great job! All critical job description keywords are present.</p>
          )}
        </div>
      </div>

      {/* Formatting & Layout Issues */}
      {formatting_issues && formatting_issues.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Wrench className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-semibold text-slate-800">Formatting & ATS Layout Observations</h3>
          </div>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {formatting_issues.map((issue, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-50 border border-slate-200/70 text-xs sm:text-sm text-slate-700"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-2 flex-shrink-0" />
                <span>{issue}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Before vs. After Bullet Improvements */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <h3 className="text-lg font-bold text-slate-800 tracking-tight">
              Actionable Bullet Improvements (Before vs. After)
            </h3>
          </div>
          <span className="text-xs text-slate-500 hidden sm:inline">
            Optimized for recruiter impact and quantified metrics
          </span>
        </div>

        {bullet_improvements.length > 0 ? (
          <div className="space-y-4">
            {bullet_improvements.map((item, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden"
              >
                {/* Header tag */}
                <div className="px-5 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-600">
                    Improvement #{idx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyBullet(item.improved, idx)}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-indigo-600 transition-colors"
                  >
                    {copiedIndex === idx ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-600 font-semibold">Copied to clipboard</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy improved bullet</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="p-5 sm:p-6 space-y-4">
                  {/* Before & After Comparison */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Original */}
                    <div className="p-4 rounded-lg bg-rose-50/50 border border-rose-200/80">
                      <div className="flex items-center gap-1.5 mb-1.5 text-xs font-semibold text-rose-800 uppercase tracking-wider">
                        <span>Original Bullet</span>
                      </div>
                      <p className="text-sm text-slate-700 italic">
                        "{item.original}"
                      </p>
                    </div>

                    {/* Improved */}
                    <div className="p-4 rounded-lg bg-emerald-50/50 border border-emerald-200/80">
                      <div className="flex items-center gap-1.5 mb-1.5 text-xs font-semibold text-emerald-800 uppercase tracking-wider">
                        <span>High-Impact Revision</span>
                      </div>
                      <p className="text-sm font-medium text-slate-900">
                        {item.improved}
                      </p>
                    </div>
                  </div>

                  {/* Why this helps */}
                  {item.reason && (
                    <div className="p-3 rounded-lg bg-indigo-50/40 border border-indigo-100 flex items-start gap-2.5">
                      <HelpCircle className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                      <div className="text-xs sm:text-sm text-slate-600">
                        <strong className="font-semibold text-slate-800">Recruiter Rationale: </strong>
                        {item.reason}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500">
            No bullet rewrites needed. The resume bullet points are already strong!
          </div>
        )}
      </div>
    </div>
  );
}
