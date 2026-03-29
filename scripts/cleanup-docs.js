const fs = require('fs');
const path = require('path');

// Files to delete (all MD files except README.md)
const filesToDelete = [
  'AI_API_REFERENCE.md',
  'AUTH_DEBUG_GUIDE.md',
  'CHANGELOG.md',
  'CONTRIBUTING.md',
  'DEPLOYMENT_GUIDE.md',
  'GROQ_AI_GUIDE.md',
  'IMPLEMENTATION_SUMMARY.md',
  'IMPORT_IMPLEMENTATION_SUMMARY.md',
  'IMPORT_QUICK_START.md',
  'IMPORT_SYSTEM_GUIDE.md',
  'IMPORT_TESTING_CHECKLIST.md',
  'LEETCODE_IMPORT_GUIDE.md',
  'NOTIFICATION_IMPLEMENTATION_SUMMARY.md',
  'NOTIFICATION_SYSTEM.md',
  'PRODUCTION_CHECKLIST.md',
  'PRODUCTION_READY.md',
  'PUSH_NOTIFICATIONS_SETUP.md',
  'QUICK_REFERENCE.md',
  'ROADMAP.md',
  'SEO_IMPLEMENTATION.md',
  'VERCEL_DEPLOYMENT_GUIDE.md',
  'VERCEL_ENV_VARIABLES.md'
];

// Directories to delete
const dirsToDelete = [
  'docs'
];

console.log('🗑️  Starting cleanup...\n');

// Delete files
let deletedFiles = 0;
filesToDelete.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`✅ Deleted: ${file}`);
      deletedFiles++;
    }
  } catch (error) {
    console.error(`❌ Error deleting ${file}:`, error.message);
  }
});

// Delete directories recursively
let deletedDirs = 0;
dirsToDelete.forEach(dir => {
  const dirPath = path.join(__dirname, '..', dir);
  try {
    if (fs.existsSync(dirPath)) {
      fs.rmSync(dirPath, { recursive: true, force: true });
      console.log(`✅ Deleted directory: ${dir}`);
      deletedDirs++;
    }
  } catch (error) {
    console.error(`❌ Error deleting ${dir}:`, error.message);
  }
});

console.log(`\n✨ Cleanup complete!`);
console.log(`📄 Files deleted: ${deletedFiles}`);
console.log(`📁 Directories deleted: ${deletedDirs}`);
console.log(`✅ README.md preserved`);
