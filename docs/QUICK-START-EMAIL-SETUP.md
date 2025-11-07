# Quick Start: Email Setup Guide

## ⚡ 15-Minute Setup Guide

This guide will help you set up your unified email system across all domains in about 15 minutes.

---

## 📋 Prerequisites

- Access to Resend dashboard (https://resend.com)
- Access to your domain registrar (where you bought your domains)
- A Gmail account for receiving emails (info@inneranimals.com)

---

## 🚀 Step 1: Add Domains to Resend (5 minutes)

### 1.1 Login to Resend
Go to https://resend.com/domains

### 1.2 Add Each Domain
Click **"Add Domain"** and add:
- `inneranimals.com`
- `meauxbility.org`
- `meauxbility.com`

### 1.3 Copy DNS Records
For each domain, Resend will provide DNS records. **Keep this page open** - you'll need these records in the next step.

---

## 🌐 Step 2: Configure DNS Records (5 minutes)

Go to your domain registrar (GoDaddy, Namecheap, Cloudflare, etc.) and add these records for **each domain**:

### SPF Record
```
Type: TXT
Name: @ (or leave blank for root domain)
Value: v=spf1 include:_spf.resend.com ~all
TTL: 3600 (or Auto)
```

### DKIM Record
```
Type: TXT
Name: resend._domainkey (provided by Resend)
Value: [long string provided by Resend]
TTL: 3600 (or Auto)
```

### DMARC Record
```
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=none; rua=mailto:info@inneranimals.com
TTL: 3600 (or Auto)
```

**Important:** The DKIM record value is unique for each domain. Copy it exactly from the Resend dashboard.

---

## ⏰ Step 3: Wait for DNS Propagation (5-30 minutes)

DNS changes can take 5-30 minutes to propagate worldwide. You can check status at:
- https://dnschecker.org

While waiting, move to Step 4.

---

## 📧 Step 4: Set Up Email Forwarding (5 minutes)

### Option A: Cloudflare Email Routing (Recommended - FREE)

1. **Add domains to Cloudflare**
   - Go to https://dash.cloudflare.com
   - Add each domain (free plan is fine)
   - Update nameservers at your registrar

2. **Enable Email Routing**
   - Go to Email → Email Routing for each domain
   - Click "Get Started"

3. **Create Catch-All Rule**
   - Create a catch-all rule: `*@inneranimals.com` → `info@inneranimals.com`
   - Repeat for all domains:
     - `*@meauxbility.org` → `info@inneranimals.com`
     - `*@meauxbility.com` → `info@inneranimals.com`

4. **Verify Email**
   - Cloudflare will send a verification email to info@inneranimals.com
   - Click the verification link

### Option B: ImprovMX (Alternative - FREE for 1 domain)

1. Go to https://improvmx.com
2. Add your domain
3. Set up forwarding: `*@yourdomain.com` → `info@inneranimals.com`

---

## ✅ Step 5: Verify Everything Works (5 minutes)

### 5.1 Verify Domains in Resend
1. Go back to https://resend.com/domains
2. Click "Verify" for each domain
3. All should show green checkmarks ✓

### 5.2 Test Email Sending
1. Go to your dashboard at https://innerautodidact.com/dashboard
2. Click "Email" in the sidebar
3. Click "Compose" tab
4. Click "Send Test" button
5. Check your info@inneranimals.com inbox

### 5.3 Test Email Receiving (if using Cloudflare)
1. Send an email TO any address @inneranimals.com
2. Check info@inneranimals.com - it should arrive there
3. Repeat for @meauxbility.org and @meauxbility.com

---

## 🎯 What You Can Do Now

Once setup is complete, you can:

### Send Emails
- From any verified domain address
- Using templates or custom content
- Track delivery status in real-time

### Receive Emails
- All emails funnel to info@inneranimals.com
- Reply from Gmail and it works normally
- Use any @inneranimals.com, @meauxbility.org, or @meauxbility.com address

### Manage Everything
- View sent email history in dashboard
- Check domain verification status
- Monitor email statistics

---

## 📊 Your New Email System

### What You Have Now
```
┌─────────────────────────────────────────┐
│         RECEIVING (Cloudflare)          │
│  ┌────────────────────────────────────┐ │
│  │ *@inneranimals.com      ─────┐     │ │
│  │ *@meauxbility.org        ────┤     │ │
│  │ *@meauxbility.com        ────┤     │ │
│  └──────────────────────────────┼─────┘ │
│                                  │       │
│                                  ▼       │
│              info@inneranimals.com       │
│                  (Gmail)                 │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│           SENDING (Resend)              │
│  ┌────────────────────────────────────┐ │
│  │ From: Any verified address         │ │
│  │   • info@inneranimals.com          │ │
│  │   • noreply@inneranimals.com       │ │
│  │   • sam@meauxbility.org            │ │
│  │   • contact@meauxbility.com        │ │
│  └────────────────────────────────────┘ │
│         ▼ Via Resend API ▼             │
│      Delivered to recipients            │
└─────────────────────────────────────────┘
```

---

## 💰 Cost Breakdown

### Before
- Google Workspace: $72+/month
- iCloud+: $10+/month
- **Total: $82+/month**

### After
- Resend: $0-20/month (up to 50k emails)
- Cloudflare Email Routing: $0/month
- Gmail (1 account): $6/month
- **Total: $6-26/month**

### Savings
- **$56-76/month**
- **$672-912/year**
- **$3,360-4,560 over 5 years**

---

## 🆘 Troubleshooting

### Email sending fails
- ✓ Check domain is verified in Resend dashboard
- ✓ Verify DNS records are correct at dnschecker.org
- ✓ Wait 30 minutes for DNS propagation
- ✓ Check API key is correct in .env.local

### Emails not being received
- ✓ Verify email forwarding is set up in Cloudflare
- ✓ Check spam folder in Gmail
- ✓ Verify catch-all rule includes your domain
- ✓ Send verification email from Cloudflare dashboard

### Domain won't verify
- ✓ Double-check DNS records match exactly
- ✓ Remove any duplicate records
- ✓ Wait up to 48 hours for DNS propagation
- ✓ Use dnschecker.org to verify records are live

### Dashboard not loading emails
- ✓ Check browser console for errors (F12)
- ✓ Verify RESEND_API_KEY in .env.local
- ✓ Make sure you've sent at least one email
- ✓ Note: Email history requires Resend Pro for full access

---

## 📚 Additional Resources

- **Comprehensive Plan**: See `EMAIL-CONSOLIDATION-PLAN.md` for detailed strategy
- **Resend Docs**: https://resend.com/docs
- **Cloudflare Email Routing**: https://developers.cloudflare.com/email-routing/
- **DNS Checker**: https://dnschecker.org

---

## 🎉 Next Steps After Setup

1. **Update Gmail Signature**
   - Add all your email addresses to your Gmail signature
   - People can reply to any address

2. **Cancel Old Subscriptions**
   - Cancel extra Google Workspace accounts (keep 1)
   - Cancel iCloud+ email subscriptions
   - Keep Google Workspace for Calendar/Drive/Meet

3. **Update Email Addresses**
   - Update email on important services
   - Add all addresses to business cards
   - Configure email clients if needed

4. **Monitor Performance**
   - Check delivery rates weekly
   - Watch for bounces
   - Review email analytics in Resend

---

## ✨ You're Done!

Your unified email system is now set up! You can:
- Send from any domain via the dashboard
- Receive all emails in one Gmail inbox
- Save $672-912 per year
- Manage everything in one interface

**Questions?** Check the comprehensive plan or test the system in your dashboard!
