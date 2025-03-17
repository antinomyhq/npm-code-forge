#!/usr/bin/env node

const { platform, arch } = process;
const { join } = require('path');
const { chmodSync, copyFileSync, existsSync } = require('fs');
const { spawnSync } = require('child_process');

// Detect libc type on Linux
function detectLibcType() {
  try {
    // Run ldd --version and check for musl
    const lddOutput = spawnSync('ldd', ['--version'], { encoding: 'utf8' }).stderr.toString() || 
                      spawnSync('ldd', ['--version'], { encoding: 'utf8' }).stdout.toString();
    
    return lddOutput.toLowerCase().includes('musl') ? 'musl' : 'gnu';
  } catch (error) {
    console.warn('Warning: Could not detect libc type, defaulting to glibc.');
    return 'gnu';
  }
}

// Map of supported platforms and architectures to binary names
const PLATFORMS = {
  'darwin': {
    'x64': 'forge-x86_64-apple-darwin',
    'arm64': 'forge-aarch64-apple-darwin'
  },
  'linux': {
    'x64': {
      'gnu': 'forge-x86_64-unknown-linux-gnu',
      'musl': 'forge-x86_64-unknown-linux-musl'
    },
    'arm64': {
      'gnu': 'forge-aarch64-unknown-linux-gnu',
      'musl': 'forge-aarch64-unknown-linux-musl'
    }
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
  // Check if platform is supported
  if (!PLATFORMS[platform]) {
    console.error(`❌ Unsupported platform: ${platform}`);
    console.error('Supported platforms: macOS, Linux, Windows');
    process.exit(1);
  }

  // Check if architecture is supported
  if (!PLATFORMS[platform][arch]) {
    console.error(`❌ Unsupported architecture: ${arch} for platform ${platform}`);
    console.error(`Supported architectures for ${platform}: ${Object.keys(PLATFORMS[platform]).join(', ')}`);
    process.exit(1);
  }

  let binaryName;
  let binaryPath;
  const targetPath = join(__dirname, 'forge' + getBinaryExtension());

  // Handle Linux specially for libc type
  if (platform === 'linux') {
    const libcType = detectLibcType();
    console.log(`🔍 Detected libc type: ${libcType}`);
    
    // Check if we have the binary for the detected libc type
    if (!PLATFORMS[platform][arch][libcType]) {
      console.error(`❌ Unsupported libc type: ${libcType} for ${platform}/${arch}`);
      console.error(`Supported libc types: ${Object.keys(PLATFORMS[platform][arch]).join(', ')}`);
      process.exit(1);
    }
    
    binaryName = PLATFORMS[platform][arch][libcType];
    binaryPath = join(__dirname, 'bin', platform, arch, binaryName);
    
    // If the preferred binary doesn't exist, try the alternative
    if (!existsSync(binaryPath)) {
      const alternativeLibc = libcType === 'gnu' ? 'musl' : 'gnu';
      const alternativeBinaryName = PLATFORMS[platform][arch][alternativeLibc];
      const alternativeBinaryPath = join(__dirname, 'bin', platform, arch, alternativeBinaryName);
      
      if (existsSync(alternativeBinaryPath)) {
        console.warn(`⚠️  Binary for ${libcType} not found, trying ${alternativeLibc} instead`);
        binaryName = alternativeBinaryName;
        binaryPath = alternativeBinaryPath;
      }
    }
  } else {
    binaryName = PLATFORMS[platform][arch];
    binaryPath = join(__dirname, 'bin', platform, arch, binaryName);
  }

  // Check if binary exists
  if (!existsSync(binaryPath)) {
    console.error(`❌ Binary not found: ${binaryPath}`);
    console.error('If this is a new architecture or platform, please check the repository for updates.');
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