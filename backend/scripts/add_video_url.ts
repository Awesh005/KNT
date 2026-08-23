import { pool } from '../src/config/database';

async function addColumn() {
  const connection = await pool.getConnection();
  try {
    await connection.query('ALTER TABLE campaigns ADD COLUMN video_url VARCHAR(255) DEFAULT NULL');
    console.log('Successfully added video_url column.');
  } catch (error: any) {
    if (error.code === 'ER_DUP_FIELDNAME') {
      console.log('Column video_url already exists.');
    } else {
      console.error('Failed to add column:', error);
    }
  } finally {
    connection.release();
    process.exit(0);
  }
}

addColumn();
