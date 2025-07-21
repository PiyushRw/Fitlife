import fetch from 'node-fetch';

const API_BASE_URL = 'http://localhost:5001/api/v1';

const testAuth = async () => {
  console.log('🧪 Testing FitLife Authentication Endpoints...\n');

  try {
    // Test 1: Health Check
    console.log('1. Testing Health Check...');
    const healthResponse = await fetch(`${API_BASE_URL.replace('/api/v1', '')}/api/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health Check:', healthData.message);
    console.log('');

    // Test 2: Register User
    console.log('2. Testing User Registration...');
    const registerData = {
      firstName: 'Test',
      lastName: 'User',
      email: `test${Date.now()}@example.com`,
      password: 'password123'
    };

    const registerResponse = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registerData)
    });

    const registerResult = await registerResponse.json();
    
    if (registerResponse.ok) {
      console.log('✅ Registration successful');
      console.log('   User ID:', registerResult.data.user._id);
      console.log('   Token:', registerResult.data.token ? 'Present' : 'Missing');
    } else {
      console.log('❌ Registration failed:', registerResult.error);
    }
    console.log('');

    // Test 3: Login User
    console.log('3. Testing User Login...');
    const loginData = {
      email: registerData.email,
      password: registerData.password
    };

    const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loginData)
    });

    const loginResult = await loginResponse.json();
    
    if (loginResponse.ok) {
      console.log('✅ Login successful');
      console.log('   User ID:', loginResult.data.user._id);
      console.log('   Token:', loginResult.data.token ? 'Present' : 'Missing');
      
      // Test 4: Get Profile (Protected Route)
      console.log('');
      console.log('4. Testing Get Profile (Protected Route)...');
      
      const profileResponse = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${loginResult.data.token}`,
          'Content-Type': 'application/json'
        }
      });

      const profileResult = await profileResponse.json();
      
      if (profileResponse.ok) {
        console.log('✅ Profile retrieval successful');
        console.log('   User Name:', profileResult.data.user.firstName, profileResult.data.user.lastName);
        console.log('   Email:', profileResult.data.user.email);
      } else {
        console.log('❌ Profile retrieval failed:', profileResult.error);
      }
    } else {
      console.log('❌ Login failed:', loginResult.error);
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
};

testAuth(); 