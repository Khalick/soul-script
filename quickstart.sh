#!/bin/bash

# Soul Script - Quick Start Script
# This script helps you get started quickly

echo "🌟 Soul Script - Quick Start 🌟"
echo "================================"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  No .env file found!"
    echo "📝 Creating .env from template..."
    cp .env.example .env
    echo "✅ Created .env file"
    echo ""
    echo "⚠️  IMPORTANT: You need to edit .env and add your Supabase credentials!"
    echo "   1. Go to https://supabase.com"
    echo "   2. Create a project"
    echo "   3. Get your URL and anon key from Settings > API"
    echo "   4. Edit .env file with your credentials"
    echo ""
    read -p "Press Enter once you've added your Supabase credentials..."
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo "✅ Dependencies installed"
    echo ""
fi

# Check if Supabase credentials are set
if grep -q "your_supabase_url_here" .env 2>/dev/null; then
    echo "⚠️  WARNING: You still need to update your .env file with real Supabase credentials!"
    echo "   The app won't work without them."
    echo ""
fi

echo "🚀 Starting development server..."
echo ""
echo "The app will open at: http://localhost:5173"
echo ""
echo "📚 Quick Tips:"
echo "   - Sign up to create an account"
echo "   - Create your first emotional entry"
echo "   - Check the timeline to see your entries"
echo ""
echo "📖 Documentation:"
echo "   - README.md - Project overview"
echo "   - SETUP_GUIDE.md - Detailed setup"
echo "   - DEPLOYMENT.md - How to deploy"
echo ""
echo "Press Ctrl+C to stop the server"
echo "================================"
echo ""

npm run dev
