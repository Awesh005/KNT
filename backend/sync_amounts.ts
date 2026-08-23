import { pool } from './src/config/database';

async function syncRaisedAmounts() {
  try {
    const [result] = await pool.query(`
      UPDATE campaigns c
      SET raised_amount = (
        SELECT COALESCE(SUM(amount), 0)
        FROM donations d
        WHERE d.campaign_id = c.id AND d.status = 'verified'
      )
    `);
    console.log('Synced successfully:', result);
  } catch (e: any) {
    console.error('Error:', e);
  } finally {
    pool.end();
  }
}
syncRaisedAmounts();
