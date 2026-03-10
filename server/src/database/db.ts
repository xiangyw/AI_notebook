import mysql from 'mysql2/promise';
import config from '../config/index.js';
import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { ALL_TABLE_CREATION_SQL } from './schema.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let pool: mysql.Pool | null = null;
let dbAvailable = false;

/**
 * 检查数据库是否可用
 */
export function isDatabaseAvailable(): boolean {
  return dbAvailable;
}

/**
 * 获取数据库连接池
 */
export function getPool(): mysql.Pool | null {
  if (!pool) {
    try {
      pool = mysql.createPool({
        host: config.database.host,
        port: config.database.port,
        user: config.database.user,
        password: config.database.password,
        database: config.database.database,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
      });
    } catch (error) {
      console.warn('⚠️ 无法创建数据库连接池');
      return null;
    }
  }
  return pool;
}

/**
 * 测试数据库连接
 */
export async function testConnection(): Promise<boolean> {
  try {
    const connectionPool = getPool();
    if (!connectionPool) {
      dbAvailable = false;
      console.warn('⚠️ 数据库连接池创建失败，将使用无数据库模式');
      return false;
    }
    
    const connection = await connectionPool.getConnection();
    await connection.ping();
    connection.release();
    console.log('✅ 数据库连接成功');
    dbAvailable = true;
    return true;
  } catch (error) {
    console.warn('⚠️ 数据库连接失败，将使用无数据库模式:', (error as Error).message);
    dbAvailable = false;
    return false;
  }
}

/**
 * 初始化数据库表
 */
export async function initializeDatabase(): Promise<void> {
  if (!dbAvailable) {
    console.log('ℹ️  无数据库模式：跳过表初始化');
    return;
  }
  
  const connectionPool = getPool();
  if (!connectionPool) return;
  
  const connection = await connectionPool.getConnection();
  try {
    // 读取 init.sql 文件
    const initSqlPath = path.resolve(__dirname, '../../../docker/mysql/init.sql');
    
    try {
      const initSql = await fs.readFile(initSqlPath, 'utf-8');
      
      // 分割 SQL 语句（按分号分割）
      const statements = initSql
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
      
      // 执行每个 SQL 语句
      for (const statement of statements) {
        if (statement && !statement.includes('GRANT') && !statement.includes('FLUSH')) {
          await connection.query(statement);
        }
      }
      
      console.log('✅ 数据库表初始化完成');
    } catch (error: any) {
      console.warn('⚠️ 无法读取 init.sql，使用内置表结构:', error.message);
      
      // 如果无法读取 init.sql，使用内置的表结构
      for (const sql of ALL_TABLE_CREATION_SQL) {
        await connection.query(sql);
      }
      
      console.log('✅ 数据库表初始化完成（使用内置结构）');
    }
  } finally {
    connection.release();
  }
}

/**
 * 关闭数据库连接
 */
export async function closeDatabase(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
    console.log('🔒 数据库连接已关闭');
  }
}
