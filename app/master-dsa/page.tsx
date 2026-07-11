'use client';

import { useAuthStore } from '@/store/authStore';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthenticatedLayout from '@/components/AuthenticatedLayout';
import BottomNav from '@/components/BottomNav';
import { api } from '@/lib/api-client';
import toast from 'react-hot-toast';
import {
  BookOpen,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Circle,
  ExternalLink,
  Star,
  MessageSquare,
  Youtube,
  FileText,
  Menu,
  X
} from 'lucide-react';
import SupportButtons from '@/components/SupportButtons';

interface LinkBadgeProps {
  type: string;
  url: string;
}

const LinkBadge = ({ type, url }: LinkBadgeProps) => {
  if (!url) return null;
  
  let label = type.toUpperCase();
  let bg = 'bg-gray-600/20 text-gray-400 hover:bg-gray-600/40';
  let Icon = ExternalLink;

  if (type === 'yt') {
    label = 'YT';
    bg = 'bg-red-500/20 text-red-400 hover:bg-red-500/30';
    Icon = Youtube;
  } else if (type === 'lc') {
    label = 'LC';
    bg = 'bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30';
  } else if (type === 'gfg') {
    label = 'GFG';
    bg = 'bg-green-500/20 text-green-500 hover:bg-green-500/30';
  } else if (type === 'cn') {
    label = 'CN';
    bg = 'bg-orange-500/20 text-orange-500 hover:bg-orange-500/30';
  } else if (type === 'tuf') {
    label = 'TUF';
    bg = 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30';
  } else if (type === 'blog') {
    label = 'Blog';
    Icon = FileText;
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex items-center justify-center w-8 h-8 rounded-lg text-xs font-bold transition-colors ${bg}`}
      title={label}
    >
      {type === 'yt' || type === 'blog' ? <Icon className="w-4 h-4" /> : label}
    </a>
  );
};

import CompanywiseView from '@/components/CompanywiseView';

export default function MasterDSAPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [sheets, setSheets] = useState<any[]>([]);
  const [activeSlug, setActiveSlug] = useState<string>('');
  const [sheetData, setSheetData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedSteps, setExpandedSteps] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadSheets();
  }, []);

  useEffect(() => {
    if (activeSlug && activeSlug !== 'companywise') {
      loadSheetData(activeSlug);
    }
  }, [activeSlug]);

  const loadSheets = async () => {
    try {
      const { data, error } = await api.getMasterSheets();
      if (error) throw new Error(error);
      const resData = data as any;
      if (resData.sheets && resData.sheets.length > 0) {
        setSheets(resData.sheets);
        setActiveSlug(resData.sheets[0].slug);
      }
    } catch (err) {
      toast.error('Failed to load sheets');
    }
  };

  const loadSheetData = async (slug: string) => {
    setLoading(true);
    try {
      const { data, error } = await api.getMasterSheetData(slug);
      if (error) throw new Error(error);
      const resData = data as any;
      setSheetData(resData);
      
      // Auto-expand first step
      if (resData.steps && resData.steps.length > 0) {
        setExpandedSteps({ [resData.steps[0]._id]: true });
      }
    } catch (err) {
      toast.error('Failed to load sheet data');
    } finally {
      setLoading(false);
    }
  };

  const toggleStep = (stepId: string) => {
    setExpandedSteps(prev => ({
      ...prev,
      [stepId]: !prev[stepId]
    }));
  };

  const toggleDone = async (problemId: string, currentStatus: boolean) => {
    // Optimistic update
    setSheetData((prev: any) => {
      const newSteps = prev.steps.map((step: any) => ({
        ...step,
        problems: step.problems.map((p: any) => 
          p._id === problemId ? { ...p, done: !currentStatus } : p
        )
      }));
      return { ...prev, steps: newSteps };
    });

    try {
      const { error } = await api.updateMasterProgress({
        masterProblemId: problemId,
        done: !currentStatus
      });
      if (error) throw new Error(error);

      if (!currentStatus) {
        toast.success('+XP Added! (Refresh dashboard to see stats)');
      }
    } catch (error) {
      // Revert on error
      toast.error('Failed to update progress');
      setSheetData((prev: any) => {
        const newSteps = prev.steps.map((step: any) => ({
          ...step,
          problems: step.problems.map((p: any) => 
            p._id === problemId ? { ...p, done: currentStatus } : p
          )
        }));
        return { ...prev, steps: newSteps };
      });
    }
  };

  const toggleRevision = async (problemId: string, currentFlag: boolean) => {
    // Optimistic update
    setSheetData((prev: any) => {
      const newSteps = prev.steps.map((step: any) => ({
        ...step,
        problems: step.problems.map((p: any) => 
          p._id === problemId ? { ...p, flaggedForRevision: !currentFlag } : p
        )
      }));
      return { ...prev, steps: newSteps };
    });

    try {
      const { error } = await api.updateMasterProgress({
        masterProblemId: problemId,
        flaggedForRevision: !currentFlag
      });
      if (error) throw new Error(error);
    } catch (error) {
      toast.error('Failed to update revision flag');
      setSheetData((prev: any) => {
        const newSteps = prev.steps.map((step: any) => ({
          ...step,
          problems: step.problems.map((p: any) => 
            p._id === problemId ? { ...p, flaggedForRevision: currentFlag } : p
          )
        }));
        return { ...prev, steps: newSteps };
      });
    }
  };

  return (
    <AuthenticatedLayout>
      <div className="flex min-h-screen bg-dark-400">
        
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div className={`
          fixed lg:static inset-y-0 left-0 z-50 w-64 bg-dark-300 border-r border-white/5 
          transform transition-transform duration-300 ease-in-out lg:transform-none pb-24
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <div className="p-4 flex items-center justify-between border-b border-white/5">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-orange-400" />
              Master DSA
            </h2>
            <button className="lg:hidden text-gray-400" onClick={() => setSidebarOpen(false)}>
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-3 space-y-1 overflow-y-auto h-full flex flex-col">
            {sheets.map((sheet) => (
              <button
                key={sheet._id}
                onClick={() => {
                  setActiveSlug(sheet.slug);
                  setSidebarOpen(false);
                }}
                className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  activeSlug === sheet.slug 
                    ? 'bg-orange-500/20 text-orange-400' 
                    : 'text-gray-400 hover:bg-white/5 hover:text-gray-300'
                }`}
              >
                {sheet.name}
              </button>
            ))}
            
            <div className="mt-4 pt-4 border-t border-white/5">
              <button
                onClick={() => {
                  setActiveSlug('companywise');
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-2 text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  activeSlug === 'companywise'
                    ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-400 border border-purple-500/30'
                    : 'text-gray-400 hover:bg-white/5 hover:text-gray-300'
                }`}
              >
                <Star className={`w-4 h-4 ${activeSlug === 'companywise' ? 'text-purple-400' : 'text-gray-500'}`} />
                Companywise
                {!user?.isPremium && (
                  <span className="ml-auto text-[10px] uppercase tracking-wider bg-white/10 px-1.5 py-0.5 rounded text-gray-400">
                    Pro
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0 pb-32 h-screen overflow-y-auto">
          {activeSlug === 'companywise' ? (
            <div className="pt-4">
              <CompanywiseView />
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="bg-dark-300/80 backdrop-blur-sm border-b border-white/5 p-4 sticky top-0 z-30 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button 
                className="lg:hidden text-gray-400 p-1"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-white">
                  {sheetData?.name || 'Loading...'}
                </h1>
              </div>
            </div>
            <SupportButtons />
          </div>

          {/* Steps */}
          <div className="p-4 max-w-5xl mx-auto w-full space-y-4">
            {loading ? (
              <div className="flex justify-center p-12">
                <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : sheetData?.steps?.map((step: any) => {
              const total = step.problems.length;
              const done = step.problems.filter((p: any) => p.done).length;
              const isExpanded = expandedSteps[step._id];

              return (
                <div key={step._id} className="bg-dark-300 rounded-xl border border-white/5 overflow-hidden">
                  <button 
                    onClick={() => toggleStep(step._id)}
                    className="w-full flex items-center justify-between p-4 bg-dark-200/50 hover:bg-dark-200 transition-colors"
                  >
                    <div className="flex items-center gap-4 text-left">
                      <div className="w-8 h-8 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold text-sm">
                        {step.order}
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">{step.title}</h3>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {done} / {total} problems completed
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {/* Progress bar mini */}
                      <div className="hidden sm:block w-24 h-1.5 bg-dark-400 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-orange-500 transition-all duration-500" 
                          style={{ width: `${(done / total) * 100}%` }}
                        />
                      </div>
                      {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="divide-y divide-white/5">
                      {step.problems.map((prob: any) => (
                        <div key={prob._id} className="p-4 flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-white/[0.02] transition-colors">
                          <div className="flex items-start gap-4 flex-1 min-w-0">
                            <button 
                              onClick={() => toggleDone(prob._id, prob.done)}
                              className="mt-0.5 flex-shrink-0"
                            >
                              {prob.done ? (
                                <CheckCircle2 className="w-6 h-6 text-green-500" />
                              ) : (
                                <Circle className="w-6 h-6 text-gray-500 hover:text-gray-400 transition-colors" />
                              )}
                            </button>
                            <div className="min-w-0 flex-1">
                              <h4 className={`text-sm sm:text-base font-medium truncate ${prob.done ? 'text-gray-400 line-through' : 'text-white'}`}>
                                {prob.topic}
                              </h4>
                              <div className="flex items-center gap-2 mt-1">
                                <span className={`text-[10px] sm:text-xs px-2 py-0.5 rounded font-medium ${
                                  prob.difficulty === 'Easy' ? 'bg-green-500/20 text-green-400' :
                                  prob.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                  'bg-red-500/20 text-red-400'
                                }`}>
                                  {prob.difficulty}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 ml-10 sm:ml-0 overflow-x-auto pb-1 sm:pb-0">
                            {/* Links */}
                            <div className="flex items-center gap-1.5 mr-4 border-r border-white/10 pr-4">
                              {prob.links?.yt && <LinkBadge type="yt" url={prob.links.yt} />}
                              {prob.links?.blog && <LinkBadge type="blog" url={prob.links.blog} />}
                              {prob.links?.tuf && <LinkBadge type="tuf" url={prob.links.tuf} />}
                              {prob.links?.lc && <LinkBadge type="lc" url={prob.links.lc} />}
                              {prob.links?.gfg && <LinkBadge type="gfg" url={prob.links.gfg} />}
                              {prob.links?.cn && <LinkBadge type="cn" url={prob.links.cn} />}
                            </div>

                            {/* Actions */}
                            <button 
                              onClick={() => toggleRevision(prob._id, prob.flaggedForRevision)}
                              className={`p-2 rounded-lg transition-colors ${
                                prob.flaggedForRevision 
                                  ? 'bg-orange-500/20 text-orange-400' 
                                  : 'text-gray-500 hover:bg-white/5 hover:text-gray-400'
                              }`}
                              title="Mark for revision"
                            >
                              <Star className={`w-4 h-4 ${prob.flaggedForRevision ? 'fill-current' : ''}`} />
                            </button>
                            
                            <button 
                              className={`p-2 rounded-lg transition-colors ${
                                prob.note 
                                  ? 'bg-blue-500/20 text-blue-400' 
                                  : 'text-gray-500 hover:bg-white/5 hover:text-gray-400'
                              }`}
                              title={prob.note ? "Edit note" : "Add note"}
                              onClick={() => {
                                const newNote = window.prompt("Enter your note for this problem:", prob.note || "");
                                if (newNote !== null) {
                                  // Opt update
                                  setSheetData((prev: any) => {
                                    const newSteps = prev.steps.map((s: any) => ({
                                      ...s,
                                      problems: s.problems.map((p: any) => 
                                        p._id === prob._id ? { ...p, note: newNote } : p
                                      )
                                    }));
                                    return { ...prev, steps: newSteps };
                                  });
                                  // API call
                                  api.updateMasterProgress({ masterProblemId: prob._id, note: newNote });
                                }
                              }}
                            >
                              <MessageSquare className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
            </>
          )}
        </div>
      </div>
      
      {/* Mobile nav (only visible on small screens due to BottomNav's internal logic) */}
      <BottomNav />
    </AuthenticatedLayout>
  );
}
