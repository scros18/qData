import { promises as fs } from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const HISTORY_FILE = path.join(DATA_DIR, 'query-history.json');
const MAX_HISTORY = 100; // Keep last 100 queries

export interface QueryHistoryEntry {
  id: string;
  query: string;
  timestamp: string;
  duration: number;
  status: 'success' | 'error';
  rowsAffected?: number;
  error?: string;
  userId: string;
  username: string;
  database?: string;
}

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

// Load query history
export async function loadQueryHistory(): Promise<QueryHistoryEntry[]> {
  try {
    await ensureDataDir();
    const data = await fs.readFile(HISTORY_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

// Save query history
async function saveQueryHistory(history: QueryHistoryEntry[]) {
  try {
    await ensureDataDir();
    // Keep only last MAX_HISTORY entries
    const trimmed = history.slice(-MAX_HISTORY);
    await fs.writeFile(HISTORY_FILE, JSON.stringify(trimmed, null, 2));
  } catch (error) {
    console.error('Error saving query history:', error);
  }
}

// Add query to history
export async function addQueryToHistory(entry: Omit<QueryHistoryEntry, 'id' | 'timestamp'>) {
  const history = await loadQueryHistory();
  
  const newEntry: QueryHistoryEntry = {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    ...entry,
  };

  history.push(newEntry);
  await saveQueryHistory(history);
  
  return newEntry;
}

// Get query history with filters
export async function getQueryHistory(options?: {
  limit?: number;
  userId?: string;
  status?: 'success' | 'error';
}) {
  const history = await loadQueryHistory();
  
  let filtered = history;

  if (options?.userId) {
    filtered = filtered.filter(q => q.userId === options.userId);
  }

  if (options?.status) {
    filtered = filtered.filter(q => q.status === options.status);
  }

  // Sort by most recent first
  filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  if (options?.limit) {
    filtered = filtered.slice(0, options.limit);
  }

  return filtered;
}

// Clear all history
export async function clearQueryHistory() {
  try {
    await fs.writeFile(HISTORY_FILE, JSON.stringify([], null, 2));
  } catch (error) {
    console.error('Error clearing query history:', error);
  }
}
