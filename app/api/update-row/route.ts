import { NextRequest, NextResponse } from "next/server";
import { getPool, isConnected } from "@/lib/database";
import { RowDataPacket, ResultSetHeader } from "mysql2/promise";
import { addAuditLog } from "@/lib/audit";
import { getSession } from "@/lib/auth";
import { cookies } from "next/headers";

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

    if (!isConnected()) {
      return NextResponse.json(
        { error: "Not connected to database", needsReconnect: true },
        { status: 401 }
      );
    }

    const { database, table, rowData, primaryKey } = await request.json();

    console.log('Update request:', { database, table, rowData, primaryKey });

    if (!database || !table || !rowData || !primaryKey) {
      return NextResponse.json(
        { error: "Missing required fields: database, table, rowData, primaryKey" },
        { status: 400 }
      );
    }

    const pool = getPool();

    // Define non-editable columns that should never be updated
    const NON_EDITABLE_COLUMNS = ['id', 'created_at', 'updated_at', 'timestamp'];

    // Build the UPDATE query dynamically - exclude non-editable columns
    const updateColumns = Object.keys(rowData).filter(
      key => key !== primaryKey && !NON_EDITABLE_COLUMNS.includes(key.toLowerCase())
    );

    if (updateColumns.length === 0) {
      return NextResponse.json(
        { error: "No editable columns to update" },
        { status: 400 }
      );
    }

    const setClause = updateColumns.map(col => `\`${col}\` = ?`).join(", ");
    const values = updateColumns.map(col => rowData[col]);
    
    const query = `UPDATE \`${database}\`.\`${table}\` SET ${setClause} WHERE \`${primaryKey}\` = ?`;
    values.push(rowData[primaryKey]);

    console.log('Executing query:', query);
    console.log('With values:', values);

    const [result] = await pool.query<ResultSetHeader>(query, values);

    console.log('Update result:', result);

    const duration = performance.now() - startTime;

    // Log successful update
    if (session) {
      addAuditLog(
        session.userId,
        session.username,
        'Update Row',
        `Updated ${result.affectedRows} row(s) in ${table}`,
        { database, table, status: 'success', duration }
      );
    }

    return NextResponse.json({
      success: true,
      affectedRows: result.affectedRows,
    });
  } catch (error: any) {
    console.error("Update row error:", error);
    console.error("Error details:", {
      message: error.message,
      code: error.code,
      sqlMessage: error.sqlMessage,
      sql: error.sql,
    });

    const duration = performance.now() - startTime;

    // Log failed update
    if (session) {
      const { database, table } = await request.json().catch(() => ({}));
      addAuditLog(
        session.userId,
        session.username,
        'Update Row',
        `Failed to update row in ${table || 'unknown'}: ${error.message}`,
        { database, table, status: 'error', duration }
      );
    }
    
    // Check if connection was lost
    if (error.code === 'PROTOCOL_CONNECTION_LOST' || error.code === 'ECONNREFUSED') {
      return NextResponse.json(
        { error: "Database connection lost", needsReconnect: true },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: error.message || error.sqlMessage || "Failed to update row" },
      { status: 500 }
    );
  }
}
