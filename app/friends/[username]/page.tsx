'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AuthenticatedLayout from '@/components/AuthenticatedLayout';
import BottomNav from '@/components/BottomNav';
import { api } from '@/lib/api-client';
import toast from 'react-hot-toast';
import {
  User,
  Trophy,
  Flame,
  TrendingUp,
  Clock,
  Target,
  Zap,
  ArrowLeft,
  Calendar,
  CheckCircle,
  Code,
  ArrowRight,
} from 'lucide-react';

interface FriendData {
  friend: {
    id: string;
    name: string;
    username: string;
    avatar: string;
    level: number;
  };
  summary: {
    totalProblemsSolved: number;
    currentStreak: number;
    longestStreak: number;
    level: number;
    weakestTopic: string;
    strongestTopic: string;
    hardProblemsCount: number;
    avgSolveTime: number;
  };
  recentActivity: Array<{
    id: string;
    type: string;
    metadata: any;
    createdAt: string;
  }>;
  comparison: {
    totalSolved: { user: number; friend: number };
    currentStreak: { user: number; friend: number };
    hardSolved: { user: number; friend: number };
    avgSolveTime: { user: number; friend: number };
    weakestTopic: { user: string; friend: string };
  };
  topicComparison: Array<{
    topic: string;
    userCount: number;
    friendCount: number;
    stronger: 'user' | 'friend';
  }>;
  commonProblems: Array<any>;
  commonWeakTopics: string[];
}

export default function FriendProfilePage() {
  const params = useParams();
  const router = useRouter();
  const username = params.username as string;

  const [data, setData] = useState<FriendData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFriendData();
  }, [username]);

  const loadFriendData = async () => {
    const { data: result, error } = await api.getFriendDashboard(username);

    if (error) {
      toast.error(error);
      setLoading(false);
      return;
    }

    setData(result as FriendData);
    setLoading(false);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'problem_solved':
        return <CheckCircle className="w-4 h-4" />;
      case 'revision_done':
        return <Calendar className="w-4 h-4" />;
      case 'challenge_joined':
      case 'challenge_completed':
        return <Trophy className="w-4 h-4" />;
      case 'streak_updated':
        return <Flame className="w-4 h-4" />;
      default:
        return <Code className="w-4 h-4" />;
    }
  };

  const getActivityMessage = (activity: any) => {
    switch (activity.type) {
      case 'problem_solved':
        return `Solved ${activity.metadata?.difficulty || ''} problem: ${activity.metadata?.problemName || 'Problem'}`;
      case 'revision_done':
        return `Completed revision: ${activity.metadata?.problemName || 'Problem'}`;
      case 'challenge_joined':
        return 'Joined a new challenge';
      case 'challenge_completed':
        return 'Completed a challenge';
      case 'streak_updated':
        return `Streak updated to ${activity.metadata?.streak || 0} days`;
      default:
        return 'Activity';
    }
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

  if (!data) {
    return (
      <AuthenticatedLayout>
        <div className="flex flex-col items-center justify-center min-h-screen p-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">User Not Found</h2>
            <p className="text-gray-600 mb-6">This user doesn&apos;t exist or you&apos;re not friends.</p>
            <button
              onClick={() => router.push('/friends')}
              className="px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700"
            >
              Back to Friends
            </button>
          </div>
        </div>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout>
      <div className="min-h-screen pb-24 bg-gray-50">
        {/* Header */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-6 shadow-lg">
          <button
            onClick={() => router.push('/friends')}
            className="flex items-center gap-2 text-white/80 hover:text-white mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Friends</span>
          </button>

          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-3xl font-bold text-white shadow-lg">
              {data.friend.avatar || data.friend.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white">{data.friend.name}</h1>
              <p className="text-white/80">@{data.friend.username}</p>
              <div className="flex items-center gap-2 mt-2">
                <div className="px-3 py-1 bg-white/20 rounded-full text-white text-sm font-medium">
                  Level {data.summary.level}
                </div>
                <div className="flex items-center gap-1 px-3 py-1 bg-white/20 rounded-full text-white text-sm">
                  <Flame className="w-4 h-4 text-orange-300" />
                  <span>{data.summary.currentStreak} days</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Section A: Summary */}
          <div className="bg-white rounded-2xl p-6 shadow-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Trophy className="w-6 h-6 text-yellow-500" />
              Summary
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-xl">
                <div className="text-3xl font-bold text-blue-600">
                  {data.summary.totalProblemsSolved}
                </div>
                <div className="text-sm text-gray-600">Problems Solved</div>
              </div>
              <div className="p-4 bg-orange-50 rounded-xl">
                <div className="text-3xl font-bold text-orange-600">
                  {data.summary.currentStreak}
                </div>
                <div className="text-sm text-gray-600">Current Streak</div>
              </div>
              <div className="p-4 bg-purple-50 rounded-xl">
                <div className="text-3xl font-bold text-purple-600">
                  {data.summary.longestStreak}
                </div>
                <div className="text-sm text-gray-600">Longest Streak</div>
              </div>
              <div className="p-4 bg-red-50 rounded-xl">
                <div className="text-3xl font-bold text-red-600">
                  {data.summary.hardProblemsCount}
                </div>
                <div className="text-sm text-gray-600">Hard Solved</div>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="text-sm text-gray-700 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  Strongest Topic
                </span>
                <span className="font-semibold text-green-700">
                  {data.summary.strongestTopic}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                <span className="text-sm text-gray-700 flex items-center gap-2">
                  <Target className="w-4 h-4 text-amber-600" />
                  Weakest Topic
                </span>
                <span className="font-semibold text-amber-700">
                  {data.summary.weakestTopic}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg">
                <span className="text-sm text-gray-700 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-indigo-600" />
                  Avg Solve Time
                </span>
                <span className="font-semibold text-indigo-700">
                  {data.summary.avgSolveTime} mins
                </span>
              </div>
            </div>
          </div>

          {/* Section B: Recent Activity */}
          <div className="bg-white rounded-2xl p-6 shadow-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Zap className="w-6 h-6 text-blue-500" />
              Recent Activity
            </h2>
            {data.recentActivity.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No recent activity</p>
            ) : (
              <div className="space-y-3">
                {data.recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 flex-shrink-0">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 font-medium truncate">
                        {getActivityMessage(activity)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(activity.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section C: Mutual Comparison */}
          <div className="bg-white rounded-2xl p-6 shadow-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Comparison</h2>
            <div className="space-y-3">
              {Object.entries(data.comparison).map(([key, value]) => {
                const labels: Record<string, string> = {
                  totalSolved: 'Total Solved',
                  currentStreak: 'Current Streak',
                  hardSolved: 'Hard Solved',
                  avgSolveTime: 'Avg Solve Time',
                  weakestTopic: 'Weakest Topic',
                };

                const isNumeric = typeof value.user === 'number';
                const userWins = isNumeric
                  ? key === 'avgSolveTime'
                    ? value.user < value.friend
                    : value.user > value.friend
                  : false;

                return (
                  <div key={key} className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 px-4 py-2 font-medium text-gray-700 text-sm">
                      {labels[key]}
                    </div>
                    <div className="grid grid-cols-2 divide-x divide-gray-200">
                      <div
                        className={`p-4 ${
                          userWins ? 'bg-green-50' : 'bg-gray-50'
                        } transition-colors`}
                      >
                        <div className="text-xs text-gray-500 mb-1">You</div>
                        <div
                          className={`text-xl font-bold ${
                            userWins ? 'text-green-600' : 'text-gray-700'
                          }`}
                        >
                          {value.user}
                        </div>
                      </div>
                      <div
                        className={`p-4 ${
                          !userWins && isNumeric ? 'bg-blue-50' : 'bg-gray-50'
                        } transition-colors`}
                      >
                        <div className="text-xs text-gray-500 mb-1">{data.friend.name}</div>
                        <div
                          className={`text-xl font-bold ${
                            !userWins && isNumeric ? 'text-blue-600' : 'text-gray-700'
                          }`}
                        >
                          {value.friend}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {data.commonWeakTopics.length > 0 && (
              <div className="mt-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
                <h3 className="font-semibold text-amber-900 mb-2 flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Common Weak Topics
                </h3>
                <div className="flex flex-wrap gap-2">
                  {data.commonWeakTopics.map((topic) => (
                    <span
                      key={topic}
                      className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Section D: Common Problems */}
          {data.commonProblems.length > 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-md">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Code className="w-6 h-6 text-purple-500" />
                Common Problems ({data.commonProblems.length})
              </h2>
              <div className="space-y-3">
                {data.commonProblems.map((problem, idx) => (
                  <div
                    key={idx}
                    className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">{problem.problemName}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              problem.difficulty === 'Easy'
                                ? 'bg-green-100 text-green-700'
                                : problem.difficulty === 'Medium'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {problem.difficulty}
                          </span>
                          <span className="text-xs text-gray-500">{problem.topic}</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-green-50 p-3 rounded-lg">
                        <div className="text-xs text-gray-600 mb-1">Your Time</div>
                        <div className="font-bold text-green-600">
                          {problem.userTimeTaken} mins
                        </div>
                      </div>
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <div className="text-xs text-gray-600 mb-1">Friend&apos;s Time</div>
                        <div className="font-bold text-blue-600">
                          {problem.friendTimeTaken} mins
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() =>
                        router.push(
                          `/friends/compare?user=${problem.userProblemId}&friend=${problem.friendProblemId}`
                        )
                      }
                      className="mt-3 w-full flex items-center justify-center gap-2 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      <span>Compare Solutions</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
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
