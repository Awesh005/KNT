import fs from 'fs';
import path from 'path';
import { pool } from '../src/config/database';

async function runMigrations() {
  const connection = await pool.getConnection();

  try {
    console.log('🔄 Starting database migrations...');

    // Create tracking table if it doesn't exist
    await connection.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        filename VARCHAR(255) NOT NULL UNIQUE,
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Get applied migrations
    const [rows] = await connection.query('SELECT filename FROM schema_migrations');
    const appliedMigrations = new Set((rows as any[]).map((r) => r.filename));

    // Get migration files
    const migrationsDir = path.join(__dirname, '../migrations');
    if (!fs.existsSync(migrationsDir)) {
      console.log('No migrations directory found.');
      process.exit(0);
    }

    const files = fs.readdirSync(migrationsDir)
      .filter((f) => f.endsWith('.sql'))
      .sort();

    for (const file of files) {
      if (!appliedMigrations.has(file)) {
        console.log(`Applying migration: ${file}...`);
        const filePath = path.join(migrationsDir, file);
        const sql = fs.readFileSync(filePath, 'utf-8');

        // Split by semicolon and execute each statement to support multiple queries in one file
        const statements = sql.split(';').filter(stmt => stmt.trim() !== '');
        
        await connection.beginTransaction();
        try {
          for (const stmt of statements) {
            await connection.query(stmt);
          }
          await connection.query('INSERT INTO schema_migrations (filename) VALUES (?)', [file]);
          await connection.commit();
          console.log(`✅ Applied: ${file}`);
        } catch (error) {
          await connection.rollback();
          console.error(`❌ Failed applying ${file}:`, error);
          throw error;
        }
      }
    }

    console.log('✨ All migrations completed successfully.');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    connection.release();
    process.exit(0);
  }
}

runMigrations();
