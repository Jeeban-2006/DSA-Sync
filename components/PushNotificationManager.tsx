'use client';

import { useState, useEffect } from 'react';
import { Bell, BellOff, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { api } from '@/lib/api-client';
import toast from 'react-hot-toast';

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
    checkSubscriptionStatus();
  }, []);

  const checkPushSupport = () => {
    if (typeof window === 'undefined') return;

    const isSupported =
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window;

    setSupported(isSupported);
    setPermission(Notification.permission);
  };

  const checkSubscriptionStatus = async () => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setSubscribed(!!subscription);
      
      if (onStatusChange) {
        onStatusChange(!!subscription);
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
  };

  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const subscribeToPush = async () => {
    setLoading(true);

    try {
      // Request notification permission
      const permissionResult = await Notification.requestPermission();
      setPermission(permissionResult);

      if (permissionResult !== 'granted') {
        toast.error('Notification permission denied');
        setLoading(false);
        return;
      }

      // Register service worker if not already registered
      let registration;
      if ('serviceWorker' in navigator) {
        registration = await navigator.serviceWorker.register('/push-sw.js');
        await navigator.serviceWorker.ready;
      }

      if (!registration) {
        toast.error('Service worker registration failed');
        setLoading(false);
        return;
      }

      // Get VAPID public key from environment or meta tag
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || 
        document.querySelector('meta[name="vapid-public-key"]')?.getAttribute('content');

      if (!vapidPublicKey) {
        toast.error('VAPID public key not configured');
        setLoading(false);
        return;
      }

      // Subscribe to push notifications
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });

      // Send subscription to server
      const subscriptionData = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: btoa(
            String.fromCharCode.apply(
              null,
              new Uint8Array(subscription.getKey('p256dh')!) as any
            )
          ),
          auth: btoa(
            String.fromCharCode.apply(
              null,
              new Uint8Array(subscription.getKey('auth')!) as any
            )
          ),
        },
        userAgent: navigator.userAgent,
      };

      const { error } = await api.subscribeToPush(subscriptionData);

      if (error) {
        toast.error('Failed to save subscription');
        await subscription.unsubscribe();
        setLoading(false);
        return;
      }

      setSubscribed(true);
      toast.success('Push notifications enabled!');
      
      if (onStatusChange) {
        onStatusChange(true);
      }
    } catch (error: any) {
      console.error('Push subscription error:', error);
      toast.error(error.message || 'Failed to enable notifications');
    } finally {
      setLoading(false);
    }
  };

  const unsubscribeFromPush = async () => {
    setLoading(true);

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await api.unsubscribeFromPush(subscription.endpoint);
        await subscription.unsubscribe();
        setSubscribed(false);
        toast.success('Push notifications disabled');
        
        if (onStatusChange) {
          onStatusChange(false);
        }
      }
    } catch (error) {
      console.error('Unsubscribe error:', error);
      toast.error('Failed to disable notifications');
    } finally {
      setLoading(false);
    }
  };

  const sendTestNotification = async () => {
    try {
      toast.loading('Sending test notification...');
      const { error } = await api.sendTestNotification();

      if (error) {
        toast.dismiss();
        toast.error(error);
        return;
      }

      toast.dismiss();
      toast.success('Test notification sent! Check your device.');
    } catch (error) {
      toast.dismiss();
      toast.error('Failed to send test notification');
    }
  };

  if (!supported) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <XCircle className="w-6 h-6 text-yellow-600 flex-shrink-0" />
          <div>
            <p className="font-semibold text-yellow-900">Push Notifications Not Supported</p>
            <p className="text-sm text-yellow-700 mt-1">
              Your browser doesn&apos;t support push notifications.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Status Card */}
      <div className={`rounded-xl p-4 border ${
        subscribed 
          ? 'bg-green-50 border-green-200' 
          : 'bg-gray-50 border-gray-200'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {subscribed ? (
              <CheckCircle className="w-6 h-6 text-green-600" />
            ) : (
              <BellOff className="w-6 h-6 text-gray-400" />
            )}
            <div>
              <p className="font-semibold text-gray-900">
                {subscribed ? 'Notifications Enabled' : 'Notifications Disabled'}
              </p>
              <p className="text-sm text-gray-600 mt-0.5">
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
              onClick={sendTestNotification}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
            >
              <Bell className="w-5 h-5" />
              <span>Send Test Notification</span>
            </button>

            <button
              onClick={unsubscribeFromPush}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50 transition-colors"
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
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-sm text-red-800">
            <strong>Notifications Blocked:</strong> You have blocked notifications for this site.
            Please enable them in your browser settings.
          </p>
        </div>
      )}

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-sm text-blue-900 font-medium mb-2">What you&apos;ll receive:</p>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Daily streak reminders (if you haven&apos;t solved today)</li>
          <li>• Revision reminders for scheduled reviews</li>
          <li>• Friend activity updates</li>
        </ul>
      </div>
    </div>
  );
}
