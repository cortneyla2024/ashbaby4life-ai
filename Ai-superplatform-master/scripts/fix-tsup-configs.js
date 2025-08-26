const fs = require('fs');
const path = require('path');

const tsupConfigContent = `import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: false, // Temporarily disable DTS generation
  clean: true,
  external: ['react', 'react-dom'],
});`;

const packagesDir = path.join(__dirname, '..', 'packages');
const packages = fs.readdirSync(packagesDir);

packages.forEach(packageName => {
  const packagePath = path.join(packagesDir, packageName);
  const tsupConfigPath = path.join(packagePath, 'tsup.config.ts');
  
  if (fs.existsSync(tsupConfigPath)) {
    fs.writeFileSync(tsupConfigPath, tsupConfigContent);
    console.log(`Updated tsup.config.ts for ${packageName}`);
  }
});

console.log('Finished updating tsup configurations');