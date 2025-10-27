import { NextRequest, NextResponse } from 'next/server';
import { isSetupComplete } from '@/lib/auth';

export async function GET() {
  try {
    const setupComplete = isSetupComplete();
    
    return NextResponse.json({
      setupComplete,
    });
  } catch (error: any) {
    console.error('Check setup error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to check setup status' },
      { status: 500 }
    );
  }
}
