import fs from 'fs';
import path from 'path';

interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  username: string;
  action: string;
  details: string;
  database?: string;
  table?: string;
  status: 'success' | 'error';
  duration?: number;
}

const LOGS_FILE = path.join(process.cwd(), 'data', 'audit-logs.json');

// Ensure data directory exists
function ensureDataDir() {
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

// Load logs from file
export function loadLogs(): AuditLog[] {
  ensureDataDir();
  
  if (!fs.existsSync(LOGS_FILE)) {
    fs.writeFileSync(LOGS_FILE, JSON.stringify([], null, 2));
    return [];
  }

  try {
    const data = fs.readFileSync(LOGS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading audit logs:', error);
    return [];
  }
}

// Save logs to file
function saveLogs(logs: AuditLog[]) {
  ensureDataDir();
  
  try {
    // Keep only last 1000 logs to prevent file from growing too large
    const recentLogs = logs.slice(-1000);
    fs.writeFileSync(LOGS_FILE, JSON.stringify(recentLogs, null, 2));
  } catch (error) {
    console.error('Error saving audit logs:', error);
  }
}

// Add a new log entry
export function addAuditLog(
  userId: string,
  username: string,
  action: string,
  details: string,
  options?: {
    database?: string;
    table?: string;
    status?: 'success' | 'error';
    duration?: number;
  }
) {
  const logs = loadLogs();
  
  const newLog: AuditLog = {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    userId,
    username,
    action,
    details,
    database: options?.database,
    table: options?.table,
    status: options?.status || 'success',
    duration: options?.duration,
  };

  logs.push(newLog);
  saveLogs(logs);
  
  return newLog;
}

// Get recent logs with optional filters
export function getAuditLogs(options?: {
  limit?: number;
  userId?: string;
  action?: string;
  database?: string;
  status?: 'success' | 'error';
}): AuditLog[] {
  let logs = loadLogs();

  // Apply filters
  if (options?.userId) {
    logs = logs.filter(log => log.userId === options.userId);
  }
  if (options?.action) {
    logs = logs.filter(log => log.action === options.action);
  }
  if (options?.database) {
    logs = logs.filter(log => log.database === options.database);
  }
  if (options?.status) {
    logs = logs.filter(log => log.status === options.status);
  }

  // Sort by most recent first
  logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  // Apply limit
  if (options?.limit) {
    logs = logs.slice(0, options.limit);
  }

  return logs;
}

// Clear all logs (admin only)
export function clearAuditLogs() {
  saveLogs([]);
}
