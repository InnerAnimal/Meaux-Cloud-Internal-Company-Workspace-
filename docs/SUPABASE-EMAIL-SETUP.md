# Supabase Email System Setup Guide

This guide walks you through setting up your Supabase database for the email system, including all tables, triggers, views, and webhook configuration.

---

## 🎯 What This Does

The Supabase database integration provides:
- **Full email history** - Track all sent emails permanently
- **Delivery tracking** - Monitor opens, clicks, bounces, complaints
- **Domain management** - Track verification status for all domains
- **Email analytics** - Daily statistics, performance metrics
- **Bounce management** - Auto-suppress bounced emails
- **Template storage** - Store and manage email templates

**Benefits:**
- Unlimited email history (not limited by Resend plan)
- Advanced filtering and search
- Custom analytics and reporting
- Automated bounce handling
- Complete audit trail

---

## 📋 Prerequisites

- Supabase project set up (https://supabase.com)
- Admin access to your Supabase dashboard
- Connection to your project

---

## 🚀 Step 1: Run the SQL Schema

### Option A: Via Supabase Dashboard (Recommended)

1. **Go to SQL Editor**
   - Open https://supabase.com/dashboard
   - Select your project
   - Click "SQL Editor" in left sidebar

2. **Create New Query**
   - Click "New Query" button
   - Name it: "Email System Setup"

3. **Copy & Paste Schema**
   - Open `docs/supabase-email-schema.sql`
   - Copy entire contents
   - Paste into SQL editor

4. **Run the Script**
   - Click "Run" button (or press Ctrl/Cmd + Enter)
   - Wait for completion (should take 5-10 seconds)
   - You should see success messages in console

### Option B: Via Supabase CLI

```bash
# Install Supabase CLI (if not installed)
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Run the migration
supabase db push
```

---

## ✅ Step 2: Verify Database Setup

After running the script, verify everything was created:

### Check Tables
Run this query in SQL Editor:
```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name LIKE 'email_%'
ORDER BY table_name;
```

You should see:
- `email_bounces`
- `email_domains`
- `email_events`
- `email_logs`
- `email_sender_addresses`
- `email_statistics`
- `email_templates`

### Check Seed Data
Run this query to see seeded domains:
```sql
SELECT * FROM email_domains;
```

You should see:
- inneranimals.com
- meauxbility.org
- meauxbility.com

### Check Views
```sql
SELECT * FROM v_recent_email_activity LIMIT 5;
SELECT * FROM v_email_performance_by_sender;
SELECT * FROM v_daily_email_summary;
```

---

## 🔗 Step 3: Configure Resend Webhook

To automatically track email events (opens, clicks, bounces), set up a webhook in Resend:

### 3.1 Get Your Webhook URL
Your webhook URL is:
```
https://yourdomain.com/api/webhooks/resend
```

Replace `yourdomain.com` with your actual domain (e.g., `innerautodidact.com`)

### 3.2 Add Webhook in Resend

1. **Go to Resend Webhooks**
   - Open https://resend.com/webhooks
   - Click "Add Webhook"

2. **Configure Webhook**
   - **Endpoint URL**: `https://yourdomain.com/api/webhooks/resend`
   - **Description**: "Email event tracking to Supabase"
   - **Events to send**: Select ALL email events:
     - ✅ email.sent
     - ✅ email.delivered
     - ✅ email.delivery_delayed
     - ✅ email.bounced
     - ✅ email.complained
     - ✅ email.opened
     - ✅ email.clicked

3. **Save Webhook**
   - Click "Create webhook"
   - Copy the webhook signing secret (if provided)
   - Store it in `.env.local` as `RESEND_WEBHOOK_SECRET` (optional, for verification)

### 3.3 Test Webhook

Send a test email from your dashboard:
1. Go to https://yourdomain.com/dashboard
2. Click "Email" → "Compose"
3. Send a test email to yourself
4. Check Supabase database:

```sql
-- Check email was logged
SELECT * FROM email_logs ORDER BY sent_at DESC LIMIT 1;

-- Check for events
SELECT * FROM email_events ORDER BY occurred_at DESC LIMIT 5;
```

---

## 📊 Step 4: Explore Your Data

### View Recent Emails
```sql
SELECT
  from_email,
  to_emails,
  subject,
  status,
  sent_at
FROM email_logs
ORDER BY sent_at DESC
LIMIT 10;
```

### Email Performance by Sender
```sql
SELECT * FROM v_email_performance_by_sender;
```

### Daily Statistics
```sql
SELECT * FROM v_daily_email_summary
WHERE date >= CURRENT_DATE - INTERVAL '7 days';
```

### Bounced Emails
```sql
SELECT
  email,
  bounce_type,
  bounce_count,
  is_suppressed,
  last_bounced_at
FROM email_bounces
WHERE is_suppressed = true;
```

---

## 🛠️ Step 5: API Integration (Already Done!)

The API routes have been updated to automatically:
- ✅ Log every sent email to Supabase
- ✅ Track sender usage stats
- ✅ Update email status from webhooks
- ✅ Check bounce list before sending
- ✅ Provide email history from database

**No additional code changes needed!** Just run the SQL schema and you're done.

---

## 📈 Understanding the Database Schema

### Core Tables

#### `email_logs`
Main table for all sent emails
- Tracks: from, to, subject, content, status
- Updated by webhooks with delivery status
- Links to templates if used

#### `email_events`
Detailed event tracking
- Records: sent, delivered, opened, clicked, bounced
- Stores: IP address, user agent, location
- Full webhook payload for debugging

#### `email_domains`
Domain verification tracking
- Monitors: SPF, DKIM, DMARC status
- Links to Resend domain IDs
- Tracks last verification check

#### `email_sender_addresses`
Available sender addresses
- Manages sender profiles
- Tracks usage statistics
- Links to domains

#### `email_templates`
Reusable email templates
- Stores HTML and text versions
- Tracks template usage
- Supports variables

#### `email_statistics`
Daily aggregated stats
- Delivery rates
- Open rates
- Click rates
- By domain, sender, category

#### `email_bounces`
Bounce management
- Hard and soft bounces
- Auto-suppression after 3 bounces
- Prevents sending to bad addresses

---

## 🔒 Security Features

### Row Level Security (RLS)
All tables have RLS enabled:
- Service role has full access
- Users can only see their own emails
- Prevents unauthorized access

### Automatic Triggers
- `update_email_log_status` - Updates email status on events
- `track_email_bounce` - Auto-suppresses bounced emails
- `update_updated_at_column` - Maintains timestamps

---

## 📊 Analytics Queries

### Email Performance Dashboard
```sql
SELECT
  DATE(sent_at) as date,
  COUNT(*) as total,
  COUNT(CASE WHEN status = 'delivered' THEN 1 END) as delivered,
  COUNT(CASE WHEN status = 'opened' THEN 1 END) as opened,
  ROUND(
    COUNT(CASE WHEN status = 'opened' THEN 1 END)::numeric /
    NULLIF(COUNT(CASE WHEN status = 'delivered' THEN 1 END), 0) * 100,
    2
  ) as open_rate
FROM email_logs
WHERE sent_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(sent_at)
ORDER BY date DESC;
```

### Top Performing Senders
```sql
SELECT
  from_email,
  COUNT(*) as emails_sent,
  ROUND(
    AVG(CASE WHEN status = 'opened' THEN 100.0 ELSE 0.0 END),
    2
  ) as avg_open_rate
FROM email_logs
WHERE sent_at >= NOW() - INTERVAL '7 days'
GROUP BY from_email
ORDER BY emails_sent DESC;
```

### Bounce Rate by Domain
```sql
SELECT
  SPLIT_PART(from_email, '@', 2) as domain,
  COUNT(*) as total_sent,
  COUNT(CASE WHEN status = 'bounced' THEN 1 END) as bounced,
  ROUND(
    COUNT(CASE WHEN status = 'bounced' THEN 1 END)::numeric /
    NULLIF(COUNT(*), 0) * 100,
    2
  ) as bounce_rate
FROM email_logs
GROUP BY domain
ORDER BY total_sent DESC;
```

---

## 🔄 Maintenance Tasks

### Clean Up Old Events (Optional)
If you want to archive old events after 90 days:
```sql
DELETE FROM email_events
WHERE occurred_at < NOW() - INTERVAL '90 days';
```

### Update Domain Verification Status
Manually update domain status after verifying in Resend:
```sql
UPDATE email_domains
SET
  status = 'verified',
  spf_verified = true,
  dkim_verified = true,
  dmarc_verified = true,
  verified_at = NOW(),
  last_checked_at = NOW()
WHERE domain_name = 'inneranimals.com';
```

### Reset Sender Usage Stats
Reset monthly usage counters:
```sql
UPDATE email_sender_addresses
SET emails_sent = 0;
```

---

## 🆘 Troubleshooting

### Emails Not Appearing in Database
1. Check API logs for errors
2. Verify Supabase connection in `.env.local`
3. Check RLS policies allow inserts
4. Run: `SELECT * FROM email_logs ORDER BY created_at DESC LIMIT 1;`

### Webhook Events Not Recording
1. Verify webhook is active in Resend dashboard
2. Check webhook URL is correct
3. Test webhook manually from Resend
4. Check API logs: `cat logs/webhooks.log`
5. Verify table: `SELECT * FROM email_events ORDER BY occurred_at DESC LIMIT 5;`

### Performance Issues
1. Ensure indexes are created (run schema again)
2. Archive old data periodically
3. Use materialized views for heavy analytics
4. Consider partitioning large tables

### RLS Blocking Queries
If you need service role access:
```typescript
import { createClient } from '@/lib/supabase/server';

const supabase = await createClient();
// Uses service role key from env, bypasses RLS
```

---

## 🎯 Next Steps

After setup is complete:

1. ✅ Run SQL schema in Supabase
2. ✅ Configure Resend webhook
3. ✅ Send a test email
4. ✅ Verify data in database
5. ✅ Explore analytics views
6. ✅ Set up monitoring/alerts (optional)

**Your email system is now fully integrated with Supabase!**

---

## 📚 Additional Resources

- **SQL Schema**: `docs/supabase-email-schema.sql`
- **Email Setup Guide**: `docs/QUICK-START-EMAIL-SETUP.md`
- **Consolidation Plan**: `docs/EMAIL-CONSOLIDATION-PLAN.md`
- **Supabase Docs**: https://supabase.com/docs
- **Resend Webhooks**: https://resend.com/docs/dashboard/webhooks/introduction

---

## 💡 Pro Tips

1. **Use Views for Dashboards** - The pre-built views are optimized for common queries
2. **Monitor Bounce Rates** - Check `email_bounces` table weekly
3. **Archive Old Data** - Move old events to cold storage after 90 days
4. **Test Webhooks** - Use Resend's webhook tester to simulate events
5. **Export Analytics** - Use Supabase's CSV export for reporting

**You now have enterprise-grade email tracking without enterprise costs!** 🎉
