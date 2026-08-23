import fs from 'fs';
import path from 'path';
import { pool } from '../src/config/database';

function sqlLiteral(value: any): string {
  if (value === null || value === undefined) return 'NULL';
  if (Buffer.isBuffer(value)) {
    return value.length ? `0x${value.toString('hex')}` : "''";
  }
  if (value instanceof Date) {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `'${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())} ${pad(value.getHours())}:${pad(value.getMinutes())}:${pad(value.getSeconds())}'`;
  }
  if (typeof value === 'object') {
    return `'${JSON.stringify(value).replace(/\\/g, '\\\\').replace(/'/g, "''")}'`;
  }
  if (typeof value === 'number' || typeof value === 'bigint') return String(value);
  if (typeof value === 'boolean') return value ? '1' : '0';
  return `'${String(value).replace(/\\/g, '\\\\').replace(/'/g, "''")}'`;
}

function hostingerSafeCreate(sql: string) {
  return sql
    .replace(/utf8mb4_0900_ai_ci/g, 'utf8mb4_unicode_ci')
    .replace(/utf8mb4_0900_bin/g, 'utf8mb4_bin')
    .replace(/DEFINER=`[^`]+`@`[^`]+`/g, '')
    .replace(/ALGORITHM=UNDEFINED /g, '');
}

async function dump() {
  const outPath = path.join(process.cwd(), '../production/hostinger-deploy-v3.sql');
  const chunks: string[] = [];
  chunks.push(`-- KNT World Welfare Foundation
-- Hostinger deploy v3 complete dump
-- Generated: ${new Date().toISOString()}
-- Import in phpMyAdmin into your Hostinger database (utf8mb4)

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS=0;
SET UNIQUE_CHECKS=0;
SET SQL_MODE='NO_AUTO_VALUE_ON_ZERO';
SET time_zone = '+00:00';
`);

  const [tableRows] = await pool.query('SHOW FULL TABLES WHERE Table_type = ?', ['BASE TABLE']);
  const tables = (tableRows as any[]).map((row) => Object.values(row)[0] as string);

  for (const table of tables) {
    const [createRows] = await pool.query(`SHOW CREATE TABLE \`${table}\``);
    const createSql = hostingerSafeCreate((createRows as any[])[0]['Create Table']);
    chunks.push(`\n-- ----------------------------\n-- Table \`${table}\`\n-- ----------------------------\nDROP TABLE IF EXISTS \`${table}\`;\n${createSql};\n`);

    const [rows] = await pool.query(`SELECT * FROM \`${table}\``);
    const data = rows as any[];
    if (!data.length) continue;

    const columns = Object.keys(data[0]).map((col) => `\`${col}\``).join(', ');
    const values = data.map((row) => `(${Object.values(row).map(sqlLiteral).join(', ')})`);
    const batchSize = 80;
    for (let i = 0; i < values.length; i += batchSize) {
      const batch = values.slice(i, i + batchSize);
      chunks.push(`INSERT INTO \`${table}\` (${columns}) VALUES\n${batch.join(',\n')};\n`);
    }
  }

  chunks.push('\nSET FOREIGN_KEY_CHECKS=1;\nSET UNIQUE_CHECKS=1;\n');
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, chunks.join('\n'), 'utf8');
  console.log(`Wrote ${outPath} (${tables.length} tables)`);
  await pool.end();
}

dump().catch((error) => {
  console.error(error);
  process.exit(1);
});
