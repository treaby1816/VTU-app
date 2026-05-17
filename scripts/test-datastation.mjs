import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function testDataStationKey() {
  const apiKey = process.env.DATASTATION_API_KEY;
  const baseUrl = process.env.DATASTATION_BASE_URL || 'https://datastation.com.ng/api';

  if (!apiKey || apiKey === 'your-datastation-api-key') {
    console.error('❌ No valid DATASTATION_API_KEY found in .env.local');
    return;
  }

  console.log(`🔍 Testing DataStation key: ${apiKey.substring(0, 4)}...`);
  console.log(`🌐 Base URL: ${baseUrl}`);

  try {
    const res = await fetch(`${baseUrl}/user/`, {
      method: 'GET',
      headers: {
        'Authorization': `Token ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await res.json();
    
    if (res.ok && data.user) {
      console.log('✅ Key is VALID!');
      console.log('👤 User Data:', JSON.stringify(data.user, null, 2));
    } else {
      console.error('❌ Key might be INVALID or endpoint changed.');
      console.error('Response:', data);
    }
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
  }
}

testDataStationKey();
