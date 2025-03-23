const fs = require('fs');
const path = require('path');

// Function to fix Windows path issues with symbolic links
function fixWindowsPathIssues() {
  console.log('Fixing Windows path issues for Next.js...');
  
  const nextDir = path.join(__dirname, '.next');
  
  // Check if .next directory exists
  if (!fs.existsSync(nextDir)) {
    console.log('.next directory does not exist, nothing to fix.');
    return;
  }
  
  const serverDir = path.join(nextDir, 'server');
  
  // Check if server directory exists
  if (!fs.existsSync(serverDir)) {
    console.log('server directory does not exist, nothing to fix.');
    return;
  }
  
  // Check for middleware-manifest.json
  const middlewareManifestPath = path.join(serverDir, 'middleware-manifest.json');
  if (fs.existsSync(middlewareManifestPath)) {
    try {
      // Read the file as a regular file (not a symlink)
      const content = fs.readFileSync(middlewareManifestPath, 'utf8');
      
      // Delete the file if it exists
      fs.unlinkSync(middlewareManifestPath);
      
      // Write it back as a regular file
      fs.writeFileSync(middlewareManifestPath, content, 'utf8');
      
      console.log('Fixed middleware-manifest.json');
    } catch (error) {
      console.error('Error fixing middleware-manifest.json:', error);
    }
  } else {
    console.log('middleware-manifest.json does not exist, nothing to fix.');
  }
  
  console.log('Path fixing completed.');
}

// Run the function
fixWindowsPathIssues(); 