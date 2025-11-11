# Meaux Access - Setup Instructions

## ⚠️ Current Status

The application structure is complete, but there are two issues to resolve:

1. **Tailwind CSS Installation** - Needs manual installation
2. **R2 API Keys** - Need to be generated manually

## 🔧 Fix Tailwind CSS

Run these commands:

```bash
cd ~/Desktop/inneranimal-platform-setup/meaux-access-app
rm -rf node_modules package-lock.json
npm install tailwindcss@3.4.18 postcss@8.5.6 autoprefixer@10.4.22 tailwindcss-animate@1.0.7 --save-dev
npm install
```

If that doesn't work, try:

```bash
npm cache clean --force
rm -rf node_modules package-lock.json .next
npm install
npm install -D tailwindcss@3.4.18 postcss autoprefixer tailwindcss-animate
```

## 🔑 Generate R2 API Keys

1. Go to: https://dash.cloudflare.com/e8d0359c2ad85845814f446f4dd174ea/r2/overview
2. Create bucket: `meauxxx-assets` (if it doesn't exist)
3. Click "Manage R2 API Tokens"
4. Create API Token:
   - Name: `meauxxx-r2-token`
   - Permissions: Object Read & Write
   - TTL: Forever
   - Apply to bucket: `meauxxx-assets`
5. Copy Access Key ID and Secret Access Key
6. Add to `.env.local`:
   ```
   CLOUDFLARE_R2_ACCESS_KEY_ID=your-access-key-id
   CLOUDFLARE_R2_SECRET_ACCESS_KEY=your-secret-access-key
   ```

## ✅ Test Build

After fixing Tailwind:

```bash
npm run build
```

If successful, start dev server:

```bash
npm run dev
```

Visit: http://localhost:3000

## 📝 Next Steps

1. Fix Tailwind installation (see above)
2. Generate R2 keys (see above)
3. Create Supabase users (4 team members)
4. Run Supabase SQL schema
5. Test login with team credentials
6. Deploy to Vercel

## 🐛 Troubleshooting

**Build fails with Tailwind error:**
- Ensure Tailwind v3.4.18 is installed (not v4)
- Check `node_modules/tailwindcss` exists
- Try `npm install` again

**Path alias errors (@/lib not found):**
- Check `tsconfig.json` has correct paths
- Restart dev server after changes

**R2 upload fails:**
- Verify R2 keys are in `.env.local`
- Check bucket name matches: `meauxxx-assets`
- Verify bucket exists in Cloudflare dashboard

