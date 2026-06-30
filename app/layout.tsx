import type { Metadata, Viewport } from 'next';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  title: '2026 FIFA World Cup',
  description: 'Live scores, fixtures, and standings for the 2026 FIFA World Cup — all times in AEST',
  manifest: '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'WC 2026' },
};

export const viewport: Viewport = {
  themeColor: '#0a0e1a',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        {/* Top nav */}
        <header style={{ background: '#0d1320', borderBottom: '1px solid #1e2a3a' }}>
          <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
            <span className="text-2xl">⚽</span>
            <Link href="/" className="font-bold text-lg tracking-tight" style={{ color: '#c9a227' }}>
              World Cup 2026
            </Link>
          </div>
        </header>

        {/* Tab bar */}
        <nav style={{ background: '#0d1320', borderBottom: '1px solid #1e2a3a' }}>
          <div className="max-w-2xl mx-auto px-4 flex">
            {[
              { href: '/', label: 'Home' },
              { href: '/fixtures', label: 'Fixtures' },
              { href: '/standings', label: 'Standings' },
              { href: '/bracket', label: 'Bracket' },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="flex-1 text-center py-3 text-sm font-medium transition-colors"
                style={{ color: '#94a3b8' }}
              >
                {label}
              </Link>
            ))}
          </div>
        </nav>

        <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6">
          {children}
        </main>

        <footer className="text-center py-4 text-xs" style={{ color: '#475569' }}>
          All times shown in AEST (UTC+10) · Data via football-data.org
        </footer>
      </body>
    </html>
  );
}
