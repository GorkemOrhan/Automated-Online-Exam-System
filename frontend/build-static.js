const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Building static version for GitHub Pages...');

// Ensure .env.production exists with static mode enabled
const envContent = `
# Production environment settings

# Enable static mode (for GitHub Pages deployment)
NEXT_PUBLIC_STATIC_EXPORT=true

# Set a placeholder API URL (this won't be used in static mode)
NEXT_PUBLIC_API_URL=https://api-placeholder.example.com
`;

fs.writeFileSync(path.join(__dirname, '.env.production'), envContent.trim());
console.log('Created .env.production with static mode enabled');

// Run Next.js static export
try {
  console.log('Building Next.js static export...');
  execSync('npm run build && npm run export', { stdio: 'inherit' });
  
  // Create .nojekyll file to disable Jekyll processing on GitHub Pages
  fs.writeFileSync(path.join(__dirname, 'out', '.nojekyll'), '');
  console.log('Created .nojekyll file for GitHub Pages');
  
  console.log('Static build completed successfully!');
} catch (error) {
  console.error('Error during static build:', error);
  process.exit(1);
} 