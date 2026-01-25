import { NextResponse } from 'next/server';
import { SERVER_SESSION_ID } from '@/lib/session';

export async function GET() {
  return NextResponse.json({ sessionId: SERVER_SESSION_ID });
}
