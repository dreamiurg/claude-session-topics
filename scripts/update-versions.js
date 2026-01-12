#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');

const version = process.argv[2];
if (!version) {
  console.error('Usage: node update-versions.js <version>');
  process.exit(1);
}

// Validate semver format (basic check)
const semverRegex = /^\d+\.\d+\.\d+(-[\w.]+)?(\+[\w.]+)?$/;
if (!semverRegex.test(version)) {
  console.error(`Error: Invalid version format "${version}". Expected semver (e.g., 1.2.3)`);
  process.exit(1);
}

console.log(`Updating version to ${version}`);

// Update plugin.json
const pluginJsonPath = path.join(__dirname, '..', '.claude-plugin', 'plugin.json');
const pluginJson = JSON.parse(fs.readFileSync(pluginJsonPath, 'utf8'));
pluginJson.version = version;
fs.writeFileSync(pluginJsonPath, `${JSON.stringify(pluginJson, null, 2)}\n`);
console.log(`✓ Updated ${pluginJsonPath}`);

// Update marketplace.json
const marketplaceJsonPath = path.join(__dirname, '..', '.claude-plugin', 'marketplace.json');
const marketplaceJson = JSON.parse(fs.readFileSync(marketplaceJsonPath, 'utf8'));
marketplaceJson.plugins[0].version = version;
fs.writeFileSync(marketplaceJsonPath, `${JSON.stringify(marketplaceJson, null, 2)}\n`);
console.log(`✓ Updated ${marketplaceJsonPath}`);

// Update package.json
const packageJsonPath = path.join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
packageJson.version = version;
fs.writeFileSync(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`);
console.log(`✓ Updated ${packageJsonPath}`);

console.log(`\nAll versions updated to ${version}`);
