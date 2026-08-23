const mysql = require('mysql2/promise');
require('dotenv').config();

async function test() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'knt_welfare',
    waitForConnections: true,
  });

  try {
    const documentsString = JSON.stringify([]);
    const [result] = await pool.query(
      `INSERT INTO fundraiser_requests (id, user_id, beneficiary_name, category, story, target_amount, deadline, documents, status, account_holder_name, account_number) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        'test-1', 1, 'Test', 'Medical', 'test story', 
        1000, new Date(), documentsString, 'pending',
        'John', '123'
      ]
    );
    console.log('Success:', result);
  } catch (error) {
    console.error('Error inserting:', error);
  } finally {
    pool.end();
  }
}
test();
