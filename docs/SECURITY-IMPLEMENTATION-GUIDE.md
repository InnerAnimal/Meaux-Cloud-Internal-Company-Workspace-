# Security & Vault Implementation Guide

## 🔐 Overview

This guide covers implementing the security features including:
- Credential vault management
- Two-factor authentication (2FA)
- Security monitoring and alerts
- Encrypted message boards
- Key exposure detection

## 📋 Prerequisites

1. Run `inneranimalmedia-security-vault-extensions.sql` in Supabase
2. Set environment variable: `VAULT_ENCRYPTION_KEY` (32-byte hex string)
3. Install required packages:
```bash
npm install otplib speakeasy qrcode
npm install @types/otplib @types/speakeasy @types/qrcode
```

## 🚀 Implementation Steps

### Step 1: Set Up Encryption Key

Generate a secure encryption key:

```bash
# Generate 32-byte key
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Add to `.env.local`:
```env
VAULT_ENCRYPTION_KEY=your-generated-key-here
```

**⚠️ CRITICAL:** Store this key securely. If lost, all encrypted credentials cannot be recovered.

### Step 2: Implement Credential Vault Service

Copy `lib-security-vault-service.ts` to your project:
```bash
cp lib-security-vault-service.ts lib/security/vault-service.ts
```

Update imports:
```typescript
import { createClient } from '@/lib/supabase/server'
```

### Step 3: Set Up 2FA

#### 3.1 TOTP Setup

Create `lib/security/2fa-service.ts`:

```typescript
import { authenticator } from 'otplib'
import QRCode from 'qrcode'
import { createClient } from '@/lib/supabase/server'

export async function generateTOTPSecret(userId: string) {
  const secret = authenticator.generateSecret()
  
  // Encrypt secret before storing
  const encrypted = encryptSecret(secret)
  
  const supabase = createClient()
  await supabase
    .from('user_two_factor')
    .upsert({
      user_id: userId,
      totp_secret_encrypted: encrypted,
      totp_enabled: false // User must verify first
    })
  
  return secret
}

export async function generateTOTPQRCode(userId: string, email: string) {
  const secret = await generateTOTPSecret(userId)
  
  const otpAuth = authenticator.keyuri(
    email,
    'InnerAnimal Platform',
    secret
  )
  
  const qrCodeUrl = await QRCode.toDataURL(otpAuth)
  return qrCodeUrl
}

export async function verifyTOTP(userId: string, token: string): Promise<boolean> {
  const supabase = createClient()
  
  const { data: twoFactor } = await supabase
    .from('user_two_factor')
    .select('totp_secret_encrypted')
    .eq('user_id', userId)
    .single()
  
  if (!twoFactor?.totp_secret_encrypted) return false
  
  const secret = decryptSecret(twoFactor.totp_secret_encrypted)
  return authenticator.check(token, secret)
}

export async function enableTOTP(userId: string, token: string): Promise<boolean> {
  const isValid = await verifyTOTP(userId, token)
  
  if (isValid) {
    const supabase = createClient()
    await supabase
      .from('user_two_factor')
      .update({ totp_enabled: true })
      .eq('user_id', userId)
    
    // Generate backup codes
    await generateBackupCodes(userId)
  }
  
  return isValid
}

async function generateBackupCodes(userId: string) {
  const codes = Array.from({ length: 10 }, () => 
    Math.random().toString(36).substring(2, 10).toUpperCase()
  )
  
  // Encrypt codes
  const encrypted = codes.map(code => encryptSecret(code))
  
  const supabase = createClient()
  await supabase
    .from('user_two_factor')
    .update({
      totp_backup_codes: encrypted,
      backup_codes_generated_at: new Date().toISOString()
    })
    .eq('user_id', userId)
  
  return codes // Return plain codes for user to save
}
```

#### 3.2 SMS 2FA Setup

For SMS, use Twilio or similar service:

```typescript
import twilio from 'twilio'

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
)

export async function sendSMS2FACode(userId: string, phoneNumber: string) {
  const code = Math.floor(100000 + Math.random() * 900000).toString()
  
  // Store code in session (hashed)
  const codeHash = crypto.createHash('sha256').update(code).digest('hex')
  
  const supabase = createClient()
  await supabase
    .from('two_factor_sessions')
    .insert({
      user_id: userId,
      session_token: crypto.randomBytes(32).toString('hex'),
      verification_method: 'sms',
      code: codeHash,
      expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 min
    })
  
  // Send SMS
  await client.messages.create({
    body: `Your InnerAnimal Platform verification code is: ${code}`,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: phoneNumber
  })
  
  return true
}
```

### Step 4: Implement Security Scans

Create `app/api/security/scan/route.ts`:

```typescript
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { runSecurityScan } from '@/lib/security/vault-service'

export async function POST(request: Request) {
  const { organizationId } = await request.json()
  const supabase = createClient()
  
  // Get user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  
  // Run scan
  const scan = await runSecurityScan(organizationId, user.id)
  
  return NextResponse.json({ scan })
}
```

### Step 5: Set Up Key Exposure Detection

Integrate with GitHub Secret Scanning or GitGuardian:

```typescript
// lib/security/exposure-detection.ts

export async function checkGitHubExposure(credential: string) {
  // Use GitHub Secret Scanning API
  // Or use GitGuardian API
  const response = await fetch('https://api.gitguardian.com/v1/exposures', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.GITGUARDIAN_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ secret: credential })
  })
  
  const data = await response.json()
  return data.found || false
}
```

### Step 6: Create Vault UI Components

#### 6.1 Credential List Component

```typescript
// components/vault/CredentialList.tsx

'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'

export function CredentialList({ organizationId }: { organizationId: string }) {
  const [credentials, setCredentials] = useState([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    loadCredentials()
  }, [organizationId])
  
  async function loadCredentials() {
    const { data } = await supabase
      .from('credential_vault')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
    
    setCredentials(data || [])
    setLoading(false)
  }
  
  return (
    <div>
      {credentials.map(cred => (
        <CredentialCard key={cred.id} credential={cred} />
      ))}
    </div>
  )
}
```

#### 6.2 Credential Access Modal (with 2FA)

```typescript
// components/vault/CredentialAccessModal.tsx

'use client'

import { useState } from 'react'
import { verify2FA, retrieveCredential } from '@/lib/security/vault-service'

export function CredentialAccessModal({ credentialId }: { credentialId: string }) {
  const [twoFactorCode, setTwoFactorCode] = useState('')
  const [method, setMethod] = useState<'totp' | 'sms' | 'email'>('totp')
  const [credential, setCredential] = useState<string | null>(null)
  const [error, setError] = useState('')
  
  async function handleAccess() {
    try {
      // Verify 2FA
      const verified = await verify2FA(userId, twoFactorCode, method)
      if (!verified) {
        setError('2FA verification failed')
        return
      }
      
      // Retrieve credential
      const value = await retrieveCredential(credentialId, userId, twoFactorCode, method)
      setCredential(value)
    } catch (err: any) {
      setError(err.message)
    }
  }
  
  return (
    <div>
      <input
        type="text"
        value={twoFactorCode}
        onChange={(e) => setTwoFactorCode(e.target.value)}
        placeholder="Enter 2FA code"
      />
      <button onClick={handleAccess}>Access Credential</button>
      {credential && (
        <div>
          <input type="password" value={credential} readOnly />
          <button onClick={() => navigator.clipboard.writeText(credential)}>
            Copy
          </button>
        </div>
      )}
    </div>
  )
}
```

### Step 7: Set Up Security Alerts

Create alert notification system:

```typescript
// lib/security/alerts.ts

export async function notifySecurityAlert(alertId: string) {
  const supabase = createClient()
  
  const { data: alert } = await supabase
    .from('security_alerts')
    .select(`
      *,
      organization:organizations(name),
      credential:credential_vault(name, service_name)
    `)
    .eq('id', alertId)
    .single()
  
  if (!alert) return
  
  // Get recipients
  const { data: policy } = await supabase
    .from('security_policies')
    .select('alert_recipients')
    .eq('organization_id', alert.organization_id)
    .single()
  
  const recipients = policy?.alert_recipients || []
  
  // Send emails
  for (const userId of recipients) {
    const { data: user } = await supabase
      .from('profiles')
      .select('email, full_name')
      .eq('id', userId)
      .single()
    
    if (user) {
      await sendEmail({
        to: user.email,
        templateSlug: 'security-alert',
        variables: {
          alert_title: alert.title,
          alert_description: alert.description,
          severity: alert.severity,
          recommendation: alert.recommendation,
          credential_name: alert.credential?.name
        }
      })
    }
  }
}
```

### Step 8: Create Key Management Templates

Help clients manage their keys:

```typescript
// app/api/key-templates/route.ts

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const serviceName = searchParams.get('service')
  
  const supabase = createClient()
  
  const { data: templates } = await supabase
    .from('key_management_templates')
    .select('*')
    .eq('service_name', serviceName)
    .eq('is_active', true)
  
  return NextResponse.json({ templates })
}
```

## 🔒 Security Best Practices

### 1. Encryption Key Management
- ✅ Store `VAULT_ENCRYPTION_KEY` in environment variables
- ✅ Never commit keys to version control
- ✅ Rotate encryption keys periodically
- ✅ Use key management service (AWS KMS, HashiCorp Vault) for production

### 2. 2FA Implementation
- ✅ Require 2FA for credential access
- ✅ Require 2FA for admin actions
- ✅ Provide backup codes
- ✅ Support multiple 2FA methods

### 3. Access Control
- ✅ Log all credential access
- ✅ Limit access to authorized users
- ✅ Implement time-based access (expire sessions)
- ✅ Monitor for suspicious activity

### 4. Key Exposure Prevention
- ✅ Regular security scans
- ✅ Integrate with secret scanning services
- ✅ Monitor GitHub/GitLab for exposed keys
- ✅ Alert immediately on exposure

### 5. Credential Rotation
- ✅ Rotate credentials regularly (90 days default)
- ✅ Automate rotation where possible
- ✅ Track rotation history
- ✅ Revoke old credentials immediately

## 📊 Monitoring & Alerts

### Set Up Automated Scans

Create cron job (Vercel Cron or external service):

```typescript
// app/api/cron/security-scan/route.ts

export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }
  
  const supabase = createClient()
  
  // Get all active organizations
  const { data: organizations } = await supabase
    .from('organizations')
    .select('id')
    .eq('status', 'active')
  
  // Run scans
  for (const org of organizations || []) {
    await runSecurityScan(org.id, 'system')
  }
  
  return Response.json({ success: true })
}
```

## ✅ Checklist

- [ ] Encryption key generated and stored securely
- [ ] Vault service implemented
- [ ] 2FA (TOTP) implemented
- [ ] SMS 2FA configured (optional)
- [ ] Security scan endpoint created
- [ ] Key exposure detection integrated
- [ ] Security alerts system working
- [ ] Credential access logging enabled
- [ ] Automated scans scheduled
- [ ] Key management templates created
- [ ] UI components built
- [ ] Testing completed

## 🆘 Troubleshooting

### Issue: Can't decrypt credentials
**Solution:** Verify `VAULT_ENCRYPTION_KEY` is correct and matches encryption key used

### Issue: 2FA not working
**Solution:** Check TOTP secret is stored correctly, verify time sync

### Issue: Security scans not finding exposed keys
**Solution:** Verify API keys for scanning services, check scan configuration

### Issue: Alerts not sending
**Solution:** Check email service configuration, verify recipient emails

---

**Next:** Set up Cloudflare following `CLOUDFLARE-SETUP-GUIDE.md`

