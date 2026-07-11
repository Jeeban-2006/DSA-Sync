'use client';

import { useState, useEffect } from 'react';
import { useWidgetStore } from '@/store/widgetStore';
import { api } from '@/lib/api-client';
import {
  VERDICT_COLORS,
  IMPORTANCE_COLORS,
  FREQ_COLORS,
  DIFF_COLORS,
  DSAAnalysisResult,
} from '@/lib/dsa-analyzer';
import { Brain, X, Send } from 'lucide-react';

function Badge({ label, style }: { label: string; style?: any }) {
  return (
    <span
      style={{
        fontSize: 12,
        fontWeight: 500,
        padding: '3px 10px',
        borderRadius: 999,
        ...style,
      }}
    >
      {label}
    </span>
  );
}

function Section({ title, children }: any) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
        <span style={{ fontSize: 12, fontWeight: 500, color: '#888', textTransform: 'uppercase' }}>
          {title}
        </span>
      </div>
      {children}
    </div>
  );
}

function FreqBar({ score }: { score: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
      <span style={{ fontSize: 12, color: '#888', width: 28 }}>{score}/10</span>
      <div style={{ flex: 1, height: 6, background: '#222', borderRadius: 3, overflow: 'hidden' }}>
        <div
          style={{
            height: '100%',
            width: `${score * 10}%`,
            borderRadius: 3,
            background: score >= 7 ? '#639922' : score >= 4 ? '#BA7517' : '#888780',
            transition: 'width 0.6s ease',
          }}
        />
      </div>
    </div>
  );
}

export default function FloatingDSAAnalyzer() {
  const { isVisible, isAnalyzerOpen, position, toggleAnalyzer, setPosition } = useWidgetStore();
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DSAAnalysisResult | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setMounted(true);
    // If the position is at the default [0,20], initialize it to bottom right (clearing the navbar)
    if (position.x === 0 && position.y === 20) {
      setPosition(window.innerWidth - 94, window.innerHeight - 110);
    }
  }, [position.x, position.y, setPosition]);

  const handleMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  useEffect(() => {
    if (!isDragging || !mounted) return;

    const handleMouseMove = (e: MouseEvent) => {
      let newX = e.clientX - dragStart.x;
      let newY = e.clientY - dragStart.y;

      newX = Math.max(0, Math.min(newX, window.innerWidth - 80));
      newY = Math.max(0, Math.min(newY, window.innerHeight - 80));

      setPosition(newX, newY);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStart, position.x, position.y, setPosition, mounted]);

  const analyze = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setResult(null);
    setError('');

    try {
      const response = await api.analyzeDSAProblem(input);
      if (response.error) {
        setError(response.error);
        return;
      }

      const data = response.data as any;
      setResult(data);
    } catch (e) {
      setError('Could not analyze. Please try again.');
    }
    setLoading(false);
  };

  if (!isVisible || !mounted) return null;

  const vc = result ? VERDICT_COLORS[result.verdict as keyof typeof VERDICT_COLORS] : null;

  return (
    <>
      {/* Floating Button */}
      <button
        onMouseDown={handleMouseDown}
        onClick={() => !isDragging && toggleAnalyzer()}
        style={{
          position: 'fixed',
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: 70,
          height: 70,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          border: 'none',
          color: 'white',
          fontSize: 28,
          cursor: isDragging ? 'grabbing' : 'grab',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
          transition: isDragging ? 'none' : 'all 0.3s ease',
          zIndex: 9998,
        }}
        onMouseEnter={(e) => {
          if (!isDragging) {
            (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.1)';
            (e.currentTarget as HTMLButtonElement).style.boxShadow =
              '0 6px 20px rgba(102, 126, 234, 0.6)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isDragging) {
            (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
            (e.currentTarget as HTMLButtonElement).style.boxShadow =
              '0 4px 12px rgba(102, 126, 234, 0.4)';
          }
        }}
      >
        <Brain size={32} />
      </button>

      {/* Modal */}
      {isAnalyzerOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px',
          }}
          onClick={() => toggleAnalyzer()}
        >
          <div
            style={{
              background: '#1a1a1a',
              color: '#fff',
              borderRadius: '12px',
              maxWidth: '600px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto',
              padding: '24px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>DSA Problem Analyzer</h2>
              <button
                onClick={() => toggleAnalyzer()}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#888',
                  cursor: 'pointer',
                  fontSize: 24,
                  padding: 0,
                }}
              >
                <X size={24} />
              </button>
            </div>

            {/* Input */}
            <div style={{ marginBottom: 16 }}>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Paste problem URL or describe the problem..."
                rows={3}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid #333',
                  background: '#0a0a0a',
                  color: '#fff',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                  fontSize: 14,
                  boxSizing: 'border-box',
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.ctrlKey) analyze();
                }}
              />
              <p style={{ fontSize: 12, color: '#666', marginTop: 4 }}>Ctrl+Enter to submit</p>
            </div>

            {/* Analyze Button */}
            <button
              onClick={analyze}
              disabled={loading || !input.trim()}
              style={{
                width: '100%',
                padding: '10px 16px',
                borderRadius: '8px',
                border: 'none',
                background: loading || !input.trim() ? '#333' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: '#fff',
                cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                marginBottom: 16,
              }}
            >
              {loading ? (
                <>
                  <div
                    style={{
                      width: 16,
                      height: 16,
                      border: '2px solid #666',
                      borderTop: '2px solid #fff',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite',
                    }}
                  />
                  Analyzing
                </>
              ) : (
                <>
                  <Send size={16} />
                  Analyze
                </>
              )}
            </button>

            {/* Error */}
            {error && (
              <div
                style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  color: '#ef4444',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  marginBottom: 16,
                  fontSize: 14,
                }}
              >
                {error}
              </div>
            )}

            {/* Result */}
            {result && (
              <div style={{ marginTop: 20 }}>
                {/* Header Card */}
                <div
                  style={{
                    background: '#0a0a0a',
                    border: `2px solid ${vc?.border}`,
                    borderRadius: '8px',
                    padding: '12px',
                    marginBottom: 12,
                  }}
                >
                  <p style={{ fontWeight: 500, fontSize: 15, margin: '0 0 6px' }}>
                    {result.problem_name}
                  </p>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
                    {result.platform && (
                      <Badge label={result.platform} style={{ background: '#222', color: '#aaa' }} />
                    )}
                    {result.difficulty && (
                      <Badge
                        label={result.difficulty}
                        style={{
                          background: DIFF_COLORS[result.difficulty as keyof typeof DIFF_COLORS]?.bg,
                          color: DIFF_COLORS[result.difficulty as keyof typeof DIFF_COLORS]?.text,
                        }}
                      />
                    )}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <Badge
                      label={result.verdict}
                      style={{
                        background: vc?.bg,
                        color: vc?.text,
                        fontSize: 12,
                        padding: '4px 10px',
                      }}
                    />
                    <p style={{ fontSize: 12, color: '#888', marginTop: 6 }}>{result.verdict_reason}</p>
                  </div>
                </div>

                {/* Why Worth It */}
                {result.why_worth_it && (
                  <div
                    style={{
                      background: '#0a0a0a',
                      borderRadius: '8px',
                      padding: '10px 12px',
                      marginBottom: 12,
                      borderLeft: '3px solid #667eea',
                      fontSize: 13,
                      color: '#ddd',
                      lineHeight: 1.6,
                    }}
                  >
                    {result.why_worth_it}
                  </div>
                )}

                {/* Interview Frequency */}
                <div style={{ background: '#0a0a0a', borderRadius: '8px', padding: '12px', marginBottom: 12 }}>
                  <Section title="Interview Frequency">
                    <FreqBar score={result.interview_frequency?.score || 0} />
                  </Section>
                </div>

                {/* Tip */}
                {result.tip && (
                  <div style={{ background: '#0a0a0a', borderRadius: '8px', padding: '12px' }}>
                    <Section title="Pro Tip">
                      <p style={{ fontSize: 13, margin: 0, color: '#ddd', lineHeight: 1.6 }}>
                        {result.tip}
                      </p>
                    </Section>
                  </div>
                )}
              </div>
            )}

            {/* Close Button */}
            <button
              onClick={() => toggleAnalyzer()}
              style={{
                marginTop: 16,
                width: '100%',
                padding: '10px 16px',
                borderRadius: '8px',
                border: '1px solid #333',
                background: '#0a0a0a',
                color: '#ddd',
                cursor: 'pointer',
                fontWeight: 500,
              }}
            >
              Close
            </button>

            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
          </div>
        </div>
      )}
    </>
  );
}
