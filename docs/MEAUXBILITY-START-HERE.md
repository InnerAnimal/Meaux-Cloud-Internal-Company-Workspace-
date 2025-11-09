# 🚀 Meauxbility.org - Lightning Fast Deployment

## ⚡ Deploy in 2-4 Hours

Your Meauxbility.org web application with:
- ✅ 10+ pages (fully branded)
- ✅ Dual theme (light/dark mode)
- ✅ 501(c)(3) donation system
- ✅ AI-powered workflows for team/volunteers
- ✅ Real logins & secure vault
- ✅ Volunteer dashboard

## 🎯 Quick Start (3 Steps)

### Step 1: Run SQL Setup (5 min)

In Supabase SQL Editor, run:
```sql
-- Run this file:
schemas/meauxbility-setup.sql
```

This creates:
- Meauxbility organization
- Branding theme (dual mode)
- Donation product
- AI commands (/MG, /VA, /DR, etc.)
- Volunteer permissions

### Step 2: Run Deployment Script (30 min)

```bash
cd ~/Desktop/inneranimal-platform-setup/scripts
./meauxbility-quick-deploy.sh
```

This creates:
- Next.js app structure
- All 10+ pages
- Branding system
- Donation integration
- Volunteer dashboard

### Step 3: Configure & Deploy (1-2 hours)

1. **Get Organization ID:**
   ```sql
   SELECT id FROM organizations WHERE slug = 'meauxbility';
   ```

2. **Create `.env.local`:**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
   NEXT_PUBLIC_MEAUXBILITY_ORG_ID=<id-from-step-1>
   RESEND_API_KEY=your-resend-key
   STRIPE_SECRET_KEY=your-stripe-key
   ```

3. **Deploy to Vercel:**
   ```bash
   cd meauxbility-app
   vercel --prod
   ```

4. **Configure Cloudflare:**
   - Follow `docs/CLOUDFLARE-SETUP-GUIDE.md`
   - Point `meauxbility.org` to Vercel

## 📄 Pages Included

The script creates these pages (you fill in content):

1. **Home** (`/`) - Hero, mission, donation CTA
2. **About** (`/about`) - Organization story
3. **Programs** (`/programs`) - Grant programs
4. **Grants** (`/grants`) - Grant application info
5. **Donate** (`/donate`) - Donation form (Stripe)
6. **Stories** (`/stories`) - Recipient stories
7. **Volunteer** (`/volunteer`) - Volunteer signup
8. **Contact** (`/contact`) - Contact form
9. **Blog** (`/blog`) - Blog posts
10. **Resources** (`/resources`) - Resources library

## 🤖 AI Workflows for Team

Your team gets instant AI commands:

- **`/MG`** - Create mobility grant workflow
- **`/VA`** - Process volunteer application
- **`/DR`** - Generate donation receipt (tax-deductible)
- **`/GS`** - Check grant status
- **`/VR`** - Volunteer activity report

All accessible from volunteer dashboard!

## 🎨 Branding Features

- **Dual Theme**: Automatic light/dark mode
- **Meauxbility Colors**: 
  - Primary: Teal (#60DFDF)
  - Accent: Orange (#FF6B35)
- **Branded Components**: All components use Meauxbility theme
- **Responsive**: Mobile-first design

## 💰 501(c)(3) Features

- ✅ Tax-deductible donations
- ✅ Automatic receipt generation
- ✅ EIN tracking
- ✅ Donation reporting
- ✅ Recurring donations support

## 👥 Volunteer Features

- ✅ Real login system
- ✅ Secure credential vault
- ✅ AI workflow access
- ✅ Grant processing tools
- ✅ Activity tracking

## 🔐 Security

- ✅ 2FA for sensitive actions
- ✅ Encrypted credential storage
- ✅ Access logging
- ✅ Security alerts
- ✅ Exposure detection

## 📊 What You Get

### Database (Same Supabase Instance)
- Meauxbility organization
- Branding theme
- Donation products
- AI commands
- Volunteer permissions

### Application
- Next.js 14+ app
- 10+ page structure
- Donation system (Stripe)
- Volunteer dashboard
- AI workflow runner
- Branding system

### Deployment
- Vercel-ready
- Cloudflare DNS guide
- SSL/TLS configured
- Email (Resend) ready

## 🚀 Deployment Timeline

- **SQL Setup**: 5 minutes
- **App Creation**: 30 minutes
- **Content Fill**: 1-2 hours
- **Deploy**: 15 minutes
- **Total**: 2-4 hours

## 📚 Full Documentation

See `docs/MEAUXBILITY-QUICK-DEPLOY.md` for complete guide with:
- Detailed step-by-step
- Code examples
- Troubleshooting
- Post-deployment checklist

## ✅ Checklist

- [ ] Run `schemas/meauxbility-setup.sql`
- [ ] Run deployment script
- [ ] Get organization ID
- [ ] Configure `.env.local`
- [ ] Fill in page content
- [ ] Test donation flow
- [ ] Deploy to Vercel
- [ ] Configure Cloudflare DNS
- [ ] Test volunteer login
- [ ] Test AI workflows

## 🎉 You're Ready!

**Start now:**
```bash
cd ~/Desktop/inneranimal-platform-setup
# Read: docs/MEAUXBILITY-QUICK-DEPLOY.md
# Or run: scripts/meauxbility-quick-deploy.sh
```

**Meauxbility.org will be live in 2-4 hours!** 🚀

