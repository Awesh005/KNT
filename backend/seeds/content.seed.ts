export default async function seedContent(connection: any) {
  // Check if sample content already exists
  const [existing] = await connection.query('SELECT id FROM content_modules LIMIT 1');
  if ((existing as any[]).length > 0) {
    console.log('Sample content already exists. Skipping...');
    return;
  }

  // Insert Team
  await connection.query(`
    INSERT INTO content_modules (type, title, media, description) VALUES
    ('team', 'Pankaj Kumar', 'https://via.placeholder.com/300', 'Founder & Director'),
    ('team', 'Rahul Sharma', 'https://via.placeholder.com/300', 'Operations Manager')
  `);

  // Insert Programs
  await connection.query(`
    INSERT INTO content_modules (type, title, media, description) VALUES
    ('program', 'Food Distribution', 'https://via.placeholder.com/400x300', 'Providing meals to the underprivileged daily.')
  `);
  
  // Create a sample campaign (Assuming admin exists from admin.seed.ts)
  const [existingCampaigns] = await connection.query('SELECT id FROM campaigns LIMIT 1');
  if ((existingCampaigns as any[]).length === 0) {
    await connection.query(`
      INSERT INTO campaigns (title, category, story, target_amount, raised_amount, deadline, status, created_by)
      VALUES (
        'Education for All', 
        'Education', 
        'Help us provide school supplies to 1000 children.', 
        500000.00, 
        100000.00, 
        '2027-12-31', 
        'approved', 
        'USR-001'
      )
    `);
  }
}
