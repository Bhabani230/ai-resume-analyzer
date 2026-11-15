import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import UploadForm from './components/UploadForm';
import ReportView from './components/ReportView';
import HistoryList from './components/HistoryList';

const BACKEND_URL = 'http://localhost:5000';

export default function App() {
  const [activeTab, setActiveTab] = useState('form'); // 'form' | 'report' | 'history'
  const [currentReport, setCurrentReport] = useState(null);
  const [currentFileName, setCurrentFileName] = useState('');
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch scan history on component mount
  const fetchHistory = async () => {
    setIsHistoryLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/history`);
      if (response.ok) {
        const json = await response.json();
        setHistory(json.history || []);
      }
    } catch (err) {
      console.warn('Could not connect to backend server for history:', err.message);
    } finally {
      setIsHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // Submit analysis request to Node.js backend
  const handleAnalyze = async (file, jobDescription) => {
    setIsLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('job_description', jobDescription);

      const response = await fetch(`${BACKEND_URL}/api/analyze`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Analysis failed. Please check the backend service.');
      }

      setCurrentReport(result.data);
      setCurrentFileName(file.name);
      setActiveTab('report');

      // Update history list
      if (result.record) {
        setHistory((prev) => [result.record, ...prev]);
      } else {
        fetchHistory();
      }
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err.message || 'An unexpected error occurred while communicating with the server.');
    } finally {
      setIsLoading(false);
    }
  };

  // View an existing record from history
  const handleSelectRecord = (record) => {
    if (record.report) {
      setCurrentReport(record.report);
      setCurrentFileName(record.fileName);
      setActiveTab('report');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Delete a record from history
  const handleDeleteRecord = async (id) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/history/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setHistory((prev) => prev.filter((item) => item._id !== id));
      }
    } catch (err) {
      console.error('Failed to delete history record:', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        historyCount={history.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {activeTab === 'form' && (
          <UploadForm
            onAnalyze={handleAnalyze}
            isLoading={isLoading}
            error={error}
          />
        )}

        {activeTab === 'report' && currentReport && (
          <ReportView
            data={currentReport}
            fileName={currentFileName}
            onBackToForm={() => setActiveTab('form')}
          />
        )}

        {activeTab === 'history' && (
          <HistoryList
            history={history}
            isLoading={isHistoryLoading}
            onSelectRecord={handleSelectRecord}
            onDeleteRecord={handleDeleteRecord}
            onRefresh={fetchHistory}
            onNewAnalysis={() => setActiveTab('form')}
          />
        )}
      </main>

      {/* Minimal Classic SaaS Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>AI Resume Analyzer &bull; Built with FastAPI + Express + React</span>
          <span className="text-slate-400">Strict JSON structured output powered by Google GenAI</span>
        </div>
      </footer>
    </div>
  );
}
