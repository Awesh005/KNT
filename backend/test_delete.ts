import { donationService } from './src/modules/donations/donation.service';
import { pool } from './src/config/database';

async function test() {
  try {
    console.log('Testing delete DON-EA839FA4...');
    await donationService.deleteDonation('DON-EA839FA4');
    console.log('Success');
  } catch (e: any) {
    console.error('Error:', e);
  } finally {
    pool.end();
  }
}
test();
