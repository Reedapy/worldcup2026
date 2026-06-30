import { getMatches, hasApiKey } from '@/lib/api';
import type { Match } from '@/lib/types';
import { BracketView } from './BracketView';

const KNOCKOUT_STAGES = new Set(['ROUND_OF_32', 'ROUND_OF_16', 'QUARTER_FINALS', 'SEMI_FINALS', 'THIRD_PLACE', 'FINAL']);

export default async function BracketPage() {
  if (!hasApiKey()) {
    return (
      <div style={{ textAlign: 'center', padding: 80, color: '#94a3b8' }}>
        <p style={{ fontSize: 40, marginBottom: 12 }}>🔑</p>
        <p>API key not set. See Home for setup instructions.</p>
      </div>
    );
  }

  let allMatches: Match[] = [];
  try {
    allMatches = await getMatches();
  } catch {
    return (
      <div style={{ textAlign: 'center', padding: 80, color: '#94a3b8' }}>
        <p style={{ fontSize: 40, marginBottom: 12 }}>😕</p>
        <p>Could not load bracket. Check your API key.</p>
      </div>
    );
  }

  const knockoutMatches = allMatches.filter(m => KNOCKOUT_STAGES.has(m.stage));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, color: '#c9a227' }}>Knockout Bracket</h1>
      <p style={{ fontSize: 12, color: '#64748b' }}>
        ← Scroll sideways to see all rounds · Winner highlighted in green
      </p>
      <BracketView matches={knockoutMatches} />
    </div>
  );
}
