import { getScorers, hasApiKey } from '@/lib/api';
import { NextResponse } from 'next/server';

export const revalidate = 60;

export async function GET() {
  if (!hasApiKey()) {
    return NextResponse.json({ error: 'API key not configured.' }, { status: 500 });
  }
  try {
    const scorers = await getScorers();
    return NextResponse.json({ scorers, fetchedAt: new Date().toISOString() });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
