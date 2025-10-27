import { NextRequest, NextResponse } from 'next/server';
import { getSession, verifyUserPin, updateSessionPinVerification } from '@/lib/auth';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { pin } = await request.json();

    if (!pin) {
      return NextResponse.json(
        { error: 'PIN is required' },
        { status: 400 }
      );
    }

    // Validate PIN format (exactly 4 digits)
    if (!/^\d{4}$/.test(pin)) {
      return NextResponse.json(
        { error: 'PIN must be exactly 4 digits' },
        { status: 400 }
      );
    }

    // Get session from cookie
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('qdata_session')?.value;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'No active session' },
        { status: 401 }
      );
    }

    const session = getSession(sessionId);

    if (!session) {
      return NextResponse.json(
        { error: 'Invalid or expired session' },
        { status: 401 }
      );
    }

    // Verify PIN
    const pinValid = verifyUserPin(session.userId, pin);

    if (!pinValid) {
      return NextResponse.json(
        { error: 'Invalid PIN' },
        { status: 401 }
      );
    }

    // Update session to mark PIN as verified
    updateSessionPinVerification(sessionId, true);

    return NextResponse.json({
      success: true,
      message: 'PIN verified successfully',
      user: {
        username: session.username,
        role: session.role,
      },
    });
  } catch (error: any) {
    console.error('PIN verification error:', error);
    return NextResponse.json(
      { error: error.message || 'PIN verification failed' },
      { status: 500 }
    );
  }
}
