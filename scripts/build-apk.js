#!/usr/bin/env node

/**
 * Script to build Android APK from PWA using Bubblewrap
 * 
 * Prerequisites:
 * - Node.js 16+
 * - Java JDK 8 or higher
 * - Android SDK
 * 
 * Usage:
 *   node scripts/build-apk.js [URL]
 * 
 * Example:
 *   node scripts/build-apk.js https://gml-viaturas.vercel.app
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const URL = process.argv[2] || 'https://your-site.vercel.app';
const PACKAGE_NAME = 'com.gml.viaturas';
const APP_NAME = 'GML Viaturas';

console.log('========================================');
console.log('GML Viaturas - APK Builder');
console.log('========================================');
console.log('');

// Check if bubblewrap is installed
function checkBubblewrap() {
    try {
        execSync('bubblewrap --version', { stdio: 'ignore' });
        return true;
    } catch (e) {
        return false;
    }
}

// Install bubblewrap if not present
function installBubblewrap() {
    console.log('Installing Bubblewrap...');
    try {
        execSync('npm install -g @bubblewrap/cli', { stdio: 'inherit' });
        console.log('Bubblewrap installed successfully!');
    } catch (e) {
        console.error('Failed to install Bubblewrap:', e.message);
        process.exit(1);
    }
}

// Initialize the TWA project
function initTWA() {
    console.log(`Initializing TWA project for ${URL}...`);

    const buildDir = path.join(__dirname, '..', 'android-build');

    if (!fs.existsSync(buildDir)) {
        fs.mkdirSync(buildDir, { recursive: true });
    }

    process.chdir(buildDir);

    try {
        // Initialize with manifest
        execSync(`bubblewrap init --manifest ${URL}/manifest.json --package ${PACKAGE_NAME} --name "${APP_NAME}"`, {
            stdio: 'inherit'
        });
        console.log('TWA project initialized!');
    } catch (e) {
        console.error('Failed to initialize TWA:', e.message);
        process.exit(1);
    }
}

// Build the APK
function buildAPK() {
    console.log('Building APK...');

    try {
        execSync('bubblewrap build', { stdio: 'inherit' });
        console.log('');
        console.log('========================================');
        console.log('Build completed successfully!');
        console.log('========================================');
        console.log('');
        console.log('APK location: android-build/app/build/outputs/apk/release/');
        console.log('');
        console.log('Next steps:');
        console.log('1. Test the APK on an Android device');
        console.log('2. Sign the APK for Play Store distribution');
        console.log('3. Update assetlinks.json with your certificate fingerprint');
    } catch (e) {
        console.error('Build failed:', e.message);
        process.exit(1);
    }
}

// Main execution
console.log('Checking prerequisites...');

if (!checkBubblewrap()) {
    console.log('Bubblewrap not found.');
    installBubblewrap();
}

console.log('');
console.log(`Building APK for: ${URL}`);
console.log(`Package name: ${PACKAGE_NAME}`);
console.log('');

initTWA();
buildAPK();
