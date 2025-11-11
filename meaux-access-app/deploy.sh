#!/bin/bash

# Meaux Access Deployment Script
# Deploys to Vercel with proper configuration

set -e

echo "🚀 Meaux Access Deployment"
echo "=========================="
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "⚠️  Warning: .env.local not found"
    echo "   Copy .env.example to .env.local and configure your API keys"
    echo ""
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the project
echo "🔨 Building project..."
npm run build

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
vercel --prod

echo ""
echo "✅ Deployment complete!"
echo ""
echo "Next steps:"
echo "1. Configure your domain in Vercel dashboard"
echo "2. Set environment variables in Vercel"
echo "3. Test all integrations"
echo ""

