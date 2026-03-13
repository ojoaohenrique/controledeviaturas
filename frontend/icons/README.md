# App Icons

This directory contains the PWA icons for the GML Controle de Viaturas application.

## Required Icon Sizes

The following icon sizes are needed for full PWA support:

- `icon-72x72.png` - Android launcher
- `icon-96x96.png` - Android launcher
- `icon-128x128.png` - Chrome Web Store
- `icon-144x144.png` - Microsoft Store
- `icon-152x152.png` - iPad
- `icon-192x192.png` - Android/iOS home screen
- `icon-384x384.png` - Android splash screen
- `icon-512x512.png` - Android splash screen, Microsoft Store

## Generating Icons from SVG

The `icon.svg` file in this directory can be used to generate all PNG icons.

### Option 1: Using Node.js and sharp (Recommended)

```bash
npm install -g sharp-cli

# Generate all sizes
sharp icon.svg --resize 72x72 --output icon-72x72.png
sharp icon.svg --resize 96x96 --output icon-96x96.png
sharp icon.svg --resize 128x128 --output icon-128x128.png
sharp icon.svg --resize 144x144 --output icon-144x144.png
sharp icon.svg --resize 152x152 --output icon-152x152.png
sharp icon.svg --resize 192x192 --output icon-192x192.png
sharp icon.svg --resize 384x384 --output icon-384x384.png
sharp icon.svg --resize 512x512 --output icon-512x512.png
```

### Option 2: Using Online Tools

1. Go to [PWA Asset Generator](https://pwa-asset-generator.nicepkg.cn/) or similar
2. Upload the `icon.svg` file
3. Download the generated icons
4. Place them in this directory

### Option 3: Using Figma or Design Tools

1. Open `icon.svg` in Figma, Adobe Illustrator, or Inkscape
2. Export at each required size
3. Save as PNG with transparency

## Icon Design Guidelines

- **Primary Color**: `#0056b3` (Blue)
- **Background**: White shield with blue car
- **Format**: PNG with transparency for all icons
- **Purpose**: Use `any maskable` for adaptive icons on Android

## Testing Icons

After generating icons, test them using:

1. **Chrome DevTools**: Application > Manifest
2. **Lighthouse**: Run PWA audit
3. **Real devices**: Install on Android/iOS to verify icons appear correctly
