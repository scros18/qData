import { NextRequest, NextResponse } from 'next/server';
import { getTables } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const database = searchParams.get('database');

    if (!database) {
      return NextResponse.json(
        { success: false, error: 'Database parameter is required' },
        { status: 400 }
      );
    }

    const tables = await getTables(database);
    
    // Extract table names from the result
    const tableNames = (tables as any[]).map((row: any) => {
      // MySQL returns table names in different formats
      const key = Object.keys(row)[0];
      return row[key];
    });

    return NextResponse.json({
      success: true,
      tables: tableNames,
    });
  } catch (error: any) {
    console.error('Error fetching tables:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch tables',
      },
      { status: 500 }
    );
  }
}
