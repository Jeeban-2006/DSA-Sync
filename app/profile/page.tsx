'use client';

import { useEffect, useState } from 'react';
import AuthenticatedLayout from '@/components/AuthenticatedLayout';
import BottomNav from '@/components/BottomNav';
import PushNotificationManager from '@/components/PushNotificationManager';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api-client';
import toast from 'react-hot-toast';
import {
  User,
  Mail,
  AtSign,
  Calendar,
  Trophy,
  Flame,
  Code2,
  LogOut,
  Copy,
  Check,
  Bell,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  const copyUsername = () => {
    if (user?.username) {
      navigator.clipboard.writeText(user.username);
      setCopied(true);
      toast.success('Username copied!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  if (!user) {
    return null;
  }

  const joinDate = new Date(user.joinDate).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <AuthenticatedLayout>
      <div className="min-h-screen pb-24 page-content bg-dark-400">
        {/* Header */}
        <div className="bg-gradient-to-br from-purple-600 to-purple-800 p-6 rounded-b-3xl shadow-2xl">
          <div className="flex flex-col items-center">
            <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center text-4xl font-bold text-white mb-4">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <h1 className="text-2xl font-bold text-white">{user.name}</h1>
            <p className="text-purple-100 text-sm">@{user.username}</p>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="card text-center">
              <Trophy className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">Level {user.level}</p>
              <p className="text-gray-400 text-sm">{user.xp} XP</p>
            </div>

            <div className="card text-center">
              <Code2 className="w-8 h-8 text-primary-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{user.totalProblemsSolved}</p>
              <p className="text-gray-400 text-sm">Problems Solved</p>
            </div>

            <div className="card text-center">
              <Flame className="w-8 h-8 text-orange-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{user.currentStreak}</p>
              <p className="text-gray-400 text-sm">Day Streak</p>
            </div>

            <div className="card text-center">
              <Flame className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{user.longestStreak}</p>
              <p className="text-gray-400 text-sm">Best Streak</p>
            </div>
          </div>

          {/* Account Info */}
          <div className="card space-y-4">
            <h2 className="text-lg font-semibold text-white mb-4">Account Information</h2>

            <div className="flex items-center gap-3 p-3 bg-dark-300 rounded-lg">
              <User className="w-5 h-5 text-gray-400" />
              <div className="flex-1">
                <p className="text-xs text-gray-400">Full Name</p>
                <p className="text-white">{user.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-dark-300 rounded-lg">
              <Mail className="w-5 h-5 text-gray-400" />
              <div className="flex-1">
                <p className="text-xs text-gray-400">Email</p>
                <p className="text-white">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-primary-600/20 rounded-lg border border-primary-600/30">
              <AtSign className="w-5 h-5 text-primary-400" />
              <div className="flex-1">
                <p className="text-xs text-primary-300">Username (for friends)</p>
                <p className="text-white font-semibold">@{user.username}</p>
              </div>
              <button
                onClick={copyUsername}
                className="p-2 rounded-lg bg-primary-600 hover:bg-primary-700 transition-colors"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-white" />
                ) : (
                  <Copy className="w-4 h-4 text-white" />
                )}
              </button>
            </div>

            <div className="flex items-center gap-3 p-3 bg-dark-300 rounded-lg">
              <Calendar className="w-5 h-5 text-gray-400" />
              <div className="flex-1">
                <p className="text-xs text-gray-400">Member Since</p>
                <p className="text-white">{joinDate}</p>
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="card">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary-400" />
              Push Notifications
            </h2>
            <PushNotificationManager />
          </div>

          {/* Info Card */}
          <div className="card bg-blue-600/20 border border-blue-600/30">
            <div className="flex gap-3">
              <AtSign className="w-5 h-5 text-blue-400 flex-shrink-0 mt-1" />
              <div>
                <p className="text-blue-300 font-semibold mb-1">Share Your Username</p>
                <p className="text-blue-200 text-sm">
                  Friends can find you by searching for <span className="font-semibold">@{user.username}</span> in the Friends section!
                </p>
              </div>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full btn-secondary flex items-center justify-center gap-2 text-red-400 border-red-600/30 hover:bg-red-600/20"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </div>

      <BottomNav />
    </AuthenticatedLayout>
  );
}
