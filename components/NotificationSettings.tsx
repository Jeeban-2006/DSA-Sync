'use client';

import { useState, useEffect } from 'react';
import { Bell, Mail, Clock, Moon, Send } from 'lucide-react';
import toast from 'react-hot-toast';

interface NotificationPreferences {
  pushEnabled: boolean;
  emailEnabled: boolean;
  streakReminders: boolean;
  revisionReminders: boolean;
  achievementAlerts: boolean;
  friendActivity: boolean;
  challengeUpdates: boolean;
  weeklyReport: boolean;
  streakReminderTime: string;
  revisionReminderTime: string;
  weeklyReportDay: number;
  quietHoursStart: string;
  quietHoursEnd: string;
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function NotificationSettings() {
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const response = await fetch('/api/notifications/preferences');
      if (response.ok) {
        const data = await response.json();
        setPreferences(data);
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
      toast.error('Failed to load notification settings');
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async () => {
    if (!preferences) return;

    try {
      setSaving(true);
      const response = await fetch('/api/notifications/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences),
      });

      if (response.ok) {
        toast.success('Settings saved successfully!');
      } else {
        throw new Error('Failed to save');
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const sendTestNotification = async (type: string) => {
    try {
      const response = await fetch('/api/notifications/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      });

      if (response.ok) {
        toast.success('Test notification sent! Check your notifications.');
      } else {
        throw new Error('Failed to send test notification');
      }
    } catch (error) {
      console.error('Error sending test notification:', error);
      toast.error('Failed to send test notification');
    }
  };

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      toast.error('Browser does not support notifications');
      return;
    }

    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      toast.success('Notification permission granted!');
      updatePreference('pushEnabled', true);
    } else {
      toast.error('Notification permission denied');
    }
  };

  const updatePreference = (key: keyof NotificationPreferences, value: any) => {
    if (!preferences) return;
    setPreferences({ ...preferences, [key]: value });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!preferences) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-500">Failed to load notification settings</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Notification Channels */}
      <div className="card-hover">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Notification Channels
        </h3>
        
        <div className="space-y-4">
          {/* Push Notifications */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Push Notifications</p>
              <p className="text-sm text-gray-400">Receive browser notifications</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={requestNotificationPermission}
                className="text-xs text-blue-400 hover:underline"
              >
                Enable
              </button>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.pushEnabled}
                  onChange={(e) => updatePreference('pushEnabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>
          </div>

          {/* Email Notifications */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Email Notifications</p>
              <p className="text-sm text-gray-400">Receive email updates</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.emailEnabled}
                onChange={(e) => updatePreference('emailEnabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Notification Types */}
      <div className="card-hover">
        <h3 className="text-lg font-semibold text-white mb-4">Notification Types</h3>
        
        <div className="space-y-4">
          {[
            { key: 'streakReminders', label: 'Streak Reminders', icon: '🔥', desc: 'Daily reminders to maintain your streak' },
            { key: 'revisionReminders', label: 'Revision Reminders', icon: '📚', desc: 'Alerts for problems due for revision' },
            { key: 'achievementAlerts', label: 'Achievement Alerts', icon: '🎉', desc: 'Celebrate your milestones' },
            { key: 'friendActivity', label: 'Friend Activity', icon: '👥', desc: 'Updates about your friends' },
            { key: 'challengeUpdates', label: 'Challenge Updates', icon: '⚔️', desc: 'Competition and challenge notifications' },
            { key: 'weeklyReport', label: 'Weekly Report', icon: '📊', desc: 'AI-generated weekly progress summary' },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{item.icon}</span>
                <div>
                  <p className="text-white font-medium">{item.label}</p>
                  <p className="text-sm text-gray-400">{item.desc}</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences[item.key as keyof NotificationPreferences] as boolean}
                  onChange={(e) => updatePreference(item.key as keyof NotificationPreferences, e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Timing Settings */}
      <div className="card-hover">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Timing Settings
        </h3>
        
        <div className="space-y-4">
          {/* Streak Reminder Time */}
          <div>
            <label className="text-white font-medium block mb-2">Streak Reminder Time</label>
            <input
              type="time"
              value={preferences.streakReminderTime}
              onChange={(e) => updatePreference('streakReminderTime', e.target.value)}
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500"
            />
            <p className="text-sm text-gray-400 mt-1">When to remind you about your streak</p>
          </div>

          {/* Revision Reminder Time */}
          <div>
            <label className="text-white font-medium block mb-2">Revision Reminder Time</label>
            <input
              type="time"
              value={preferences.revisionReminderTime}
              onChange={(e) => updatePreference('revisionReminderTime', e.target.value)}
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500"
            />
            <p className="text-sm text-gray-400 mt-1">When to remind you about revisions</p>
          </div>

          {/* Weekly Report Day */}
          <div>
            <label className="text-white font-medium block mb-2">Weekly Report Day</label>
            <select
              value={preferences.weeklyReportDay}
              onChange={(e) => updatePreference('weeklyReportDay', parseInt(e.target.value))}
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500"
            >
              {DAYS.map((day, index) => (
                <option key={day} value={index}>{day}</option>
              ))}
            </select>
            <p className="text-sm text-gray-400 mt-1">Day to receive weekly progress report</p>
          </div>
        </div>
      </div>

      {/* Quiet Hours */}
      <div className="card-hover">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Moon className="w-5 h-5" />
          Quiet Hours
        </h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-white font-medium block mb-2">Start</label>
            <input
              type="time"
              value={preferences.quietHoursStart}
              onChange={(e) => updatePreference('quietHoursStart', e.target.value)}
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="text-white font-medium block mb-2">End</label>
            <input
              type="time"
              value={preferences.quietHoursEnd}
              onChange={(e) => updatePreference('quietHoursEnd', e.target.value)}
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
        <p className="text-sm text-gray-400 mt-2">No notifications during these hours</p>
      </div>

      {/* Test Notifications */}
      <div className="card-hover">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Send className="w-5 h-5" />
          Test Notifications
        </h3>
        
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => sendTestNotification('streak')}
            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors text-sm"
          >
            🔥 Streak
          </button>
          <button
            onClick={() => sendTestNotification('revision')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
          >
            📚 Revision
          </button>
          <button
            onClick={() => sendTestNotification('achievement')}
            className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors text-sm"
          >
            🎉 Achievement
          </button>
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={savePreferences}
        disabled={saving}
        className="w-full py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-700 text-white rounded-lg font-semibold transition-colors"
      >
        {saving ? 'Saving...' : 'Save Settings'}
      </button>
    </div>
  );
}
