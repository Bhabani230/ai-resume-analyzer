import React from 'react';
import { History, FileText, Trash2, ArrowRight, RefreshCw, Calendar, Award } from 'lucide-react';

export default function HistoryList({
  history = [],
  isLoading,
  onSelectRecord,
  onDeleteRecord,
  onRefresh,
  onNewAnalysis,
}) {
  const getScoreBadge = (score) => {
    if (score >= 80) return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    if (score >= 60) return 'bg-indigo-100 text-indigo-800 border-indigo-200';
    if (score >= 40) return 'bg-amber-100 text-amber-800 border-amber-200';
    return 'bg-rose-100 text-rose-800 border-rose-200';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <History className="w-6 h-6 text-indigo-600" />
            <span>Analysis History</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Review previous resume ATS scans and tracked score improvements.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onRefresh}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 shadow-sm transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={onNewAnalysis}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-colors"
          >
            <span>+ New Scan</span>
          </button>
        </div>
      </div>

      {/* History Table / List */}
      {history && history.length > 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="divide-y divide-slate-200">
            {history.map((record) => {
              const score = record.atsScore ?? record.report?.ats_score ?? 0;
              return (
                <div
                  key={record._id}
                  className="p-5 sm:p-6 hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  {/* Left: Info */}
                  <div className="space-y-1.5 max-w-xl">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="inline-flex items-center gap-1.5 font-semibold text-slate-800 text-sm">
                        <FileText className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                        <span className="truncate max-w-[240px] sm:max-w-[320px]">{record.fileName}</span>
                      </span>

                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${getScoreBadge(
                          score
                        )}`}
                      >
                        <Award className="w-3 h-3" />
                        <span>ATS Score: {score}</span>
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2">
                      <span className="font-medium text-slate-700">Target Role: </span>
                      {record.jobSnippet || 'Target job description'}
                    </p>

                    <div className="flex items-center gap-1 text-[11px] text-slate-400">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(record.createdAt)}</span>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => onSelectRecord(record)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold transition-colors"
                    >
                      <span>View Report</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => onDeleteRecord(record._id)}
                      className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                      title="Delete record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <History className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-800">No Past Scans Yet</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1 mb-6">
            Upload your first resume against a job description to generate your initial ATS score and audit report.
          </p>
          <button
            type="button"
            onClick={onNewAnalysis}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors"
          >
            <span>Scan Resume Now</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
