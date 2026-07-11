'use client';

import { useState, useEffect } from 'react';
import { Bell, BellOff, Loader2 } from 'lucide-react';
import { api } from '@/lib/api-client';
import toast from 'react-hot-toast';
import { requestFCMToken, onMessageListener } from '@/lib/firebase';

interface PushNotificationManagerProps {
  onStatusChange?: (enabled: boolean) => void;
}

export default function PushNotificationManager({ onStatusChange }: PushNotificationManagerProps) {
  const [supported, setSupported] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    checkPushSupport();
  }, []);

  const checkPushSupport = () => {
    if (typeof window === 'undefined') return;

    const isSupported =
      'serviceWorker' in navigator &&
      'Notification' in window;

    setSupported(isSupported);
    setPermission(Notification.permission);
    
    if (Notification.permission === 'granted') {
      setSubscribed(true);
      if (onStatusChange) onStatusChange(true);
    }
  };

  const subscribeToPush = async () => {
    setLoading(true);

    try {
      const permissionResult = await Notification.requestPermission();
      setPermission(permissionResult);

      if (permissionResult !== 'granted') {
        toast.error('Notification permission denied');
        setLoading(false);
        return;
      }

      // Register the service worker
      if ('serviceWorker' in navigator) {
        await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      }

      const token = await requestFCMToken();

      if (token) {
        // Send token to backend
        const res = await api.request('/api/fcm/token', { 
          method: 'POST',
          body: JSON.stringify({ token })
        });
        
        if (res.error) throw new Error(res.error);

        setSubscribed(true);
        if (onStatusChange) onStatusChange(true);
        toast.success('Successfully subscribed to notifications!');
      } else {
        toast.error('Failed to generate notification token');
      }
    } catch (error) {
      console.error('Subscription error:', error);
      toast.error('Failed to enable notifications');
    } finally {
      setLoading(false);
    }
  };

  const unsubscribeFromPush = async () => {
    // Note: FCM doesn't have a direct "unsubscribe" from the client side without deleting the token.
    // Usually, you just remove the token from your backend.
    setLoading(true);
    try {
      // In a real app, you might want to call an endpoint to remove the token from the user profile
      const res = await api.request('/api/fcm/token/remove', {
        method: 'POST',
        body: JSON.stringify({})
      });
      
      setSubscribed(false);
      if (onStatusChange) onStatusChange(false);
      toast.success('Unsubscribed from notifications');
    } catch (error) {
      console.error('Unsubscription error:', error);
      toast.error('Failed to disable notifications');
    } finally {
      setLoading(false);
    }
  };

  if (!supported) {
    return (
      <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
        Push notifications are not supported in your browser.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Status Card */}
      <div className={`rounded-xl p-4 border ${
        subscribed 
          ? 'bg-primary-500/10 border-primary-500/20' 
          : 'bg-dark-300 border-white/5'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {subscribed ? (
              <Bell className="w-6 h-6 text-primary-400" />
            ) : (
              <BellOff className="w-6 h-6 text-gray-400" />
            )}
            <div>
              <p className="font-semibold text-white">
                {subscribed ? 'Notifications Enabled' : 'Notifications Disabled'}
              </p>
              <p className="text-sm text-gray-400 mt-0.5">
                {subscribed
                  ? 'You will receive streak and revision reminders'
                  : 'Enable to get daily reminders and updates'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        {!subscribed ? (
          <button
            onClick={subscribeToPush}
            disabled={loading || permission === 'denied'}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Enabling...</span>
              </>
            ) : (
              <>
                <Bell className="w-5 h-5" />
                <span>Enable Notifications</span>
              </>
            )}
          </button>
        ) : (
          <>
            <button
              onClick={unsubscribeFromPush}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-dark-300 text-red-400 rounded-xl hover:bg-red-500/10 border border-red-500/30 disabled:opacity-50 transition-colors"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Disabling...</span>
                </>
              ) : (
                <>
                  <BellOff className="w-5 h-5" />
                  <span>Disable Notifications</span>
                </>
              )}
            </button>
          </>
        )}
      </div>

      {permission === 'denied' && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
          <p className="text-sm text-red-400">
            <strong>Notifications Blocked:</strong> You have blocked notifications for this site.
            Please enable them in your browser settings.
          </p>
        </div>
      )}

      {/* Info */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
        <p className="text-sm text-blue-400 font-medium mb-2">What you'll receive:</p>
        <ul className="text-sm text-blue-300 space-y-1">
          <li>• Daily streak reminders (if you haven't solved today)</li>
          <li>• Motivational daily quotes</li>
          <li>• Premium status updates</li>
        </ul>
      </div>
    </div>
  );
}
