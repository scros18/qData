import { NextRequest, NextResponse } from 'next/server';
import { getSession, getAllUsers } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('qdata_session')?.value;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const session = getSession(sessionId);

    if (!session || !session.pinVerified) {
      return NextResponse.json(
        { error: 'Not authenticated or PIN not verified' },
        { status: 401 }
      );
    }

    if (session.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const users = getAllUsers();

    return NextResponse.json({
      users,
    });
  } catch (error: any) {
    console.error('Get users error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get users' },
      { status: 500 }
    );
  }
}
