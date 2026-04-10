const fetch = require('node-fetch');

// Replace with your actual Resend API key
const API_KEY = 'your_resend_api_key_here';

async function testResendAPI() {
  try {
    console.log('Testing Resend API connection...');
    
    const response = await fetch('https://api.resend.com/domains', {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      }
    });

    const data = await response.json();
    
    console.log('Resend API Connection Test:');
    console.log('Status:', response.status === 200 ? 'SUCCESS' : 'FAILED');
    console.log('Response:', data);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testResendAPI();
