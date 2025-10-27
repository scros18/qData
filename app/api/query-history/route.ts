import { NextRequest, NextResponse } from 'next/server';
import { getQueryHistory, clearQueryHistory } from '@/lib/query-history';
import { getSession } from '@/lib/auth';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

// GET - Fetch query history
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

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const status = searchParams.get('status') as 'success' | 'error' | null;

    const history = await getQueryHistory({
      limit,
      userId: session.userId,
      status: status || undefined,
    });

    return NextResponse.json({
      success: true,
      history,
      count: history.length,
    });
  } catch (error: any) {
    console.error('Error fetching query history:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch query history' },
      { status: 500 }
    );
  }
}

// DELETE - Clear query history
export async function DELETE(request: NextRequest) {
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

    await clearQueryHistory();

    return NextResponse.json({
      success: true,
      message: 'Query history cleared',
    });
  } catch (error: any) {
    console.error('Error clearing query history:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to clear query history' },
      { status: 500 }
    );
  }
}
