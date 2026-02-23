import { ImageResponse } from 'next/og';

// Route segment config
export const runtime = 'edge';

// Image metadata
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

// Image generation
export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(to bottom right, #0f172a, #1e293b)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui',
        }}
      >
        {/* Logo/Icon */}
        <div
          style={{
            width: '120px',
            height: '120px',
            borderRadius: '24px',
            background: 'linear-gradient(to bottom right, #0ea5e9, #8b5cf6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '32px',
          }}
        >
          <div style={{ fontSize: '64px', color: 'white' }}>✨</div>
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: '72px',
            fontWeight: 'bold',
            background: 'linear-gradient(to right, #0ea5e9, #8b5cf6)',
            backgroundClip: 'text',
            color: 'transparent',
            marginBottom: '24px',
          }}
        >
          DSA Sync
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: '36px',
            color: '#94a3b8',
            textAlign: 'center',
            maxWidth: '900px',
            lineHeight: 1.4,
          }}
        >
          AI-powered collaborative DSA growth platform
        </div>

        {/* Features */}
        <div
          style={{
            display: 'flex',
            gap: '48px',
            marginTop: '48px',
            color: '#cbd5e1',
            fontSize: '24px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span>📊</span>
            <span>Smart Tracking</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span>🤖</span>
            <span>AI Insights</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span>👥</span>
            <span>Collaboration</span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
