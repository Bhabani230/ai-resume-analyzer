import React from 'react';
import { FileText, History, PlusCircle, CheckCircle2 } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, historyCount = 0 }) {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <div 
            onClick={() => setActiveTab('form')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-sm">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-slate-800 tracking-tight">AI Resume Analyzer</span>
                <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Gemini Flash
                </span>
              </div>
              <p className="text-xs text-slate-500">ATS Optimization & Bullet Improvements</p>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('form')}
              className={`inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'form' || activeTab === 'report'
                  ? 'bg-slate-100 text-slate-900'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <PlusCircle className="w-4 h-4 text-indigo-600" />
              <span>Analyzer</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('history')}
              className={`inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'history'
                  ? 'bg-slate-100 text-slate-900'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <History className="w-4 h-4 text-slate-500" />
              <span>History</span>
              {historyCount > 0 && (
                <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-semibold">
                  {historyCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
