#!/usr/bin/env node

const { platform, arch } = process;
const { join } = require('path');
const { chmodSync, copyFileSync, existsSync, mkdirSync } = require('fs');

// Map of supported platforms and architectures to binary names
const PLATFORMS = {
  'darwin': {
    'x64': 'forge-x86_64-apple-darwin',
    'arm64': 'forge-aarch64-apple-darwin'
  },
  'linux': {
    'x64': 'forge-x86_64-unknown-linux-gnu',
    'arm64': 'forge-aarch64-unknown-linux-gnu'
  },
  'win32': {
    'x64': 'forge-x86_64-pc-windows-msvc.exe',
    'arm64': 'forge-aarch64-pc-windows-msvc.exe'
  }
};

// Platform-specific binary extension
function getBinaryExtension() {
  return platform === 'win32' ? '.exe' : '';
}

// Install binary based on platform and architecture
function install() {
  // Check if platform and architecture are supported
  if (!PLATFORMS[platform] || !PLATFORMS[platform][arch]) {
    console.error(`❌ Unsupported platform/architecture: ${platform}/${arch}`);
    console.error('Supported platforms: macOS (x64, arm64), Linux (x64, arm64), Windows (x64, arm64)');
    process.exit(1);
  }

  const binaryName = PLATFORMS[platform][arch];
  const binaryPath = join(__dirname, 'bin', platform, arch, binaryName);
  const targetPath = join(__dirname, 'forge' + getBinaryExtension());

  // Check if binary exists
  if (!existsSync(binaryPath)) {
    console.error(`❌ Binary not found: ${binaryPath}`);
    process.exit(1);
  }

  try {
    // Copy binary to target location
    copyFileSync(binaryPath, targetPath);
    // Make binary executable (not needed on Windows)
    if (platform !== 'win32') {
      chmodSync(targetPath, '755');
    }
    console.log(`✅ Successfully installed forge for ${platform}/${arch}`);
  } catch (error) {
    console.error(`❌ Error installing binary: ${error.message}`);
    process.exit(1);
  }
}

// Run installation
install();