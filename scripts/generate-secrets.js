// Quick setup script to generate JWT secret
// Run: node scripts/generate-secrets.js

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

console.log('\n🔐 Generating secrets for DSA Sync...\n');

// Generate JWT secret
const jwtSecret = crypto.randomBytes(32).toString('hex');

console.log('✅ JWT Secret generated!');
console.log('Copy this to your .env.local file:\n');
console.log(`JWT_SECRET=${jwtSecret}\n`);

// Read current .env.local
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  let envContent = fs.readFileSync(envPath, 'utf8');
  
  // Replace placeholder JWT secret
  if (envContent.includes('your-super-secret-jwt-key-change-this-in-production')) {
    envContent = envContent.replace(
      /JWT_SECRET=.*/,
      `JWT_SECRET=${jwtSecret}`
    );
    
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Updated .env.local with new JWT secret!\n');
  }
}

console.log('📝 Next steps:');
console.log('1. Set up MongoDB:');
console.log('   - Option A: Install MongoDB locally');
console.log('   - Option B: Use MongoDB Atlas (free): https://www.mongodb.com/cloud/atlas');
console.log('\n2. Update MONGODB_URI in .env.local');
console.log('\n3. (Optional) Add GROQ_API_KEY for AI features from https://console.groq.com');
console.log('\n4. Restart the dev server\n');
