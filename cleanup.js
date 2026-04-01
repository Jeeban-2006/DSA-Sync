const fs = require('fs');

const filesToDelete = [
  '00_READ_ME_FIRST.txt',
  'SETUP_OVERVIEW.txt',
  'create-pages.js',
  'create_dirs.bat',
  'create_dirs.py',
  'create_pages.py',
  'run-script.bat',
  'run_node_script.py',
  'setup-legal-pages.bat',
  'setup-legal-pages.js',
  'verify-dirs.js'
];

filesToDelete.forEach(file => {
  try {
    fs.unlinkSync(file);
    console.log(`✅ Deleted: ${file}`);
  } catch (e) {
    console.log(`⏭️  Skip: ${file} (not found)`);
  }
});

console.log('\n✨ Cleanup complete!');
