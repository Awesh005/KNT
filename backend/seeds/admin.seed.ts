import bcrypt from 'bcrypt';
import { env } from '../src/config/env';

export default async function seedAdmin(connection: any) {
  const adminId = 'USR-001';
  const name = 'Super Admin';
  const email = env.ADMIN_EMAIL;
  const password = env.ADMIN_PASSWORD; // We will hash this
  
  const [existing] = await connection.query('SELECT id FROM users WHERE email = ?', [email]);
  if ((existing as any[]).length > 0) {
    console.log('Super Admin already exists. Skipping...');
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await connection.query(`
    INSERT INTO users (id, name, email, password_hash, role, status)
    VALUES (?, ?, ?, ?, 'Super Admin', 'active')
  `, [adminId, name, email, hashedPassword]);
}
