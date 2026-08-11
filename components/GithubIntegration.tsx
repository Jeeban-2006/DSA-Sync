'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api-client';
import { Github, RefreshCw, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function GithubIntegration() {
  const { user, updateUser } = useAuthStore();
  const router = useRouter();
  const [repoName, setRepoName] = useState(user?.github?.repository || 'dsa-sync-submissions');
  const [isSaving, setIsSaving] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  useEffect(() => {
    // Check if coming back from github oauth
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('github_success') === 'true') {
        toast.success('Successfully connected to GitHub!');
        
        // Fetch latest user data from DB to update local storage state
        api.getMe().then((res) => {
          const data = res.data as any;
          if (data?.user) {
            updateUser(data.user);
          }
          // Clean up url without reloading the page
          window.history.replaceState({}, document.title, '/profile');
        });
      }
    }
  }, [updateUser]);

  const isConnected = !!user?.github?.username;

  const handleConnect = async () => {
    try {
      const res = await api.request<{ url: string }>('/api/auth/github');
      if (res.error) throw new Error(res.error);
      if (res.data?.url) {
        window.location.href = res.data.url;
      }
    } catch (err) {
      toast.error('Failed to initiate GitHub auth');
    }
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      const res = await api.request<{ error?: string }>('/api/github/settings', {
        method: 'POST',
        body: JSON.stringify({ 
          repository: repoName,
          autoCommit: user?.github?.autoCommit ?? true 
        })
      });
      if (res.error) throw new Error(res.error);
      
      updateUser({
        github: {
          ...user!.github!,
          repository: repoName
        }
      });
      toast.success('Settings saved');
    } catch (err: any) {
      toast.error(err.message || 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleAutoCommit = async () => {
    const newVal = !(user?.github?.autoCommit ?? true);
    try {
      const res = await api.request('/api/github/settings', {
        method: 'POST',
        body: JSON.stringify({ 
          autoCommit: newVal
        })
      });
      if (res.error) throw new Error('Failed to update');
      
      updateUser({
        github: {
          ...user!.github!,
          autoCommit: newVal
        }
      });
      toast.success(newVal ? 'Auto-commit enabled' : 'Auto-commit disabled');
    } catch (err: any) {
      toast.error('Failed to update settings');
    }
  };

  const handleBulkSync = async () => {
    setIsSyncing(true);
    try {
      const res = await api.request<{ success: boolean; count: number; message?: string }>('/api/github/sync', {
        method: 'POST'
      });
      
      if (res.error) throw new Error(res.error);
      
      toast.success(res.data?.message || `Successfully pushed ${res.data?.count || 0} solutions to GitHub`);
      
      if (res.data?.success) {
        updateUser({
          ...user,
          github: {
            username: user?.github?.username || '',
            repository: user?.github?.repository || '',
            autoCommit: user?.github?.autoCommit ?? true,
            lastSync: new Date().toISOString()
          }
        });
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to sync with GitHub');
    } finally {
      setIsSyncing(false);
    }
  };

  const handlePull = async () => {
    setIsPulling(true);
    try {
      const res = await api.request<{ success: boolean; count: number; totalFilesFound: number; message?: string }>('/api/github/pull', {
        method: 'POST'
      });
      
      if (res.error) throw new Error(res.error);
      
      if (res.data?.count === 0 && res.data.totalFilesFound > 0) {
        toast.success(`Found ${res.data.totalFilesFound} files, but no missing problems were updated.`);
      } else if (res.data?.count === 0) {
        toast.success(res.data.message || 'No new LeetHub files found in repository.');
      } else {
        toast.success(`Successfully imported code for ${res.data?.count} problems from GitHub!`);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to import code from GitHub');
    } finally {
      setIsPulling(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('Are you sure you want to disconnect GitHub? This will stop auto-syncing.')) return;
    
    setIsDisconnecting(true);
    try {
      const res = await api.request('/api/github/disconnect', { method: 'POST' });
      if (res.error) throw new Error('Failed to disconnect');
      
      const newUser = { ...user } as any;
      delete newUser.github;
      useAuthStore.setState({ user: newUser });
      toast.success('GitHub disconnected');
    } catch (err: any) {
      toast.error('Failed to disconnect');
    } finally {
      setIsDisconnecting(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="card">
        <h2 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
          <Github className="w-5 h-5 text-gray-300" />
          GitHub Integration
        </h2>
        <p className="text-gray-400 text-sm mb-4">
          Automatically sync your submissions with your GitHub account.
        </p>
        <button
          onClick={handleConnect}
          className="bg-dark-300 hover:bg-dark-200 border border-white/10 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 text-sm"
        >
          <Github className="w-4 h-4" />
          Connect to GitHub
        </button>
      </div>
    );
  }

  return (
    <div className="card bg-dark-400 border border-white/10 overflow-hidden !p-0">
      {/* Header */}
      <div className="p-4 bg-[#0d1117] flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-3">
          <Github className="w-8 h-8 text-white" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-white font-medium">@{user?.github?.username}</span>
              <span className="bg-green-500/20 text-green-400 text-[10px] px-2 py-0.5 rounded-full border border-green-500/30 flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                Connected
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">Active account</p>
          </div>
        </div>
        <button className="text-blue-400 text-sm hover:text-blue-300 transition-colors flex items-center gap-1">
          Manage accounts &gt;
        </button>
      </div>

      {/* Repository Section */}
      <div className="p-4 border-b border-white/5 bg-[#161b22]">
        <h3 className="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-3">Repository</h3>
        <div className="flex items-center gap-2 mb-2">
          <Github className="w-4 h-4 text-white" />
          <span className="text-white font-bold">{repoName}</span>
        </div>
        <p className="text-xs text-gray-400 mb-3">
          Stores submission-history files for standard problems. Project-based tracks like ML Build Your GPT use separate repos.
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={repoName}
            onChange={(e) => setRepoName(e.target.value)}
            className="flex-1 bg-[#0d1117] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={handleSaveSettings}
            disabled={isSaving || repoName === user?.github?.repository}
            className="bg-[#21262d] hover:bg-[#30363d] border border-white/10 text-gray-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Rename'}
          </button>
        </div>
        <p className="text-[10px] text-gray-500 mt-2">Letters, numbers, hyphens, underscores. Max 100 chars.</p>
      </div>

      {/* Commit Settings Section */}
      <div className="p-4 border-b border-white/5 bg-[#161b22] flex items-center justify-between">
        <div>
          <h3 className="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-3">Commit Settings</h3>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleToggleAutoCommit}
              className={`w-10 h-5 rounded-full relative transition-colors ${
                (user?.github?.autoCommit ?? true) ? 'bg-[#238636]' : 'bg-gray-600'
              }`}
            >
              <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                (user?.github?.autoCommit ?? true) ? 'translate-x-5' : 'translate-x-0'
              }`} />
            </button>
            <div>
              <p className="text-white text-sm font-medium">Auto-commit on submission</p>
              <p className="text-xs text-gray-400">Only accepted submissions will be committed</p>
            </div>
          </div>
        </div>
        <select className="bg-[#0d1117] border border-white/10 text-white text-sm rounded-lg px-3 py-1.5 focus:outline-none">
          <option>Accepted Only</option>
        </select>
      </div>

      {/* Bulk Sync Section */}
      <div className="p-4 border-b border-white/5 bg-[#161b22]">
        <h3 className="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-3">Bulk Sync</h3>
        <p className="text-sm text-white mb-3">Push all unsynced submissions to your repository at once.</p>
        <select className="w-full bg-[#0d1117] border border-white/10 text-white text-sm rounded-lg px-3 py-2 mb-3 focus:outline-none">
          <option>Accepted Only</option>
        </select>
        <div className="flex items-center gap-3 w-full">
          <div className="flex gap-2 w-full">
            <button
              onClick={handleBulkSync}
              disabled={isSyncing}
              className="bg-[#238636] hover:bg-[#2ea043] text-white border border-[#2ea043]/30 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 flex-1"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'Syncing...' : 'Sync All Now'}
            </button>
            <button
              onClick={handlePull}
              disabled={isPulling}
              className="bg-transparent hover:bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 flex-1"
            >
              <Download className={`w-4 h-4 ${isPulling ? 'animate-spin' : ''}`} />
              {isPulling ? 'Importing...' : 'Import Code'}
            </button>
          </div>
        </div>
        <div className="mt-2 text-xs text-gray-500">
          {user?.github?.lastSync ? `Last synced ${new Date(user.github.lastSync).toLocaleDateString()}` : 'No submissions to sync.'}
        </div>
      </div>

      {/* Danger Zone Section */}
      <div className="p-4 bg-[#1a0f0f]">
        <h3 className="text-[10px] uppercase tracking-wider text-red-500 font-bold mb-3">Danger Zone</h3>
        <div className="flex items-start justify-between gap-4">
          <p className="text-xs text-gray-400 max-w-[250px]">
            Permanently removes this account and its sync history from DSA Tracker. Your GitHub repo and committed files remain unaffected.
          </p>
          <button
            onClick={handleDisconnect}
            disabled={isDisconnecting}
            className="border border-red-500 text-red-500 hover:bg-red-500 hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex-shrink-0"
          >
            {isDisconnecting ? 'Disconnecting...' : `Disconnect @${user?.github?.username}`}
          </button>
        </div>
      </div>
    </div>
  );
}
