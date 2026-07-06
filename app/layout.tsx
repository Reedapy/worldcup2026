import type { Metadata, Viewport } from 'next';
import { Barlow_Condensed, Source_Sans_3 } from 'next/font/google';
import { NavLinks } from '@/components/NavLinks';
import './globals.css';

const barlow = Barlow_Condensed({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-barlow',
});

const source = Source_Sans_3({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-source',
});

export const metadata: Metadata = {
  title: '2026 FIFA World Cup',
  description: 'Live scores, player stats, fixtures, and standings — all times in AEST',
  manifest: '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'WC 2026' },
};

export const viewport: Viewport = {
  themeColor: '#060a12',
  width: 'device-width',
  initialScale: 1,
};

function TrophyIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 3h12v2a5 5 0 01-4 4.9V12h3v2H7v-2h3V9.9A5 5 0 016 5V3z"
        fill="#060a12"
      />
      <path
        d="M4 5h2a3 3 0 003 3V3H4v2zm16 0V3h-5v5a3 3 0 003-3h2zM8 18h8v2H8v-2zm2 2h4v1H10v-1z"
        fill="#060a12"
        opacity="0.7"
      />
    </svg>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${barlow.variable} ${source.variable}`}>
      <body style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

        <header className="site-header">
          <div className="site-header__inner">
            <div className="site-logo" aria-hidden>
              <TrophyIcon />
            </div>
            <div>
              <div className="site-title">World Cup 2026</div>
              <div className="site-tagline">USA · Canada · Mexico · AEST</div>
            </div>
          </div>
        </header>

        <nav className="site-nav">
          <div className="site-nav__inner">
            <NavLinks />
          </div>
        </nav>

        <main className="site-main">
          {children}
        </main>

        <footer className="site-footer">
          All times in AEST (UTC+10) · Data via football-data.org
        </footer>
      </body>
    </html>
  );
}
