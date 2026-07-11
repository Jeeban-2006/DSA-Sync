import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Lock, Unlock, Database, Share2, Layers, GitMerge, Search, Network, BookOpen, Calculator, PenTool, LayoutTemplate } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

export default function RoadmapSection() {
  const router = useRouter();
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);

  const nodes = [
    { id: 'arrays', title: 'Arrays & Hashing', icon: Database, x: 50, y: 10, status: 'unlocked', delay: '0.1s' },
    
    { id: 'pointers', title: 'Two Pointers', icon: Share2, x: 30, y: 30, status: 'unlocked', delay: '0.2s' },
    { id: 'stack', title: 'Stack', icon: Layers, x: 70, y: 30, status: 'locked', delay: '0.3s' },
    
    { id: 'linkedlist', title: 'Linked List', icon: BookOpen, x: 15, y: 50, status: 'locked', delay: '0.4s' },
    { id: 'sliding', title: 'Sliding Window', icon: GitMerge, x: 50, y: 50, status: 'locked', delay: '0.45s' },
    { id: 'binary', title: 'Binary Search', icon: Search, x: 85, y: 50, status: 'locked', delay: '0.5s' },
    
    { id: 'trees', title: 'Trees', icon: Network, x: 50, y: 70, status: 'locked', delay: '0.6s' },
    
    { id: 'tries', title: 'Tries', icon: LayoutTemplate, x: 15, y: 90, status: 'locked', delay: '0.7s' },
    { id: 'heap', title: 'Heap / Priority Queue', icon: Layers, x: 50, y: 90, status: 'locked', delay: '0.75s' },
    { id: 'backtracking', title: 'Backtracking', icon: PenTool, x: 85, y: 90, status: 'locked', delay: '0.8s' },
  ];

  const edges = [
    { from: 'arrays', to: 'pointers' },
    { from: 'arrays', to: 'stack' },
    { from: 'pointers', to: 'linkedlist' },
    { from: 'pointers', to: 'sliding' },
    { from: 'pointers', to: 'binary' },
    { from: 'linkedlist', to: 'trees' },
    { from: 'sliding', to: 'trees' },
    { from: 'binary', to: 'trees' },
    { from: 'trees', to: 'tries' },
    { from: 'trees', to: 'heap' },
    { from: 'trees', to: 'backtracking' },
  ];

  const getNodeCoords = (id: string) => {
    const node = nodes.find(n => n.id === id);
    return node ? { x: node.x, y: node.y } : { x: 50, y: 50 };
  };

  return (
    <section id="roadmap" className="relative py-24 bg-dark-400 overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-900/10 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-block mb-4 px-4 py-2 rounded-full bg-cyan-600/20 border border-cyan-500/30">
            <span className="text-cyan-300 text-sm font-medium">🗺️ Interactive Roadmap</span>
          </div>
          <h2 className="section-title scroll-animate text-3xl sm:text-5xl font-bold text-white mb-4">
            Master Concepts Logically
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-8">
            Follow structured paths like NeetCode 150 or Blind 75. Our visual roadmap ensures you learn prerequisites before diving into advanced topics.
          </p>
        </div>

        {/* Roadmap Canvas */}
        <div className="scroll-animate relative w-full max-w-5xl mx-auto h-[800px] bg-dark-300/30 rounded-3xl border border-white/5 backdrop-blur-sm p-4 hidden md:block">
          
          {/* Edges (SVG Lines) */}
          <svg viewBox="0 0 1000 1000" preserveAspectRatio="none" className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
            <defs>
              <marker id="arrowhead" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                <polygon points="0 0, 6 3, 0 6" fill="rgba(255,255,255,0.6)" />
              </marker>
            </defs>
            {edges.map((edge, i) => {
              const from = getNodeCoords(edge.from);
              const to = getNodeCoords(edge.to);
              
              // Map 0-100 percentages to 0-1000 viewBox coordinates
              const fx = from.x * 10;
              const fy = from.y * 10;
              const tx = to.x * 10;
              const ty = to.y * 10;

              return (
                <g key={i}>
                  <path
                    d={`M ${fx} ${fy} C ${fx} ${fy + 100}, ${tx} ${ty - 100}, ${tx} ${ty}`}
                    fill="none"
                    stroke="rgba(255,255,255,0.4)"
                    strokeWidth="4"
                    markerEnd="url(#arrowhead)"
                    className="animate-draw-line"
                    style={{ animationDelay: `${i * 0.15 + 0.5}s` }}
                  />
                </g>
              );
            })}
          </svg>

          {/* Nodes */}
          {nodes.map(node => (
            <div
              key={node.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
              style={{ left: `${node.x}%`, top: `${node.y}%`, zIndex: 10 }}
            >
              <div 
                className={`relative p-4 rounded-xl backdrop-blur-md border transition-all duration-500 hover:scale-110 flex flex-col items-center gap-2 w-36 shadow-2xl animate-fade-in-up
                  ${node.status === 'unlocked' 
                    ? 'bg-cyan-950/40 border-cyan-500/50 hover:border-cyan-400 hover:shadow-cyan-500/30' 
                    : 'bg-dark-200/50 border-white/10 hover:border-white/20'
                  }
                `}
                style={{ animationDelay: node.delay, animationFillMode: 'both' }}
              >
                {/* Status indicator */}
                <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center border-2 border-dark-400 ${
                  node.status === 'unlocked' ? 'bg-cyan-500 text-dark-400' : 'bg-gray-700 text-gray-400'
                }`}>
                  {node.status === 'unlocked' ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                </div>

                <node.icon className={`w-8 h-8 ${node.status === 'unlocked' ? 'text-cyan-400' : 'text-gray-500'}`} />
                <span className={`text-sm font-semibold text-center leading-tight ${node.status === 'unlocked' ? 'text-white' : 'text-gray-400'}`}>
                  {node.title}
                </span>
                
                {/* Progress bar mock */}
                <div className="w-full h-1.5 bg-dark-400 rounded-full overflow-hidden mt-1">
                  <div 
                    className={`h-full rounded-full ${node.status === 'unlocked' ? 'bg-cyan-500' : 'bg-transparent'}`}
                    style={{ width: node.status === 'unlocked' ? '65%' : '0%' }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile Fallback list */}
        <div className="md:hidden space-y-4">
          {nodes.map(node => (
            <div key={node.id} className="bg-dark-300/50 border border-white/10 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${node.status === 'unlocked' ? 'bg-cyan-900/50 text-cyan-400' : 'bg-dark-200 text-gray-500'}`}>
                  <node.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className={`font-semibold ${node.status === 'unlocked' ? 'text-white' : 'text-gray-400'}`}>{node.title}</h3>
                  <span className="text-xs text-gray-500">{node.status === 'unlocked' ? '65% Complete' : 'Locked'}</span>
                </div>
              </div>
              {node.status === 'unlocked' ? <Unlock className="w-5 h-5 text-cyan-500" /> : <Lock className="w-5 h-5 text-gray-600" />}
            </div>
          ))}
        </div>

        <div className="mt-12 text-center relative z-20">
          <button
            onClick={() => {
              if (isAuthenticated) {
                router.push('/master-dsa');
              } else {
                router.push('/auth/login');
              }
            }}
            className="group px-8 py-4 bg-white/5 backdrop-blur-sm border border-white/10 text-white rounded-xl font-semibold text-lg hover:bg-white/10 transition-all flex items-center gap-2 mx-auto"
          >
            Explore Master DSA Sheets
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes drawLine {
          from { stroke-dasharray: 2000; stroke-dashoffset: 2000; }
          to { stroke-dasharray: 2000; stroke-dashoffset: 0; }
        }
        .animate-draw-line {
          animation: drawLine 2s ease-out forwards;
        }
      `}</style>
    </section>
  );
}
