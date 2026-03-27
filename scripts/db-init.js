/**
 * Database Initialization Script
 * Creates all required tables for the Warehouse Inventory System
 */

const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

// Load environment variables from .env.local
function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env.local');
  const envExamplePath = path.join(__dirname, '..', '.env.example');
  
  if (!fs.existsSync(envPath)) {
    if (fs.existsSync(envExamplePath)) {
      console.log('⚠️  .env.local not found. Copying from .env.example...');
      fs.copyFileSync(envExamplePath, envPath);
    } else {
      console.error('❌ .env.local not found. Please create it first.');
      process.exit(1);
    }
  }
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length > 0) {
        const val = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
        process.env[key.trim()] = val;
      }
    }
  });
}

async function main() {
  loadEnv();
  
  const config = {
    host: process.env.DATABASE_HOSTNAME || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '3306'),
    user: process.env.DATABASE_USERNAME || 'root',
    password: process.env.DATABASE_PASSWORD || '',
  };
  
  const databaseName = process.env.DATABASE_NAME || 'warehouse_inventory';
  
  console.log('📊 Database Initialization');
  console.log('========================');
  console.log(`Host: ${config.host}:${config.port}`);
  console.log(`User: ${config.user}`);
  console.log(`Database: ${databaseName}`);
  console.log('');
  
  let connection;
  
  try {
    // Connect without database selection
    console.log('1. Connecting to MySQL...');
    connection = await mysql.createConnection(config);
    console.log('   ✅ Connected');
    
    // Create database if not exists
    console.log('2. Creating database...');
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${databaseName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    console.log('   ✅ Database created/verified');
    
    // Use the database
    await connection.query(`USE \`${databaseName}\``);
    
    // Create User table
    console.log('3. Creating User table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS User (
        id VARCHAR(36) PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255),
        password VARCHAR(255) NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('   ✅ User table created');
    
    // Create Product table
    console.log('4. Creating Product table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS Product (
        id VARCHAR(36) PRIMARY KEY,
        sku VARCHAR(100) NOT NULL,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        description TEXT,
        quantity INT DEFAULT 0 CHECK (quantity >= 0),
        userId VARCHAR(36) NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_sku (userId, sku),
        INDEX idx_user_id (userId),
        INDEX idx_sku (sku),
        INDEX idx_category (category)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('   ✅ Product table created');
    
    // Create StockAdjustment table
    console.log('5. Creating StockAdjustment table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS StockAdjustment (
        id VARCHAR(36) PRIMARY KEY,
        productId VARCHAR(36) NOT NULL,
        userId VARCHAR(36) NOT NULL,
        type ENUM('ADD', 'REMOVE') NOT NULL,
        quantity INT NOT NULL,
        previousQuantity INT NOT NULL,
        newQuantity INT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (productId) REFERENCES Product(id) ON DELETE CASCADE,
        FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE,
        INDEX idx_product_id (productId),
        INDEX idx_user_id (userId),
        INDEX idx_timestamp (timestamp),
        INDEX idx_user_timestamp (userId, timestamp)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('   ✅ StockAdjustment table created');
    
    console.log('');
    console.log('========================');
    console.log('✅ Database initialized successfully!');
    console.log('');
    console.log('Tables created:');
    console.log('  - User');
    console.log('  - Product');
    console.log('  - StockAdjustment');
    console.log('');
    
  } catch (error) {
    console.error('');
    console.error('❌ Database initialization failed:');
    console.error(error.message);
    console.error('');
    console.error('Please check:');
    console.error('  1. Laragon MySQL is running');
    console.error('  2. Database credentials in .env.local are correct');
    console.error('');
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

main();
