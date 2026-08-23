import fs from 'fs';
import path from 'path';

export default async function seedMockData(connection: any) {
  const jsonPath = path.resolve(__dirname, '../mock_data.json');
  if (!fs.existsSync(jsonPath)) {
    console.log('No mock_data.json found. Skipping mock data seed.');
    return;
  }

  const raw = fs.readFileSync(jsonPath, 'utf-8');
  const db = JSON.parse(raw);

  console.log('Seeding Users (Donors/Others)...');
  for (const u of db.users || []) {
    if (u.id === 'USR-001') continue; // Skip super admin which is already seeded
    const [existing] = await connection.query('SELECT id FROM users WHERE email = ?', [u.email]);
    if ((existing as any[]).length === 0) {
      await connection.query(`
        INSERT INTO users (id, name, email, password_hash, role, status)
        VALUES (?, ?, ?, ?, ?, 'active')
      `, [
        u.id,
        u.name,
        u.email,
        'dummy_hash', // In reality they won't log in unless they reset password, or we can use bcrypt
        u.role || 'Donor'
      ]);
    }
  }

  console.log('Seeding Campaigns...');
  for (const c of db.campaigns || []) {
    // Check if exists
    const [existing] = await connection.query('SELECT id FROM campaigns WHERE title = ?', [c.title]);
    if ((existing as any[]).length === 0) {
      // Map to snake_case
      const formattedDate = new Date(c.createdAt || Date.now()).toISOString().slice(0, 19).replace('T', ' ');
      // Handle deadline, default to 30 days from now if not present
      const deadlineDate = c.deadline ? new Date(c.deadline) : new Date(Date.now() + 30*24*60*60*1000);
      const formattedDeadline = deadlineDate.toISOString().slice(0, 10);

      await connection.query(`
        INSERT INTO campaigns 
        (title, category, story, cover_image, target_amount, raised_amount, deadline, status, is_urgent, is_featured, created_by, created_at, updated_at, student_details)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        c.title,
        c.category,
        c.story,
        c.coverImage || null,
        c.targetAmount || 0,
        c.raisedAmount || 0,
        formattedDeadline,
        c.status || 'approved',
        c.isUrgent ? 1 : 0,
        c.isFeatured ? 1 : 0,
        c.createdBy || 'USR-001',
        formattedDate,
        formattedDate,
        c.studentDetails ? JSON.stringify(c.studentDetails) : null
      ]);
    }
  }

  console.log('Seeding Donations...');
  for (const d of db.donations || []) {
    const [existing] = await connection.query('SELECT id FROM donations WHERE payment_ref = ?', [d.paymentRef || d.id]);
    if ((existing as any[]).length === 0) {
      const formattedDate = new Date(d.donatedAt || Date.now()).toISOString().slice(0, 19).replace('T', ' ');
      
      // Need campaign internal ID (INT)
      let campaignId = null;
      let campaignTitle = null;
      if (d.campaignId) {
        // mock campaignId was like CMP-001. We need to find it by looking up title from the JSON
        const matchedCmp = db.campaigns?.find((c: any) => c.id === d.campaignId);
        if (matchedCmp) {
          const [dbCmp] = await connection.query('SELECT id, title FROM campaigns WHERE title = ?', [matchedCmp.title]);
          if ((dbCmp as any[]).length > 0) {
            campaignId = (dbCmp as any)[0].id;
            campaignTitle = (dbCmp as any)[0].title;
          }
        }
      }

      const donorId = d.donorId || 'USR-002';
      
      // Auto-create missing user if needed
      const [userExists] = await connection.query('SELECT id FROM users WHERE id = ?', [donorId]);
      if ((userExists as any[]).length === 0) {
        await connection.query(`
          INSERT INTO users (id, name, email, password_hash, role, status)
          VALUES (?, ?, ?, ?, 'Donor', 'active')
        `, [
          donorId,
          d.donorName || 'Missing User',
          `donor_${donorId}@example.com`,
          'dummy_hash'
        ]);
      }

      await connection.query(`
        INSERT INTO donations 
        (id, donor_id, campaign_id, amount, status, payment_ref, donated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        d.id,
        donorId,
        campaignId,
        d.amount || 0,
        d.status || 'verified',
        d.paymentRef || d.id,
        formattedDate
      ]);
    }
  }



  // Gallery, Partners etc could be seeded into content_modules if needed, but the user mainly wanted campaigns & donations.
  // The content_modules table handles JSON blobs for these.
  // Let's seed content_modules for gallery, partners, programs, teamMembers, careers
  
  const contentKeys = [
    { key: 'gallery', data: db.gallery },
    { key: 'partners', data: db.partners },
    { key: 'programs', data: db.programs },
    { key: 'team', data: db.teamMembers },
    { key: 'careers', data: db.careers },
    { key: 'certificates', data: db.certificates },
    { key: 'featured_moments', data: db.featuredMoments }
  ];

  for (const c of contentKeys) {
    if (c.data) {
      const [existing] = await connection.query('SELECT id FROM cms_content WHERE page_key = ? AND section_key = ?', ['global', c.key]);
      if ((existing as any[]).length === 0) {
        await connection.query(`
          INSERT INTO cms_content (page_key, section_key, content)
          VALUES (?, ?, ?)
        `, [
          'global',
          c.key,
          JSON.stringify(c.data)
        ]);
      } else {
        await connection.query(`
          UPDATE cms_content SET content = ? WHERE page_key = ? AND section_key = ?
        `, [
          JSON.stringify(c.data),
          'global',
          c.key
        ]);
      }
    }
  }

  console.log('Mock Data Seeding Completed.');
}
