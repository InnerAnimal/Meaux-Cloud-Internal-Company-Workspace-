#!/bin/bash

# Script to create R2 API token via Cloudflare Dashboard
# This requires manual steps as the API token doesn't have R2 permissions

echo "🔑 R2 API Token Creation Guide"
echo "================================"
echo ""
echo "Since the MEAUXACCESS token doesn't have R2 permissions,"
echo "please create the R2 API token manually:"
echo ""
echo "1. Go to: https://dash.cloudflare.com/e8d0359c2ad85845814f446f4dd174ea/r2/overview"
echo ""
echo "2. Click 'Manage R2 API Tokens'"
echo ""
echo "3. Click 'Create API Token'"
echo ""
echo "4. Configure:"
echo "   - Name: meauxxx-r2-token"
echo "   - Permissions: Object Read & Write"
echo "   - TTL: Forever (or your preference)"
echo "   - Apply to bucket: meauxxx-assets"
echo ""
echo "5. Copy the Access Key ID and Secret Access Key"
echo ""
echo "6. Add to .env.local:"
echo "   CLOUDFLARE_R2_ACCESS_KEY_ID=your-access-key-id"
echo "   CLOUDFLARE_R2_SECRET_ACCESS_KEY=your-secret-access-key"
echo ""
echo "Note: The bucket 'meauxxx-assets' will be created automatically"
echo "      when you first upload a file, or create it manually in the dashboard."

