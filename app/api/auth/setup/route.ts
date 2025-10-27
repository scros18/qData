import { NextRequest, NextResponse } from 'next/server';
import { createAdminUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { username, password, pin } = await request.json();

    if (!username || !password || !pin) {
      return NextResponse.json(
        { error: 'Username, password, and PIN are required' },
        { status: 400 }
      );
    }

    // Validate username
    if (username.length < 3 || username.length > 20) {
      return NextResponse.json(
        { error: 'Username must be 3-20 characters' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    // Validate PIN (must be exactly 4 digits)
    if (!/^\d{4}$/.test(pin)) {
      return NextResponse.json(
        { error: 'PIN must be exactly 4 digits' },
        { status: 400 }
      );
    }

    const admin = createAdminUser(username, password, pin);

    return NextResponse.json({
      success: true,
      message: 'Admin account created successfully',
      user: {
        id: admin.id,
        username: admin.username,
        role: admin.role,
      },
    });
  } catch (error: any) {
    console.error('Setup error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create admin account' },
      { status: 500 }
    );
  }
}
