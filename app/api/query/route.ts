import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database';
import { addAuditLog } from '@/lib/audit';
import { getSession } from '@/lib/auth';
import { addQueryToHistory } from '@/lib/query-history';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const startTime = performance.now();
  let session = null;
  
  try {
    // Get session for logging
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('qdata_session')?.value;
    if (sessionId) {
      session = getSession(sessionId);
    }

    const body = await request.json();
    const { query, params } = body;

    if (!query) {
      return NextResponse.json(
        { success: false, error: 'Query is required' },
        { status: 400 }
      );
    }

    const results = await executeQuery(query, params);
    const duration = Math.round(performance.now() - startTime);

    // Log successful query
    if (session) {
      const queryPreview = query.length > 100 ? query.substring(0, 100) + '...' : query;
      addAuditLog(
        session.userId,
        session.username,
        'Execute Query',
        `Executed: ${queryPreview}`,
        { status: 'success', duration }
      );

      // Add to query history
      await addQueryToHistory({
        query,
        duration,
        status: 'success',
        rowsAffected: Array.isArray(results) ? results.length : (results as any)?.affectedRows,
        userId: session.userId,
        username: session.username,
      });
    }

    return NextResponse.json({
      success: true,
      results,
    });
  } catch (error: any) {
    console.error('Query execution error:', error);
    const duration = Math.round(performance.now() - startTime);

    // Log failed query
    if (session) {
      const { query } = await request.json();
      const queryPreview = query?.length > 100 ? query.substring(0, 100) + '...' : query;
      addAuditLog(
        session.userId,
        session.username,
        'Execute Query',
        `Failed: ${queryPreview} - Error: ${error.message}`,
        { status: 'error', duration }
      );

      // Add to query history
      await addQueryToHistory({
        query: query || '',
        duration,
        status: 'error',
        error: error.message,
        userId: session.userId,
        username: session.username,
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to execute query',
      },
      { status: 500 }
    );
  }
}
