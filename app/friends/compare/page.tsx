'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AuthenticatedLayout from '@/components/AuthenticatedLayout';
import BottomNav from '@/components/BottomNav';
import { api } from '@/lib/api-client';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  Clock,
  Code,
  AlertCircle,
  Lightbulb,
  User,
  CheckCircle,
} from 'lucide-react';

interface ComparisonData {
  problemName: string;
  platform: string;
  difficulty: string;
  topic: string;
  userSolution: {
    timeTaken: number;
    approach: string;
    mistakes: string;
    learning: string;
    code?: string;
    dateSolved: string;
  };
  friendSolution: {
    name: string;
    username: string;
    timeTaken: number;
    approach: string;
    mistakes: string;
    learning: string;
    code?: string;
    dateSolved: string;
  };
}

function CompareSolutionsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userProblemId = searchParams.get('user');
  const friendProblemId = searchParams.get('friend');

  const [data, setData] = useState<ComparisonData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userProblemId && friendProblemId) {
      loadComparison();
    }
  }, [userProblemId, friendProblemId]);

  const loadComparison = async () => {
    if (!userProblemId || !friendProblemId) return;

    // For now, we'll need to create an API endpoint for this
    // Placeholder implementation
    setLoading(false);
    toast.error('Comparison API coming soon!');
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

  return (
    <AuthenticatedLayout>
      <div className="min-h-screen pb-24 bg-gray-50">
        {/* Header */}
        <div className="bg-gradient-to-br from-purple-600 to-purple-800 p-6 shadow-lg">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-white/80 hover:text-white mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>

          <h1 className="text-2xl font-bold text-white">Solution Comparison</h1>
          <p className="text-white/80 text-sm mt-1">
            Compare approaches and learn from each other
          </p>
        </div>

        <div className="p-4 space-y-4">
          {/* Coming Soon Message */}
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
              <Code className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Solution Comparison Coming Soon!
            </h2>
            <p className="text-gray-600">
              We&apos;re working on bringing you detailed solution comparisons with AI-powered insights.
            </p>
            <button
              onClick={() => router.back()}
              className="mt-6 px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700"
            >
              Go Back
            </button>
          </div>

          {/* Feature Preview */}
          <div className="bg-white rounded-2xl p-6 shadow-md">
            <h3 className="font-bold text-gray-900 mb-4">What to Expect:</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Side-by-Side Comparison</p>
                  <p className="text-sm text-gray-600">
                    View your approach and your friend&apos;s approach side by side
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Time Analysis</p>
                  <p className="text-sm text-gray-600">
                    Compare solve times and identify efficiency opportunities
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Mistake Comparison</p>
                  <p className="text-sm text-gray-600">
                    Learn from common and unique mistakes
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">AI Insights</p>
                  <p className="text-sm text-gray-600">
                    Get AI-powered recommendations on which approach is more optimal
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <BottomNav />
    </AuthenticatedLayout>
  );
}

export default function CompareSolutionsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CompareSolutionsContent />
    </Suspense>
  );
}
