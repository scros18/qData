import { NextRequest, NextResponse } from 'next/server';
import { getPool, isConnected } from '@/lib/database';
import { addAuditLog } from '@/lib/audit';
import { getSession } from '@/lib/auth';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const startTime = performance.now();
  
  try {
    // Get session for audit logging
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('qdata_session')?.value;
    const session = sessionId ? getSession(sessionId) : null;

    const { database, table, rowData } = await request.json();

    if (!database || !table || !rowData) {
      return NextResponse.json(
        { error: 'Database, table, and row data are required' },
        { status: 400 }
      );
    }

    if (!isConnected()) {
      return NextResponse.json(
        { error: 'Not connected to database', needsReconnect: true },
        { status: 400 }
      );
    }

    const pool = getPool();

    // Filter out empty values and build INSERT query
    const columns: string[] = [];
    const values: any[] = [];
    const placeholders: string[] = [];

    for (const [key, value] of Object.entries(rowData)) {
      // Skip if value is empty string or null (except for explicit null values)
      if (value !== '' && value !== undefined) {
        columns.push(`\`${key}\``);
        values.push(value);
        placeholders.push('?');
      }
    }

    if (columns.length === 0) {
      return NextResponse.json(
        { error: 'At least one column value is required' },
        { status: 400 }
      );
    }

    const query = `INSERT INTO \`${database}\`.\`${table}\` (${columns.join(', ')}) VALUES (${placeholders.join(', ')})`;

    console.log('Executing query:', query);
    console.log('With values:', values);

    const [result]: any = await pool.execute(query, values);

    console.log('Insert result:', result);

    const duration = Math.round(performance.now() - startTime);

    // Add audit log
    if (session) {
      addAuditLog(
        session.userId,
        session.username,
        'insert',
        `Added new row to ${table}`,
        {
          database,
          table,
          status: 'success',
          duration,
        }
      );
    }

    return NextResponse.json({
      success: true,
      insertId: result.insertId,
      affectedRows: result.affectedRows,
      duration,
    });
  } catch (error: any) {
    const duration = Math.round(performance.now() - startTime);
    console.error('Error adding row:', error);

    // Add audit log for error
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('qdata_session')?.value;
    const session = sessionId ? getSession(sessionId) : null;

    if (session) {
      addAuditLog(
        session.userId,
        session.username,
        'insert',
        `Failed to add row: ${error.message}`,
        {
          status: 'error',
          duration,
        }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to add row' },
      { status: 500 }
    );
  }
}
