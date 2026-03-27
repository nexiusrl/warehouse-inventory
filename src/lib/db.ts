/**
 * MySQL Database Connection Pool
 * Uses mysql2 with connection pooling for better performance
 */

import mysql from 'mysql2/promise';

// Database configuration from environment variables
const dbConfig = {
  host: process.env.DATABASE_HOSTNAME || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '3306'),
  user: process.env.DATABASE_USERNAME || 'root',
  password: process.env.DATABASE_PASSWORD || '',
  database: process.env.DATABASE_NAME || 'warehouse_inventory',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

// Create connection pool
let pool: mysql.Pool | null = null;

export function getPool(): mysql.Pool {
  if (!pool) {
    pool = mysql.createPool(dbConfig);
  }
  return pool;
}

export async function query<T = any>(sql: string, params?: any[]): Promise<T> {
  const connection = await getPool().getConnection();
  try {
    const [rows] = await connection.execute(sql, params);
    return rows as T;
  } finally {
    connection.release();
  }
}

export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

// Helper function to get DATABASE_URL from individual env vars
export function getDatabaseUrl(): string {
  const { host, port, user, password, database } = dbConfig;
  const passwordPart = password ? `:${password}` : '';
  return `mysql://${user}${passwordPart}@${host}:${port}/${database}`;
}
