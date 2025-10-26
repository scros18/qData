import { NextRequest, NextResponse } from 'next/server';
import { createPool, testConnection } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { host, port, user, password, database } = body;

    // Validate required fields
    if (!host || !port || !user) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const config = {
      host,
      port: parseInt(port),
      user,
      password: password || '',
      database: database || undefined,
    };

    // Test the connection
    const isValid = await testConnection(config);

    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Failed to connect to database. Please check your credentials.' },
        { status: 401 }
      );
    }

    // Create the connection pool
    createPool(config);

    return NextResponse.json({
      success: true,
      message: 'Connected successfully',
    });
  } catch (error: any) {
    console.error('Connection error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'An error occurred while connecting to the database',
      },
      { status: 500 }
    );
  }
}
