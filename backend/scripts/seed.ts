import { pool } from '../src/config/database';
import fs from 'fs';
import path from 'path';

async function runSeeds() {
  const connection = await pool.getConnection();

  try {
    console.log('🌱 Starting database seeding...');

    const seedsDir = path.join(__dirname, '../seeds');
    if (!fs.existsSync(seedsDir)) {
      console.log('No seeds directory found.');
      process.exit(0);
    }

    const files = fs.readdirSync(seedsDir)
      .filter((f) => f.endsWith('.seed.ts') || f.endsWith('.seed.js'))
      .sort();

    for (const file of files) {
      console.log(`Running seed: ${file}...`);
      const filePath = path.join(seedsDir, file);
      
      // Use dynamic import
      const seedModule = await import(filePath);
      
      if (typeof seedModule.default === 'function') {
        await seedModule.default(connection);
        console.log(`✅ Seeded: ${file}`);
      } else {
        console.warn(`⚠️ Skipping ${file}: No default export function found.`);
      }
    }

    console.log('✨ All seeds completed successfully.');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    connection.release();
    process.exit(0);
  }
}

runSeeds();
