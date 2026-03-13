#!/usr/bin/env node

/**
 * Script to generate PWA icons from SVG
 * 
 * Prerequisites:
 *   npm install -g sharp
 * 
 * Usage:
 *   node scripts/generate-icons.js
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const ICONS_DIR = path.join(__dirname, '..', 'frontend', 'icons');
const SVG_FILE = path.join(ICONS_DIR, 'icon.svg');

const SIZES = [
    { name: 'icon-72x72.png', size: 72 },
    { name: 'icon-96x96.png', size: 96 },
    { name: 'icon-128x128.png', size: 128 },
    { name: 'icon-144x144.png', size: 144 },
    { name: 'icon-152x152.png', size: 152 },
    { name: 'icon-192x192.png', size: 192 },
    { name: 'icon-384x384.png', size: 384 },
    { name: 'icon-512x512.png', size: 512 },
];

async function generateIcons() {
    console.log('========================================');
    console.log('GML Viaturas - Icon Generator');
    console.log('========================================');
    console.log('');

    // Check if sharp is installed
    try {
        require.resolve('sharp');
    } catch (e) {
        console.error('Error: sharp is not installed.');
        console.log('Please install it with: npm install -g sharp');
        process.exit(1);
    }

    // Check if SVG exists
    if (!fs.existsSync(SVG_FILE)) {
        console.error(`Error: SVG file not found at ${SVG_FILE}`);
        process.exit(1);
    }

    console.log(`Generating icons from: ${SVG_FILE}`);
    console.log('');

    const svgBuffer = fs.readFileSync(SVG_FILE);

    for (const { name, size } of SIZES) {
        const outputPath = path.join(ICONS_DIR, name);

        try {
            await sharp(svgBuffer)
                .resize(size, size)
                .png()
                .toFile(outputPath);

            console.log(`✓ Generated: ${name} (${size}x${size})`);
        } catch (err) {
            console.error(`✗ Failed to generate ${name}:`, err.message);
        }
    }

    console.log('');
    console.log('========================================');
    console.log('Icon generation complete!');
    console.log('========================================');
}

generateIcons().catch(console.error);
