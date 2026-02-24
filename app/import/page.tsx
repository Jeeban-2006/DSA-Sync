'use client';

import { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/components/AuthenticatedLayout';
import BottomNav from '@/components/BottomNav';
import { api } from '@/lib/api-client';
import toast from 'react-hot-toast';
import {
  Upload,
  Download,
  RefreshCw,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  Code2,
  History,
  TrendingUp,
} from 'lucide-react';

interface ImportSummary {
  batchId: string;
  totalRows?: number;
  totalProblems?: number;
  imported: number;
  duplicatesSkipped: number;
  invalidRows?: number;
  errors?: Array<{ row: number; reason: string }>;
  message?: string;
  handle?: string;
  username?: string;
}

interface ImportHistoryItem {
  _id: string;
  source: string;
  totalRows: number;
  imported: number;
  duplicatesSkipped: number;
  invalidRows: number;
  createdAt: string;
  metadata?: {
    fileName?: string;
    codeforcesHandle?: string;
    leetcodeUsername?: string;
    codechefUsername?: string;
  };
}

interface ImportStats {
  totalImports: number;
  totalProblemsImported: number;
  csvImports: number;
  codeforcesImports: number;
  leetcodeImports: number;
  codechefImports: number;
}

export default function ImportPage() {
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvUploading, setCsvUploading] = useState(false);
  const [csvSummary, setCsvSummary] = useState<ImportSummary | null>(null);

  const [cfHandle, setCfHandle] = useState('');
  const [cfImporting, setCfImporting] = useState(false);
  const [cfSyncing, setCfSyncing] = useState(false);
  const [cfSummary, setCfSummary] = useState<ImportSummary | null>(null);

  const [lcUsername, setLcUsername] = useState('');
  const [lcImporting, setLcImporting] = useState(false);
  const [lcSyncing, setLcSyncing] = useState(false);
  const [lcSummary, setLcSummary] = useState<ImportSummary | null>(null);

  const [ccUsername, setCcUsername] = useState('');
  const [ccImporting, setCcImporting] = useState(false);
  const [ccSyncing, setCcSyncing] = useState(false);
  const [ccSummary, setCcSummary] = useState<ImportSummary | null>(null);

  const [history, setHistory] = useState<ImportHistoryItem[]>([]);
  const [stats, setStats] = useState<ImportStats | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const [showErrors, setShowErrors] = useState(false);

  // Helper function to get auth token
  const getAuthToken = () => {
    if (typeof window !== 'undefined') {
      const authData = localStorage.getItem('dsa-sync-auth');
      if (authData) {
        const { state } = JSON.parse(authData);
        return state?.token || null;
      }
    }
    return null;
  };

  useEffect(() => {
    fetchImportHistory();
  }, []);

  const fetchImportHistory = async () => {
    setLoadingHistory(true);
    try {
      const token = getAuthToken();
      const response = await fetch('/api/import/history', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setHistory(data.history);
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch import history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleDownloadTemplate = () => {
    window.location.href = '/api/import/template';
    toast.success('CSV template downloaded!');
  };

  const handleCsvFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.endsWith('.csv')) {
        toast.error('Please select a CSV file');
        return;
      }
      setCsvFile(file);
      setCsvSummary(null);
    }
  };

  const handleCsvUpload = async () => {
    if (!csvFile) {
      toast.error('Please select a CSV file');
      return;
    }

    setCsvUploading(true);
    setCsvSummary(null);

    try {
      const formData = new FormData();
      formData.append('file', csvFile);

      const token = getAuthToken();
      const response = await fetch('/api/import/csv', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to import CSV');
      }

      setCsvSummary(data);
      toast.success(`Successfully imported ${data.imported} problems!`);
      
      // Refresh history
      fetchImportHistory();
      
      // Clear file input
      setCsvFile(null);
      const fileInput = document.getElementById('csv-file-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

    } catch (error: any) {
      toast.error(error.message || 'Failed to import CSV');
      console.error('CSV import error:', error);
    } finally {
      setCsvUploading(false);
    }
  };

  const handleCodeforcesImport = async () => {
    if (!cfHandle.trim()) {
      toast.error('Please enter your Codeforces handle');
      return;
    }

    setCfImporting(true);
    setCfSummary(null);

    try {
      const token = getAuthToken();
      const response = await fetch('/api/import/codeforces', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ handle: cfHandle.trim(), isSync: false }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to import from Codeforces');
      }

      setCfSummary(data);
      toast.success(`Successfully imported ${data.imported} problems!`);
      
      // Refresh history
      fetchImportHistory();

    } catch (error: any) {
      toast.error(error.message || 'Failed to import from Codeforces');
      console.error('Codeforces import error:', error);
    } finally {
      setCfImporting(false);
    }
  };

  const handleCodeforcesSync = async () => {
    if (!cfHandle.trim()) {
      toast.error('Please enter your Codeforces handle');
      return;
    }

    setCfSyncing(true);

    try {
      const token = getAuthToken();
      const response = await fetch('/api/import/codeforces', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ handle: cfHandle.trim(), isSync: true }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to sync Codeforces');
      }

      toast.success(data.message || `Synced ${data.imported} new problems!`);
      
      // Refresh history
      fetchImportHistory();

    } catch (error: any) {
      toast.error(error.message || 'Failed to sync Codeforces');
      console.error('Codeforces sync error:', error);
    } finally {
      setCfSyncing(false);
    }
  };

  const handleLeetCodeImport = async () => {
    if (!lcUsername.trim()) {
      toast.error('Please enter your LeetCode username');
      return;
    }

    setLcImporting(true);
    setLcSummary(null);

    try {
      const token = getAuthToken();
      const response = await fetch('/api/import/leetcode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ username: lcUsername.trim(), isSync: false }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to import from LeetCode');
      }

      setLcSummary(data);
      toast.success(`Successfully imported ${data.imported} problems!`);
      
      // Refresh history
      fetchImportHistory();

    } catch (error: any) {
      toast.error(error.message || 'Failed to import from LeetCode');
      console.error('LeetCode import error:', error);
    } finally {
      setLcImporting(false);
    }
  };

  const handleLeetCodeSync = async () => {
    if (!lcUsername.trim()) {
      toast.error('Please enter your LeetCode username');
      return;
    }

    setLcSyncing(true);

    try {
      const token = getAuthToken();
      const response = await fetch('/api/import/leetcode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ username: lcUsername.trim(), isSync: true }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to sync LeetCode');
      }

      toast.success(data.message || `Synced ${data.imported} new problems!`);
      
      // Refresh history
      fetchImportHistory();

    } catch (error: any) {
      toast.error(error.message || 'Failed to sync LeetCode');
      console.error('LeetCode sync error:', error);
    } finally {
      setLcSyncing(false);
    }
  };

  const handleCodeChefImport = async () => {
    if (!ccUsername.trim()) {
      toast.error('Please enter your CodeChef username');
      return;
    }

    setCcImporting(true);
    setCcSummary(null);

    try {
      const token = getAuthToken();
      const response = await fetch('/api/import/codechef', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ username: ccUsername.trim(), isSync: false }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to import from CodeChef');
      }

      setCcSummary(data);
      toast.success(`Successfully imported ${data.imported} problems!`);
      
      // Refresh history
      fetchImportHistory();

    } catch (error: any) {
      toast.error(error.message || 'Failed to import from CodeChef');
      console.error('CodeChef import error:', error);
    } finally {
      setCcImporting(false);
    }
  };

  const handleCodeChefSync = async () => {
    if (!ccUsername.trim()) {
      toast.error('Please enter your CodeChef username');
      return;
    }

    setCcSyncing(true);

    try {
      const token = getAuthToken();
      const response = await fetch('/api/import/codechef', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ username: ccUsername.trim(), isSync: true }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to sync CodeChef');
      }

      toast.success(data.message || `Synced ${data.imported} new problems!`);
      
      // Refresh history
      fetchImportHistory();

    } catch (error: any) {
      toast.error(error.message || 'Failed to sync CodeChef');
      console.error('CodeChef sync error:', error);
    } finally {
      setCcSyncing(false);
    }
  };

  return (
    <AuthenticatedLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pb-20">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Import Problems</h1>
            <p className="text-gray-300">
              Bulk import your solved problems from CSV, Codeforces, LeetCode, or CodeChef
            </p>
          </div>

          {/* Statistics Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-300 text-sm">Total Imports</p>
                    <p className="text-3xl font-bold text-white">{stats.totalImports}</p>
                  </div>
                  <History className="w-8 h-8 text-blue-400" />
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-300 text-sm">Problems Imported</p>
                    <p className="text-3xl font-bold text-white">{stats.totalProblemsImported}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-400" />
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-300 text-sm">CSV Imports</p>
                    <p className="text-3xl font-bold text-white">{stats.csvImports}</p>
                  </div>
                  <FileText className="w-8 h-8 text-yellow-400" />
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-300 text-sm">Codeforces</p>
                    <p className="text-3xl font-bold text-white">{stats.codeforcesImports}</p>
                  </div>
                  <Code2 className="w-8 h-8 text-purple-400" />
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-300 text-sm">LeetCode</p>
                    <p className="text-3xl font-bold text-white">{stats.leetcodeImports}</p>
                  </div>
                  <Code2 className="w-8 h-8 text-orange-400" />
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-300 text-sm">CodeChef</p>
                    <p className="text-3xl font-bold text-white">{stats.codechefImports}</p>
                  </div>
                  <Code2 className="w-8 h-8 text-red-400" />
                </div>
              </div>
            </div>
          )}

          {/* Import Methods Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* CSV Import Card */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
              <div className="flex items-center gap-3 mb-6">
                <FileText className="w-8 h-8 text-yellow-400" />
                <h2 className="text-2xl font-bold text-white">CSV Import</h2>
              </div>

              <div className="space-y-4">
                {/* Download Template */}
                <div className="bg-black/20 rounded-lg p-4">
                  <p className="text-gray-300 text-sm mb-3">
                    Download our CSV template to see the expected format
                  </p>
                  <button
                    onClick={handleDownloadTemplate}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <Download className="w-5 h-5" />
                    Download CSV Template
                  </button>
                </div>

                {/* Upload CSV */}
                <div className="bg-black/20 rounded-lg p-4">
                  <label htmlFor="csv-file-input" className="block text-gray-300 text-sm mb-2">
                    Select CSV File
                  </label>
                  <input
                    id="csv-file-input"
                    type="file"
                    accept=".csv"
                    onChange={handleCsvFileChange}
                    className="w-full text-white bg-black/30 border border-white/20 rounded-lg p-2 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-purple-600 file:text-white file:cursor-pointer hover:file:bg-purple-700"
                  />
                  {csvFile && (
                    <p className="text-green-400 text-sm mt-2">
                      Selected: {csvFile.name}
                    </p>
                  )}
                </div>

                <button
                  onClick={handleCsvUpload}
                  disabled={!csvFile || csvUploading}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2"
                >
                  {csvUploading ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5" />
                      Upload & Import
                    </>
                  )}
                </button>

                {/* CSV Summary */}
                {csvSummary && (
                  <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4 mt-4">
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      <h3 className="font-semibold text-white">Import Summary</h3>
                    </div>
                    <div className="space-y-1 text-sm text-gray-300">
                      <p>✅ Total Rows: {csvSummary.totalRows}</p>
                      <p>✅ Imported: {csvSummary.imported}</p>
                      <p>⏭️ Duplicates Skipped: {csvSummary.duplicatesSkipped}</p>
                      {csvSummary.invalidRows! > 0 && (
                        <p>❌ Invalid Rows: {csvSummary.invalidRows}</p>
                      )}
                    </div>

                    {csvSummary.errors && csvSummary.errors.length > 0 && (
                      <button
                        onClick={() => setShowErrors(!showErrors)}
                        className="text-yellow-400 text-sm mt-3 underline hover:text-yellow-300"
                      >
                        {showErrors ? 'Hide' : 'Show'} Errors ({csvSummary.errors.length})
                      </button>
                    )}

                    {showErrors && csvSummary.errors && (
                      <div className="mt-3 bg-black/30 rounded p-3 max-h-40 overflow-y-auto">
                        {csvSummary.errors.map((error, idx) => (
                          <p key={idx} className="text-red-400 text-xs">
                            Row {error.row}: {error.reason}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Codeforces Import Card */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
              <div className="flex items-center gap-3 mb-6">
                <Code2 className="w-8 h-8 text-purple-400" />
                <h2 className="text-2xl font-bold text-white">Codeforces Import</h2>
              </div>

              <div className="space-y-4">
                <div className="bg-black/20 rounded-lg p-4">
                  <p className="text-gray-300 text-sm mb-3">
                    Import all your accepted Codeforces submissions
                  </p>
                  <label htmlFor="cf-handle" className="block text-gray-300 text-sm mb-2">
                    Codeforces Handle
                  </label>
                  <input
                    id="cf-handle"
                    type="text"
                    value={cfHandle}
                    onChange={(e) => setCfHandle(e.target.value)}
                    placeholder="e.g., tourist"
                    className="w-full bg-black/30 border border-white/20 text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <button
                  onClick={handleCodeforcesImport}
                  disabled={!cfHandle.trim() || cfImporting}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2"
                >
                  {cfImporting ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5" />
                      Import from Codeforces
                    </>
                  )}
                </button>

                <button
                  onClick={handleCodeforcesSync}
                  disabled={!cfHandle.trim() || cfSyncing}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2"
                >
                  {cfSyncing ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Syncing...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-5 h-5" />
                      Sync New Submissions
                    </>
                  )}
                </button>

                {/* CF Summary */}
                {cfSummary && (
                  <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4 mt-4">
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      <h3 className="font-semibold text-white">Import Summary</h3>
                    </div>
                    <div className="space-y-1 text-sm text-gray-300">
                      <p>👤 Handle: {cfSummary.handle}</p>
                      <p>📊 Total Problems: {cfSummary.totalProblems}</p>
                      <p>✅ Imported: {cfSummary.imported}</p>
                      <p>⏭️ Duplicates Skipped: {cfSummary.duplicatesSkipped}</p>
                    </div>
                  </div>
                )}

                {/* Info */}
                <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-4 mt-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-gray-300">
                      <p className="font-semibold text-white mb-1">Sync Feature</p>
                      <p>
                        Use "Sync" to fetch only new submissions without duplicating existing
                        problems.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* LeetCode Import Card */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
              <div className="flex items-center gap-3 mb-6">
                <Code2 className="w-8 h-8 text-orange-400" />
                <h2 className="text-2xl font-bold text-white">LeetCode Import</h2>
              </div>

              <div className="space-y-4">
                <div className="bg-black/20 rounded-lg p-4">
                  <p className="text-gray-300 text-sm mb-3">
                    Import your accepted LeetCode submissions
                  </p>
                  <label htmlFor="lc-username" className="block text-gray-300 text-sm mb-2">
                    LeetCode Username
                  </label>
                  <input
                    id="lc-username"
                    type="text"
                    value={lcUsername}
                    onChange={(e) => setLcUsername(e.target.value)}
                    placeholder="e.g., johnsmith"
                    className="w-full bg-black/30 border border-white/20 text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <button
                  onClick={handleLeetCodeImport}
                  disabled={!lcUsername.trim() || lcImporting}
                  className="w-full bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-700 hover:to-yellow-700 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2"
                >
                  {lcImporting ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5" />
                      Import from LeetCode
                    </>
                  )}
                </button>

                <button
                  onClick={handleLeetCodeSync}
                  disabled={!lcUsername.trim() || lcSyncing}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2"
                >
                  {lcSyncing ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Syncing...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-5 h-5" />
                      Sync New Submissions
                    </>
                  )}
                </button>

                {/* LC Summary */}
                {lcSummary && (
                  <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4 mt-4">
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      <h3 className="font-semibold text-white">Import Summary</h3>
                    </div>
                    <div className="space-y-1 text-sm text-gray-300">
                      <p>👤 Username: {lcSummary.username}</p>
                      <p>📊 Total Problems: {lcSummary.totalProblems}</p>
                      <p>✅ Imported: {lcSummary.imported}</p>
                      <p>⏭️ Duplicates Skipped: {lcSummary.duplicatesSkipped}</p>
                    </div>
                  </div>
                )}

                {/* Info */}
                <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-4 mt-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-gray-300">
                      <p className="font-semibold text-white mb-1">Important: API Limitations</p>
                      <p className="mb-2">
                        LeetCode's public API may not return all problems in one import. The API typically provides recent submissions.
                      </p>
                      <p className="font-semibold text-white mb-1">Tips:</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>If you don't see all problems, wait a few minutes and click "Sync New Submissions"</li>
                        <li>Sync regularly after solving new problems</li>
                        <li>The system prevents duplicates automatically</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* CodeChef Import Card */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
              <div className="flex items-center gap-3 mb-6">
                <Code2 className="w-8 h-8 text-red-400" />
                <h2 className="text-2xl font-bold text-white">CodeChef Import</h2>
              </div>

              <div className="space-y-4">
                <div className="bg-black/20 rounded-lg p-4">
                  <p className="text-gray-300 text-sm mb-3">
                    Import your accepted CodeChef submissions
                  </p>
                  <label htmlFor="cc-username" className="block text-gray-300 text-sm mb-2">
                    CodeChef Username
                  </label>
                  <input
                    id="cc-username"
                    type="text"
                    value={ccUsername}
                    onChange={(e) => setCcUsername(e.target.value)}
                    placeholder="e.g., chefuser"
                    className="w-full bg-black/30 border border-white/20 text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <button
                  onClick={handleCodeChefImport}
                  disabled={!ccUsername.trim() || ccImporting}
                  className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2"
                >
                  {ccImporting ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5" />
                      Import from CodeChef
                    </>
                  )}
                </button>

                <button
                  onClick={handleCodeChefSync}
                  disabled={!ccUsername.trim() || ccSyncing}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2"
                >
                  {ccSyncing ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Syncing...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-5 h-5" />
                      Sync New Submissions
                    </>
                  )}
                </button>

                {/* CC Summary */}
                {ccSummary && (
                  <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4 mt-4">
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      <h3 className="font-semibold text-white">Import Summary</h3>
                    </div>
                    <div className="space-y-1 text-sm text-gray-300">
                      <p>👤 Username: {ccSummary.username}</p>
                      <p>📊 Total Problems: {ccSummary.totalProblems}</p>
                      <p>✅ Imported: {ccSummary.imported}</p>
                      <p>⏭️ Duplicates Skipped: {ccSummary.duplicatesSkipped}</p>
                    </div>
                  </div>
                )}

                {/* Info */}
                <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-4 mt-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-gray-300">
                      <p className="font-semibold text-white mb-1">Note</p>
                      <p>
                        Fetches recent accepted submissions from your public CodeChef profile.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Import History */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
            <div className="flex items-center gap-3 mb-6">
              <History className="w-8 h-8 text-blue-400" />
              <h2 className="text-2xl font-bold text-white">Import History</h2>
            </div>

            {loadingHistory ? (
              <div className="text-center py-8">
                <RefreshCw className="w-8 h-8 text-purple-400 animate-spin mx-auto mb-2" />
                <p className="text-gray-300">Loading history...</p>
              </div>
            ) : history.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                <p className="text-gray-400">No import history yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {history.map((item) => (
                  <div
                    key={item._id}
                    className="bg-black/20 rounded-lg p-4 border border-white/10 hover:border-white/30 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              item.source === 'CSV'
                                ? 'bg-yellow-500/20 text-yellow-400'
                                : item.source === 'Codeforces'
                                ? 'bg-purple-500/20 text-purple-400'
                                : item.source === 'LeetCode'
                                ? 'bg-orange-500/20 text-orange-400'
                                : 'bg-red-500/20 text-red-400'
                            }`}
                          >
                            {item.source}
                          </span>
                          <span className="text-gray-400 text-xs">
                            {new Date(item.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                          <div>
                            <p className="text-gray-400">Total</p>
                            <p className="text-white font-semibold">{item.totalRows}</p>
                          </div>
                          <div>
                            <p className="text-gray-400">Imported</p>
                            <p className="text-green-400 font-semibold">{item.imported}</p>
                          </div>
                          <div>
                            <p className="text-gray-400">Duplicates</p>
                            <p className="text-yellow-400 font-semibold">
                              {item.duplicatesSkipped}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-400">Invalid</p>
                            <p className="text-red-400 font-semibold">{item.invalidRows}</p>
                          </div>
                        </div>

                        {item.metadata?.fileName && (
                          <p className="text-gray-400 text-xs mt-2">
                            File: {item.metadata.fileName}
                          </p>
                        )}
                        {item.metadata?.codeforcesHandle && (
                          <p className="text-gray-400 text-xs mt-2">
                            Handle: {item.metadata.codeforcesHandle}
                          </p>
                        )}
                        {item.metadata?.leetcodeUsername && (
                          <p className="text-gray-400 text-xs mt-2">
                            Username: {item.metadata.leetcodeUsername}
                          </p>
                        )}
                        {item.metadata?.codechefUsername && (
                          <p className="text-gray-400 text-xs mt-2">
                            Username: {item.metadata.codechefUsername}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <BottomNav />
    </AuthenticatedLayout>
  );
}
