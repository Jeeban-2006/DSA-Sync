'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthenticatedLayout from '@/components/AuthenticatedLayout';
import BottomNav from '@/components/BottomNav';
import { api } from '@/lib/api-client';
import toast from 'react-hot-toast';
import { Save, Code2, ArrowLeft } from 'lucide-react';

const TOPICS = [
  'Array', 'String', 'Linked List', 'Stack', 'Queue',
  'Tree', 'Graph', 'Dynamic Programming', 'Greedy', 'Backtracking',
  'Binary Search', 'Two Pointers', 'Sliding Window', 'Heap', 'Hashing',
  'Sorting', 'Bit Manipulation', 'Math', 'Recursion', 'Trie'
];

const PLATFORMS = ['LeetCode', 'Codeforces', 'CodeChef', 'HackerRank', 'GeeksForGeeks', 'InterviewBit', 'Other'];

export default function AddProblemPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    problemName: '',
    platform: 'LeetCode',
    problemLink: '',
    difficulty: 'Medium',
    topic: 'Array',
    subtopic: '',
    timeTaken: '',
    dateSolved: new Date().toISOString().split('T')[0],
    status: 'Solved',
    approachSummary: '',
    mistakesFaced: '',
    keyLearning: '',
    codeSnippet: '',
    markedForRevision: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.problemName || !formData.timeTaken || !formData.problemLink || !formData.subtopic || !formData.approachSummary) {
      toast.error('Please fill all required fields');
      return;
    }

    setLoading(true);

    const { data, error } = await api.addProblem({
      ...formData,
      timeTaken: parseInt(formData.timeTaken),
    });

    if (error) {
      toast.error(error);
      setLoading(false);
      return;
    }

    const resultData = data as any;
    toast.success(`Problem added! +${resultData.xpGained || 0} XP`);
    router.push('/dashboard');
  };

  return (
    <AuthenticatedLayout>
      <div className="min-h-screen pb-24 page-content bg-dark-400">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 p-6 shadow-xl">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white">Add Problem</h1>
              <p className="text-primary-100 text-sm">Log your DSA progress</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="card">
            <label className="label">
              Problem Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              className="input"
              placeholder="Two Sum"
              value={formData.problemName}
              onChange={(e) => setFormData({ ...formData, problemName: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="card">
              <label className="label">Platform</label>
              <select
                className="input"
                value={formData.platform}
                onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
              >
                {PLATFORMS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div className="card">
              <label className="label">Difficulty</label>
              <select
                className="input"
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
          </div>

          <div className="card">
            <label className="label">
              Problem Link <span className="text-red-400">*</span>
            </label>
            <input
              type="url"
              className="input"
              placeholder="https://leetcode.com/problems/..."
              value={formData.problemLink}
              onChange={(e) => setFormData({ ...formData, problemLink: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="card">
              <label className="label">Topic</label>
              <select
                className="input"
                value={formData.topic}
                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
              >
                {TOPICS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div className="card">
              <label className="label">
                Subtopic <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                className="input"
                placeholder="Kadane's Algorithm"
                value={formData.subtopic}
                onChange={(e) => setFormData({ ...formData, subtopic: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="card">
              <label className="label">
                Time Taken (mins) <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                className="input"
                placeholder="30"
                value={formData.timeTaken}
                onChange={(e) => setFormData({ ...formData, timeTaken: e.target.value })}
                required
              />
            </div>

            <div className="card">
              <label className="label">Date Solved</label>
              <input
                type="date"
                className="input"
                value={formData.dateSolved}
                onChange={(e) => setFormData({ ...formData, dateSolved: e.target.value })}
              />
            </div>
          </div>

          <div className="card">
            <label className="label">Status</label>
            <select
              className="input"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="Solved">Solved</option>
              <option value="Needs Revision">Needs Revision</option>
              <option value="Couldn't Solve">Couldn&apos;t Solve</option>
            </select>
          </div>

          <div className="card">
            <label className="label">
              Approach Summary <span className="text-red-400">*</span>
            </label>
            <textarea
              className="input min-h-[100px]"
              placeholder="Describe your approach..."
              value={formData.approachSummary}
              onChange={(e) => setFormData({ ...formData, approachSummary: e.target.value })}
              required
            />
          </div>

          <div className="card">
            <label className="label">Mistakes Faced</label>
            <textarea
              className="input min-h-[80px]"
              placeholder="What mistakes did you make?"
              value={formData.mistakesFaced}
              onChange={(e) => setFormData({ ...formData, mistakesFaced: e.target.value })}
            />
          </div>

          <div className="card">
            <label className="label">Key Learning</label>
            <textarea
              className="input min-h-[80px]"
              placeholder="What did you learn?"
              value={formData.keyLearning}
              onChange={(e) => setFormData({ ...formData, keyLearning: e.target.value })}
            />
          </div>

          <div className="card">
            <label className="label">Code Snippet (Optional)</label>
            <textarea
              className="input min-h-[120px] font-mono text-sm"
              placeholder="// Your code here..."
              value={formData.codeSnippet}
              onChange={(e) => setFormData({ ...formData, codeSnippet: e.target.value })}
            />
          </div>

          <div className="card">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="w-5 h-5 rounded border-gray-600 text-primary-600 focus:ring-primary-500"
                checked={formData.markedForRevision}
                onChange={(e) => setFormData({ ...formData, markedForRevision: e.target.checked })}
              />
              <span className="text-gray-300">Mark for revision (3, 7, 30 days)</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2 sticky bottom-20 shadow-2xl"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save Problem
              </>
            )}
          </button>
        </form>
      </div>

      <BottomNav />
    </AuthenticatedLayout>
  );
}
