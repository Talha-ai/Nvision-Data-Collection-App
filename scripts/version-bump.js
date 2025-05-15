const fs = require('fs');
const path = require('path');

// Get the version type from command line arguments
const versionType = process.argv[2] || 'patch'; // Default to patch if no argument provided

// Read package.json
const packagePath = path.join(__dirname, '..', 'package.json');
const package = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

// Split version into parts
const [major, minor, patch] = package.version.split('.').map(Number);

let newVersion;
switch (versionType.toLowerCase()) {
  case 'major':
    newVersion = `${major + 1}.0.0`;
    break;
  case 'minor':
    newVersion = `${major}.${minor + 1}.0`;
    break;
  case 'patch':
    newVersion = `${major}.${minor}.${patch + 1}`;
    break;
  default:
    console.error('Invalid version type. Use: major, minor, or patch');
    process.exit(1);
}

  // Update version in package.json
  package.version = newVersion;
  fs.writeFileSync(packagePath, JSON.stringify(package, null, 2) + '\n');

  // Create version-specific build directory
  const buildDir = path.join(__dirname, '..', 'dist_electron', newVersion);
  if (!fs.existsSync(buildDir)) {
    fs.mkdirSync(buildDir, { recursive: true });
  }

console.log(`Version bumped to ${newVersion}`);
console.log(`Build directory created at: ${buildDir}`); 