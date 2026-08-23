const mysql = require('mysql2/promise');
require('dotenv').config();

async function migrate() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'knt_welfare',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

  try {
    console.log('Adding columns to fundraiser_requests...');
    await pool.query('ALTER TABLE fundraiser_requests ADD COLUMN account_holder_name VARCHAR(255) NULL;');
    await pool.query('ALTER TABLE fundraiser_requests ADD COLUMN account_number VARCHAR(255) NULL;');
    
    console.log('Adding columns to campaigns...');
    await pool.query('ALTER TABLE campaigns ADD COLUMN account_holder_name VARCHAR(255) NULL;');
    await pool.query('ALTER TABLE campaigns ADD COLUMN account_number VARCHAR(255) NULL;');
    
    console.log('Migration successful');
  } catch (error) {
    if (error.code === 'ER_DUP_FIELDNAME') {
      console.log('Columns already exist.');
    } else {
      console.error('Migration failed:', error);
    }
  } finally {
    await pool.end();
  }
}

migrate();
