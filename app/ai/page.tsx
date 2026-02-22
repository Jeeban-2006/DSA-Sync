'use client';

import { useEffect, useState } from 'react';
import AuthenticatedLayout from '@/components/AuthenticatedLayout';
import BottomNav from '@/components/BottomNav';
import { api } from '@/lib/api-client';
import toast from 'react-hot-toast';
import {
  Sparkles,
  Brain,
  Target,
  TrendingUp,
  Award,
  Zap,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react';

export default function AIPage() {
  const [recommendations, setRecommendations] = useState<any>(null);
  const [weeklyReport, setWeeklyReport] = useState<any>(null);
  const [confidence, setConfidence] = useState<any>(null);
  const [pattern, setPattern] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'recommendations' | 'report' | 'confidence' | 'pattern'>('recommendations');

  useEffect(() => {
    loadAIInsights();
  }, []);

  const loadAIInsights = async () => {
    setLoading(true);

    // Load recommendations
    const recData = await api.getAIRecommendations();
    if (recData.data) {
      setRecommendations(recData.data as any);
    }

    // Load latest weekly report
    const reportData = await api.getWeeklyReports();
    const reportsData = reportData.data as any;
    if (reportsData?.reports?.length > 0) {
      setWeeklyReport(reportsData.reports[0]);
    }

    // Load confidence score
    const confData = await api.getConfidenceScore();
    if (confData.data) {
      setConfidence(confData.data as any);
    }

    // Load pattern detection
    const patternData = await api.getPatternDetection();
    if (patternData.data) {
      setPattern(patternData.data);
    }

    setLoading(false);
  };

  const handleGenerateWeeklyReport = async () => {
    toast.promise(
      api.generateWeeklyReport(),
      {
        loading: 'Generating AI report...',
        success: (result) => {
          if (result.data) {
            const reportData = result.data as any;
            setWeeklyReport({ content: reportData.report?.content });
            return 'Report generated!';
          }
          return 'Report failed';
        },
        error: 'Failed to generate report',
      }
    );
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
        <div className="bg-gradient-to-br from-purple-600 via-primary-600 to-pink-600 p-6 rounded-b-3xl shadow-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">AI Insights</h1>
              <p className="text-purple-100 text-sm">Powered by intelligent analysis</p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => setActiveTab('recommendations')}
              className={`flex-shrink-0 px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === 'recommendations'
                  ? 'bg-white text-purple-700'
                  : 'bg-white/20 text-white'
              }`}
            >
              <Target className="w-4 h-4 inline mr-2" />
              Recommendations
            </button>
            <button
              onClick={() => setActiveTab('report')}
              className={`flex-shrink-0 px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === 'report'
                  ? 'bg-white text-purple-700'
                  : 'bg-white/20 text-white'
              }`}
            >
              <TrendingUp className="w-4 h-4 inline mr-2" />
              Weekly Report
            </button>
            <button
              onClick={() => setActiveTab('confidence')}
              className={`flex-shrink-0 px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === 'confidence'
                  ? 'bg-white text-purple-700'
                  : 'bg-white/20 text-white'
              }`}
            >
              <Award className="w-4 h-4 inline mr-2" />
              Confidence
            </button>
            <button
              onClick={() => setActiveTab('pattern')}
              className={`flex-shrink-0 px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === 'pattern'
                  ? 'bg-white text-purple-700'
                  : 'bg-white/20 text-white'
              }`}
            >
              <Brain className="w-4 h-4 inline mr-2" />
              Patterns
            </button>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Recommendations Tab */}
          {activeTab === 'recommendations' && (
            <div className="space-y-4 animate-fade-in">
              {recommendations?.recommendations?.recommendations?.length > 0 ? (
                <>
                  {recommendations.recommendations.recommendations.map((rec: any, index: number) => (
                    <div key={index} className="card-hover">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-10 h-10 rounded-lg bg-primary-600/20 flex items-center justify-center flex-shrink-0">
                          <Target className="w-5 h-5 text-primary-400" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-white font-semibold mb-1">
                            {rec.topic} - {rec.difficulty}
                          </h3>
                          <p className="text-gray-400 text-sm mb-2">{rec.reason}</p>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Zap className="w-3 h-3" />
                            <span>{rec.estimatedTime} mins</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {rec.focusAreas?.map((area: string, i: number) => (
                          <span key={i} className="badge bg-primary-500/20 text-primary-300 border-primary-500/30">
                            {area}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}

                  {recommendations.recommendations.strategy && (
                    <div className="card bg-gradient-to-br from-primary-900/30 to-purple-900/30 border-primary-500/30">
                      <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-primary-400" />
                        Strategy
                      </h4>
                      <p className="text-gray-300 text-sm">{recommendations.recommendations.strategy}</p>
                    </div>
                  )}

                  {recommendations.recommendations.weeklyGoal && (
                    <div className="card bg-gradient-to-br from-green-900/30 to-emerald-900/30 border-green-500/30">
                      <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-400" />
                        Weekly Goal
                      </h4>
                      <p className="text-gray-300 text-sm">{recommendations.recommendations.weeklyGoal}</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="card text-center py-12">
                  <Brain className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">Not enough data</h3>
                  <p className="text-gray-400">Solve at least 5 problems to get AI recommendations</p>
                </div>
              )}
            </div>
          )}

          {/* Weekly Report Tab */}
          {activeTab === 'report' && (
            <div className="space-y-4 animate-fade-in">
              {weeklyReport?.content ? (
                <>
                  {/* Summary */}
                  {weeklyReport.content.summary && (
                    <div className="card bg-gradient-to-br from-primary-900/30 to-purple-900/30 border-primary-500/30">
                      <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-primary-400" />
                        Week {weeklyReport.content.summary.week} Summary
                      </h3>
                      <div className="space-y-2">
                        <p className="text-gray-300">
                          <span className="text-white font-semibold">{weeklyReport.content.summary.totalSolved}</span> problems solved
                        </p>
                        <p className="text-gray-400 text-sm">{weeklyReport.content.summary.improvement}</p>
                      </div>
                      {weeklyReport.content.summary.highlights?.length > 0 && (
                        <div className="mt-3 space-y-1">
                          {weeklyReport.content.summary.highlights.map((h: string, i: number) => (
                            <div key={i} className="flex items-start gap-2">
                              <span className="text-primary-400 mt-1">•</span>
                              <span className="text-gray-300 text-sm">{h}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Next Week Focus */}
                  {weeklyReport.content.nextWeekFocus && (
                    <div className="card bg-gradient-to-br from-green-900/30 to-emerald-900/30 border-green-500/30">
                      <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                        <Target className="w-5 h-5 text-green-400" />
                        Next Week Focus
                      </h3>
                      <div className="space-y-2">
                        <p className="text-white font-medium">{weeklyReport.content.nextWeekFocus.primaryTopic}</p>
                        <p className="text-gray-300 text-sm">
                          Target: <span className="text-white font-semibold">{weeklyReport.content.nextWeekFocus.targetProblems}</span> problems
                        </p>
                        <p className="text-gray-400 text-sm">{weeklyReport.content.nextWeekFocus.strategy}</p>
                      </div>
                    </div>
                  )}

                  {/* Motivational Message */}
                  {weeklyReport.content.motivationalMessage && (
                    <div className="card bg-gradient-to-br from-pink-900/30 to-rose-900/30 border-pink-500/30">
                      <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-pink-400" />
                        Keep Going!
                      </h3>
                      <p className="text-gray-300 text-sm italic">{weeklyReport.content.motivationalMessage}</p>
                    </div>
                  )}

                  <button
                    onClick={handleGenerateWeeklyReport}
                    className="btn-secondary w-full flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Regenerate Report
                  </button>
                </>
              ) : (
                <div className="card text-center py-12">
                  <TrendingUp className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No report yet</h3>
                  <p className="text-gray-400 mb-4">Generate your first weekly growth report</p>
                  <button
                    onClick={handleGenerateWeeklyReport}
                    className="btn-primary mx-auto"
                  >
                    Generate Report
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Confidence Tab */}
          {activeTab === 'confidence' && (
            <div className="space-y-4 animate-fade-in">
              {confidence?.confidence ? (
                <>
                  <div className="card bg-gradient-to-br from-purple-900/30 to-blue-900/30 border-purple-500/30">
                    <div className="text-center mb-6">
                      <div className="text-6xl font-bold text-gradient mb-2">
                        {confidence.confidence.overallConfidence}%
                      </div>
                      <p className="text-gray-400">Overall Confidence</p>
                    </div>
                    
                    <div className="space-y-3">
                      <h4 className="text-white font-semibold">Interview Readiness</h4>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Score</span>
                        <span className="text-white font-semibold">
                          {confidence.confidence.interviewReadiness?.score || 0}%
                        </span>
                      </div>
                      <div className="w-full bg-dark-200 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-primary-500 to-purple-500 h-3 rounded-full transition-all"
                          style={{ width: `${confidence.confidence.interviewReadiness?.score || 0}%` }}
                        />
                      </div>
                      <span className="badge bg-primary-500/20 text-primary-300">
                        {confidence.confidence.interviewReadiness?.level || 'Calculating...'}
                      </span>
                    </div>
                  </div>

                  {confidence.confidence.topicConfidence?.length > 0 && (
                    <div className="card">
                      <h3 className="text-white font-semibold mb-4">Topic Confidence</h3>
                      <div className="space-y-3">
                        {confidence.confidence.topicConfidence.map((topic: any, index: number) => (
                          <div key={index} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-gray-300">{topic.topic}</span>
                              <span className="text-white font-semibold">{topic.score}%</span>
                            </div>
                            <div className="w-full bg-dark-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${
                                  topic.readiness === 'interview-ready'
                                    ? 'bg-green-500'
                                    : topic.readiness === 'needs-practice'
                                    ? 'bg-yellow-500'
                                    : 'bg-red-500'
                                }`}
                                style={{ width: `${topic.score}%` }}
                              />
                            </div>
                            <p className="text-xs text-gray-400">{topic.reasoning}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="card text-center py-12">
                  <Award className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">Building confidence profile</h3>
                  <p className="text-gray-400">Solve at least 20 problems to see your confidence score</p>
                </div>
              )}
            </div>
          )}

          {/* Pattern Tab */}
          {activeTab === 'pattern' && (
            <div className="space-y-4 animate-fade-in">
              {pattern?.profile ? (
                <>
                  <div className="card bg-gradient-to-br from-orange-900/30 to-red-900/30 border-orange-500/30">
                    <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                      <Brain className="w-5 h-5 text-orange-400" />
                      Solving Style
                    </h3>
                    <p className="text-2xl font-bold text-gradient mb-3">{pattern.profile.profile.solvingStyle}</p>
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm text-gray-400 mb-1">Strengths</p>
                        <div className="flex flex-wrap gap-1">
                          {pattern.profile.profile.strengths?.map((s: string, i: number) => (
                            <span key={i} className="badge bg-green-500/20 text-green-300 border-green-500/30 text-xs">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400 mb-1">Weaknesses</p>
                        <div className="flex flex-wrap gap-1">
                          {pattern.profile.profile.weaknesses?.map((w: string, i: number) => (
                            <span key={i} className="badge bg-red-500/20 text-red-300 border-red-500/30 text-xs">
                              {w}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {pattern.profile.recommendations?.length > 0 && (
                    <div className="card">
                      <h3 className="text-white font-semibold mb-3">Recommendations</h3>
                      <div className="space-y-2">
                        {pattern.profile.recommendations.map((rec: string, i: number) => (
                          <div key={i} className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-primary-400 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-300 text-sm">{rec}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="card text-center py-12">
                  <Brain className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">Pattern Analysis Locked</h3>
                  <p className="text-gray-400">Solve at least 50 problems to unlock pattern detection</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </AuthenticatedLayout>
  );
}
