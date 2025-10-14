// Environment Variables Verification Script
// Run this to check if your environment variables are properly configured

console.log('🔍 Checking Environment Variables...\n');

// Check required environment variables
const requiredVars = [
  'PERPLEXITY_API_KEY',
  'LLAMA_CLOUD_API_KEY',
  'NODE_ENV'
];

let allPresent = true;

requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    // Mask the API key for security
    const maskedValue = varName.includes('API_KEY') 
      ? `${value.substring(0, 8)}...${value.substring(value.length - 4)}`
      : value;
    console.log(`✅ ${varName}: ${maskedValue}`);
  } else {
    console.log(`❌ ${varName}: NOT SET`);
    allPresent = false;
  }
});

console.log('\n📊 Summary:');
if (allPresent) {
  console.log('✅ All required environment variables are set!');
  console.log('🚀 Your application should work correctly.');
} else {
  console.log('❌ Some environment variables are missing.');
  console.log('🔧 Please set the missing variables in your Netlify dashboard.');
}

console.log('\n📝 Next Steps:');
console.log('1. Set environment variables in Netlify dashboard');
console.log('2. Redeploy your application');
console.log('3. Test PDF upload and chat functionality');
