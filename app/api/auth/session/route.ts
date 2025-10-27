import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { generateSessionFingerprint } from '@/lib/security';
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

    // Generate current fingerprint for verification
    const currentFingerprint = generateSessionFingerprint({
      userAgent: request.headers.get('user-agent') || undefined,
      acceptLanguage: request.headers.get('accept-language') || undefined,
      acceptEncoding: request.headers.get('accept-encoding') || undefined,
    });

    const session = getSession(sessionId, currentFingerprint);

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
