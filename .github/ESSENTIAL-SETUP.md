# 🚀 Essential GitHub Apps Setup Guide

This guide will help you set up the 4 essential GitHub apps for your repository.

## ✅ Quick Checklist

- [ ] Enable Dependabot alerts
- [ ] Enable CodeQL scanning
- [ ] Set up GitHub Actions CI/CD
- [ ] Connect Vercel GitHub app

---

## 1. Enable Dependabot 🔒

### Automatic Setup (Recommended)
✅ **Already configured!** The `.github/dependabot.yml` file is in place.

### Manual Enable (If needed)
1. Go to your repository on GitHub
2. Click **Settings** → **Security** → **Code security and analysis**
3. Under **Dependabot alerts**, click **Enable**
4. Under **Dependabot security updates**, click **Enable**

### What This Does
- ✅ Automatically creates PRs for dependency updates
- ✅ Alerts you to security vulnerabilities
- ✅ Runs weekly on Mondays at 9 AM
- ✅ Groups updates by production/development dependencies

---

## 2. Enable CodeQL Security Scanning 🔍

### Automatic Setup (Recommended)
✅ **Already configured!** The `.github/codeql.yml` workflow is in place.

### Manual Enable
1. Go to your repository on GitHub
2. Click **Settings** → **Security** → **Code security and analysis**
3. Under **Code scanning**, click **Set up** next to CodeQL analysis
4. Select **Set up this workflow** → Choose **JavaScript/TypeScript**
5. Commit the workflow file

### What This Does
- ✅ Scans code for security vulnerabilities
- ✅ Runs on every push and PR
- ✅ Weekly scheduled scans
- ✅ Free for public and private repos

---

## 3. GitHub Actions CI/CD 🤖

### Automatic Setup (Recommended)
✅ **Already configured!** The `.github/workflows/ci.yml` file is in place.

### What It Does
- ✅ Runs linting on every PR
- ✅ Type checks TypeScript code
- ✅ Builds the Next.js app
- ✅ Prevents merging broken code

### View Results
- Go to **Actions** tab in GitHub
- See green checkmarks ✅ or red X ❌ for each workflow run

---

## 4. Connect Vercel ⚡

### Step 1: Install Vercel GitHub App
1. Go to: https://github.com/apps/vercel
2. Click **Install**
3. Select **InnerAnimal** organization
4. Choose repositories:
   - ✅ `Meaux-Cloud-Internal-Company-Workspace-`
   - ✅ Any other repos you want to deploy
5. Click **Install**

### Step 2: Configure Vercel Project
1. Go to: https://vercel.com/dashboard
2. Click **Add New** → **Project**
3. Import your GitHub repository
4. Vercel will auto-detect Next.js settings
5. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `STRIPE_SECRET_KEY`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - `RESEND_API_KEY`
   - (Add all other required variables)

### Step 3: Deploy
1. Click **Deploy**
2. Vercel will build and deploy automatically
3. Every push to `main` will trigger a new deployment
4. Pull requests get preview deployments automatically

### What This Does
- ✅ Auto-deploys on push to main
- ✅ Creates preview deployments for PRs
- ✅ Manages environment variables
- ✅ Provides build logs and analytics

---

## Verification Steps

### 1. Check Dependabot
```bash
# Go to GitHub → Insights → Dependency graph
# You should see dependencies listed
```

### 2. Check CodeQL
```bash
# Go to GitHub → Security → Code scanning alerts
# After first scan, you'll see results here
```

### 3. Check GitHub Actions
```bash
# Go to GitHub → Actions tab
# You should see CI workflow runs
```

### 4. Check Vercel
```bash
# Go to Vercel dashboard
# Your project should be listed and deploying
```

---

## Troubleshooting

### Dependabot Not Creating PRs
- Check `.github/dependabot.yml` exists
- Verify Dependabot is enabled in Settings → Security
- Wait for next scheduled run (Mondays at 9 AM)

### CodeQL Not Running
- Check `.github/codeql.yml` exists
- Verify CodeQL is enabled in Settings → Security
- Check Actions tab for workflow runs

### GitHub Actions Failing
- Check `.github/workflows/ci.yml` syntax
- Verify Node.js version matches your project
- Check Actions tab for error messages

### Vercel Not Deploying
- Verify Vercel GitHub app is installed
- Check Vercel dashboard for project status
- Verify environment variables are set
- Check Vercel build logs for errors

---

## Next Steps

After setting up these essentials:

1. **Set up project management** → Install Linear or Zenhub
2. **Add error tracking** → Install Sentry
3. **Set up team notifications** → Install Slack/Discord integration

See `docs/GITHUB-APPS-RECOMMENDATIONS.md` for more apps.

---

## Support

If you run into issues:
- Check GitHub Actions logs
- Review Vercel deployment logs
- Check repository Settings → Security
- See full guide: `docs/GITHUB-APPS-RECOMMENDATIONS.md`

---

**Last Updated:** November 2024

