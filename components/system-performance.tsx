'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Activity, Cpu, HardDrive, Clock, Server } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface PerformanceData {
  timestamp: string;
  cpu: {
    usage: number;
    cores: number;
    model: string;
  };
  memory: {
    total: number;
    used: number;
    free: number;
    usagePercent: number;
  };
  system: {
    platform: string;
    hostname: string;
    uptime: number;
    loadAverage: number[] | null;
    nodeVersion: string;
  };
}

interface DataPoint {
  timestamp: number;
  value: number;
}

export function SystemPerformance() {
  const [performanceData, setPerformanceData] = useState<PerformanceData | null>(null);
  const [cpuHistory, setCpuHistory] = useState<DataPoint[]>([]);
  const [memoryHistory, setMemoryHistory] = useState<DataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const canvasRefCpu = useRef<HTMLCanvasElement>(null);
  const canvasRefMemory = useRef<HTMLCanvasElement>(null);

  const MAX_HISTORY = 60; // Keep last 60 data points (1 minute at 1s interval)

  useEffect(() => {
    fetchPerformanceData();
    
    // Poll every 1 second for real-time updates
    intervalRef.current = setInterval(() => {
      fetchPerformanceData();
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (canvasRefCpu.current && cpuHistory.length > 0) {
      drawChart(canvasRefCpu.current, cpuHistory, '#3b82f6', 'CPU');
    }
  }, [cpuHistory]);

  useEffect(() => {
    if (canvasRefMemory.current && memoryHistory.length > 0) {
      drawChart(canvasRefMemory.current, memoryHistory, '#8b5cf6', 'Memory');
    }
  }, [memoryHistory]);

  const fetchPerformanceData = async () => {
    try {
      const response = await fetch('/qdata/api/system/performance');
      if (response.ok) {
        const data: PerformanceData = await response.json();
        setPerformanceData(data);
        setIsLoading(false);

        const now = Date.now();

        // Update CPU history
        setCpuHistory(prev => {
          const newHistory = [...prev, { timestamp: now, value: data.cpu.usage }];
          return newHistory.slice(-MAX_HISTORY);
        });

        // Update Memory history
        setMemoryHistory(prev => {
          const newHistory = [...prev, { timestamp: now, value: data.memory.usagePercent }];
          return newHistory.slice(-MAX_HISTORY);
        });
      }
    } catch (error) {
      console.error('Failed to fetch performance data:', error);
      setIsLoading(false);
    }
  };

  const drawChart = (
    canvas: HTMLCanvasElement,
    data: DataPoint[],
    color: string,
    label: string
  ) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const padding = 20;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Background
    ctx.fillStyle = 'rgba(15, 23, 42, 0.4)';
    ctx.fillRect(0, 0, width, height);

    if (data.length < 2) return;

    // Grid lines
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.1)';
    ctx.lineWidth = 1;
    
    for (let i = 0; i <= 4; i++) {
      const y = padding + (height - 2 * padding) * (i / 4);
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
    }

    // Draw chart line
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const xStep = (width - 2 * padding) / (MAX_HISTORY - 1);
    const yScale = (height - 2 * padding) / 100; // 0-100%

    ctx.beginPath();
    
    data.forEach((point, index) => {
      const x = padding + index * xStep;
      const y = height - padding - point.value * yScale;
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();

    // Gradient fill
    const gradient = ctx.createLinearGradient(0, padding, 0, height - padding);
    gradient.addColorStop(0, color + '40');
    gradient.addColorStop(1, color + '00');

    ctx.lineTo(width - padding, height - padding);
    ctx.lineTo(padding, height - padding);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // Current value indicator
    if (data.length > 0) {
      const lastPoint = data[data.length - 1];
      const x = padding + (data.length - 1) * xStep;
      const y = height - padding - lastPoint.value * yScale;

      // Draw dot
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();

      // Draw glow
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, Math.PI * 2);
      ctx.fillStyle = color + '30';
      ctx.fill();
    }
  };

  const formatBytes = (bytes: number): string => {
    const gb = bytes / 1024 / 1024 / 1024;
    return `${gb.toFixed(2)} GB`;
  };

  const formatUptime = (seconds: number): string => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Activity className="h-5 w-5 animate-pulse" />
          <span>Loading performance data...</span>
        </div>
      </div>
    );
  }

  if (!performanceData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Failed to load performance data</div>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4 md:p-6 min-h-full">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-500/10">
          <Activity className="h-5 w-5 text-blue-500" />
        </div>
        <div>
          <h2 className="text-xl md:text-2xl font-semibold">System Performance</h2>
          <p className="text-xs md:text-sm text-muted-foreground">Real-time monitoring • Updates every second</p>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* CPU Card */}
        <Card className="border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-transparent">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">CPU Usage</CardTitle>
              <Cpu className="h-4 w-4 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-500">
              {performanceData.cpu.usage}%
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {performanceData.cpu.cores} cores
            </p>
          </CardContent>
        </Card>

        {/* Memory Card */}
        <Card className="border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-transparent">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Memory Usage</CardTitle>
              <HardDrive className="h-4 w-4 text-purple-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-500">
              {performanceData.memory.usagePercent}%
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {formatBytes(performanceData.memory.used)} / {formatBytes(performanceData.memory.total)}
            </p>
          </CardContent>
        </Card>

        {/* Uptime Card */}
        <Card className="border-green-500/20 bg-gradient-to-br from-green-500/5 to-transparent">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Uptime</CardTitle>
              <Clock className="h-4 w-4 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-500">
              {formatUptime(performanceData.system.uptime)}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              System running
            </p>
          </CardContent>
        </Card>

        {/* System Info Card */}
        <Card className="border-orange-500/20 bg-gradient-to-br from-orange-500/5 to-transparent">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">System</CardTitle>
              <Server className="h-4 w-4 text-orange-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-500 capitalize">
              {performanceData.system.platform}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Node {performanceData.system.nodeVersion}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* CPU Chart */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Cpu className="h-4 w-4 text-blue-500" />
              CPU Usage History
            </CardTitle>
            <CardDescription className="text-xs">Last 60 seconds</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <canvas
                ref={canvasRefCpu}
                width={600}
                height={160}
                className="w-full h-[160px] rounded-lg"
              />
              <div className="absolute top-2 right-2 text-xs text-muted-foreground">
                Live
                <span className="inline-block w-2 h-2 bg-blue-500 rounded-full ml-1 animate-pulse" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Memory Chart */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <HardDrive className="h-4 w-4 text-purple-500" />
              Memory Usage History
            </CardTitle>
            <CardDescription className="text-xs">Last 60 seconds</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <canvas
                ref={canvasRefMemory}
                width={600}
                height={160}
                className="w-full h-[160px] rounded-lg"
              />
              <div className="absolute top-2 right-2 text-xs text-muted-foreground">
                Live
                <span className="inline-block w-2 h-2 bg-purple-500 rounded-full ml-1 animate-pulse" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Details */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Server className="h-4 w-4" />
            System Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Hostname</p>
              <p className="font-mono text-sm">{performanceData.system.hostname}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">CPU Model</p>
              <p className="font-mono text-sm truncate" title={performanceData.cpu.model}>
                {performanceData.cpu.model}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Platform</p>
              <p className="font-mono text-sm capitalize">{performanceData.system.platform}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">CPU Cores</p>
              <p className="font-mono text-sm">{performanceData.cpu.cores} cores</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Total Memory</p>
              <p className="font-mono text-sm">{formatBytes(performanceData.memory.total)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Free Memory</p>
              <p className="font-mono text-sm">{formatBytes(performanceData.memory.free)}</p>
            </div>
            {performanceData.system.loadAverage && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Load Average</p>
                <p className="font-mono text-sm">
                  {performanceData.system.loadAverage.map(l => l.toFixed(2)).join(', ')}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
