'use client';

import { useEffect, useState } from 'react';
import AuthenticatedLayout from '@/components/AuthenticatedLayout';
import BottomNav from '@/components/BottomNav';
import { api } from '@/lib/api-client';
import toast from 'react-hot-toast';
import { RotateCcw, CheckCircle2, Calendar, Clock, TrendingUp } from 'lucide-react';

export default function RevisionPage() {
  const [revisions, setRevisions] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRevisions();
  }, []);

  const loadRevisions = async () => {
    const { data, error } = await api.getRevisions();

    if (error) {
      toast.error('Failed to load revisions');
      setLoading(false);
      return;
    }

    setRevisions(data);
    setLoading(false);
  };

  const handleCompleteRevision = async (revisionId: string) => {
    const { error } = await api.completeRevision(revisionId, {
      performanceNotes: 'Completed via mobile',
    });

    if (error) {
      toast.error('Failed to complete revision');
      return;
    }

    toast.success('Revision completed! 🎉');
    loadRevisions();
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
      <div className="min-h-screen pb-24 page-content">
        {/* Header */}
        <div className="bg-gradient-to-br from-purple-600 to-purple-800 p-6 rounded-b-3xl shadow-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <RotateCcw className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Revision Queue</h1>
              <p className="text-purple-100 text-sm">Strengthen your concepts</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-white">{revisions?.stats?.totalPending || 0}</p>
              <p className="text-purple-100 text-xs">Pending</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-white">{revisions?.stats?.totalCompleted || 0}</p>
              <p className="text-purple-100 text-xs">Completed</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-white">{revisions?.stats?.completionRate || 0}%</p>
              <p className="text-purple-100 text-xs">Rate</p>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-6">
          {/* Today's Revisions */}
          {revisions?.today?.length > 0 ? (
            <div>
              <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary-400" />
                Due Today ({revisions.today.length})
              </h2>
              <div className="space-y-3">
                {revisions.today.map((revision: any) => (
                  <div key={revision._id} className="card-hover">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-white font-semibold">{revision.problemId?.problemName}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`badge badge-${revision.problemId?.difficulty?.toLowerCase()}`}>
                            {revision.problemId?.difficulty}
                          </span>
                          <span className="text-xs text-gray-400">{revision.problemId?.topic}</span>
                        </div>
                      </div>
                      <span className="badge bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                        {revision.cycle}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
                      <Clock className="w-4 h-4" />
                      <span>Solved {revision.problemId?.timeTaken || 0} mins ago</span>
                    </div>

                    <button
                      onClick={() => handleCompleteRevision(revision._id)}
                      className="btn-primary w-full flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Mark as Completed
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="card text-center py-12">
              <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">All caught up!</h3>
              <p className="text-gray-400">No revisions due today. Great work!</p>
            </div>
          )}

          {/* Upcoming Revisions */}
          {revisions?.upcoming?.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary-400" />
                Upcoming
              </h2>
              <div className="space-y-3">
                {revisions.upcoming.map((revision: any) => (
                  <div key={revision._id} className="card">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-white font-medium">{revision.problemId?.problemName}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`badge badge-${revision.problemId?.difficulty?.toLowerCase()}`}>
                            {revision.problemId?.difficulty}
                          </span>
                          <span className="text-xs text-gray-400">{revision.cycle}</span>
                        </div>
                      </div>
                      <span className="text-xs text-gray-400">
                        {new Date(revision.scheduledDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
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
