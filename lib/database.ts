import mysql from 'mysql2/promise';

// Use globalThis to persist pool across hot reloads in development
const globalForDb = globalThis as unknown as {
  pool: mysql.Pool | null;
};

let pool = globalForDb.pool || null;

export interface DatabaseConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database?: string;
  ssl?: {
    rejectUnauthorized?: boolean;
    ca?: string;
    cert?: string;
    key?: string;
  };
}

export function createPool(config: DatabaseConfig) {
  if (pool) {
    pool.end();
  }
  
  const poolConfig: any = {
    host: config.host,
    port: config.port,
    user: config.user,
    password: config.password,
    database: config.database,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 10000, // 10 seconds
    timeout: 30000, // 30 seconds for queries
  };

  // Add SSL/TLS if configured
  if (config.ssl) {
    poolConfig.ssl = config.ssl;
  }

  // In production, warn if SSL is not enabled
  if (process.env.NODE_ENV === 'production' && !config.ssl) {
    console.warn('⚠️  WARNING: Database connection without SSL/TLS in production!');
    console.warn('⚠️  This is a security risk. Enable SSL/TLS for database connections.');
  }
  
  pool = mysql.createPool(poolConfig);
  
  // Store in globalThis for hot reload persistence
  globalForDb.pool = pool;
  
  return pool;
}

export function getPool() {
  if (!pool) {
    throw new Error('Database connection lost. Please reconnect.');
  }
  return pool;
}

export function isConnected(): boolean {
  return pool !== null;
}

export async function testConnection(config: DatabaseConfig): Promise<boolean> {
  try {
    const testPoolConfig: any = {
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      database: config.database,
      connectionLimit: 1,
      connectTimeout: 10000,
    };

    // Add SSL/TLS if configured
    if (config.ssl) {
      testPoolConfig.ssl = config.ssl;
    }

    const testPool = mysql.createPool(testPoolConfig);
    
    await testPool.query('SELECT 1');
    await testPool.end();
    return true;
  } catch (error) {
    console.error('Connection test failed:', error);
    return false;
  }
}

export async function executeQuery(query: string, params?: any[]) {
  const pool = getPool();
  const [results] = await pool.query(query, params);
  return results;
}

export async function getDatabases() {
  const pool = getPool();
  const [databases] = await pool.query('SHOW DATABASES');
  return databases as Array<{ Database: string }>;
}

export async function getTables(database: string) {
  const pool = getPool();
  const [tables] = await pool.query(`SHOW TABLES FROM \`${database}\``);
  return tables;
}

export async function getTableStructure(database: string, table: string) {
  const pool = getPool();
  const [columns] = await pool.query(`DESCRIBE \`${database}\`.\`${table}\``);
  return columns;
}

export async function getTableData(database: string, table: string, limit = 100, offset = 0) {
  const pool = getPool();
  const [data] = await pool.query(
    `SELECT * FROM \`${database}\`.\`${table}\` LIMIT ? OFFSET ?`,
    [limit, offset]
  );
  return data;
}

export async function getTableCount(database: string, table: string) {
  const pool = getPool();
  const [result] = await pool.query(
    `SELECT COUNT(*) as count FROM \`${database}\`.\`${table}\``
  );
  return (result as any)[0].count;
}
