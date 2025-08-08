#!/usr/bin/env node

/**
 * Test script to verify deployment configuration
 * Run with: node test-deployment.js
 */

import fetch from 'node-fetch';

const BACKEND_URL = 'https://fitlife-backend.vercel.app';
const FRONTEND_URL = 'https://fitlife-frontend.vercel.app';

async function testDeployment() {
  console.log('🔍 Testing FitLife Deployment Configuration...\n');
  
  const tests = [
    {
      name: 'Backend Health Check',
      url: `${BACKEND_URL}/api/health`,
      expectedStatus: 200
    },
    {
      name: 'Database Health Check',
      url: `${BACKEND_URL}/api/health/db`,
      expectedStatus: 200
    },
    {
      name: 'Login Endpoint Accessibility',
      url: `${BACKEND_URL}/api/v1/auth/login`,
      method: 'POST',
      body: { email: 'test@example.com', password: 'test123' },
      expectedStatus: 401 // Should return 401 for invalid credentials, not 500
    },
    {
      name: 'CORS Headers Check',
      url: `${BACKEND_URL}/api/health`,
      checkCORS: true
    }
  ];

  for (const test of tests) {
    try {
      console.log(`🧪 ${test.name}`);
      
      const options = {
        method: test.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Origin': FRONTEND_URL
        }
      };
      
      if (test.body) {
        options.body = JSON.stringify(test.body);
      }
      
      const response = await fetch(test.url, options);
      
      console.log(`   Status: ${response.status}`);
      
      if (response.status === test.expectedStatus) {
        console.log(`   ✅ PASS`);
      } else {
        console.log(`   ❌ FAIL - Expected ${test.expectedStatus}, got ${response.status}`);
      }
      
      if (test.checkCORS) {
        const corsHeader = response.headers.get('Access-Control-Allow-Origin');
        console.log(`   CORS Header: ${corsHeader || 'Not set'}`);
      }
      
      const data = await response.json().catch(() => ({}));
      if (data.error) {
        console.log(`   Error: ${data.error}`);
      }
      
    } catch (error) {
      console.log(`   ❌ FAIL - ${error.message}`);
    }
    
    console.log(''); // Empty line between tests
  }
}

// Run the tests
testDeployment().catch(console.error);
