#!/usr/bin/env node

const { join } = require('path');
const { spawnSync } = require('child_process');
const { existsSync } = require('fs');

// Get the correct binary extension based on platform
const getBinaryExtension = () => {
  return process.platform === 'win32' ? '.exe' : '';
};

// Get the path to the forge binary in the same directory as this script
const forgeBinaryPath = join(__dirname, 'forge' + getBinaryExtension());

// Check if the binary exists
if (!existsSync(forgeBinaryPath)) {
  console.error(`❌ Forge binary not found at: ${forgeBinaryPath}`);
  console.error('Please try reinstalling the package with: npm install -g @antinomyhq/forge');
  console.error(`System information: ${process.platform} (${process.arch})`);
  process.exit(1);
}

// Execute the binary with the same arguments
const result = spawnSync(forgeBinaryPath, process.argv.slice(2), { 
  stdio: 'inherit',
  shell: process.platform === 'win32' // Use shell on Windows
});

// Exit with the same code as the binary
process.exit(result.status);