'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import AuthenticatedLayout from '@/components/AuthenticatedLayout';
import BottomNav from '@/components/BottomNav';
import { api } from '@/lib/api-client';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  ExternalLink,
  Calendar,
  Tag,
  Clock,
  CheckCircle,
  AlertCircle,
  Star,
  Code2,
  BookOpen,
  Lightbulb,
  AlertTriangle,
  Brain,
  Trash2,
  Edit,
  Copy,
  Check,
} from 'lucide-react';

interface Problem {
  _id: string;
  problemName: string;
  platform: string;
  difficulty: string;
  topic: string;
  subtopic: string;
  dateSolved: string;
  status: string;
  problemLink: string;
  timeTaken?: number;
  approachSummary?: string;
  mistakesFaced?: string;
  keyLearning?: string;
  codeSnippet?: string;
  imported?: boolean;
  importSource?: string;
  markedForRevision?: boolean;
  revisionCount?: number;
  timesAttempted?: number;
  createdAt?: string;
}

export default function ProblemDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [problem, setProblem] = useState<Problem | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (id) {
      loadProblem(id);
    }
  }, [id]);

  const loadProblem = async (problemId: string) => {
    setLoading(true);
    const { data, error } = await api.getProblem(problemId);

    if (error) {
      if (error.includes('not found') || error.includes('404')) {
        setNotFound(true);
      } else {
        toast.error('Failed to load problem');
      }
      setLoading(false);
      return;
    }

    setProblem((data as any)?.problem || null);
    setLoading(false);
  };

  const toggleRevision = async () => {
    if (!problem) return;
    const currentStatus = problem.markedForRevision || false;

    let error;
    if (currentStatus) {
      const result = await api.deleteRevision(problem._id);
      error = result.error;
    } else {
      const result = await api.createRevision(problem._id);
      error = result.error;
    }

    if (error) {
      toast.error('Failed to update revision status');
      return;
    }

    toast.success(currentStatus ? 'Removed from revision' : 'Marked for revision');
    setProblem((prev) => prev ? { ...prev, markedForRevision: !currentStatus } : prev);
  };

  const handleDelete = async () => {
    if (!problem) return;
    setDeleting(true);

    const { error } = await api.deleteProblem(problem._id);

    if (error) {
      toast.error('Failed to delete problem');
      setDeleting(false);
      return;
    }

    toast.success('Problem deleted successfully');
    router.push('/problems');
  };

  const copyCode = () => {
    if (problem?.codeSnippet) {
      navigator.clipboard.writeText(problem.codeSnippet);
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return 'text-green-400 bg-green-400/20 border-green-400/30';
      case 'Medium':
        return 'text-yellow-400 bg-yellow-400/20 border-yellow-400/30';
      case 'Hard':
        return 'text-red-400 bg-red-400/20 border-red-400/30';
      default:
        return 'text-gray-400 bg-gray-400/20 border-gray-400/30';
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'LeetCode':
        return 'bg-orange-400/20 text-orange-400 border-orange-400/30';
      case 'Codeforces':
        return 'bg-purple-400/20 text-purple-400 border-purple-400/30';
      case 'CodeChef':
        return 'bg-red-400/20 text-red-400 border-red-400/30';
      case 'GeeksForGeeks':
        return 'bg-green-400/20 text-green-400 border-green-400/30';
      case 'HackerRank':
        return 'bg-blue-400/20 text-blue-400 border-blue-400/30';
      default:
        return 'bg-gray-400/20 text-gray-400 border-gray-400/30';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Solved':
        return 'text-green-400 bg-green-400/20 border-green-400/30';
      case 'Needs Revision':
        return 'text-yellow-400 bg-yellow-400/20 border-yellow-400/30';
      case "Couldn't Solve":
        return 'text-red-400 bg-red-400/20 border-red-400/30';
      default:
        return 'text-gray-400 bg-gray-400/20 border-gray-400/30';
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  // Loading state
  if (loading) {
    return (
      <AuthenticatedLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </AuthenticatedLayout>
    );
  }

  // 404 state
  if (notFound || !problem) {
    return (
      <AuthenticatedLayout>
        <div className="min-h-screen pb-24 page-content flex flex-col items-center justify-center p-6">
          <div className="text-center max-w-sm">
            <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-12 h-12 text-red-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Problem Not Found</h1>
            <p className="text-gray-400 mb-6">
              The problem you&apos;re looking for doesn&apos;t exist or you don&apos;t have access to it.
            </p>
            <Link
              href="/problems"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Problems
            </Link>
          </div>
        </div>
        <BottomNav />
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout>
      <div className="min-h-screen pb-24 page-content">

        {/* Header */}
        <div className="bg-gradient-to-br from-dark-100 to-dark-200 border-b border-white/10 sticky top-0 z-10 backdrop-blur-sm">
          <div className="flex items-center gap-3 p-4">
            <Link
              href="/problems"
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-400 uppercase tracking-wide">Problem Detail</p>
              <h1 className="text-base font-semibold text-white truncate">{problem.problemName}</h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleRevision}
                className={`p-2 rounded-lg transition-all ${
                  problem.markedForRevision
                    ? 'bg-orange-500/20 text-orange-400 hover:bg-orange-500/30'
                    : 'bg-white/10 text-gray-400 hover:bg-white/20'
                }`}
                title={problem.markedForRevision ? 'Remove from revision' : 'Mark for revision'}
              >
                <Star className={`w-5 h-5 ${problem.markedForRevision ? 'fill-current' : ''}`} />
              </button>
              <Link
                href={`/problems/add?edit=${problem._id}`}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-gray-400 hover:text-white transition-colors"
                title="Edit problem"
              >
                <Edit className="w-5 h-5" />
              </Link>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                title="Delete problem"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-4">

          {/* Problem Header Card */}
          <div className="card">
            <div className="flex items-start justify-between mb-3">
              <h2 className="text-xl font-bold text-white leading-tight flex-1 pr-2">
                {problem.problemName}
              </h2>
              {problem.markedForRevision && (
                <span className="flex-shrink-0 px-2 py-1 rounded-lg text-xs font-semibold bg-orange-400/20 text-orange-400 border border-orange-400/30">
                  ⭐ Revision
                </span>
              )}
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-4">
              <span className={`px-3 py-1 rounded-lg text-xs font-semibold border ${getDifficultyColor(problem.difficulty)}`}>
                {problem.difficulty}
              </span>
              <span className={`px-3 py-1 rounded-lg text-xs font-semibold border ${getPlatformColor(problem.platform)}`}>
                {problem.platform}
              </span>
              <span className={`px-3 py-1 rounded-lg text-xs font-semibold border ${getStatusColor(problem.status)}`}>
                {problem.status === 'Solved' && <CheckCircle className="w-3 h-3 inline mr-1" />}
                {problem.status}
              </span>
              {problem.imported && (
                <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-purple-400/20 text-purple-400 border border-purple-400/30">
                  Imported {problem.importSource ? `· ${problem.importSource}` : ''}
                </span>
              )}
            </div>

            {/* Meta info grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Tag className="w-4 h-4 text-blue-400 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-500">Topic</p>
                  <p className="text-white font-medium">{problem.topic}</p>
                </div>
              </div>

              {problem.subtopic && (
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Tag className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500">Subtopic</p>
                    <p className="text-white font-medium">{problem.subtopic}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Calendar className="w-4 h-4 text-green-400 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-500">Date Solved</p>
                  <p className="text-white font-medium">{formatDate(problem.dateSolved)}</p>
                </div>
              </div>

              {problem.timeTaken !== undefined && problem.timeTaken !== null && (
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Clock className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500">Time Taken</p>
                    <p className="text-white font-medium">
                      {problem.timeTaken >= 60
                        ? `${Math.floor(problem.timeTaken / 60)}h ${problem.timeTaken % 60}m`
                        : `${problem.timeTaken} min`}
                    </p>
                  </div>
                </div>
              )}

              {problem.revisionCount !== undefined && (
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <BookOpen className="w-4 h-4 text-primary-400 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500">Revisions</p>
                    <p className="text-white font-medium">{problem.revisionCount} times</p>
                  </div>
                </div>
              )}

              {problem.timesAttempted !== undefined && (
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <AlertCircle className="w-4 h-4 text-orange-400 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500">Attempts</p>
                    <p className="text-white font-medium">{problem.timesAttempted} times</p>
                  </div>
                </div>
              )}
            </div>

            {/* External Link Button */}
            {problem.problemLink && (
              <div className="mt-4 pt-4 border-t border-white/10">
                <a
                  href={problem.problemLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600/20 hover:bg-primary-600/30 border border-primary-500/30 text-primary-300 hover:text-primary-200 rounded-lg text-sm font-medium transition-all"
                >
                  <ExternalLink className="w-4 h-4" />
                  View on {problem.platform}
                </a>
              </div>
            )}
          </div>

          {/* Approach Summary */}
          {problem.approachSummary && (
            <div className="card">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Brain className="w-4 h-4 text-blue-400" />
                </div>
                <h3 className="text-base font-semibold text-white">Approach Summary</h3>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                {problem.approachSummary}
              </p>
            </div>
          )}

          {/* Mistakes Faced */}
          {problem.mistakesFaced && (
            <div className="card border-l-4 border-l-red-500/50">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 bg-red-500/20 rounded-lg">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                </div>
                <h3 className="text-base font-semibold text-white">Mistakes Faced</h3>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                {problem.mistakesFaced}
              </p>
            </div>
          )}

          {/* Key Learning */}
          {problem.keyLearning && (
            <div className="card border-l-4 border-l-yellow-500/50">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 bg-yellow-500/20 rounded-lg">
                  <Lightbulb className="w-4 h-4 text-yellow-400" />
                </div>
                <h3 className="text-base font-semibold text-white">Key Learning</h3>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                {problem.keyLearning}
              </p>
            </div>
          )}

          {/* Code Snippet */}
          {problem.codeSnippet && (
            <div className="card">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <Code2 className="w-4 h-4 text-green-400" />
                  </div>
                  <h3 className="text-base font-semibold text-white">Code Snippet</h3>
                </div>
                <button
                  onClick={copyCode}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white rounded-lg text-xs font-medium transition-all"
                >
                  {codeCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-green-400" />
                      <span className="text-green-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      Copy
                    </>
                  )}
                </button>
              </div>
              <div className="bg-dark-300 rounded-xl overflow-x-auto border border-white/5">
                <pre className="p-4 text-sm text-gray-200 font-mono leading-relaxed whitespace-pre">
                  {problem.codeSnippet}
                </pre>
              </div>
            </div>
          )}

          {/* Empty state for notes */}
          {!problem.approachSummary && !problem.mistakesFaced && !problem.keyLearning && !problem.codeSnippet && (
            <div className="card text-center py-8">
              <BookOpen className="w-12 h-12 text-gray-500 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-white mb-1">No Notes Yet</h3>
              <p className="text-gray-400 text-sm mb-4">
                Add your approach, mistakes, and key learnings to make this a true learning journal.
              </p>
              <Link
                href={`/problems/add?edit=${problem._id}`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                <Edit className="w-4 h-4" />
                Add Notes
              </Link>
            </div>
          )}

          {/* Future sections placeholder */}
          <div className="card bg-dark-100/50 border-dashed border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <Brain className="w-4 h-4 text-primary-400" />
              <h3 className="text-sm font-semibold text-gray-400">Coming Soon</h3>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {['AI Analysis', 'Friend Comments', 'Compare Solutions', 'Similar Problems'].map((feature) => (
                <div
                  key={feature}
                  className="px-3 py-2 bg-white/5 rounded-lg text-xs text-gray-500 text-center"
                >
                  {feature}
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-dark-100 border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-red-500/20 rounded-xl">
                  <Trash2 className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Delete Problem?</h3>
                  <p className="text-sm text-gray-400">This action cannot be undone.</p>
                </div>
              </div>
              <p className="text-gray-300 text-sm mb-6">
                Are you sure you want to delete <span className="text-white font-semibold">&quot;{problem.problemName}&quot;</span>? All notes, approach, and code will be permanently removed.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-colors"
                  disabled={deleting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50"
                  disabled={deleting}
                >
                  {deleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
      <BottomNav />
    </AuthenticatedLayout>
  );
}
