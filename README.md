# InnerAnimal Platform - Complete Setup Package

## 📦 What's Included

### Database Schemas (`schemas/`)
- `inneranimalmedia-supabase-schema.sql` - Base schema
- `inneranimalmedia-schema-extensions.sql` - Multi-tenancy, AI chats, branding
- `inneranimalmedia-security-vault-extensions.sql` - Security, vault, e-commerce
- `meauxbility-setup.sql` - Meauxbility.org quick setup (run after base schemas)

### Service Implementations (`services/`)
- `lib-resend-service.ts` - Email service
- `lib-security-vault-service.ts` - Vault & security service

### Documentation (`docs/`)
- `START-HERE.md` - Overview and quick start
- `QUICK-SETUP-GUIDE.md` - 30-minute setup guide
- `MEAUXBILITY-QUICK-DEPLOY.md` - **Meauxbility.org lightning deployment (2-4 hours)**
- `IMPLEMENTATION-ROADMAP.md` - 8-week implementation plan
- `CLOUDFLARE-SETUP-GUIDE.md` - Complete Cloudflare configuration
- `SECURITY-IMPLEMENTATION-GUIDE.md` - Security features guide
- `COMPLETE-SETUP-SUMMARY.md` - Complete overview
- `INNERANIMAL-SCHEMA-DOCUMENTATION.md` - Schema reference
- `INNERANIMAL-SCHEMA-QUICK-REFERENCE.md` - Quick SQL reference

## 🚀 Quick Start

1. **Read**: `docs/START-HERE.md`
2. **Follow**: `docs/QUICK-SETUP-GUIDE.md`
3. **Reference**: Other docs as needed

## 📋 Setup Order

1. Run schemas in Supabase (in order):
   - `schemas/inneranimalmedia-supabase-schema.sql`
   - `schemas/inneranimalmedia-schema-extensions.sql`
   - `schemas/inneranimalmedia-security-vault-extensions.sql`

2. Copy services to your Next.js project:
   - `services/lib-resend-service.ts` → `lib/resend/service.ts`
   - `services/lib-security-vault-service.ts` → `lib/security/vault-service.ts`

3. Follow documentation in `docs/` folder

## 🔐 Security Note

**IMPORTANT**: Generate and securely store your `VAULT_ENCRYPTION_KEY`:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 📚 Documentation Guide

- **New to this?** → Start with `START-HERE.md`
- **Ready to build?** → Follow `QUICK-SETUP-GUIDE.md`
- **🚀 Deploying Meauxbility.org?** → **See `MEAUXBILITY-QUICK-DEPLOY.md` (2-4 hour deploy!)**
- **Need roadmap?** → See `IMPLEMENTATION-ROADMAP.md`
- **Setting up Cloudflare?** → Read `CLOUDFLARE-SETUP-GUIDE.md`
- **Implementing security?** → Check `SECURITY-IMPLEMENTATION-GUIDE.md`
- **Need reference?** → Use schema documentation files

## 🎯 Quick Deploy: Meauxbility.org

**Want to deploy Meauxbility.org fast?** Use the automated script:

```bash
cd scripts
./meauxbility-quick-deploy.sh
```

Then:
1. Run `schemas/meauxbility-setup.sql` in Supabase
2. Configure `.env.local`
3. Deploy to Vercel

**Full guide**: `docs/MEAUXBILITY-QUICK-DEPLOY.md`

## ✅ Next Steps

1. Review `docs/COMPLETE-SETUP-SUMMARY.md` for overview
2. Follow `docs/QUICK-SETUP-GUIDE.md` to get started
3. Reference other docs as you build

---

# Meauxbility Cloud - Internal Company Workspace

MeauxCloud is your all-in-one internal communications platform, offering email, video conferencing, file storage, and comprehensive service management.

## Features

- **Gmail Integration** - Email management with inbox preview
- **Google Calendar** - Event scheduling and calendar management
- **Google Meet** - Instant video meeting creation
- **Google Drive** - File storage and collaboration
- **Cloud Storage** - Monitor your Google Cloud storage (2TB)
- **Stripe** - Payment processing dashboard
- **Supabase** - Database management
- **Render** - Hosting and deployment status
- **Responsive Design** - Works seamlessly on desktop and mobile

## Tech Stack

- **Next.js 16** (App Router with Turbopack)
- **TypeScript** - Type-safe development
- **Tailwind CSS v4** - Modern utility-first CSS
- **Supabase** - Backend database & authentication
- **Stripe** - Payment processing
- **Resend** - Transactional emails
- **Cloudflare R2** - Object storage

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Vercel account (for deployment)
- API keys for all services (see Environment Variables section)

### Local Development

1. **Clone the repository**
   ```bash
   git clone git@github.com:InnerAnimal/Meaux-Cloud-Internal-Company-Workspace-.git
   cd Meaux-Cloud-Internal-Company-Workspace-
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Then fill in your actual API keys in `.env.local`

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Environment Variables

See `.env.example` for a complete list of required environment variables.

### Required Variables

| Variable | Description | Where to get it |
|----------|-------------|-----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | [Supabase Dashboard](https://supabase.com/dashboard) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Supabase Dashboard → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Supabase Dashboard → Settings → API |
| `STRIPE_SECRET_KEY` | Stripe secret key | [Stripe Dashboard](https://dashboard.stripe.com/apikeys) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | Stripe Dashboard → Developers → API Keys |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret | Stripe Dashboard → Developers → Webhooks |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | [Google Cloud Console](https://console.cloud.google.com) |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | Google Cloud Console |
| `RESEND_API_KEY` | Resend API key | [Resend Dashboard](https://resend.com/api-keys) |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare account ID | [Cloudflare Dashboard](https://dash.cloudflare.com) |
| `CLOUDFLARE_API_TOKEN` | Cloudflare API token | Cloudflare Dashboard → My Profile → API Tokens |

## Deployment to Vercel

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New" → "Project"
   - Import your GitHub repository
   - Vercel will auto-detect Next.js

3. **Add Environment Variables**
   - In the Vercel project settings, go to "Settings" → "Environment Variables"
   - Add all variables from your `.env.local` file
   - **IMPORTANT**: Add them for all environments (Production, Preview, Development)

4. **Deploy**
   - Click "Deploy"
   - Wait for the build to complete
   - Your app will be live at `your-project.vercel.app`

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```

4. **Add Environment Variables**
   ```bash
   vercel env add NEXT_PUBLIC_SUPABASE_URL
   vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
   # ... add all other variables
   ```

5. **Deploy to Production**
   ```bash
   vercel --prod
   ```

## Setting Up Stripe Webhooks

After deploying to Vercel, you need to configure Stripe webhooks:

1. **Get your deployment URL**
   - Example: `https://your-project.vercel.app`

2. **Add webhook endpoint in Stripe**
   - Go to [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
   - Click "Add endpoint"
   - Endpoint URL: `https://your-project.vercel.app/api/webhooks/stripe`
   - Select events to listen to:
     - `payment_intent.succeeded`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
   - Click "Add endpoint"

3. **Copy webhook signing secret**
   - Copy the `Signing secret` (starts with `whsec_`)
   - Add it to Vercel environment variables as `STRIPE_WEBHOOK_SECRET`

4. **Redeploy**
   ```bash
   vercel --prod
   ```

## Project Structure

```
meaux-cloud/
├── app/                      # Next.js App Router
│   ├── api/                 # API routes
│   │   └── webhooks/        # Webhook handlers
│   ├── dashboard/           # Dashboard page
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Home page
│   └── globals.css          # Global styles
├── components/              # React components
│   ├── dashboard/          # Dashboard components
│   └── ui/                 # Reusable UI components
├── lib/                     # Utilities & API clients
│   ├── supabase/           # Supabase client & server
│   └── stripe/             # Stripe client & server
├── public/                  # Static assets
├── .env.local              # Environment variables (not in git)
├── .env.example            # Example env file
├── next.config.js          # Next.js configuration
├── tailwind.config.ts      # Tailwind configuration
└── package.json            # Dependencies
```

## Common Issues & Solutions

### Build Fails on Vercel

1. **Check Node.js version**
   - Ensure Vercel is using Node.js 18+
   - Set in Project Settings → General → Node.js Version

2. **Missing Environment Variables**
   - Verify all required variables are set in Vercel
   - Check for typos in variable names

3. **TypeScript Errors**
   - Run `npm run build` locally first
   - Fix any TypeScript errors before deploying

### Webhooks Not Working

1. **Check webhook URL**
   - Ensure it matches your Vercel deployment URL
   - URL should end with `/api/webhooks/stripe`

2. **Verify webhook secret**
   - Make sure `STRIPE_WEBHOOK_SECRET` is set in Vercel
   - Secret should start with `whsec_`

## Development Commands

```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## Future Enhancements

- [ ] Full Google Workspace API integration
- [ ] Real-time email synchronization
- [ ] Calendar event CRUD operations
- [ ] Google Drive file browser
- [ ] User authentication with NextAuth
- [ ] Multi-tenant support
- [ ] Team collaboration features
- [ ] Advanced analytics dashboard

## Support

For issues or questions:
- Email: sam@meauxbility.org
- GitHub Issues: [Create an issue](https://github.com/InnerAnimal/Meaux-Cloud-Internal-Company-Workspace-/issues)

## License

ISC

---

Built with ❤️ by Meauxbility Team
