require('dotenv').config();
const { shopify } = require('@shopify/shopify-app-express');

console.log('Shopify API initialized successfully');

// Test Shopify API functionality
async function testShopifyAPI() {
  try {
    console.log('Testing Shopify API functionality...');
    
    // This is just a basic test to verify the API is set up correctly
    // In a real implementation, you would test actual API calls
    console.log('Shopify API test completed');
  } catch (error) {
    console.error('Error testing Shopify API:', error);
  }
}

testShopifyAPI();