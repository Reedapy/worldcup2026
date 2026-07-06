import { getLiveBundle, hasApiKey } from '@/lib/api';
import { NextResponse } from 'next/server';

export const revalidate = 60;

export async function GET() {
  if (!hasApiKey()) {
    return NextResponse.json({ error: 'API key not configured.' }, { status: 500 });
  }
  try {
    const bundle = await getLiveBundle();
    return NextResponse.json(bundle);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
