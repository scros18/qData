import { NextRequest, NextResponse } from 'next/server';
import { getDatabases, isConnected } from '@/lib/database';

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

    const databases = await getDatabases();
    
    return NextResponse.json({
      success: true,
      databases: databases.map((db) => db.Database),
    });
  } catch (error: any) {
    console.error('Error fetching databases:', error);
    
    // Check if it's a connection error
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
        error: error.message || 'Failed to fetch databases',
      },
      { status: 500 }
    );
  }
}
