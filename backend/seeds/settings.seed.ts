export default async function seedSettings(connection: any) {
  const defaultSettings = {
    companyName: 'Kind & Support Welfare Foundation',
    email: 'contact@kntwelfare.org',
    phone: '+91 9876543210',
    address: '123 Charity Lane, New Delhi, India 110001',
    facebook: 'https://facebook.com',
    twitter: 'https://twitter.com',
    instagram: 'https://instagram.com',
    linkedin: 'https://linkedin.com',
    paymentQRUrl: 'https://via.placeholder.com/200?text=Donate+QR',
  };

  const [existing] = await connection.query('SELECT id FROM site_settings WHERE setting_key = ?', ['global_settings']);
  
  if ((existing as any[]).length > 0) {
    console.log('Global settings already exist. Skipping...');
    return;
  }

  await connection.query(`
    INSERT INTO site_settings (setting_key, setting_value)
    VALUES (?, ?)
  `, ['global_settings', JSON.stringify(defaultSettings)]);
}
