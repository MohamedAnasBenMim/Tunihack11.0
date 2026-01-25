import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { users } from '@/lib/store';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId } = body;

    let user;
    if (userId && users.has(userId)) {
      user = users.get(userId)!;
    } else {
      // Create new user
      const newUserId = uuidv4();
      user = {
        id: newUserId,
        cards: [],
        hasDefaultAddress: false
      };
      users.set(newUserId, user);
    }

    return NextResponse.json({
      userId: user.id,
      hasPassword: !!user.passwordHash,
      hasStoredCard: user.cards.length > 0
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to initialize user' }, { status: 500 });
  }
}
