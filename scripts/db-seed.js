/**
 * Database Seed Script
 * Populates the database with demo data for testing
 */

const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

// Load environment variables
function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (!fs.existsSync(envPath)) {
    console.error('❌ .env.local not found. Run npm run db:init first.');
    process.exit(1);
  }
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length > 0) {
        process.env[key.trim()] = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
      }
    }
  });
}

function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

async function main() {
  loadEnv();
  
  const config = {
    host: process.env.DATABASE_HOSTNAME || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '3306'),
    user: process.env.DATABASE_USERNAME || 'root',
    password: process.env.DATABASE_PASSWORD || '',
    database: process.env.DATABASE_NAME || 'warehouse_inventory',
  };
  
  console.log('🌱 Database Seeding');
  console.log('==================');
  console.log('');
  
  let connection;
  
  try {
    connection = await mysql.createConnection(config);
    console.log('✅ Connected to database');
    console.log('');
    
    // Create demo user
    console.log('1. Creating demo user...');
    const userId = uuid();
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    await connection.execute(
      `INSERT INTO User (id, email, name, password) VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE email=email`,
      [userId, 'demo@warehouse.com', 'Demo User', hashedPassword]
    );
    console.log('   ✅ User created: demo@warehouse.com / password123');
    console.log('');
    
    // Create demo products
    console.log('2. Creating demo products...');
    const products = [
      { sku: 'WH-001', name: 'Industrial Shelving Unit', category: 'Storage', description: 'Heavy-duty steel shelving unit', quantity: 45 },
      { sku: 'WH-002', name: 'Pallet Jack Manual', category: 'Equipment', description: 'Manual pallet jack, 5500 lbs', quantity: 8 },
      { sku: 'WH-003', name: 'Safety Vest High-Vis', category: 'Safety', description: 'ANSI Class 2 safety vest', quantity: 150 },
      { sku: 'WH-004', name: 'Barcode Scanner Wireless', category: 'Electronics', description: 'Wireless barcode scanner', quantity: 0 },
      { sku: 'WH-005', name: 'Cardboard Boxes Large', category: 'Packaging', description: '24x18x18 boxes, pack of 25', quantity: 5 },
      { sku: 'WH-006', name: 'Forklift Battery 48V', category: 'Equipment', description: '48V battery with charger', quantity: 12 },
      { sku: 'WH-007', name: 'Shrink Wrap Roll', category: 'Packaging', description: '18 inch x 1500 ft film', quantity: 75 },
      { sku: 'WH-008', name: 'Safety Goggles', category: 'Safety', description: 'Anti-fog with UV protection', quantity: 3 },
    ];
    
    const productIds = [];
    for (const p of products) {
      const id = uuid();
      productIds.push(id);
      await connection.execute(
        `INSERT INTO Product (id, sku, name, category, description, quantity, userId)
         VALUES (?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE sku=sku`,
        [id, p.sku, p.name, p.category, p.description, p.quantity, userId]
      );
      console.log(`   ✅ ${p.name} (${p.sku})`);
    }
    console.log('');
    
    // Create sample stock adjustments
    console.log('3. Creating stock adjustments...');
    const adjustments = [
      { productId: productIds[0], type: 'ADD', quantity: 10, previousQuantity: 35, newQuantity: 45 },
      { productId: productIds[1], type: 'REMOVE', quantity: 2, previousQuantity: 10, newQuantity: 8 },
      { productId: productIds[2], type: 'ADD', quantity: 50, previousQuantity: 100, newQuantity: 150 },
      { productId: productIds[3], type: 'REMOVE', quantity: 5, previousQuantity: 5, newQuantity: 0 },
      { productId: productIds[4], type: 'REMOVE', quantity: 20, previousQuantity: 25, newQuantity: 5 },
    ];
    
    for (const adj of adjustments) {
      const timestamp = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000);
      await connection.execute(
        `INSERT INTO StockAdjustment (id, productId, userId, type, quantity, previousQuantity, newQuantity, timestamp)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [uuid(), adj.productId, userId, adj.type, adj.quantity, adj.previousQuantity, adj.newQuantity, timestamp]
      );
    }
    console.log('   ✅ 5 stock adjustments created');
    console.log('');
    
    console.log('==================');
    console.log('✅ Database seeded successfully!');
    console.log('');
    console.log('Demo Login:');
    console.log('  Email: demo@warehouse.com');
    console.log('  Password: password123');
    console.log('');
    
  } catch (error) {
    console.error('');
    console.error('❌ Seeding failed:');
    console.error(error.message);
    console.error('');
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

main();
