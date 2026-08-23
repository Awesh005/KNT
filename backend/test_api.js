async function test() {
  try {
    const loginRes = await fetch('http://localhost:5001/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'testing@example.com',
        password: 'password123'
      })
    });
    
    const loginData = await loginRes.json();
    const token = loginData.data.token;
    
    const res = await fetch('http://localhost:5001/api/v1/requests', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        beneficiary_name: 'Rahul',
        category: 'Medical',
        story: 'Test story that is more than 20 characters long.',
        target_amount: 100000,
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        account_holder_name: 'Rahul Singh',
        account_number: '1234567890',
        documents: ['http://example.com/doc.pdf']
      })
    });
    const text = await res.text();
    console.log('STATUS:', res.status);
    console.log('RESPONSE:', text);
  } catch (error) {
    console.error('ERROR:', error);
  }
}
test();
