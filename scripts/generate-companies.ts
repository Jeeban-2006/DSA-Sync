import fs from 'fs';
import path from 'path';

function generateCompaniesList() {
  const sourceDir = path.join(process.cwd(), 'leetcode-companywise-interview-questions-master');
  const targetDir = path.join(process.cwd(), 'public', 'data');
  const targetFile = path.join(targetDir, 'companies.json');

  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  if (!fs.existsSync(sourceDir)) {
    console.error('Source directory not found:', sourceDir);
    return;
  }

  const entries = fs.readdirSync(sourceDir, { withFileTypes: true });
  
  const companies = entries
    .filter(entry => entry.isDirectory() && !entry.name.startsWith('.'))
    .map(entry => {
      // Convert slug back to a human-readable name roughly (e.g. "american-express" -> "American Express")
      const name = entry.name
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      return {
        slug: entry.name,
        name: name,
      };
    })
    // Sort alphabetically
    .sort((a, b) => a.name.localeCompare(b.name));

  fs.writeFileSync(targetFile, JSON.stringify(companies, null, 2), 'utf-8');
  console.log(`Generated companies.json with ${companies.length} companies.`);
}

generateCompaniesList();
