import { NextRequest, NextResponse } from 'next/server';
import { getDatabases } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const databases = await getDatabases();
    
    return NextResponse.json({
      success: true,
      databases: databases.map((db) => db.Database),
    });
  } catch (error: any) {
    console.error('Error fetching databases:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch databases',
      },
      { status: 500 }
    );
  }
}
