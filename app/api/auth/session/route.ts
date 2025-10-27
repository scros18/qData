import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('qdata_session')?.value;

    if (!sessionId) {
      return NextResponse.json(
        { authenticated: false },
        { status: 200 }
      );
    }

    const session = getSession(sessionId);

    if (!session) {
      return NextResponse.json(
        { authenticated: false },
        { status: 200 }
      );
    }

    return NextResponse.json({
      authenticated: true,
      pinVerified: session.pinVerified,
      user: {
        username: session.username,
        role: session.role,
      },
    });
  } catch (error: any) {
    console.error('Session check error:', error);
    return NextResponse.json(
      { authenticated: false },
      { status: 200 }
    );
  }
}
