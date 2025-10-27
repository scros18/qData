import { NextRequest, NextResponse } from 'next/server';
import { getTableStructure, isConnected } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    // Check if connected
    if (!isConnected()) {
      return NextResponse.json(
        {
          success: false,
          error: 'Not connected to database. Please connect first.',
          needsReconnect: true,
        },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const database = searchParams.get('database');
    const table = searchParams.get('table');

    if (!database || !table) {
      return NextResponse.json(
        { success: false, error: 'Database and table parameters are required' },
        { status: 400 }
      );
    }

    const columns = await getTableStructure(database, table);

    return NextResponse.json({
      success: true,
      columns,
    });
  } catch (error: any) {
    console.error('Error fetching table structure:', error);
    
    if (error.message?.includes('connection') || error.message?.includes('connect')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Database connection lost. Please reconnect.',
          needsReconnect: true,
        },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch table structure',
      },
      { status: 500 }
    );
  }
}
