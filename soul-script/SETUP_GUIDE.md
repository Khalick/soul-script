# Soul Script - Complete Setup Guide

This guide will walk you through setting up Soul Script from scratch, including Supabase configuration and deployment options.

## Table of Contents
1. [Local Development Setup](#local-development-setup)
2. [Supabase Configuration](#supabase-configuration)
3. [Environment Variables](#environment-variables)
4. [Running the Application](#running-the-application)
5. [Building for Production](#building-for-production)
6. [Deployment Options](#deployment-options)
7. [Converting to Mobile APK](#converting-to-mobile-apk)
8. [Troubleshooting](#troubleshooting)

## Local Development Setup

### 1. Prerequisites
Ensure you have the following installed:
- **Node.js**: Version 18.19.1 or higher (20+ recommended)
- **npm**: Version 9.2.0 or higher
- **Git**: For version control

### 2. Install Dependencies
```bash
cd soul-script
npm install
```

This will install all required packages including:
- React & React DOM
- TypeScript
- Tailwind CSS
- Supabase client
- Zustand (state management)
- Lucide React (icons)
- date-fns (date utilities)
- Vite PWA plugin

## Supabase Configuration

### 1. Create a Supabase Account
1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign up with GitHub or email

### 2. Create a New Project
1. Click "New Project"
2. Choose a project name (e.g., "soul-script")
3. Set a strong database password (save this!)
4. Select a region close to your users
5. Click "Create new project"
6. Wait 2-3 minutes for setup to complete

### 3. Set Up Database Schema

1. Go to **SQL Editor** in the left sidebar
2. Click **New Query**
3. Copy the entire contents of `supabase-schema.sql` from the project
4. Paste into the SQL editor
5. Click **Run** (bottom right)
6. You should see "Success. No rows returned"

This creates:
- Users table
- Journal entries table
- Media attachments table
- Emotional patterns table
- User settings table
- All necessary indexes
- Row Level Security policies
- Triggers and functions

### 4. Set Up Storage Buckets

#### Create journal-media bucket (private)
1. Go to **Storage** in the left sidebar
2. Click **New bucket**
3. Name: `journal-media`
4. Public bucket: **OFF** (unchecked)
5. Click **Create bucket**

#### Create avatars bucket (public)
1. Click **New bucket**
2. Name: `avatars`
3. Public bucket: **ON** (checked)
4. Click **Create bucket**

#### Set up storage policies
1. Click on `journal-media` bucket
2. Go to **Policies** tab
3. Click **New Policy**
4. Choose **Custom policy**

Add these three policies:

**Policy 1: Allow users to upload own media**
```sql
-- Policy name: Users can upload own media
-- Allowed operation: INSERT
CREATE POLICY "Users can upload own media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'journal-media' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

**Policy 2: Allow users to view own media**
```sql
-- Policy name: Users can view own media
-- Allowed operation: SELECT
CREATE POLICY "Users can view own media"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'journal-media' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

**Policy 3: Allow users to delete own media**
```sql
-- Policy name: Users can delete own media
-- Allowed operation: DELETE
CREATE POLICY "Users can delete own media"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'journal-media' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

### 5. Get API Credentials

1. Go to **Settings** (gear icon in left sidebar)
2. Click **API** in the settings menu
3. Copy the following:
   - **Project URL** (e.g., https://xxxxx.supabase.co)
   - **anon/public key** (under "Project API keys")

⚠️ **Important**: Keep these credentials secure! Never commit them to public repositories.

## Environment Variables

### 1. Create .env file
```bash
cp .env.example .env
```

### 2. Edit .env file
Open `.env` and add your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Replace:
- `your-project-id` with your actual Supabase project ID
- `your-anon-key-here` with your actual anon public key

### 3. Verify Configuration
The app will show a warning in the console if credentials are missing.

## Running the Application

### Development Mode
```bash
npm run dev
```

This starts the development server at `http://localhost:5173`

Features in dev mode:
- Hot Module Replacement (HMR)
- Fast refresh
- Source maps for debugging
- TypeScript type checking

### Test the Application

1. **Sign Up**
   - Navigate to http://localhost:5173
   - Click "Sign Up" tab
   - Enter name, email, and password
   - Click "Create Account"

2. **Create Your First Entry**
   - Click "New Entry" button
   - Select an emotion
   - Adjust intensity slider
   - Add optional tags
   - Click "Continue to Journal"
   - Write your thoughts
   - Upload photos/videos (optional)
   - Click "Save Entry"

3. **View Timeline**
   - Click the Calendar icon in the navigation
   - See your entries on the calendar
   - Click on a day to view entries

## Building for Production

### 1. Build the App
```bash
npm run build
```

This creates an optimized production build in the `dist` folder.

Build output includes:
- Minified JavaScript bundles
- Optimized CSS
- PWA manifest and service worker
- Compressed assets

### 2. Preview Production Build
```bash
npm run preview
```

Test the production build locally at `http://localhost:4173`

### 3. Build Output
The `dist` folder contains:
```
dist/
├── assets/          # JS, CSS, and other assets
├── index.html       # Main HTML file
├── manifest.json    # PWA manifest
└── sw.js           # Service worker
```

## Deployment Options

### Option 1: Vercel (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy**
   ```bash
   vercel
   ```

3. **Add Environment Variables**
   - Go to Vercel dashboard
   - Select your project
   - Settings > Environment Variables
   - Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

4. **Redeploy**
   ```bash
   vercel --prod
   ```

### Option 2: Netlify

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Build the app**
   ```bash
   npm run build
   ```

3. **Deploy**
   ```bash
   netlify deploy --prod --dir=dist
   ```

4. **Add Environment Variables**
   - Netlify dashboard > Site settings > Build & deploy > Environment
   - Add variables and redeploy

### Option 3: Cloudflare Pages

1. Go to Cloudflare dashboard
2. Pages > Create a project
3. Connect Git repository
4. Build settings:
   - Build command: `npm run build`
   - Build output directory: `dist`
5. Add environment variables
6. Deploy

### Option 4: Manual Hosting (Any Static Host)

1. Build the app: `npm run build`
2. Upload `dist` folder contents to your host
3. Configure environment variables on the host
4. Ensure your server serves `index.html` for all routes (SPA)

## Converting to Mobile APK

### Method 1: PWA Builder (Easiest - No Coding)

1. **Deploy your app** to a public URL (using Vercel, Netlify, etc.)

2. **Go to PWABuilder**
   - Visit [pwabuilder.com](https://www.pwabuilder.com/)
   - Enter your deployed app URL
   - Click "Start"

3. **Generate APK**
   - Click "Build My PWA"
   - Select "Android" platform
   - Click "Generate"
   - Download the APK package

4. **Install on Android**
   - Transfer APK to Android device
   - Enable "Install from unknown sources" in settings
   - Install the APK

### Method 2: Capacitor (Native Features)

```bash
# Install Capacitor
npm install @capacitor/core @capacitor/cli
npm install @capacitor/android

# Initialize Capacitor
npx cap init
# Enter app name: Soul Script
# Enter app ID: com.soulscript.app

# Build web assets
npm run build

# Add Android platform
npx cap add android

# Sync web code to Android
npx cap sync

# Open in Android Studio
npx cap open android
```

In Android Studio:
1. Wait for Gradle sync to complete
2. Build > Build Bundle(s) / APK(s) > Build APK(s)
3. Find APK in `android/app/build/outputs/apk/debug/`

### Method 3: Trusted Web Activity (Google Play Store)

```bash
# Install Bubblewrap
npm install -g @bubblewrap/cli

# Initialize TWA
bubblewrap init --manifest https://your-app-url.com/manifest.json

# Build APK
bubblewrap build

# Output: app-release-signed.apk
```

Upload to Google Play Console for distribution.

## Troubleshooting

### Issue: "Module not found" errors
**Solution**: 
```bash
rm -rf node_modules package-lock.json
npm install
```

### Issue: Tailwind styles not loading
**Solution**: 
1. Check `tailwind.config.js` content paths
2. Ensure `@tailwind` directives are in `src/index.css`
3. Restart dev server

### Issue: Supabase connection errors
**Solution**:
1. Verify `.env` file exists and has correct credentials
2. Check Supabase project is active (not paused)
3. Verify RLS policies are enabled
4. Check browser console for detailed error messages

### Issue: Can't upload media
**Solution**:
1. Verify storage buckets exist
2. Check storage policies are configured
3. Ensure file size is within limits
4. Check browser console for errors

### Issue: Authentication not working
**Solution**:
1. Check email confirmations are disabled in Supabase Auth settings
2. Verify Auth is enabled in Supabase project
3. Check browser cookies are enabled
4. Clear browser cache and try again

### Issue: APK install fails
**Solution**:
1. Enable "Install from unknown sources" on Android
2. Ensure APK is signed (for production)
3. Check Android version compatibility
4. Try reinstalling after uninstalling old version

## Performance Tips for 100k+ Users

1. **Enable Database Connection Pooling**
   - Supabase Pro plan includes this automatically
   - Configure in Supabase dashboard

2. **Implement Image Compression**
   ```bash
   npm install browser-image-compression
   ```
   Use before uploading photos

3. **Enable CDN**
   - Vercel and Netlify include CDN automatically
   - For custom hosting, use CloudFlare or AWS CloudFront

4. **Monitor Performance**
   - Use Supabase Dashboard metrics
   - Enable logging in production
   - Set up error tracking (Sentry)

5. **Optimize Database Queries**
   - Use pagination for large lists
   - Implement infinite scroll
   - Cache frequently accessed data

## Support & Resources

- **Supabase Docs**: https://supabase.com/docs
- **Vite Docs**: https://vitejs.dev
- **React Docs**: https://react.dev
- **Tailwind CSS**: https://tailwindcss.com

For project-specific questions, create an issue on GitHub.

---

**Happy Journaling! 💝**
