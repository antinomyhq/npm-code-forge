#!/bin/bash
set -e

VERSION=$1

if [ -z "$VERSION" ]; then
    echo "Usage: ./update-package.sh <version>"
    exit 1
fi

# Update version in package.json
npm version $VERSION --no-git-tag-version

# Create bin directories if they don't exist
mkdir -p bin/darwin/arm64
mkdir -p bin/darwin/x64
mkdir -p bin/linux/arm64
mkdir -p bin/linux/x64
mkdir -p bin/win32/arm64
mkdir -p bin/win32/x64

# Download binaries from GitHub release
echo "Downloading binaries for version $VERSION..."

# macOS
curl -L "https://github.com/antinomyhq/forge/releases/download/$VERSION/forge-aarch64-apple-darwin" -o bin/darwin/arm64/forge-aarch64-apple-darwin
curl -L "https://github.com/antinomyhq/forge/releases/download/$VERSION/forge-x86_64-apple-darwin" -o bin/darwin/x64/forge-x86_64-apple-darwin

# Linux
curl -L "https://github.com/antinomyhq/forge/releases/download/$VERSION/forge-aarch64-unknown-linux-gnu" -o bin/linux/arm64/forge-aarch64-unknown-linux-gnu
curl -L "https://github.com/antinomyhq/forge/releases/download/$VERSION/forge-x86_64-unknown-linux-gnu" -o bin/linux/x64/forge-x86_64-unknown-linux-gnu

# Windows
curl -L "https://github.com/antinomyhq/forge/releases/download/$VERSION/forge-aarch64-pc-windows-msvc.exe" -o bin/win32/arm64/forge-aarch64-pc-windows-msvc.exe
curl -L "https://github.com/antinomyhq/forge/releases/download/$VERSION/forge-x86_64-pc-windows-msvc.exe" -o bin/win32/x64/forge-x86_64-pc-windows-msvc.exe

# Make binaries executable
chmod +x bin/darwin/arm64/forge-aarch64-apple-darwin
chmod +x bin/darwin/x64/forge-x86_64-apple-darwin
chmod +x bin/linux/arm64/forge-aarch64-unknown-linux-gnu
chmod +x bin/linux/x64/forge-x86_64-unknown-linux-gnu

echo "Binaries downloaded and prepared for npm package"

# Publish to npm if NPM_TOKEN is available
if [ -n "$NPM_TOKEN" ]; then
    echo "//registry.npmjs.org/:_authToken=$NPM_TOKEN" > .npmrc
    npm publish
    rm .npmrc
    echo "Package published to npm"
else
    echo "NPM_TOKEN not set, skipping publish"
fi