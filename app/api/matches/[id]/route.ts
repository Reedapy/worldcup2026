import { getMatch, hasApiKey } from '@/lib/api';
import { NextResponse } from 'next/server';

export const revalidate = 20;

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!hasApiKey()) {
    return NextResponse.json({ error: 'API key not configured.' }, { status: 500 });
  }
  const { id } = await params;
  const matchId = parseInt(id, 10);
  if (isNaN(matchId)) {
    return NextResponse.json({ error: 'Invalid match ID.' }, { status: 400 });
  }
  try {
    const match = await getMatch(matchId, true);
    return NextResponse.json({ match, fetchedAt: new Date().toISOString() });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
