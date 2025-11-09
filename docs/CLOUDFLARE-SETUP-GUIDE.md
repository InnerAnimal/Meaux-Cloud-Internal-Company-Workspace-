# Cloudflare Setup Guide - InnerAnimal Platform

## 🎯 Overview

You have Cloudflare Pro accounts and multiple domains. This guide will help you:
1. Configure DNS for all your domains
2. Set up SSL/TLS certificates
3. Configure CDN and caching
4. Set up security features
5. Integrate with Vercel deployments

## 📋 Your Domains (to configure)

Based on your setup:
- `inneranimalmedia.com`
- `meauxbility.org`
- `meaux.cloud` (admin center)
- `southernpetsanimalrescue.org` (if applicable)
- Any other domains you own

## 🚀 Step-by-Step Setup

### Step 1: Add Domains to Cloudflare

1. **Login to Cloudflare**
   - Go to https://dash.cloudflare.com
   - Click "Add a Site"

2. **Add Each Domain**
   - Enter domain name (e.g., `inneranimalmedia.com`)
   - Click "Add site"
   - Cloudflare will scan existing DNS records

3. **Choose Plan**
   - Select "Pro" plan (you already have this)
   - Click "Continue"

4. **Review DNS Records**
   - Cloudflare will import existing records
   - Review and confirm

5. **Update Nameservers**
   - Cloudflare will provide nameservers (e.g., `alice.ns.cloudflare.com`)
   - Go to your domain registrar
   - Update nameservers to Cloudflare's
   - Wait for propagation (can take up to 24 hours, usually < 1 hour)

### Step 2: DNS Configuration for Vercel

For each domain that will point to Vercel:

1. **In Cloudflare Dashboard:**
   - Go to DNS → Records
   - Add/Edit records:

   **For Root Domain:**
   ```
   Type: A
   Name: @
   Content: 76.76.21.21 (Vercel's IP - or use CNAME)
   Proxy: Proxied (orange cloud) ✅
   TTL: Auto
   ```

   **OR Use CNAME (Recommended):**
   ```
   Type: CNAME
   Name: @
   Content: cname.vercel-dns.com
   Proxy: Proxied ✅
   TTL: Auto
   ```

   **For WWW:**
   ```
   Type: CNAME
   Name: www
   Content: cname.vercel-dns.com
   Proxy: Proxied ✅
   TTL: Auto
   ```

2. **In Vercel Dashboard:**
   - Go to Project → Settings → Domains
   - Add domain (e.g., `inneranimalmedia.com`)
   - Add `www.inneranimalmedia.com`
   - Vercel will verify DNS

### Step 3: SSL/TLS Configuration

1. **Go to SSL/TLS Settings**
   - In Cloudflare dashboard: SSL/TLS → Overview

2. **Set Encryption Mode**
   - Select "Full (strict)" ✅
   - This ensures end-to-end encryption

3. **Enable Always Use HTTPS**
   - SSL/TLS → Edge Certificates
   - Toggle "Always Use HTTPS" ON ✅

4. **Enable Automatic HTTPS Rewrites**
   - Toggle "Automatic HTTPS Rewrites" ON ✅

5. **Enable HSTS (HTTP Strict Transport Security)**
   - Scroll to "HTTP Strict Transport Security (HSTS)"
   - Click "Enable HSTS"
   - Max Age: 6 months (or 1 year)
   - Include Subdomains: Yes
   - Preload: Yes (optional but recommended)

### Step 4: Security Settings

1. **Web Application Firewall (WAF)**
   - Security → WAF
   - Enable "WAF" ✅
   - Set to "Medium" or "High" security level

2. **Bot Fight Mode**
   - Security → Bots
   - Enable "Bot Fight Mode" ✅
   - Or upgrade to "Super Bot Fight Mode" (Pro feature)

3. **Rate Limiting**
   - Security → WAF → Rate limiting rules
   - Create rules for:
     - Login attempts (e.g., 5 per minute)
     - API endpoints (e.g., 100 per minute)
     - Form submissions (e.g., 10 per minute)

4. **DDoS Protection**
   - Already enabled by default
   - Security → Settings
   - Set to "High" ✅

### Step 5: Performance Optimization

1. **Caching Rules**
   - Caching → Configuration
   - Set Browser Cache TTL: 4 hours
   - Enable "Always Online" ✅

2. **Page Rules (for Vercel)**
   - Rules → Page Rules
   - Create rules:

   **Rule 1: Cache Static Assets**
   ```
   URL: *inneranimalmedia.com/_next/static/*
   Settings:
   - Cache Level: Cache Everything
   - Edge Cache TTL: 1 month
   - Browser Cache TTL: 1 month
   ```

   **Rule 2: Don't Cache API Routes**
   ```
   URL: *inneranimalmedia.com/api/*
   Settings:
   - Cache Level: Bypass
   ```

   **Rule 3: Don't Cache Dashboard**
   ```
   URL: *inneranimalmedia.com/dashboard/*
   Settings:
   - Cache Level: Bypass
   ```

3. **Speed Optimizations**
   - Speed → Optimization
   - Enable:
     - Auto Minify (JavaScript, CSS, HTML) ✅
     - Brotli compression ✅
     - Rocket Loader (optional) ⚠️
     - Mirage (optional, for mobile) ⚠️

### Step 6: Email Configuration (for Resend)

For domains used with Resend:

1. **Add DNS Records for Email**
   - DNS → Records
   - Add SPF record:
     ```
     Type: TXT
     Name: @
     Content: v=spf1 include:_spf.resend.com ~all
     Proxy: DNS only (gray cloud)
     ```

   - Add DKIM records (from Resend dashboard):
     ```
     Type: TXT
     Name: [selector]._domainkey
     Content: [value from Resend]
     Proxy: DNS only
     ```

   - Add DMARC record:
     ```
     Type: TXT
     Name: _dmarc
     Content: v=DMARC1; p=quarantine; rua=mailto:dmarc@inneranimalmedia.com
     Proxy: DNS only
     ```

2. **Verify in Resend**
   - Go to Resend dashboard
   - Add domain
   - Verify DNS records
   - Wait for verification (usually < 5 minutes)

### Step 7: Subdomain Setup

For admin center (`admin.meaux.cloud`):

1. **Add Subdomain Record**
   ```
   Type: CNAME
   Name: admin
   Content: cname.vercel-dns.com
   Proxy: Proxied ✅
   ```

2. **Add to Vercel**
   - Add `admin.meaux.cloud` to Vercel project
   - Verify DNS

### Step 8: Analytics & Monitoring

1. **Cloudflare Analytics**
   - Analytics → Web Analytics
   - Enable for each domain ✅
   - View traffic, performance, security metrics

2. **Set up Alerts**
   - Notifications → Add
   - Configure alerts for:
     - High traffic spikes
     - Security threats
     - SSL certificate expiration
     - DNS changes

### Step 9: Workers (Optional - Advanced)

For custom logic at the edge:

1. **Create Worker**
   - Workers → Create Worker
   - Write edge function
   - Deploy to route

2. **Use Cases:**
   - Custom redirects
   - A/B testing
   - Request modification
   - Custom headers

## 🔧 Configuration for Each Domain

### inneranimalmedia.com
```
DNS:
- @ → CNAME → cname.vercel-dns.com (Proxied)
- www → CNAME → cname.vercel-dns.com (Proxied)
- api → CNAME → cname.vercel-dns.com (Proxied) [if separate API subdomain]

Email (Resend):
- SPF: v=spf1 include:_spf.resend.com ~all
- DKIM: [from Resend]
- DMARC: v=DMARC1; p=quarantine

SSL: Full (strict)
WAF: Enabled (Medium)
```

### meauxbility.org
```
DNS:
- @ → CNAME → cname.vercel-dns.com (Proxied)
- www → CNAME → cname.vercel-dns.com (Proxied)

Email (Resend):
- SPF: v=spf1 include:_spf.resend.com ~all
- DKIM: [from Resend]
- DMARC: v=DMARC1; p=quarantine

SSL: Full (strict)
WAF: Enabled (Medium)
```

### meaux.cloud (Admin Center)
```
DNS:
- @ → CNAME → cname.vercel-dns.com (Proxied)
- admin → CNAME → cname.vercel-dns.com (Proxied)
- api → CNAME → cname.vercel-dns.com (Proxied)

SSL: Full (strict)
WAF: Enabled (High) [More security for admin]
Rate Limiting: Stricter rules
```

## 📊 Recommended Settings Summary

### Security
- ✅ SSL/TLS: Full (strict)
- ✅ Always Use HTTPS: ON
- ✅ HSTS: Enabled (6 months)
- ✅ WAF: Enabled (Medium/High)
- ✅ Bot Fight Mode: Enabled
- ✅ Rate Limiting: Configured

### Performance
- ✅ Auto Minify: ON
- ✅ Brotli: ON
- ✅ Cache Static Assets: 1 month
- ✅ Bypass Cache for API/Dashboard

### Email
- ✅ SPF: Configured
- ✅ DKIM: Configured
- ✅ DMARC: Configured

## 🚨 Common Issues & Solutions

### Issue: DNS Not Propagating
**Solution:**
- Wait up to 24 hours
- Check DNS propagation: https://www.whatsmydns.net
- Clear DNS cache: `sudo dscacheutil -flushcache` (Mac)

### Issue: SSL Certificate Errors
**Solution:**
- Ensure SSL mode is "Full (strict)"
- Verify origin certificate in Vercel
- Check DNS records are correct

### Issue: Email Not Sending (Resend)
**Solution:**
- Verify DNS records (SPF, DKIM, DMARC)
- Check Resend dashboard for errors
- Ensure domain is verified in Resend

### Issue: Vercel Deployment Not Updating
**Solution:**
- Clear Cloudflare cache: Caching → Purge Everything
- Check Vercel deployment status
- Verify DNS records point to Vercel

## 🔐 Security Best Practices

1. **Always Use Proxied DNS** (orange cloud) ✅
   - Protects origin IP
   - Enables DDoS protection
   - Enables caching

2. **Use Full (strict) SSL** ✅
   - End-to-end encryption
   - Prevents man-in-the-middle attacks

3. **Enable WAF** ✅
   - Protects against common attacks
   - Blocks malicious requests

4. **Set Up Rate Limiting** ✅
   - Prevents brute force attacks
   - Protects API endpoints

5. **Monitor Analytics** ✅
   - Watch for unusual traffic
   - Set up alerts

## 📱 Mobile App Configuration (if applicable)

If you have mobile apps:

1. **API Subdomain**
   ```
   api.inneranimalmedia.com → CNAME → cname.vercel-dns.com
   ```

2. **CORS Headers**
   - Workers → Create Worker
   - Add CORS headers for mobile app domains

## 🎯 Next Steps

1. **Add all domains to Cloudflare**
2. **Configure DNS for Vercel**
3. **Set up SSL/TLS**
4. **Configure email (Resend)**
5. **Set up security (WAF, rate limiting)**
6. **Optimize performance (caching)**
7. **Monitor and adjust**

## 📚 Resources

- Cloudflare Docs: https://developers.cloudflare.com
- Vercel DNS: https://vercel.com/docs/concepts/projects/domains
- Resend DNS: https://resend.com/docs/dashboard/domains/introduction

## ✅ Checklist

- [ ] All domains added to Cloudflare
- [ ] Nameservers updated at registrar
- [ ] DNS records configured for Vercel
- [ ] SSL/TLS set to Full (strict)
- [ ] Always Use HTTPS enabled
- [ ] HSTS enabled
- [ ] WAF enabled
- [ ] Bot Fight Mode enabled
- [ ] Rate limiting configured
- [ ] Email DNS (SPF, DKIM, DMARC) configured
- [ ] Resend domains verified
- [ ] Page rules configured
- [ ] Analytics enabled
- [ ] Alerts configured

---

**Pro Tip:** Start with one domain, get it working perfectly, then replicate the settings to other domains!

