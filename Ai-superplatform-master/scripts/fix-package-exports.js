const fs = require('fs');
const path = require('path');

const packagesDir = path.join(__dirname, '..', 'packages');
const packages = fs.readdirSync(packagesDir);

packages.forEach(packageName => {
  const packagePath = path.join(packagesDir, packageName);
  const packageJsonPath = path.join(packagePath, 'package.json');
  
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    // Fix exports order if it exists
    if (packageJson.exports && packageJson.exports['.']) {
      const exports = packageJson.exports['.'];
      
      // Reorder exports with types first
      const newExports = {};
      if (exports.types) newExports.types = exports.types;
      if (exports.import) newExports.import = exports.import;
      if (exports.require) newExports.require = exports.require;
      
      packageJson.exports['.'] = newExports;
      
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
      console.log(`Fixed exports order for ${packageName}`);
    }
  }
});

console.log('Finished fixing package exports');