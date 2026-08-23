import { documentService } from '../src/modules/documents/document.service';
import { pool } from '../src/config/database';

async function main() {
  const [rows] = await pool.query("SELECT id FROM donations WHERE status = 'verified' LIMIT 1");
  const donationId = (rows as any[])[0]?.id;
  if (!donationId) {
    console.log('No verified donation found');
    process.exit(1);
  }
  console.log('Testing regenerate for', donationId);
  const result = await documentService.generate80G(donationId, { regenerate: true });
  console.log('OK', result);
  process.exit(0);
}

main().catch((err) => {
  console.error('FAILED', err);
  process.exit(1);
});
