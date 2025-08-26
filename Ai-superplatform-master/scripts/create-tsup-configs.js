const fs = require('fs');
const path = require('path');

const tsupConfig = `import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
  external: ['react', 'react-dom'],
});`;

const packagesDir = path.join(__dirname, '..', 'packages');
const packages = fs.readdirSync(packagesDir);

packages.forEach(packageName => {
  const packagePath = path.join(packagesDir, packageName);
  const packageJsonPath = path.join(packagePath, 'package.json');
  const tsupConfigPath = path.join(packagePath, 'tsup.config.ts');
  const srcPath = path.join(packagePath, 'src');
  const indexPath = path.join(srcPath, 'index.ts');
  
  // Check if package.json exists and has tsup in dev script
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    if (packageJson.scripts && packageJson.scripts.dev && packageJson.scripts.dev.includes('tsup')) {
      // Check if tsup.config.ts already exists
      if (!fs.existsSync(tsupConfigPath)) {
        // Check if src/index.ts exists
        if (fs.existsSync(indexPath)) {
          fs.writeFileSync(tsupConfigPath, tsupConfig);
          console.log(`Created tsup.config.ts for ${packageName}`);
        } else {
          console.log(`Skipping ${packageName}: no src/index.ts found`);
        }
      } else {
        console.log(`Skipping ${packageName}: tsup.config.ts already exists`);
      }
    }
  }
});

console.log('Finished creating tsup configurations');