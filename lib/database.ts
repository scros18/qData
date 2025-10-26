import mysql from 'mysql2/promise';

let pool: mysql.Pool | null = null;

export interface DatabaseConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database?: string;
}

export function createPool(config: DatabaseConfig) {
  if (pool) {
    pool.end();
  }
  
  pool = mysql.createPool({
    host: config.host,
    port: config.port,
    user: config.user,
    password: config.password,
    database: config.database,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });
  
  return pool;
}

export function getPool() {
  if (!pool) {
    throw new Error('Database pool not initialized. Please connect first.');
  }
  return pool;
}

export async function testConnection(config: DatabaseConfig): Promise<boolean> {
  try {
    const testPool = mysql.createPool({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      database: config.database,
      connectionLimit: 1,
    });
    
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
