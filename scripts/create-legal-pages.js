const fs = require('fs');
const path = require('path');

const appDir = path.join(__dirname, '..', 'app');
const privacyDir = path.join(appDir, 'privacy');
const termsDir = path.join(appDir, 'terms');

console.log('🏗️  Creating legal pages directories...\n');

// Create directories
try {
  fs.mkdirSync(privacyDir, { recursive: true });
  console.log(`✅ Created privacy directory`);
} catch (err) {
  console.error(`❌ Error creating privacy directory: ${err.message}`);
  process.exit(1);
}

try {
  fs.mkdirSync(termsDir, { recursive: true });
  console.log(`✅ Created terms directory`);
} catch (err) {
  console.error(`❌ Error creating terms directory: ${err.message}`);
  process.exit(1);
}

// Verify
console.log('\n🔍 Verifying directories...');
if (fs.existsSync(privacyDir)) {
  console.log(`✅ Privacy directory verified: ${privacyDir}`);
} else {
  console.error(`❌ Privacy directory does NOT exist`);
  process.exit(1);
}

if (fs.existsSync(termsDir)) {
  console.log(`✅ Terms directory verified: ${termsDir}`);
} else {
  console.error(`❌ Terms directory does NOT exist`);
  process.exit(1);
}

console.log('\n✨ Directories created successfully!');
console.log(`📁 Privacy page: ${path.join(privacyDir, 'page.tsx')}`);
console.log(`📁 Terms page: ${path.join(termsDir, 'page.tsx')}`);
