import React from 'react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Gradient Background */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(38deg, rgba(113,75,103,1) 0%, rgba(113,75,103,1) 0%, rgba(0,0,0,1) 100%)',
        }}
      />

      {/* Soft noise / texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")',
          backgroundRepeat: 'repeat',
          backgroundSize: '200px 200px',
        }}
      />

      {/* Floating decorative orbs */}
      <div className="absolute top-10 left-10 w-64 h-64 rounded-full opacity-20 blur-3xl"
        style={{ background: '#a97096' }} />
      <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full opacity-15 blur-3xl"
        style={{ background: '#714b67' }} />
      <div className="absolute top-1/2 left-1/4 w-48 h-48 rounded-full opacity-10 blur-3xl"
        style={{ background: '#cba3bc' }} />

      {/* Center Form Card */}
      <div className="relative z-10 w-full max-w-md px-4">
        {/* Glass Card */}
        <div
          className="w-full rounded-2xl p-8 shadow-2xl"
          style={{
            background: 'rgba(255, 255, 255, 0.96)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.4)',
          }}
        >
          {/* Brand Logo — inside card, above form content */}
          <div className="flex items-center justify-center gap-2 mb-7">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center shadow-md"
              style={{ background: '#714b67' }}
            >
              <span style={{ fontFamily: 'var(--font-display), "Caveat", cursive', fontSize: '20px', fontWeight: 700, color: '#fff', lineHeight: 1 }}>
                P
              </span>
            </div>
            <span
              style={{
                fontFamily: 'var(--font-display), "Caveat", cursive',
                fontSize: '28px',
                fontWeight: 700,
                color: '#714b67',
                letterSpacing: '-0.5px',
                lineHeight: 1,
              }}
            >
              Plano
            </span>
          </div>

          {children}
        </div>

        {/* Footer text */}
        <p className="text-center text-xs mt-6 text-white/40 font-medium">
          © 2025 Plano · Recurring revenue, simplified.
        </p>
      </div>
    </div>
  );
}
