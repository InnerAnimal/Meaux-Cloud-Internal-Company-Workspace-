# 🚀 Simple Deploy Guide - Meaux Access Dashboard

## Option 1: Deploy via GitHub + Vercel (RECOMMENDED - Easiest!)

### Step 1: Create Fresh GitHub Repo

1. Go to: https://github.com/new
2. Repository name: `meaux-access-dashboard` (or any name you want)
3. Description: "Internal team workspace for Meauxbility"
4. Make it **Private** (important - internal workspace!)
5. **DON'T** initialize with README, .gitignore, or license
6. Click **"Create repository"**

### Step 2: Push Your Code to GitHub

Open terminal and run:

```bash
cd ~/Desktop/inneranimal-platform-setup/meaux-access-app

# Initialize git (if not already done)
git init

# Add all files
git add .

# Create first commit
git commit -m "Initial commit: Meaux Access Dashboard"

# Add your GitHub repo (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/meaux-access-dashboard.git

# Push to GitHub
git branch -M main
git push -u origin main
```

**Note:** You'll need to authenticate with GitHub (use a personal access token if prompted)

### Step 3: Deploy to Vercel

1. Go to: https://vercel.com/new
2. Click **"Import Git Repository"**
3. Find and select your `meaux-access-dashboard` repo
4. Click **"Import"**

### Step 4: Configure Vercel Project

**Project Settings:**
- Framework Preset: **Next.js** (auto-detected)
- Root Directory: `./` (default)
- Build Command: `npm run build` (default)
- Output Directory: `.next` (default)
- Install Command: `npm install` (default)

**Environment Variables:**
Click **"Environment Variables"** and add ALL of these (copy from your `.env.local`):

```
NEXT_PUBLIC_SUPABASE_URL=https://ghiulqoqujsiofsjcrqk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdoaXVscW9xdWpzaW9mc2pjcnFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA5NjAwOTAsImV4cCI6MjA3NjUzNjA5MH0.gJc7lCi9JMVhNAdon44Zuq5hT15EVM3Oyi-iszfJWSA
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdoaXVscW9xdWpzaW9mc2pjcnFrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDk2MDA5MCwiZXhwIjoyMDc2NTM2MDkwfQ.kk2kiNNoUkeF6wNeNcL1a6Nuwr7vcbbdVQrrrlkX4J4
SUPABASE_JWT_SECRET=nhw9k1T0CYn2r7YZ9HCr9I9m5ZFq0guTYvvOIh3T9ksIoT9xJb2+AbnmSq/RGg2qmf7HV89vpYHAPD6I//ixew==
CLOUDFLARE_ACCOUNT_ID=e8d0359c2ad85845814f446f4dd174ea
CLOUDFLARE_API_TOKEN=FCYx1bfM_5Tb3KSgGcSbVH0ArbbMGVo0DPGrSekI
CLOUDFLARE_R2_ACCESS_KEY_ID=NEED_TO_GENERATE
CLOUDFLARE_R2_SECRET_ACCESS_KEY=NEED_TO_GENERATE
R2_BUCKET_NAME=meauxxx-assets
R2_PUBLIC_URL=https://assets.meauxxx.com
VERCEL_TOKEN=vck_4BMqveAjanteOohRofOoWnyHnqi98PGVhUM9a64k62GRZKGdgP35Slto
VERCEL_PROJECT_ID=prj_Peb8D5XxpVWr7lC1UqqTz4WDgFqh
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_51SJPjpK5HnR8nkDr2uGDyZvrezAHxAjP8v2pn06ItWk7xUG86aWX72VcMA5S9irhqwDWjH7YSixa4QfD8uruEx88003bSI91TX
STRIPE_SECRET_KEY=***ADD_IN_VERCEL_DASHBOARD***
STRIPE_WEBHOOK_SECRET=whsec_ac1Pc6tHKMtr0THF6MDBgmybnQUOI9Uk
OPENAI_API_KEY=***ADD_IN_VERCEL_DASHBOARD***
ANTHROPIC_API_KEY=***ADD_IN_VERCEL_DASHBOARD***
GITHUB_TOKEN=***ADD_IN_VERCEL_DASHBOARD***
GITHUB_CONNOR_TOKEN=***ADD_IN_VERCEL_DASHBOARD***
NEXTAUTH_SECRET=d8f7a6e5c4b3a2918273645f5e4d3c2b1a09876543210fedcba9876543210fed
NEXTAUTH_URL=https://meauxxx.com
RESEND_API_KEY=re_U183DFLM_qBKzcYhN2KXEvJf3z8e59ifQ
VAULT_ENCRYPTION_KEY=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
NEXT_PUBLIC_APP_URL=https://meauxxx.com
NODE_ENV=production
```

**Important:** 
- For each variable, select **"Production"**, **"Preview"**, and **"Development"** environments
- **DON'T** add the R2 keys yet (you'll add them after generating them)

### Step 5: Deploy!

1. Click **"Deploy"**
2. Vercel will build your app (this might take 2-3 minutes)
3. **Vercel's build environment should fix the Tailwind issue automatically!**

### Step 6: After First Deploy

1. **Generate R2 Keys:**
   - Go to Cloudflare Dashboard > R2
   - Create bucket `meauxxx-assets`
   - Create API token
   - Copy the keys

2. **Add R2 Keys to Vercel:**
   - Go to your Vercel project > Settings > Environment Variables
   - Add `CLOUDFLARE_R2_ACCESS_KEY_ID` and `CLOUDFLARE_R2_SECRET_ACCESS_KEY`
   - Redeploy

3. **Set Up Supabase:**
   - Create 4 users in Supabase Auth
   - Run the SQL schema
   - Test login!

---

## Option 2: Vercel CLI (Alternative)

If you prefer command line:

```bash
cd ~/Desktop/inneranimal-platform-setup/meaux-access-app
npm i -g vercel
vercel login
vercel
```

Follow the prompts, then add environment variables in Vercel dashboard.

---

## 🎯 Recommended: Option 1 (GitHub + Vercel)

**Why?**
- ✅ Vercel's build environment fixes Tailwind automatically
- ✅ Automatic deployments on git push
- ✅ Easy to manage environment variables
- ✅ Free hosting
- ✅ Custom domain support

**Time needed:** ~10 minutes

---

## ⚠️ Before You Deploy

Make sure you have:
1. ✅ All code files (we have them!)
2. ⚠️ R2 keys (generate after first deploy)
3. ⚠️ Supabase users created (do this before testing login)

---

## 🆘 Troubleshooting

**Build fails?**
- Check Vercel build logs
- Make sure all environment variables are added
- Tailwind should work automatically in Vercel's environment

**Can't push to GitHub?**
- Make sure you're authenticated
- Use a Personal Access Token if needed
- Check you have write access to the repo

**Need help?**
- Check Vercel logs: Project > Deployments > Click deployment > View logs
- Check GitHub Actions (if enabled)

