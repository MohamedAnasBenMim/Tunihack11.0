import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { users } from '@/lib/store';

// Generate a 6-digit OTP-style password
function generatePassword(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    const user = users.get(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.passwordHash) {
      return NextResponse.json({ error: 'Password already exists. Use reset instead.' }, { status: 400 });
    }

    const plainPassword = generatePassword();
    const passwordHash = await bcrypt.hash(plainPassword, 10);

    user.passwordHash = passwordHash;
    users.set(userId, user);

    // Return plaintext password ONCE
    return NextResponse.json({
      password: plainPassword,
      message: 'Save this password! You will not be able to see it again.'
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate password' }, { status: 500 });
  }
}
