# Meaux Access Dashboard

Internal team workspace for Meauxbility, Inner Animals, and iAutodidact.

## 🚀 Quick Start

### Prerequisites

- Node.js 18.x
- npm
- Supabase account
- Cloudflare R2 bucket
- Vercel account

### Setup Steps

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment Variables**
   - Copy `.env.local` and fill in all values
   - **IMPORTANT**: Generate R2 Access Keys from Cloudflare Dashboard
   - Add R2 keys to `.env.local`:
     ```
     CLOUDFLARE_R2_ACCESS_KEY_ID=your-access-key-id
     CLOUDFLARE_R2_SECRET_ACCESS_KEY=your-secret-access-key
     ```

3. **Set Up Supabase**
   - Run the SQL schema from the instructions document
   - Create 4 team users in Supabase Auth:
     - sam@meauxbility.org
     - fred@meauxbility.org
     - connor@meauxbility.org
     - info@meauxbility.org
   - Insert user profiles using the UUIDs from Supabase Auth

4. **Create R2 Bucket**
   - Go to Cloudflare Dashboard > R2
   - Create bucket: `meauxxx-assets`
   - Generate API token with Object Read & Write permissions
   - Add keys to `.env.local`

5. **Run Development Server**
   ```bash
   npm run dev
   ```

6. **Deploy to Vercel**
   ```bash
   git add .
   git commit -m "feat: Complete Meaux Access dashboard"
   git push origin main
   ```
   - Vercel will auto-deploy
   - Add all environment variables in Vercel project settings

## 📁 Project Structure

```
app/
├── (auth)/          # Authentication pages
├── (dashboard)/     # Dashboard pages
│   ├── overview/    # Overview dashboard
│   ├── meoxtalk/    # Team messaging
│   ├── assets/      # Asset manager
│   ├── vault/       # Secure vault
│   ├── wallet/      # Financial tracking
│   ├── r2/          # R2 browser
│   ├── database/    # Database viewer
│   └── analytics/   # Analytics
├── api/             # API routes
└── layout.tsx       # Root layout

components/
├── dashboard/       # Dashboard components
└── ui/              # UI components

lib/
├── supabase/        # Supabase clients
├── cloudflare/      # R2 client
├── stripe/          # Stripe client
└── utils/           # Utilities
```

## 🔑 Features

- ✅ **Authentication** - Supabase Auth with iOS-style login
- ✅ **Dashboard** - Overview with stats and quick actions
- ✅ **MeauxTalk** - Real-time team messaging
- ✅ **Asset Manager** - R2 upload with Sharp.js optimization
- ✅ **Secure Vault** - AES-256 encrypted API keys
- ✅ **Wallet** - Stripe transaction tracking
- ✅ **R2 Browser** - Cloudflare R2 storage browser
- ✅ **Database Viewer** - Supabase table overview
- ✅ **Analytics** - Performance metrics

## 🎨 Design System

- **Colors**: Primary teal (#1F97A9), Accent orange (#FF7619)
- **Typography**: SF Pro Display system font
- **Components**: Glassmorphic cards, smooth animations
- **Styling**: Tailwind CSS + custom utilities

## 🔒 Security

- Row Level Security (RLS) enabled on all Supabase tables
- AES-256 encryption for vault secrets
- Role-based access control
- Secure API key storage

## 📝 Notes

- This is an **internal workspace** - not for public use
- All API keys are stored securely
- R2 bucket must be created before asset uploads work
- Supabase users must be created before login works

## 🐛 Troubleshooting

**Login not working?**
- Verify Supabase users are created
- Check RLS policies are set correctly

**Asset upload failing?**
- Verify R2 bucket exists
- Check R2 API keys are correct
- Ensure bucket name matches `.env.local`

**Build errors?**
- Run `npm install` again
- Check all environment variables are set
- Verify Node.js version is 18.x

## 📞 Support

For issues or questions, contact the team via MeauxTalk.
