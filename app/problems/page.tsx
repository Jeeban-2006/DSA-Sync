'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthenticatedLayout from '@/components/AuthenticatedLayout';
import BottomNav from '@/components/BottomNav';
import { api } from '@/lib/api-client';
import toast from 'react-hot-toast';
import {
  Search,
  Filter,
  SortAsc,
  SortDesc,
  Code2,
  ExternalLink,
  Calendar,
  Tag,
  ChevronDown,
  ChevronUp,
  ListFilter,
  Clock,
  CheckCircle,
  AlertCircle,
  Star,
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
  imported?: boolean;
  importSource?: string;
  markedForRevision?: boolean;
}

type SortField = 'dateSolved' | 'problemName' | 'difficulty';
type SortOrder = 'asc' | 'desc';

export default function ProblemsPage() {
  const router = useRouter();
  const [problems, setProblems] = useState<Problem[]>([]);
  const [filteredProblems, setFilteredProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('dateSolved');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [showFilters, setShowFilters] = useState(false);

  // Filters
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [showRevisionOnly, setShowRevisionOnly] = useState<boolean>(false);

  useEffect(() => {
    loadProblems();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [problems, searchQuery, sortField, sortOrder, selectedDifficulty, selectedPlatform, selectedTopic, selectedStatus, showRevisionOnly]);

  const loadProblems = async () => {
    setLoading(true);
    const { data, error } = await api.getProblems();

    if (error) {
      toast.error('Failed to load problems');
      setLoading(false);
      return;
    }

    setProblems((data as any)?.problems || []);
    setLoading(false);
  };

  const applyFiltersAndSort = () => {
    let filtered = [...problems];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.problemName.toLowerCase().includes(query) ||
          p.topic.toLowerCase().includes(query) ||
          p.subtopic?.toLowerCase().includes(query) ||
          p.platform.toLowerCase().includes(query)
      );
    }

    // Difficulty filter
    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter((p) => p.difficulty === selectedDifficulty);
    }

    // Platform filter
    if (selectedPlatform !== 'all') {
      filtered = filtered.filter((p) => p.platform === selectedPlatform);
    }

    // Topic filter
    if (selectedTopic !== 'all') {
      filtered = filtered.filter((p) => p.topic === selectedTopic);
    }

    // Status filter
    if (selectedStatus !== 'all') {
      filtered = filtered.filter((p) => p.status === selectedStatus);
    }

    // Revision filter
    if (showRevisionOnly) {
      filtered = filtered.filter((p) => p.markedForRevision === true);
    }

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;

      if (sortField === 'dateSolved') {
        comparison = new Date(a.dateSolved).getTime() - new Date(b.dateSolved).getTime();
      } else if (sortField === 'problemName') {
        comparison = a.problemName.localeCompare(b.problemName);
      } else if (sortField === 'difficulty') {
        const difficultyOrder = { Easy: 1, Medium: 2, Hard: 3 };
        comparison = (difficultyOrder[a.difficulty as keyof typeof difficultyOrder] || 0) -
                    (difficultyOrder[b.difficulty as keyof typeof difficultyOrder] || 0);
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    setFilteredProblems(filtered);
  };

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedDifficulty('all');
    setSelectedPlatform('all');
    setSelectedTopic('all');
    setSelectedStatus('all');
    setShowRevisionOnly(false);
  };

  const toggleRevision = async (problemId: string, currentStatus: boolean, e: React.MouseEvent) => {
    e.stopPropagation();
    
    let error;
    if (currentStatus) {
      // Remove from revision
      const result = await api.deleteRevision(problemId);
      error = result.error;
    } else {
      // Add to revision
      const result = await api.createRevision(problemId);
      error = result.error;
    }

    if (error) {
      toast.error('Failed to update revision status');
      return;
    }

    toast.success(currentStatus ? 'Removed from revision' : 'Marked for revision');
    
    // Update local state
    setProblems(prev => prev.map(p => 
      p._id === problemId 
        ? { ...p, markedForRevision: !currentStatus }
        : p
    ));
  };

  // Get unique values for filters
  const platforms = ['all', ...Array.from(new Set(problems.map((p) => p.platform)))];
  const topics = ['all', ...Array.from(new Set(problems.map((p) => p.topic)))];
  const difficulties = ['all', 'Easy', 'Medium', 'Hard'];
  const statuses = ['all', 'Solved', 'Attempted', 'Reviewing'];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return 'text-green-400 bg-green-400/20';
      case 'Medium':
        return 'text-yellow-400 bg-yellow-400/20';
      case 'Hard':
        return 'text-red-400 bg-red-400/20';
      default:
        return 'text-gray-400 bg-gray-400/20';
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'LeetCode':
        return 'bg-orange-400/20 text-orange-400';
      case 'Codeforces':
        return 'bg-purple-400/20 text-purple-400';
      case 'CodeChef':
        return 'bg-red-400/20 text-red-400';
      case 'GeeksForGeeks':
        return 'bg-green-400/20 text-green-400';
      case 'HackerRank':
        return 'bg-blue-400/20 text-blue-400';
      default:
        return 'bg-gray-400/20 text-gray-400';
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

  return (
    <AuthenticatedLayout>
      <div className="min-h-screen pb-24 page-content">
        {/* Header */}
        <div className="bg-gradient-to-br from-primary-600 to-primary-800 p-6 rounded-b-3xl shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">All Problems</h1>
              <p className="text-primary-100 text-sm">
                {filteredProblems.length} of {problems.length} problems
              </p>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-white transition-colors"
            >
              <ListFilter className="w-5 h-5" />
              {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search problems..."
              className="w-full bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-gray-300 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-white/30"
            />
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-4 p-4 bg-white/10 backdrop-blur-sm rounded-lg space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-primary-100 mb-1">Difficulty</label>
                  <select
                    value={selectedDifficulty}
                    onChange={(e) => setSelectedDifficulty(e.target.value)}
                    className="w-full bg-dark-200 border border-white/10 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    {difficulties.map((d) => (
                      <option key={d} value={d}>
                        {d === 'all' ? 'All' : d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-primary-100 mb-1">Platform</label>
                  <select
                    value={selectedPlatform}
                    onChange={(e) => setSelectedPlatform(e.target.value)}
                    className="w-full bg-dark-200 border border-white/10 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    {platforms.map((p) => (
                      <option key={p} value={p}>
                        {p === 'all' ? 'All Platforms' : p}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-primary-100 mb-1">Topic</label>
                  <select
                    value={selectedTopic}
                    onChange={(e) => setSelectedTopic(e.target.value)}
                    className="w-full bg-dark-200 border border-white/10 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    {topics.map((t) => (
                      <option key={t} value={t}>
                        {t === 'all' ? 'All Topics' : t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-primary-100 mb-1">Status</label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full bg-dark-200 border border-white/10 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    {statuses.map((s) => (
                      <option key={s} value={s}>
                        {s === 'all' ? 'All Statuses' : s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-orange-400" />
                  <span className="text-sm text-orange-300 font-medium">Show Revision Only</span>
                </div>
                <button
                  onClick={() => setShowRevisionOnly(!showRevisionOnly)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    showRevisionOnly ? 'bg-orange-500' : 'bg-gray-600'
                  }`}
                >
                  <div
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                      showRevisionOnly ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <button
                onClick={clearFilters}
                className="w-full text-sm text-primary-200 hover:text-white transition-colors"
              >
                Clear all filters
              </button>
            </div>
          )}

          {/* Sort Options */}
          <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
            <button
              onClick={() => toggleSort('dateSolved')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition-colors ${
                sortField === 'dateSolved'
                  ? 'bg-white/30 text-white'
                  : 'bg-white/10 text-primary-100 hover:bg-white/20'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              Date
              {sortField === 'dateSolved' &&
                (sortOrder === 'asc' ? <SortAsc className="w-3 h-3" /> : <SortDesc className="w-3 h-3" />)}
            </button>

            <button
              onClick={() => toggleSort('problemName')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition-colors ${
                sortField === 'problemName'
                  ? 'bg-white/30 text-white'
                  : 'bg-white/10 text-primary-100 hover:bg-white/20'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              Name
              {sortField === 'problemName' &&
                (sortOrder === 'asc' ? <SortAsc className="w-3 h-3" /> : <SortDesc className="w-3 h-3" />)}
            </button>

            <button
              onClick={() => toggleSort('difficulty')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition-colors ${
                sortField === 'difficulty'
                  ? 'bg-white/30 text-white'
                  : 'bg-white/10 text-primary-100 hover:bg-white/20'
              }`}
            >
              <AlertCircle className="w-3.5 h-3.5" />
              Difficulty
              {sortField === 'difficulty' &&
                (sortOrder === 'asc' ? <SortAsc className="w-3 h-3" /> : <SortDesc className="w-3 h-3" />)}
            </button>
          </div>
        </div>

        {/* Problems List */}
        <div className="p-4 space-y-3">
          {filteredProblems.length === 0 ? (
            <div className="card text-center py-12">
              <Code2 className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Problems Found</h3>
              <p className="text-gray-400 mb-4">
                {searchQuery || selectedDifficulty !== 'all' || selectedPlatform !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Start by adding your first problem!'}
              </p>
              {problems.length === 0 && (
                <button
                  onClick={() => router.push('/problems/add')}
                  className="btn-primary"
                >
                  Add Problem
                </button>
              )}
            </div>
          ) : (
            filteredProblems.map((problem) => (
              <div
                key={problem._id}
                className="card hover:border-primary-500/50 transition-all cursor-pointer"
                onClick={() => {
                  // TODO: Navigate to problem detail page if you create one
                  if (problem.problemLink) {
                    window.open(problem.problemLink, '_blank');
                  }
                }}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-semibold text-white">{problem.problemName}</h3>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => toggleRevision(problem._id, problem.markedForRevision || false, e)}
                          className={`p-1.5 rounded-lg transition-all ${
                            problem.markedForRevision
                              ? 'bg-orange-500/20 text-orange-400 hover:bg-orange-500/30'
                              : 'bg-gray-500/20 text-gray-400 hover:bg-gray-500/30'
                          }`}
                          title={problem.markedForRevision ? 'Remove from revision' : 'Mark for revision'}
                        >
                          <Star className={`w-4 h-4 ${problem.markedForRevision ? 'fill-current' : ''}`} />
                        </button>
                        {problem.problemLink && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(problem.problemLink, '_blank');
                            }}
                            className="text-primary-400 hover:text-primary-300 transition-colors"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-2">
                      <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${getDifficultyColor(problem.difficulty)}`}>
                        {problem.difficulty}
                      </span>
                      <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${getPlatformColor(problem.platform)}`}>
                        {problem.platform}
                      </span>
                      <span className="px-2 py-1 rounded-lg text-xs font-semibold bg-blue-400/20 text-blue-400">
                        <Tag className="w-3 h-3 inline mr-1" />
                        {problem.topic}
                      </span>
                      {problem.status === 'Solved' && (
                        <span className="px-2 py-1 rounded-lg text-xs font-semibold bg-green-400/20 text-green-400">
                          <CheckCircle className="w-3 h-3 inline mr-1" />
                          Solved
                        </span>
                      )}
                      {problem.imported && (
                        <span className="px-2 py-1 rounded-lg text-xs font-semibold bg-purple-400/20 text-purple-400">
                          Imported
                        </span>
                      )}
                      {problem.markedForRevision && (
                        <span className="px-2 py-1 rounded-lg text-xs font-semibold bg-orange-400/20 text-orange-400">
                          ⭐ Revision
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(problem.dateSolved).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                      {problem.timeTaken && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {problem.timeTaken} min
                        </span>
                      )}
                      {problem.subtopic && (
                        <span className="text-gray-500">
                          {problem.subtopic}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <BottomNav />
    </AuthenticatedLayout>
  );
}
