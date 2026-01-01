# JARVIS Android APK Generation Guide

This guide will help you create a standalone Android APK from your JARVIS PWA **completely free**.

## Prerequisites

Before we begin, ensure you have:
1. **Node.js** installed (version 14 or higher)
2. **Java Development Kit (JDK)** version 8 or higher
3. **Android SDK** (we'll install this via Bubblewrap if needed)

## Step 1: Install Bubblewrap

Bubblewrap is Google's official tool for converting PWAs to Android apps. Install it globally:

```bash
npm install -g @bubblewrap/cli
```

## Step 2: Verify Your Manifest

Your `manifest.json` must be properly configured. Ensure it has:
- Valid `start_url` (your website URL)
- Icons (at least 192x192 and 512x512)
- `display: "standalone"`
- Valid `name` and `short_name`

## Step 3: Initialize the TWA Project

Navigate to your project directory and run:

```bash
bubblewrap init --manifest=https://yourwebsite.com/manifest.json
```

**Note:** Replace `https://yourwebsite.com` with your actual website URL.

This will:
- Download your manifest
- Set up the Android project structure
- Create a `twa-manifest.json` configuration file

## Step 4: Build the APK

Once initialized, build the APK:

```bash
bubblewrap build
```

This command will:
- Generate a signing key (if this is your first build)
- Build the Android APK
- Output the APK file to `./app-release-signed.apk`

## Step 5: Test the APK

Install the APK on an Android device:

```bash
adb install app-release-signed.apk
```

Or manually transfer the APK file to your device and install it.

## Step 6: Distribute Your App

Since this is a free distribution, you can:
1. **Host on your website:** Upload the APK and provide a download link
2. **Email directly:** Send the APK file to users
3. **Free app stores:** Upload to F-Droid, APKPure, or similar platforms

## Troubleshooting

### "Android SDK not found"
Run `bubblewrap doctor` to check your environment and follow the prompts to install missing components.

### "Manifest not valid"
Ensure your website is hosted on HTTPS and the manifest.json is accessible.

### "Signing key errors"
Delete the existing key at `~/.bubblewrap/keystore` and rebuild to generate a new one.

## Next Steps

- Update your app: Simply run `bubblewrap build` again after making website changes
- Add custom splash screen: Edit the `twa-manifest.json` file
- Remove the URL bar: Set up Digital Asset Links (requires website file hosting)
