# InnerAnimal Media - Implementation Roadmap
## Multi-Tenant AI-Enhanced Agency Platform

## 🎯 Your Next Steps

### Phase 1: Foundation Setup (Week 1)

#### 1.1 Supabase Database Setup
```bash
# Run in Supabase SQL Editor (in order):
1. inneranimalmedia-supabase-schema.sql (base schema)
2. inneranimalmedia-schema-extensions.sql (multi-tenancy, AI chats, Resend)
```

**Action Items:**
- [ ] Create new Supabase project (or use existing)
- [ ] Run base schema
- [ ] Run extensions schema
- [ ] Verify all tables created
- [ ] Test RLS policies

#### 1.2 Environment Configuration
Create `.env.local`:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Resend (for all organizations)
RESEND_API_KEY=your-resend-api-key

# Vercel (Pro Account)
VERCEL_URL=your-vercel-url
VERCEL_ENV=production

# Cloudflare (if using)
CLOUDFLARE_API_TOKEN=your-token
CLOUDFLARE_ZONE_ID=your-zone-id

# AI (OpenAI/Anthropic)
OPENAI_API_KEY=your-openai-key
ANTHROPIC_API_KEY=your-anthropic-key

# Admin Center (Meaux Cloud)
ADMIN_CENTER_URL=admin.meaux.cloud
ADMIN_CENTER_NAME=Meaux Cloud
```

#### 1.3 Resend Domain Setup
For each organization/domain:
- [ ] Verify domain in Resend dashboard
- [ ] Add DNS records (SPF, DKIM, DMARC)
- [ ] Test email sending
- [ ] Configure in `resend_configurations` table

**Domains to configure:**
- `inneranimalmedia.com`
- `meauxbility.org`
- `meaux.cloud` (admin center)
- Any other org domains

### Phase 2: Core Infrastructure (Week 2)

#### 2.1 Next.js Project Structure
```
inneranimal-platform/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── signup/
│   ├── (dashboard)/
│   │   ├── dashboard/
│   │   ├── projects/
│   │   ├── ai-chat/
│   │   └── settings/
│   ├── (admin)/
│   │   ├── admin/          # Meaux Cloud admin center
│   │   ├── organizations/
│   │   └── users/
│   └── api/
│       ├── resend/
│       ├── ai/
│       └── webhooks/
├── components/
│   ├── dashboard/
│   ├── ai-chat/
│   ├── branding/
│   └── shared/
├── lib/
│   ├── supabase/
│   ├── resend/
│   ├── ai/
│   └── branding/
└── types/
```

#### 2.2 Supabase Client Setup
Create `lib/supabase/client.ts`:
```typescript
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'

export const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

#### 2.3 Resend Service Setup
Create `lib/resend/service.ts`:
```typescript
import { Resend } from 'resend'
import { createClient } from '@/lib/supabase/server'

export async function sendEmail({
  organizationId,
  templateSlug,
  to,
  variables = {},
  priority = 5
}: {
  organizationId: string
  templateSlug: string
  to: string | string[]
  variables?: Record<string, any>
  priority?: number
}) {
  // Get Resend config for organization
  // Get email template
  // Queue email
  // Return queue ID
}
```

### Phase 3: Authentication & Multi-Tenancy (Week 2-3)

#### 3.1 Auth Flow
- [ ] Supabase Auth setup
- [ ] Profile creation on signup
- [ ] Organization assignment
- [ ] Role-based routing

#### 3.2 Branding System
Create `lib/branding/get-theme.ts`:
```typescript
export async function getBrandingTheme(organizationId?: string) {
  // Get theme for organization or default Meaux Cloud
  // Return theme config
}
```

#### 3.3 Dashboard Router
- [ ] Detect user's organization
- [ ] Load branding theme
- [ ] Render branded dashboard
- [ ] Admin center routing (Meaux Cloud)

### Phase 4: AI Chat Integration (Week 3-4)

#### 4.1 Chat Room Component
Create `components/ai-chat/ChatRoom.tsx`:
- Embedded chat interface
- Real-time message updates
- File attachments
- Mentions
- Reactions

#### 4.2 AI Service Integration
Create `lib/ai/chat.ts`:
```typescript
export async function sendChatMessage({
  roomId,
  message,
  userId,
  context
}: {
  roomId: string
  message: string
  userId: string
  context?: any
}) {
  // Save message
  // Call AI API (OpenAI/Anthropic)
  // Save AI response
  // Return conversation
}
```

#### 4.3 Chat Room Types
- **General**: Company-wide chat
- **Project**: Project-specific chat
- **Team**: Department chat
- **Board**: Board of directors chat
- **Private**: 1-on-1 or small group

### Phase 5: Dashboard Widgets (Week 4-5)

#### 5.1 Widget System
Create widget components:
- [ ] Projects Overview
- [ ] Recent Tasks
- [ ] Time Tracking
- [ ] AI Commands
- [ ] Notifications
- [ ] Team Activity
- [ ] Financial Summary (board/admin)

#### 5.2 Dashboard Layout
- [ ] Drag-and-drop widget arrangement
- [ ] Save layout preferences
- [ ] Responsive grid system
- [ ] Widget settings

### Phase 6: Email System (Week 5-6)

#### 6.1 Email Templates
Create branded email templates:
- [ ] Project updates
- [ ] Task assignments
- [ ] AI completions
- [ ] Invoice notifications
- [ ] Welcome emails
- [ ] Board updates

#### 6.2 Email Queue Processor
Create `app/api/cron/process-email-queue/route.ts`:
- Process pending emails
- Retry failed emails
- Update status
- Track analytics

#### 6.3 Resend Webhook Handler
Create `app/api/webhooks/resend/route.ts`:
- Handle Resend webhooks
- Update email logs
- Track opens/clicks

### Phase 7: Admin Center - Meaux Cloud (Week 6-7)

#### 7.1 Admin Dashboard
- [ ] Organization management
- [ ] User management
- [ ] Branding themes
- [ ] Email templates
- [ ] Analytics overview
- [ ] System settings

#### 7.2 Board Dashboard
- [ ] Financial overview
- [ ] Project portfolio
- [ ] Team performance
- [ ] Strategic metrics

### Phase 8: Integration & Deployment (Week 7-8)

#### 8.1 Cloudflare Setup
- [ ] Configure DNS
- [ ] Set up CDN
- [ ] SSL certificates
- [ ] Page rules

#### 8.2 Vercel Deployment
- [ ] Connect GitHub repo
- [ ] Configure environment variables
- [ ] Set up preview deployments
- [ ] Configure custom domains

#### 8.3 Testing
- [ ] Multi-tenant isolation
- [ ] AI chat functionality
- [ ] Email delivery
- [ ] Dashboard performance
- [ ] Security (RLS)

## 🚀 Quick Start (Today)

### Option A: Start Fresh (Recommended)
1. **Create new Next.js project:**
```bash
npx create-next-app@latest inneranimal-platform --typescript --tailwind --app
cd inneranimal-platform
```

2. **Install dependencies:**
```bash
npm install @supabase/supabase-js @supabase/ssr
npm install resend
npm install @radix-ui/react-* # For UI components
```

3. **Run schema in Supabase:**
   - Copy `inneranimalmedia-supabase-schema.sql`
   - Copy `inneranimalmedia-schema-extensions.sql`
   - Run both in Supabase SQL Editor

4. **Set up basic structure:**
   - Create `lib/supabase/` directory
   - Create `components/dashboard/` directory
   - Create `app/(dashboard)/dashboard/` route

### Option B: Extend Existing Project
If you want to build on existing codebase:
1. Add schema extensions to existing Supabase
2. Create new routes for admin center
3. Add AI chat components
4. Integrate Resend service

## 📋 Implementation Checklist

### Database
- [ ] Base schema deployed
- [ ] Extensions schema deployed
- [ ] RLS policies tested
- [ ] Initial data seeded
- [ ] Indexes verified

### Authentication
- [ ] Supabase Auth configured
- [ ] Profile creation flow
- [ ] Organization assignment
- [ ] Role-based access

### Branding
- [ ] Theme system working
- [ ] Meaux Cloud theme created
- [ ] Organization themes configurable
- [ ] CSS variables integration

### AI Chat
- [ ] Chat rooms created
- [ ] Message sending working
- [ ] AI integration (OpenAI/Anthropic)
- [ ] Real-time updates
- [ ] File attachments

### Email
- [ ] Resend configured
- [ ] Templates created
- [ ] Queue system working
- [ ] Webhook handler set up
- [ ] Analytics tracking

### Dashboard
- [ ] Widget system built
- [ ] Layout persistence
- [ ] Multi-tenant routing
- [ ] Performance optimized

### Admin Center
- [ ] Admin routes protected
- [ ] Organization management
- [ ] User management
- [ ] Analytics dashboard

### Deployment
- [ ] Vercel configured
- [ ] Cloudflare DNS set up
- [ ] Environment variables set
- [ ] Production tested

## 🎨 Branding Guidelines

### Meaux Cloud (Admin Center)
- **Primary**: `#60DFDF` (Teal)
- **Secondary**: `#4ECDC4` (Cyan)
- **Background**: `#0a0e12` (Dark)
- **No Google branding** - 100% custom

### InnerAnimal Media
- Use existing brand colors
- Teal/Cyan accent scheme

### Meauxbility
- Orange accent (`#FF6B35` or similar)
- Teal secondary

## 🔐 Security Checklist

- [ ] RLS policies on all tables
- [ ] Multi-tenant data isolation
- [ ] API route authentication
- [ ] Environment variables secured
- [ ] Resend API keys encrypted
- [ ] Webhook signature verification

## 📊 Success Metrics

- [ ] All team members can log in
- [ ] Board members have dashboard access
- [ ] AI chats working for all room types
- [ ] Emails sending successfully
- [ ] Multi-tenant isolation working
- [ ] Admin center accessible
- [ ] Performance < 2s load time

## 🆘 Support Resources

- Supabase Docs: https://supabase.com/docs
- Resend Docs: https://resend.com/docs
- Next.js Docs: https://nextjs.org/docs
- Vercel Docs: https://vercel.com/docs

## Next Immediate Steps

1. **Decide**: Fresh start or extend existing?
2. **Set up**: Supabase project + run schemas
3. **Configure**: Resend domains
4. **Build**: Basic auth + dashboard route
5. **Test**: Multi-tenant isolation

**Recommendation**: Start fresh with the new schema, then migrate existing data if needed. This ensures clean architecture and proper multi-tenancy from day one.

