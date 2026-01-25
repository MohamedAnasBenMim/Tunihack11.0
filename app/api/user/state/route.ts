import { NextRequest, NextResponse } from 'next/server';
import { users } from '@/lib/store';

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    const user = users.get(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      hasPassword: !!user.passwordHash,
      storedCards: user.cards,
      hasDefaultAddress: user.hasDefaultAddress
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to get user state' }, { status: 500 });
  }
}
