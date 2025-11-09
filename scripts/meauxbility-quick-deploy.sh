#!/bin/bash

# ================================================
# Meauxbility.org - Lightning Fast Deployment Script
# ================================================

set -e

echo "🚀 Meauxbility.org Quick Deploy"
echo "================================"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Supabase URL is set
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
    echo -e "${YELLOW}⚠️  NEXT_PUBLIC_SUPABASE_URL not set${NC}"
    echo "Please set your Supabase environment variables"
    exit 1
fi

# Step 1: Create Next.js app
echo -e "${BLUE}📦 Step 1: Creating Next.js app...${NC}"
if [ ! -d "meauxbility-app" ]; then
    npx create-next-app@latest meauxbility-app --typescript --tailwind --app --yes
    echo -e "${GREEN}✅ Next.js app created${NC}"
else
    echo -e "${YELLOW}⚠️  meauxbility-app already exists, skipping...${NC}"
fi

cd meauxbility-app

# Step 2: Install dependencies
echo -e "${BLUE}📦 Step 2: Installing dependencies...${NC}"
npm install @supabase/supabase-js @supabase/ssr
npm install resend
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu
npm install lucide-react framer-motion
npm install stripe @stripe/stripe-js
echo -e "${GREEN}✅ Dependencies installed${NC}"

# Step 3: Create directory structure
echo -e "${BLUE}📁 Step 3: Creating directory structure...${NC}"
mkdir -p app/\(auth\)/{login,signup}
mkdir -p app/\(public\)/{about,programs,grants,donate,stories,volunteer,contact,blog,resources}
mkdir -p app/\(dashboard\)/{dashboard,workflows,grants,volunteers}
mkdir -p app/api/{donate,workflows,webhooks}
mkdir -p components/{branding,donation,workflows,shared}
mkdir -p lib/{supabase,meauxbility,branding}
echo -e "${GREEN}✅ Directory structure created${NC}"

# Step 4: Create basic files
echo -e "${BLUE}📄 Step 4: Creating basic files...${NC}"

# Supabase client
cat > lib/supabase/client.ts << 'EOF'
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
EOF

# Branding hook
cat > lib/branding/use-meauxbility-theme.ts << 'EOF'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

export function useMeauxbilityTheme() {
  const [theme, setTheme] = useState<any>(null)

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
  }

  return { theme }
}
EOF

# Home page
cat > app/\(public\)/page.tsx << 'EOF'
import { useMeauxbilityTheme } from '@/lib/branding/use-meauxbility-theme'

export default function HomePage() {
  const { theme } = useMeauxbilityTheme()

  return (
    <main className="min-h-screen">
      <section className="hero py-20">
        <div className="container mx-auto px-4">
          <h1 className="text-5xl font-bold mb-4">
            For The Nameless Faces Voiceless
          </h1>
          <p className="text-xl mb-8">
            Mobility grants for spinal cord injury survivors
          </p>
          <a href="/donate" className="btn-primary">
            Donate Now
          </a>
        </div>
      </section>
    </main>
  )
}
EOF

# Layout
cat > app/\(public\)/layout.tsx << 'EOF'
import '../globals.css'

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
EOF

# Global CSS
cat > app/globals.css << 'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --color-primary: #60DFDF;
  --color-secondary: #4ECDC4;
  --color-accent: #FF6B35;
  --color-bg: #0a0e12;
  --color-text-primary: rgba(255, 255, 255, 0.95);
  --color-text-secondary: rgba(255, 255, 255, 0.7);
}

[data-theme="light"] {
  --color-bg: #ffffff;
  --color-text-primary: #0a0e12;
  --color-text-secondary: #1a2026;
}

body {
  background-color: var(--color-bg);
  color: var(--color-text-primary);
  transition: background-color 0.3s ease;
}

.btn-primary {
  @apply px-6 py-3 bg-[var(--color-primary)] text-[var(--color-bg)] rounded-lg font-semibold hover:opacity-90 transition;
}
EOF

echo -e "${GREEN}✅ Basic files created${NC}"

# Step 5: Create .env.local template
echo -e "${BLUE}⚙️  Step 5: Creating environment template...${NC}"
cat > .env.local.example << 'EOF'
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key

# Meauxbility Organization ID (get from Supabase after running SQL)
NEXT_PUBLIC_MEAUXBILITY_ORG_ID=your-org-id

# Resend
RESEND_API_KEY=your-resend-key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-key
STRIPE_SECRET_KEY=your-stripe-secret

# Domain
NEXT_PUBLIC_APP_URL=https://meauxbility.org
EOF

echo -e "${GREEN}✅ Environment template created${NC}"

# Step 6: Create SQL setup file
echo -e "${BLUE}📊 Step 6: Creating SQL setup file...${NC}"
cat > ../schemas/meauxbility-setup.sql << 'EOF'
-- Meauxbility.org Quick Setup SQL
-- Run this in Supabase SQL Editor

-- 1. Create Organization
INSERT INTO organizations (
  name, slug, description, industry, size, status
) VALUES (
  'Meauxbility',
  'meauxbility',
  '501(c)(3) nonprofit providing mobility grants to spinal cord injury survivors',
  'nonprofit',
  'small',
  'active'
) ON CONFLICT (slug) DO NOTHING
RETURNING id;

-- 2. Create Branding Theme
INSERT INTO branding_themes (
  organization_id, name, slug, primary_color, secondary_color, accent_color,
  background_color, text_primary, text_secondary, theme_mode
)
SELECT 
  id,
  'Meauxbility',
  'meauxbility',
  '#60DFDF',
  '#4ECDC4',
  '#FF6B35',
  '#0a0e12',
  'rgba(255, 255, 255, 0.95)',
  'rgba(255, 255, 255, 0.7)',
  'auto'
FROM organizations WHERE slug = 'meauxbility'
ON CONFLICT (slug) DO NOTHING;

-- 3. Create Donation Product
INSERT INTO products (
  organization_id, name, slug, description, short_description, price,
  product_type, is_donation, donation_min_amount, donation_max_amount,
  donation_suggested_amounts, donation_tax_deductible, status, featured
)
SELECT 
  id,
  'Mobility Grant Donation',
  'donation',
  'Support spinal cord injury survivors with mobility grants',
  'Support mobility grants',
  25.00,
  'donation',
  true,
  5.00,
  10000.00,
  ARRAY[25.00, 50.00, 100.00, 250.00, 500.00, 1000.00],
  true,
  'active',
  true
FROM organizations WHERE slug = 'meauxbility'
ON CONFLICT (organization_id, slug) DO NOTHING;

-- 4. Create AI Commands
INSERT INTO ai_commands (code, name, description, category, command_type, is_favorite) VALUES
  ('MG', 'Mobility Grant', 'Create mobility grant application workflow', 'meauxbility', 'scaffold', true),
  ('VA', 'Volunteer Application', 'Process volunteer application', 'meauxbility', 'scaffold', true),
  ('DR', 'Donation Receipt', 'Generate tax-deductible donation receipt', 'meauxbility', 'generate', true),
  ('GS', 'Grant Status', 'Check grant application status', 'meauxbility', 'monitor', true),
  ('VR', 'Volunteer Report', 'Generate volunteer activity report', 'meauxbility', 'generate', true)
ON CONFLICT (code) DO NOTHING;
EOF

echo -e "${GREEN}✅ SQL setup file created${NC}"

echo ""
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Run ../schemas/meauxbility-setup.sql in Supabase SQL Editor"
echo "2. Copy .env.local.example to .env.local and fill in values"
echo "3. Get organization ID: SELECT id FROM organizations WHERE slug = 'meauxbility';"
echo "4. Add organization ID to .env.local"
echo "5. Run: npm run dev"
echo ""
echo "📚 See MEAUXBILITY-QUICK-DEPLOY.md for full guide"

