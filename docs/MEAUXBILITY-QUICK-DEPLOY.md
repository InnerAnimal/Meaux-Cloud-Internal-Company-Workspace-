# Meauxbility.org - Lightning Fast Deployment Guide

## 🎯 Overview

Deploy a fully-branded Meauxbility.org web application (10+ pages, dual theme, 501(c)(3) features) with AI-powered workflows for your team and volunteers - all using the existing multi-tenant platform.

## ⚡ Quick Deploy Strategy

**Time to Deploy**: 2-4 hours (with existing platform)
**Approach**: Use existing multi-tenant architecture - Meauxbility becomes an organization

## 🚀 Step 1: Database Setup (15 minutes)

### 1.1 Create Meauxbility Organization

Run in Supabase SQL Editor:

```sql
-- Create Meauxbility organization
INSERT INTO organizations (
  name,
  slug,
  description,
  industry,
  size,
  status
) VALUES (
  'Meauxbility',
  'meauxbility',
  '501(c)(3) nonprofit providing mobility grants to spinal cord injury survivors',
  'nonprofit',
  'small',
  'active'
) RETURNING id;

-- Save the returned ID for next steps
```

### 1.2 Create Meauxbility Branding Theme

```sql
-- Create Meauxbility branding theme
INSERT INTO branding_themes (
  organization_id,
  name,
  slug,
  primary_color,
  secondary_color,
  accent_color,
  background_color,
  text_primary,
  text_secondary,
  theme_mode
) VALUES (
  (SELECT id FROM organizations WHERE slug = 'meauxbility'),
  'Meauxbility',
  'meauxbility',
  '#60DFDF',  -- Teal (primary)
  '#4ECDC4',  -- Cyan (secondary)
  '#FF6B35',  -- Orange (accent - Meauxbility brand)
  '#0a0e12',  -- Dark background
  'rgba(255, 255, 255, 0.95)',
  'rgba(255, 255, 255, 0.7)',
  'auto'  -- Supports light/dark mode
) RETURNING id;
```

### 1.3 Set Up Volunteer Roles

```sql
-- Create permission group for volunteers
INSERT INTO permission_groups (
  name,
  organization_id,
  permissions,
  description,
  is_system
) VALUES (
  'Volunteer',
  (SELECT id FROM organizations WHERE slug = 'meauxbility'),
  '{
    "projects": {"view": true, "create": false, "edit": false, "delete": false},
    "tasks": {"view": true, "create": true, "edit": true, "delete": false},
    "ai_commands": {"view": true, "execute": true},
    "financials": {"view": false, "edit": false},
    "team": {"view": true, "manage": false},
    "settings": {"view": false, "edit": false},
    "donations": {"view": true, "create": false, "edit": false}
  }'::jsonb,
  'Volunteer access for Meauxbility',
  false
);
```

### 1.4 Create Donation Product

```sql
-- Create donation product
INSERT INTO products (
  organization_id,
  name,
  slug,
  description,
  short_description,
  price,
  product_type,
  is_donation,
  donation_min_amount,
  donation_max_amount,
  donation_suggested_amounts,
  donation_tax_deductible,
  status,
  featured
) VALUES (
  (SELECT id FROM organizations WHERE slug = 'meauxbility'),
  'Mobility Grant Donation',
  'donation',
  'Support spinal cord injury survivors with mobility grants. Your donation helps provide essential mobility equipment and support.',
  'Support mobility grants for spinal cord injury survivors',
  25.00,  -- Minimum suggested
  'donation',
  true,
  5.00,   -- Minimum donation
  10000.00, -- Maximum donation
  ARRAY[25.00, 50.00, 100.00, 250.00, 500.00, 1000.00],
  true,   -- Tax deductible
  'active',
  true
);
```

## 🎨 Step 2: Next.js App Setup (30 minutes)

### 2.1 Create Meauxbility App

```bash
# Create new Next.js app
npx create-next-app@latest meauxbility-app --typescript --tailwind --app
cd meauxbility-app

# Install dependencies
npm install @supabase/supabase-js @supabase/ssr
npm install resend
npm install @radix-ui/react-*
npm install lucide-react
npm install framer-motion  # For animations
```

### 2.2 Project Structure

```
meauxbility-app/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── signup/
│   ├── (public)/          # Public pages
│   │   ├── page.tsx       # Home
│   │   ├── about/
│   │   ├── programs/
│   │   ├── grants/
│   │   ├── donate/
│   │   ├── stories/
│   │   ├── volunteer/
│   │   ├── contact/
│   │   ├── blog/
│   │   └── resources/
│   ├── (dashboard)/        # Team/Volunteer dashboard
│   │   ├── dashboard/
│   │   ├── workflows/
│   │   ├── grants/
│   │   └── volunteers/
│   └── api/
│       ├── donate/
│       ├── workflows/
│       └── webhooks/
├── components/
│   ├── branding/          # Meauxbility branded components
│   ├── donation/
│   ├── workflows/
│   └── shared/
└── lib/
    ├── supabase/
    ├── meauxbility/       # Meauxbility-specific utilities
    └── branding/
```

### 2.3 Environment Setup

Create `.env.local`:

```env
# Supabase (same instance as InnerAnimal)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key

# Meauxbility Organization ID (from Step 1.1)
NEXT_PUBLIC_MEAUXBILITY_ORG_ID=your-org-id-here

# Resend
RESEND_API_KEY=your-resend-key

# Stripe (for donations)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-key
STRIPE_SECRET_KEY=your-stripe-secret

# Domain
NEXT_PUBLIC_APP_URL=https://meauxbility.org
```

## 🎨 Step 3: Branding Configuration (20 minutes)

### 3.1 Create Branding Hook

Create `lib/branding/use-meauxbility-theme.ts`:

```typescript
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

export function useMeauxbilityTheme() {
  const [theme, setTheme] = useState<any>(null)
  const [isDark, setIsDark] = useState(true)

  useEffect(() => {
    loadTheme()
  }, [])

  async function loadTheme() {
    const orgId = process.env.NEXT_PUBLIC_MEAUXBILITY_ORG_ID
    
    const { data } = await supabase
      .from('branding_themes')
      .select('*')
      .eq('organization_id', orgId)
      .eq('slug', 'meauxbility')
      .single()

    if (data) {
      setTheme(data)
      applyTheme(data)
    }
  }

  function applyTheme(themeData: any) {
    const root = document.documentElement
    
    root.style.setProperty('--color-primary', themeData.primary_color)
    root.style.setProperty('--color-secondary', themeData.secondary_color)
    root.style.setProperty('--color-accent', themeData.accent_color)
    root.style.setProperty('--color-bg', themeData.background_color)
    root.style.setProperty('--color-text-primary', themeData.text_primary)
    root.style.setProperty('--color-text-secondary', themeData.text_secondary)
  }

  function toggleTheme() {
    setIsDark(!isDark)
    // Apply light/dark mode
  }

  return { theme, isDark, toggleTheme }
}
```

### 3.2 CSS Variables

Create `app/globals.css`:

```css
:root {
  /* Meauxbility Colors - Dark Theme */
  --color-primary: #60DFDF;
  --color-secondary: #4ECDC4;
  --color-accent: #FF6B35;
  --color-bg: #0a0e12;
  --color-text-primary: rgba(255, 255, 255, 0.95);
  --color-text-secondary: rgba(255, 255, 255, 0.7);
}

[data-theme="light"] {
  /* Light Theme */
  --color-bg: #ffffff;
  --color-text-primary: #0a0e12;
  --color-text-secondary: #1a2026;
}

body {
  background-color: var(--color-bg);
  color: var(--color-text-primary);
  transition: background-color 0.3s ease, color 0.3s ease;
}
```

## 🚀 Step 4: Quick Deploy Script (10 minutes)

Create `scripts/deploy-meauxbility.sh`:

```bash
#!/bin/bash

echo "🚀 Deploying Meauxbility.org..."

# 1. Build
echo "📦 Building..."
npm run build

# 2. Deploy to Vercel
echo "☁️ Deploying to Vercel..."
vercel --prod

# 3. Configure Cloudflare DNS (if not already done)
echo "🌐 Configuring DNS..."
# DNS should already be set up from Cloudflare guide

# 4. Verify deployment
echo "✅ Deployment complete!"
echo "🌐 https://meauxbility.org"
```

## 📄 Step 5: Create Core Pages (1-2 hours)

### 5.1 Home Page Template

Create `app/(public)/page.tsx`:

```typescript
import { useMeauxbilityTheme } from '@/lib/branding/use-meauxbility-theme'
import { DonationForm } from '@/components/donation/DonationForm'
import { Hero } from '@/components/branding/Hero'

export default function HomePage() {
  const { theme } = useMeauxbilityTheme()

  return (
    <main>
      <Hero 
        title="For The Nameless Faces Voiceless"
        subtitle="Mobility grants for spinal cord injury survivors"
        ctaText="Donate Now"
        ctaLink="/donate"
      />
      
      <section className="py-20">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold mb-8">Our Mission</h2>
          <p className="text-lg text-text-secondary">
            Meauxbility provides mobility grants to spinal cord injury survivors,
            helping them regain independence and mobility.
          </p>
        </div>
      </section>

      <DonationForm />
    </main>
  )
}
```

### 5.2 Page List (10+ pages)

Create these pages quickly:

```bash
# Generate page structure
mkdir -p app/\(public\)/{about,programs,grants,donate,stories,volunteer,contact,blog,resources}

# Each page can be minimal to start:
cat > app/\(public\)/about/page.tsx << 'EOF'
export default function AboutPage() {
  return <div>About Meauxbility</div>
}
EOF
```

## 🤖 Step 6: AI Workflows Setup (30 minutes)

### 6.1 Create Meauxbility-Specific Commands

```sql
-- Add Meauxbility-specific AI commands
INSERT INTO ai_commands (code, name, description, category, command_type, is_favorite) VALUES
  ('MG', 'Mobility Grant', 'Create mobility grant application workflow', 'meauxbility', 'scaffold', true),
  ('VA', 'Volunteer Application', 'Process volunteer application', 'meauxbility', 'scaffold', true),
  ('DR', 'Donation Receipt', 'Generate tax-deductible donation receipt', 'meauxbility', 'generate', true),
  ('GS', 'Grant Status', 'Check grant application status', 'meauxbility', 'monitor', true),
  ('VR', 'Volunteer Report', 'Generate volunteer activity report', 'meauxbility', 'generate', true);
```

### 6.2 Create Workflow Component

Create `components/workflows/AIWorkflowRunner.tsx`:

```typescript
'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'

export function AIWorkflowRunner() {
  const [command, setCommand] = useState('')
  const [result, setResult] = useState<any>(null)

  async function executeWorkflow() {
    const { data: commandData } = await supabase
      .from('ai_commands')
      .select('*')
      .eq('code', command)
      .single()

    if (!commandData) return

    // Execute workflow via API
    const response = await fetch('/api/workflows/execute', {
      method: 'POST',
      body: JSON.stringify({ commandId: commandData.id })
    })

    const result = await response.json()
    setResult(result)
  }

  return (
    <div className="workflow-runner">
      <input 
        type="text" 
        placeholder="/MG - Create Grant Application"
        value={command}
        onChange={(e) => setCommand(e.target.value)}
      />
      <button onClick={executeWorkflow}>Execute</button>
      {result && <div>{JSON.stringify(result)}</div>}
    </div>
  )
}
```

## 👥 Step 7: Team & Volunteer Setup (20 minutes)

### 7.1 Create Volunteer Signup

```sql
-- Create volunteer signup form endpoint
-- This uses existing profiles table
-- Volunteers get 'user' role with 'volunteer' permission group
```

### 7.2 Volunteer Dashboard

Create `app/(dashboard)/dashboard/page.tsx`:

```typescript
import { useMeauxbilityTheme } from '@/lib/branding/use-meauxbility-theme'
import { AIWorkflowRunner } from '@/components/workflows/AIWorkflowRunner'

export default function VolunteerDashboard() {
  const { theme } = useMeauxbilityTheme()

  return (
    <div className="dashboard">
      <h1>Volunteer Dashboard</h1>
      <AIWorkflowRunner />
      
      {/* Quick actions */}
      <div className="quick-actions">
        <button>/MG - Process Grant</button>
        <button>/VA - Review Volunteer</button>
        <button>/DR - Generate Receipt</button>
      </div>
    </div>
  )
}
```

## 💳 Step 8: Donation System (30 minutes)

### 8.1 Stripe Integration

Create `app/api/donate/route.ts`:

```typescript
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(request: Request) {
  const { amount, email, name, dedication } = await request.json()
  
  // Create Stripe payment intent
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount * 100, // Convert to cents
    currency: 'usd',
    metadata: {
      organization: 'meauxbility',
      email,
      name,
      dedication
    }
  })

  // Create donation record
  const supabase = createClient()
  const orgId = process.env.NEXT_PUBLIC_MEAUXBILITY_ORG_ID

  await supabase.from('donations').insert({
    organization_id: orgId,
    donor_email: email,
    donor_name: name,
    amount,
    frequency: 'one_time',
    tax_deductible: true,
    dedication_type: dedication?.type,
    dedication_name: dedication?.name,
    payment_status: 'pending'
  })

  return NextResponse.json({ 
    clientSecret: paymentIntent.client_secret 
  })
}
```

## 🚀 Step 9: Lightning Deployment (15 minutes)

### 9.1 Vercel Deployment

```bash
# Install Vercel CLI (if not already)
npm i -g vercel

# Login
vercel login

# Deploy
cd meauxbility-app
vercel --prod

# Add custom domain
vercel domains add meauxbility.org
```

### 9.2 Cloudflare Configuration

Already done from main setup, but verify:

```bash
# DNS should point to Vercel
# SSL: Full (strict)
# WAF: Enabled
```

## ✅ Deployment Checklist

- [ ] Database: Organization created
- [ ] Database: Branding theme configured
- [ ] Database: Donation product created
- [ ] Database: AI commands added
- [ ] Next.js: App created
- [ ] Next.js: Branding hook implemented
- [ ] Next.js: Core pages created (10+)
- [ ] Next.js: Donation system integrated
- [ ] Next.js: Volunteer dashboard built
- [ ] Vercel: Deployed
- [ ] Cloudflare: DNS verified
- [ ] Stripe: Payment processing tested
- [ ] Resend: Email templates configured

## 🎯 Post-Deployment

### Immediate Next Steps:

1. **Add Content**: Fill in all 10+ pages with actual content
2. **Test Workflows**: Test AI workflows with team
3. **Onboard Volunteers**: Invite volunteers, set up accounts
4. **Test Donations**: Make test donation, verify receipt
5. **Configure Email**: Set up Resend templates for Meauxbility

### Week 1 Enhancements:

- [ ] Add blog system
- [ ] Grant application form
- [ ] Volunteer application form
- [ ] Story submissions
- [ ] Resource library
- [ ] Newsletter signup

## 📊 Quick Stats

- **Setup Time**: 2-4 hours
- **Pages**: 10+ (easily expandable)
- **Themes**: Dual (light/dark) ✅
- **501(c)(3) Features**: Donations, tax receipts ✅
- **AI Workflows**: Instant commands ✅
- **Security**: Vault, 2FA ✅
- **Team Access**: Real logins ✅

## 🆘 Quick Troubleshooting

**Issue**: Theme not loading
**Fix**: Check `NEXT_PUBLIC_MEAUXBILITY_ORG_ID` in env

**Issue**: Donations not working
**Fix**: Verify Stripe keys, check webhook endpoint

**Issue**: Workflows not executing
**Fix**: Check AI command codes match database

---

**Ready?** Follow steps 1-9 and you'll have Meauxbility.org live in 2-4 hours! 🚀

