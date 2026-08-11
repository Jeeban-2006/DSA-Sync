'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { requestFCMToken, onMessageListener } from '@/lib/firebase';
import { Bell, Terminal, Shield, Save, Send, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

interface LogEntry {
  timestamp: string;
  type: 'info' | 'success' | 'error';
  message: string;
}

export default function FCMTestPage() {
  const { token: jwtToken, user } = useAuthStore();
  const [fcmToken, setFcmToken] = useState<string>('');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [swStatus, setSwStatus] = useState<'checking' | 'registered' | 'missing'>('checking');
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>('default');
  const [loading, setLoading] = useState(false);

  const addLog = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
    const entry: LogEntry = {
      timestamp: new Date().toLocaleTimeString(),
      type,
      message,
    };
    setLogs((prev) => [entry, ...prev]);
    if (type === 'error') {
      console.error(`[FCM Test] ${message}`);
    } else {
      console.log(`[FCM Test] ${message}`);
    }
  };

  useEffect(() => {
    addLog('FCM Test Flow Page Loaded', 'info');
    if (typeof window !== 'undefined') {
      setPermissionStatus(Notification.permission);
      addLog(`Initial Browser Notification Permission: ${Notification.permission}`, 'info');
    }
    
    // Check Service Worker Registration
    checkServiceWorker();

    // Listen for foreground FCM messages
    let unsubscribe: any = () => {};
    onMessageListener((payload: any) => {
      addLog(`Foreground notification received: ${JSON.stringify(payload)}`, 'success');
      toast.success(payload.notification?.title || payload.notification?.body || 'New Notification!', {
        icon: '🔔',
        duration: 8000,
      });
    }).then((unsub) => {
      unsubscribe = unsub;
      addLog('Foreground FCM message listener attached', 'info');
    }).catch((err) => {
      addLog(`Failed to attach foreground message listener: ${err.message}`, 'error');
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const checkServiceWorker = async () => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      setSwStatus('missing');
      addLog('Browser does not support service workers!', 'error');
      return;
    }

    try {
      setSwStatus('checking');
      const registrations = await navigator.serviceWorker.getRegistrations();
      addLog(`Found ${registrations.length} registered service worker(s)`, 'info');
      
      const fcmSw = registrations.find(
        (reg) => reg.active && reg.active.scriptURL.includes('firebase-messaging-sw.js')
      );

      if (fcmSw) {
        setSwStatus('registered');
        addLog(`Service Worker (FCM) is registered and active: ${fcmSw.active?.scriptURL}`, 'success');
      } else {
        setSwStatus('missing');
        addLog('No active service worker found for firebase-messaging-sw.js. Will register on token request.', 'info');
      }
    } catch (error: any) {
      setSwStatus('missing');
      addLog(`Error checking service worker registrations: ${error.message}`, 'error');
    }
  };

  const handleRequestPermission = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      addLog('Notifications are not supported in this browser', 'error');
      return;
    }

    addLog('Requesting notification permission...', 'info');
    try {
      const permission = await Notification.requestPermission();
      setPermissionStatus(permission);
      if (permission === 'granted') {
        addLog('Notification permission GRANTED!', 'success');
        toast.success('Permission granted!');
      } else {
        addLog(`Notification permission denied/default: ${permission}`, 'error');
        toast.error(`Permission: ${permission}`);
      }
    } catch (error: any) {
      addLog(`Error requesting permission: ${error.message}`, 'error');
    }
  };

  const handleGetToken = async () => {
    setLoading(true);
    addLog('Generating FCM token via VAPID key...', 'info');
    try {
      const token = await requestFCMToken();
      if (token) {
        setFcmToken(token);
        addLog(`FCM Token retrieved successfully! (Logged to developer console)`, 'success');
        console.log('Generated FCM Token:', token);
        toast.success('FCM Token generated!');
      } else {
        addLog('Failed to generate FCM Token. Check environment variables and service worker registration.', 'error');
        toast.error('Token generation failed.');
      }
    } catch (error: any) {
      addLog(`Error generating token: ${error.message}`, 'error');
    } finally {
      setLoading(false);
      checkServiceWorker();
    }
  };

  const handleSaveToken = async () => {
    if (!fcmToken) {
      addLog('Cannot save token: generate the FCM token first!', 'error');
      return;
    }
    if (!jwtToken) {
      addLog('Cannot save token: user is not authenticated (JWT token missing in auth store)', 'error');
      return;
    }

    addLog('Sending FCM token to backend...', 'info');
    try {
      const res = await fetch('/api/fcm/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwtToken}`,
        },
        body: JSON.stringify({ token: fcmToken }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        addLog('FCM token stored in DB successfully!', 'success');
        toast.success('Token saved to database!');
      } else {
        addLog(`Failed to save token to DB: ${data.error || res.statusText}`, 'error');
        toast.error('Failed to store token.');
      }
    } catch (error: any) {
      addLog(`Error storing token: ${error.message}`, 'error');
    }
  };

  const handleSendTestNotification = async () => {
    if (!fcmToken) {
      addLog('Generate the FCM token first to send a test push!', 'error');
      return;
    }
    if (!jwtToken) {
      addLog('Cannot send test notification: user is not authenticated', 'error');
      return;
    }

    addLog('Triggering test FCM notification...', 'info');
    try {
      const res = await fetch('/api/fcm/send-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwtToken}`,
        },
        body: JSON.stringify({
          fcmToken,
          title: '🔥 FCM Live Verification!',
          body: `Hello ${user?.name || 'Developer'}, push notifications are working correctly!`,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        addLog(`FCM notification sent successfully! MessageId: ${data.messageId}`, 'success');
        toast.success('FCM sent!');
      } else {
        addLog(`Failed to send FCM: ${data.error || res.statusText}`, 'error');
        toast.error('Failed to send FCM');
      }
    } catch (error: any) {
      addLog(`Error sending test notification: ${error.message}`, 'error');
    }
  };

  return (
    <div className="min-h-screen bg-dark-400 text-white p-6 sm:p-12">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-800 pb-6">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Bell className="w-8 h-8 text-primary-500" />
              FCM Test Dashboard
            </h1>
            <p className="text-gray-400 mt-1 text-sm">
              Verify your Firebase Cloud Messaging setup end-to-end on localhost.
            </p>
          </div>
          <button
            onClick={() => {
              setLogs([]);
              addLog('Logs cleared', 'info');
            }}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
          >
            Clear Log Console
          </button>
        </div>

        {/* User Info Alert */}
        {!jwtToken ? (
          <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 text-yellow-300 rounded-xl flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">
              You are currently <strong>Not Logged In</strong>. Please log in first to save the token and send test notifications.
            </p>
          </div>
        ) : (
          <div className="p-4 bg-green-500/10 border border-green-500/20 text-green-300 rounded-xl flex items-center gap-3">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">
              Authenticated as <strong>{user?.name} ({user?.username})</strong>. Ready to test FCM flow.
            </p>
          </div>
        )}

        {/* Status Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Permission */}
          <div className="p-6 bg-dark-200/50 backdrop-blur-sm border border-white/10 rounded-2xl">
            <h3 className="text-gray-400 text-sm font-medium">Notification Permission</h3>
            <div className="mt-3 flex items-center justify-between">
              <span className={`text-lg font-semibold uppercase ${
                permissionStatus === 'granted' ? 'text-green-400' : permissionStatus === 'denied' ? 'text-red-400' : 'text-yellow-400'
              }`}>
                {permissionStatus}
              </span>
              <button
                onClick={handleRequestPermission}
                className="px-3 py-1.5 bg-primary-600 hover:bg-primary-700 rounded-lg text-xs font-semibold transition-colors"
              >
                Request
              </button>
            </div>
          </div>

          {/* Service Worker */}
          <div className="p-6 bg-dark-200/50 backdrop-blur-sm border border-white/10 rounded-2xl">
            <h3 className="text-gray-400 text-sm font-medium">Service Worker Status</h3>
            <div className="mt-3 flex items-center justify-between">
              <span className={`text-lg font-semibold capitalize ${
                swStatus === 'registered' ? 'text-green-400' : swStatus === 'checking' ? 'text-yellow-400' : 'text-red-400'
              }`}>
                {swStatus}
              </span>
              <button
                onClick={checkServiceWorker}
                className="p-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                title="Re-check"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* FCM Token Status */}
          <div className="p-6 bg-dark-200/50 backdrop-blur-sm border border-white/10 rounded-2xl">
            <h3 className="text-gray-400 text-sm font-medium">FCM Token</h3>
            <div className="mt-3 flex items-center justify-between">
              <span className={`text-lg font-semibold ${fcmToken ? 'text-green-400' : 'text-gray-500'}`}>
                {fcmToken ? 'Generated' : 'Not Loaded'}
              </span>
              <button
                onClick={handleGetToken}
                disabled={loading}
                className="px-3 py-1.5 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-700 rounded-lg text-xs font-semibold transition-colors"
              >
                {loading ? 'Fetching...' : 'Generate'}
              </button>
            </div>
          </div>
        </div>

        {/* Action Panel */}
        <div className="p-6 bg-dark-200/50 backdrop-blur-sm border border-white/10 rounded-2xl space-y-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary-400" />
            Interactive Tests
          </h2>

          <div className="flex flex-wrap gap-4">
            <button
              onClick={handleSaveToken}
              disabled={!fcmToken}
              className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-800 disabled:text-gray-500 rounded-xl font-medium transition-colors flex items-center gap-2"
            >
              <Save className="w-5 h-5" />
              Save Token in Database
            </button>

            <button
              onClick={handleSendTestNotification}
              disabled={!fcmToken}
              className="px-5 py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 disabled:from-gray-850 disabled:to-gray-850 disabled:text-gray-500 rounded-xl font-medium transition-colors flex items-center gap-2"
            >
              <Send className="w-5 h-5" />
              Send Test Notification
            </button>
          </div>

          {fcmToken && (
            <div className="space-y-2">
              <label className="text-gray-400 text-sm font-medium block">Current FCM Token</label>
              <div className="p-3 bg-dark-300 rounded-lg font-mono text-xs select-all break-all border border-gray-800">
                {fcmToken}
              </div>
            </div>
          )}
        </div>

        {/* Console / Log Panel */}
        <div className="p-6 bg-black border border-gray-800 rounded-2xl space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Terminal className="w-5 h-5 text-gray-400" />
            Developer Log Console
          </h2>
          <div className="bg-dark-400 p-4 rounded-xl font-mono text-sm max-h-80 overflow-y-auto space-y-2 border border-gray-900">
            {logs.length === 0 ? (
              <p className="text-gray-500 italic">No logs yet. Perform actions above to trace the FCM flow.</p>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="flex gap-2 items-start">
                  <span className="text-gray-500 flex-shrink-0">[{log.timestamp}]</span>
                  <span className={`flex-shrink-0 uppercase font-semibold text-xs px-1.5 py-0.5 rounded ${
                    log.type === 'success' ? 'bg-green-500/20 text-green-400' : log.type === 'error' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'
                  }`}>
                    {log.type}
                  </span>
                  <span className="text-gray-300 break-all">{log.message}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
