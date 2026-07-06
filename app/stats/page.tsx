import { hasApiKey } from '@/lib/api';
import StatsPageClient from './StatsPageClient';

export default function StatsPage() {
  if (!hasApiKey()) {
    return (
      <div style={{ textAlign: 'center', padding: 80, color: '#94a3b8' }}>
        <p style={{ fontSize: 40, marginBottom: 12 }}>🔑</p>
        <p>API key not set. See Home for setup instructions.</p>
      </div>
    );
  }

  return <StatsPageClient />;
}
