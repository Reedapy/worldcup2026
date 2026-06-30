import type { Metadata, Viewport } from 'next';
import { NavLinks } from '@/components/NavLinks';
import './globals.css';

export const metadata: Metadata = {
  title: '2026 FIFA World Cup',
  description: 'Live scores, fixtures, and standings — all times in AEST',
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
      <body style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

        {/* Header */}
        <header style={{
          background: 'linear-gradient(135deg, #0d1320 0%, #0a1628 100%)',
          borderBottom: '1px solid #1e2a3a',
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}>
          <div style={{ maxWidth: 680, margin: '0 auto', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 40, height: 40, borderRadius: '50%',
              background: 'linear-gradient(135deg, #c9a227, #a07c10)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20, flexShrink: 0,
              boxShadow: '0 0 12px rgba(201,162,39,0.4)',
            }}>
              ⚽
            </div>
            <div>
              <div className="gold-shimmer" style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.5px', lineHeight: 1.1 }}>
                World Cup 2026
              </div>
              <div style={{ fontSize: 11, color: '#475569', marginTop: 1 }}>
                USA · Canada · Mexico · All times AEST
              </div>
            </div>
          </div>
        </header>

        {/* Tab bar */}
        <nav style={{
          background: '#0d1320',
          borderBottom: '1px solid #1e2a3a',
          position: 'sticky',
          top: 65,
          zIndex: 40,
        }}>
          <div style={{ maxWidth: 680, margin: '0 auto', display: 'flex' }}>
            <NavLinks />
          </div>
        </nav>

        {/* Page content */}
        <main style={{ flex: 1, maxWidth: 680, width: '100%', margin: '0 auto', padding: '20px 16px' }}>
          {children}
        </main>

        <footer style={{ textAlign: 'center', padding: '16px', fontSize: 11, color: '#334155' }}>
          All times in AEST (UTC+10) · Data: football-data.org
        </footer>
      </body>
    </html>
  );
}
