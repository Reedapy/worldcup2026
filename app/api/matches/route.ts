import { getMatches, hasApiKey } from '@/lib/api';
import { NextResponse } from 'next/server';

export const revalidate = 60;

export async function GET() {
  if (!hasApiKey()) {
    return NextResponse.json({ error: 'API key not configured.' }, { status: 500 });
  }
  try {
    const matches = await getMatches();
    return NextResponse.json({ matches });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
