'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthenticatedLayout from '@/components/AuthenticatedLayout';
import BottomNav from '@/components/BottomNav';
import NotificationBell from '@/components/NotificationBell';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api-client';
import toast from 'react-hot-toast';
import { usePushNotifications } from '@/lib/push-notifications';
import {
  Trophy,
  Flame,
  Target,
  TrendingUp,
  Clock,
  Award,
  Code2,
  Calendar,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const DIFFICULTY_COLORS = {
  Easy: '#22c55e',
  Medium: '#f59e0b',
  Hard: '#ef4444',
};

export default function DashboardPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Register push notifications
  usePushNotifications();

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    const { data, error } = await api.getAnalytics();

    if (error) {
      toast.error('Failed to load analytics');
      setLoading(false);
      return;
    }

    setAnalytics(data);
    
    // Update user data in auth store with latest XP and level
    const analyticsData = data as any;
    if (analyticsData?.user) {
      updateUser(analyticsData.user);
    }
    
    setLoading(false);
  };

  if (loading) {
    return (
      <AuthenticatedLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </AuthenticatedLayout>
    );
  }

  const difficultyData = [
    { name: 'Easy', value: analytics?.difficultyDistribution?.easy || 0, color: DIFFICULTY_COLORS.Easy },
    { name: 'Medium', value: analytics?.difficultyDistribution?.medium || 0, color: DIFFICULTY_COLORS.Medium },
    { name: 'Hard', value: analytics?.difficultyDistribution?.hard || 0, color: DIFFICULTY_COLORS.Hard },
  ];

  const topicData = Object.entries(analytics?.topicStats || {})
    .map(([topic, stats]: any) => ({
      topic,
      count: stats.total,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const progressPercentage = user ? ((user.xp % 100) / 100) * 100 : 0;

  return (
    <AuthenticatedLayout>
      <div className="min-h-screen pb-24 page-content">
        {/* Header */}
        <div className="bg-gradient-to-br from-primary-600 to-primary-800 p-6 rounded-b-3xl shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">Welcome back,</h1>
              <p className="text-primary-100 text-lg">{user?.name || 'User'}</p>
            </div>
            <div className="flex items-center gap-2">
              <NotificationBell />
              <button
                onClick={() => router.push('/profile')}
                className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold text-white hover:bg-white/30 transition-colors"
              >
                {user?.name?.charAt(0).toUpperCase()}
              </button>
            </div>
          </div>

          {/* Level Progress */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-300" />
                <span className="text-white font-semibold">Level {user?.level || 1}</span>
              </div>
              <span className="text-primary-100 text-sm">{user?.xp || 0} XP</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2.5">
              <div
                className="bg-gradient-to-r from-yellow-300 to-yellow-500 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <p className="text-primary-100 text-xs mt-2">
              {100 - (user?.xp || 0) % 100} XP to next level
            </p>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="card-hover">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary-600/20 flex items-center justify-center">
                  <Code2 className="w-6 h-6 text-primary-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{analytics?.totalProblems || 0}</p>
                  <p className="text-gray-400 text-sm">Problems</p>
                </div>
              </div>
            </div>

            <div className="card-hover">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-orange-600/20 flex items-center justify-center">
                  <Flame className="w-6 h-6 text-orange-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{analytics?.currentStreak || 0}</p>
                  <p className="text-gray-400 text-sm">Day Streak</p>
                </div>
              </div>
            </div>

            <div className="card-hover">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-green-600/20 flex items-center justify-center">
                  <Target className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{analytics?.longestStreak || 0}</p>
                  <p className="text-gray-400 text-sm">Best Streak</p>
                </div>
              </div>
            </div>

            <div className="card-hover">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-purple-600/20 flex items-center justify-center">
                  <Award className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{user?.level || 1}</p>
                  <p className="text-gray-400 text-sm">Level</p>
                </div>
              </div>
            </div>
          </div>

          {/* Difficulty Distribution */}
          <div className="card">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary-400" />
              Difficulty Distribution
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={difficultyData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {difficultyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1a2332',
                      border: '1px solid #0f1620',
                      borderRadius: '8px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-3 gap-3 mt-4">
              {difficultyData.map((item) => (
                <div key={item.name} className="text-center">
                  <div className="text-2xl font-bold" style={{ color: item.color }}>
                    {item.value}
                  </div>
                  <div className="text-xs text-gray-400">{item.name}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Topics */}
          {topicData.length > 0 && (
            <div className="card">
              <h3 className="text-lg font-semibold text-white mb-4">Top Topics</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topicData}>
                    <XAxis dataKey="topic" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1a2332',
                        border: '1px solid #0f1620',
                        borderRadius: '8px',
                      }}
                    />
                    <Bar dataKey="count" fill="#0ea5e9" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Recent Problems */}
          {analytics?.recentProblems?.length > 0 && (
            <div className="card">
              <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {analytics.recentProblems.slice(0, 5).map((problem: any) => (
                  <div
                    key={problem._id}
                    className="flex items-start gap-3 p-3 bg-dark-200 rounded-lg hover:bg-dark-100 transition-colors"
                  >
                    <div className="w-2 h-2 rounded-full bg-primary-500 mt-2" />
                    <div className="flex-1">
                      <p className="text-white font-medium">{problem.problemName}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`badge badge-${problem.difficulty.toLowerCase()}`}>
                          {problem.difficulty}
                        </span>
                        <span className="text-xs text-gray-400">{problem.topic}</span>
                      </div>
                    </div>
                    <div className="text-xs text-gray-400">
                      {new Date(problem.dateSolved).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </AuthenticatedLayout>
  );
}
