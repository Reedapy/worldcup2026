import { hasApiKey } from '@/lib/api';
import { HomeLive } from '@/components/HomeLive';
import Link from 'next/link';

function SetupCard() {
  return (
    <div className="glass-card glass-card--featured" style={{ padding: 32, textAlign: 'center' }}>
      <div className="state-panel__icon" style={{ marginBottom: 20 }}>WC</div>
      <h1 className="page-title" style={{ fontSize: '1.5rem', marginBottom: 8 }}>Connect Your Data</h1>
      <p style={{ fontSize: '0.875rem', color: 'var(--text-dim)', marginBottom: 28, lineHeight: 1.65 }}>
        A free API key unlocks live scores, fixtures, standings, and player stats for World Cup 2026.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, textAlign: 'left' }}>
        {[
          {
            step: '01',
            title: 'Get your free API key',
            desc: 'Register at football-data.org, confirm your email, and copy your API token.',
          },
          {
            step: '02',
            title: 'Add it to .env.local',
            desc: 'Set FOOTBALL_API_KEY=your_key in the worldcup2026 folder, then restart the dev server.',
          },
        ].map(({ step, title, desc }) => (
          <div key={step} className="glass-card" style={{ padding: 16, display: 'flex', gap: 14, alignItems: 'flex-start' }}>
            <span style={{
              fontFamily: 'var(--font-display)',
              fontSize: '0.75rem', fontWeight: 700,
              color: 'var(--navy)',
              background: 'linear-gradient(135deg, var(--gold-bright), var(--gold))',
              borderRadius: 8, padding: '6px 8px', flexShrink: 0,
            }}>
              {step}
            </span>
            <div>
              <p style={{ fontWeight: 700, marginBottom: 4, fontSize: '0.875rem' }}>{title}</p>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-dim)', lineHeight: 1.55, margin: 0 }}>{desc}</p>
            </div>
          </div>
        ))}
      </div>
      <p style={{ marginTop: 24 }}>
        <Link href="https://www.football-data.org/client/register" className="link-accent">
          Register at football-data.org →
        </Link>
      </p>
    </div>
  );
}

export default function HomePage() {
  if (!hasApiKey()) return <SetupCard />;
  return <HomeLive />;
}
