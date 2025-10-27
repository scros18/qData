import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { generateSessionFingerprint } from '@/lib/security';
import { cookies } from 'next/headers';
import os from 'os';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('qdata_session')?.value;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const currentFingerprint = generateSessionFingerprint({
      userAgent: request.headers.get('user-agent') || undefined,
      acceptLanguage: request.headers.get('accept-language') || undefined,
      acceptEncoding: request.headers.get('accept-encoding') || undefined,
    });

    const session = getSession(sessionId, currentFingerprint);

    if (!session || !session.pinVerified) {
      return NextResponse.json(
        { error: 'Not authenticated or PIN not verified' },
        { status: 401 }
      );
    }

    // Get system performance metrics
    const cpus = os.cpus();
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;
    
    // Calculate CPU usage as percentage of available cores being used
    // This is an approximation - for real-time usage, we'd need to sample over time
    let totalIdle = 0;
    let totalTick = 0;
    
    cpus.forEach(cpu => {
      for (const type in cpu.times) {
        totalTick += cpu.times[type as keyof typeof cpu.times];
      }
      totalIdle += cpu.times.idle;
    });
    
    // Calculate average CPU usage across all cores
    const cpuUsagePercent = totalTick > 0 
      ? Math.min(100, Math.max(0, Math.round(100 - (totalIdle / totalTick) * 100)))
      : 0;

    // Memory usage percentage
    const memoryUsagePercent = Math.round((usedMemory / totalMemory) * 100);

    // System uptime
    const uptime = os.uptime();

    // Load average (Unix-like systems only, returns [0,0,0] on Windows)
    const loadAverage = os.loadavg();

    // Platform info
    const platform = os.platform();
    const hostname = os.hostname();
    const nodeVersion = process.version;

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      cpu: {
        usage: cpuUsagePercent,
        cores: cpus.length,
        model: cpus[0]?.model || 'Unknown',
      },
      memory: {
        total: totalMemory,
        used: usedMemory,
        free: freeMemory,
        usagePercent: memoryUsagePercent,
      },
      system: {
        platform,
        hostname,
        uptime,
        loadAverage: loadAverage[0] !== 0 ? loadAverage : null, // null on Windows
        nodeVersion,
      },
    });
  } catch (error: any) {
    console.error('Performance monitoring error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get performance metrics' },
      { status: 500 }
    );
  }
}
