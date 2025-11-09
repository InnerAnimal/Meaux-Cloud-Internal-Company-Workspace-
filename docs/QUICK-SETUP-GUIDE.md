# Quick Setup Guide - InnerAnimal Platform

## 🚀 Get Started in 30 Minutes

### Step 1: Supabase Setup (10 min)

1. **Create/Open Supabase Project**
   - Go to https://supabase.com
   - Create new project or use existing
   - Note your URL and anon key

2. **Run Schema**
   ```sql
   -- In Supabase SQL Editor, run:
   1. Copy/paste inneranimalmedia-supabase-schema.sql → Run
   2. Copy/paste inneranimalmedia-schema-extensions.sql → Run
   ```

3. **Verify Tables Created**
   - Check `profiles`, `organizations`, `projects`, `ai_commands`
   - Check `branding_themes`, `internal_chat_rooms`, `email_templates`

### Step 2: Resend Setup (5 min)

1. **Sign up/Login to Resend**
   - https://resend.com
   - Get API key from dashboard

2. **Verify Domains** (for each org):
   - `inneranimalmedia.com`
   - `meauxbility.org`
   - `meaux.cloud` (admin center)
   - Add DNS records (SPF, DKIM)

3. **Add to Environment**
   ```env
   RESEND_API_KEY=re_your_key_here
   ```

### Step 3: Next.js Project (10 min)

```bash
# Create project
npx create-next-app@latest inneranimal-platform --typescript --tailwind --app
cd inneranimal-platform

# Install dependencies
npm install @supabase/supabase-js @supabase/ssr
npm install resend
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu
npm install lucide-react

# Create structure
mkdir -p lib/supabase lib/resend lib/ai components/dashboard components/ai-chat
mkdir -p app/\(dashboard\)/dashboard app/\(admin\)/admin app/api/resend app/api/ai
```

### Step 4: Basic Configuration (5 min)

1. **Create `.env.local`:**
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
RESEND_API_KEY=your-resend-key
```

2. **Create `lib/supabase/client.ts`:**
```typescript
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

3. **Create `lib/resend/service.ts`:**
   - Copy from `lib-resend-service.ts` provided

### Step 5: Test Setup

1. **Create Test User:**
   ```sql
   -- In Supabase SQL Editor
   INSERT INTO profiles (id, email, full_name, role)
   VALUES (
     gen_random_uuid(),
     'test@example.com',
     'Test User',
     'admin'
   );
   ```

2. **Create Test Organization:**
   ```sql
   INSERT INTO organizations (name, slug)
   VALUES ('InnerAnimal Media', 'inneranimal-media');
   ```

3. **Create Meaux Cloud Theme:**
   ```sql
   -- Should already exist from schema seed
   SELECT * FROM branding_themes WHERE slug = 'meaux-cloud';
   ```

## ✅ Verification Checklist

- [ ] Supabase tables created
- [ ] Resend API key working
- [ ] Environment variables set
- [ ] Next.js project running (`npm run dev`)
- [ ] Can connect to Supabase
- [ ] Can send test email

## 🎯 Next Steps

1. **Build Auth Flow**
   - Login/signup pages
   - Profile creation
   - Organization assignment

2. **Build Dashboard**
   - Basic layout
   - Branding theme integration
   - Widget placeholders

3. **Add AI Chat**
   - Chat room component
   - Message sending
   - AI integration

4. **Configure Emails**
   - Create email templates
   - Test sending
   - Set up webhooks

## 🆘 Troubleshooting

**Supabase Connection Issues:**
- Check URL and keys
- Verify RLS policies
- Check network tab for errors

**Resend Issues:**
- Verify domain DNS records
- Check API key permissions
- Review Resend dashboard logs

**Next.js Issues:**
- Clear `.next` folder
- Restart dev server
- Check console errors

## 📚 Resources

- Full Implementation: See `IMPLEMENTATION-ROADMAP.md`
- Schema Docs: See `INNERANIMAL-SCHEMA-DOCUMENTATION.md`
- Quick Reference: See `INNERANIMAL-SCHEMA-QUICK-REFERENCE.md`

