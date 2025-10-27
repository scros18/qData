import { NextRequest, NextResponse } from "next/server";
import { getPool, isConnected } from "@/lib/database";
import { RowDataPacket, ResultSetHeader } from "mysql2/promise";

export async function POST(request: NextRequest) {
  try {
    if (!isConnected()) {
      return NextResponse.json(
        { error: "Not connected to database", needsReconnect: true },
        { status: 401 }
      );
    }

    const { database, table, rowData, primaryKey } = await request.json();

    if (!database || !table || !rowData || !primaryKey) {
      return NextResponse.json(
        { error: "Missing required fields: database, table, rowData, primaryKey" },
        { status: 400 }
      );
    }

    const pool = getPool();

    // Build the UPDATE query dynamically
    const updateColumns = Object.keys(rowData).filter(key => key !== primaryKey);
    const setClause = updateColumns.map(col => `\`${col}\` = ?`).join(", ");
    const values = updateColumns.map(col => rowData[col]);
    
    const query = `UPDATE \`${database}\`.\`${table}\` SET ${setClause} WHERE \`${primaryKey}\` = ?`;
    values.push(rowData[primaryKey]);

    const [result] = await pool.query<ResultSetHeader>(query, values);

    return NextResponse.json({
      success: true,
      affectedRows: result.affectedRows,
    });
  } catch (error: any) {
    console.error("Update row error:", error);
    
    // Check if connection was lost
    if (error.code === 'PROTOCOL_CONNECTION_LOST' || error.code === 'ECONNREFUSED') {
      return NextResponse.json(
        { error: "Database connection lost", needsReconnect: true },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Failed to update row" },
      { status: 500 }
    );
  }
}
