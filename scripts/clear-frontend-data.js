const fs = require('fs');
const path = require('path');

// Clear common frontend cache/storage locations
function clearFrontendData() {
  console.log('Clearing frontend data...');
  
  // Clear Next.js cache
  const nextDir = path.join(process.cwd(), '.next');
  if (fs.existsSync(nextDir)) {
    try {
      fs.rmSync(nextDir, { recursive: true, force: true });
      console.log('Next.js cache cleared');
    } catch (error) {
      console.log('Could not clear Next.js cache:', error.message);
    }
  }
  
  // Clear build cache
  const buildDir = path.join(process.cwd(), 'build');
  if (fs.existsSync(buildDir)) {
    try {
      fs.rmSync(buildDir, { recursive: true, force: true });
      console.log('Build directory cleared');
    } catch (error) {
      console.log('Could not clear build directory:', error.message);
    }
  }
  
  // Clear node_modules/.cache
  const cacheDir = path.join(process.cwd(), 'node_modules', '.cache');
  if (fs.existsSync(cacheDir)) {
    try {
      fs.rmSync(cacheDir, { recursive: true, force: true });
      console.log('Node modules cache cleared');
    } catch (error) {
      console.log('Could not clear node modules cache:', error.message);
    }
  }
  
  console.log('\nFrontend data cleared!');
  console.log('Restart your development server to see changes.');
}

clearFrontendData();
