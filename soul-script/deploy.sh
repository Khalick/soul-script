#!/bin/bash

echo "🚀 Soul Script - Vercel Deployment Script"
echo "=========================================="
echo ""

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

echo "✅ Vercel CLI ready!"
echo ""

# Test build first
echo "🔨 Testing production build..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo ""
else
    echo "❌ Build failed! Fix errors before deploying."
    exit 1
fi

echo "🌐 Deploying to Vercel..."
echo ""
echo "📝 You'll need these environment variables:"
echo "   - VITE_SUPABASE_URL"
echo "   - VITE_SUPABASE_ANON_KEY"
echo ""

# Deploy
vercel --prod

echo ""
echo "🎉 Deployment complete!"
echo ""
echo "📱 Next steps:"
echo "   1. Visit your deployed URL"
echo "   2. Test on mobile and install as PWA"
echo "   3. Check LAUNCH_CHECKLIST.md for testing"
echo ""
