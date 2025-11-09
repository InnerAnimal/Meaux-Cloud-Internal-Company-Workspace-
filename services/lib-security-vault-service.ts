// ================================================
// Security & Vault Service - Credential Management
// ================================================

import { createClient } from '@/lib/supabase/server'
import crypto from 'crypto'

// Encryption key (should be stored in environment variable)
const ENCRYPTION_KEY = process.env.VAULT_ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex')
const ALGORITHM = 'aes-256-gcm'

/**
 * Encrypt credential value
 */
export function encryptCredential(value: string): {
  encrypted: string
  iv: string
  tag: string
} {
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY, 'hex'), iv)
  
  let encrypted = cipher.update(value, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  
  const tag = cipher.getAuthTag()
  
  return {
    encrypted,
    iv: iv.toString('hex'),
    tag: tag.toString('hex')
  }
}

/**
 * Decrypt credential value
 */
export function decryptCredential(
  encrypted: string,
  iv: string,
  tag: string
): string {
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    Buffer.from(ENCRYPTION_KEY, 'hex'),
    Buffer.from(iv, 'hex')
  )
  
  decipher.setAuthTag(Buffer.from(tag, 'hex'))
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  
  return decrypted
}

/**
 * Store credential in vault
 */
export async function storeCredential({
  organizationId,
  projectId,
  name,
  description,
  credentialType,
  value,
  serviceName,
  environment,
  username,
  url,
  requires2FA = true,
  userId
}: {
  organizationId: string
  projectId?: string
  name: string
  description?: string
  credentialType: 'api_key' | 'password' | 'database' | 'ssh_key' | 'oauth_token' | 'webhook_secret' | 'encryption_key' | 'other'
  value: string
  serviceName?: string
  environment?: 'development' | 'staging' | 'production'
  username?: string
  url?: string
  requires2FA?: boolean
  userId: string
}) {
  const supabase = createClient()
  
  // Encrypt the credential
  const { encrypted, iv, tag } = encryptCredential(value)
  
  // Store in vault
  const { data, error } = await supabase
    .from('credential_vault')
    .insert({
      organization_id: organizationId,
      project_id: projectId,
      name,
      description,
      credential_type: credentialType,
      encrypted_value: encrypted,
      encrypted_iv: iv,
      encrypted_tag: tag,
      service_name: serviceName,
      environment,
      username,
      url,
      requires_2fa: requires2FA,
      created_by: userId
    })
    .select()
    .single()
  
  if (error) throw error
  
  return data
}

/**
 * Retrieve credential (with 2FA check)
 */
export async function retrieveCredential(
  credentialId: string,
  userId: string,
  twoFactorCode?: string,
  twoFactorMethod?: 'totp' | 'sms' | 'email' | 'backup_code'
): Promise<string> {
  const supabase = createClient()
  
  // Get credential
  const { data: credential, error } = await supabase
    .from('credential_vault')
    .select('*')
    .eq('id', credentialId)
    .single()
  
  if (error) throw error
  
  // Check 2FA requirement
  if (credential.requires_2fa) {
    if (!twoFactorCode || !twoFactorMethod) {
      throw new Error('2FA required for credential access')
    }
    
    // Verify 2FA
    const verified = await verify2FA(userId, twoFactorCode, twoFactorMethod)
    if (!verified) {
      throw new Error('2FA verification failed')
    }
    
    // Log 2FA verification
    await supabase
      .from('credential_access_log')
      .insert({
        credential_id: credentialId,
        user_id: userId,
        action: 'view',
        two_factor_verified: true,
        two_factor_method: twoFactorMethod,
        success: true
      })
  }
  
  // Decrypt credential
  const decrypted = decryptCredential(
    credential.encrypted_value,
    credential.encrypted_iv,
    credential.encrypted_tag
  )
  
  // Log access
  await supabase
    .from('credential_vault')
    .update({
      last_accessed_by: userId,
      last_accessed_at: new Date().toISOString(),
      access_count: credential.access_count + 1
    })
    .eq('id', credentialId)
  
  await supabase
    .from('credential_access_log')
    .insert({
      credential_id: credentialId,
      user_id: userId,
      action: 'view',
      success: true
    })
  
  return decrypted
}

/**
 * Check for exposed credentials (integrate with GitHub Secret Scanning, etc.)
 */
export async function checkCredentialExposure(credentialId: string) {
  const supabase = createClient()
  
  // Get credential
  const { data: credential } = await supabase
    .from('credential_vault')
    .select('*')
    .eq('id', credentialId)
    .single()
  
  if (!credential) return
  
  // Decrypt to check (in real implementation, use hash comparison)
  const decrypted = decryptCredential(
    credential.encrypted_value,
    credential.encrypted_iv,
    credential.encrypted_tag
  )
  
  // Check against exposed key databases
  // This is a placeholder - integrate with:
  // - GitHub Secret Scanning API
  // - GitGuardian API
  // - TruffleHog
  // - Have I Been Pwned API
  
  const isExposed = await checkAgainstExposedKeys(decrypted)
  
  if (isExposed) {
    // Create security alert
    await supabase
      .from('security_alerts')
      .insert({
        organization_id: credential.organization_id,
        credential_id: credentialId,
        alert_type: 'exposed_key',
        severity: 'critical',
        title: `Exposed Credential Detected: ${credential.name}`,
        description: `The credential "${credential.name}" appears to be exposed in public repositories or databases. Immediate action required.`,
        recommendation: 'Rotate this credential immediately and revoke the exposed key.',
        status: 'open'
      })
    
    // Notify users
    await notifySecurityAlert(credential.organization_id, credentialId, 'exposed_key')
  }
  
  return isExposed
}

/**
 * Check credential against exposed key databases
 */
async function checkAgainstExposedKeys(credential: string): Promise<boolean> {
  // Placeholder - implement actual checks
  
  // Option 1: GitHub Secret Scanning
  // const githubResponse = await fetch('https://api.github.com/secret-scanning/...')
  
  // Option 2: GitGuardian API
  // const gitguardianResponse = await fetch('https://api.gitguardian.com/...')
  
  // Option 3: Hash and check against Have I Been Pwned
  const hash = crypto.createHash('sha1').update(credential).digest('hex').toUpperCase()
  const prefix = hash.substring(0, 5)
  const suffix = hash.substring(5)
  
  try {
    const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`)
    const text = await response.text()
    return text.includes(suffix)
  } catch {
    return false
  }
}

/**
 * Rotate credential
 */
export async function rotateCredential(
  credentialId: string,
  newValue: string,
  userId: string,
  reason: 'scheduled' | 'manual' | 'security_breach' | 'expired'
) {
  const supabase = createClient()
  
  // Get old credential
  const { data: oldCredential } = await supabase
    .from('credential_vault')
    .select('*')
    .eq('id', credentialId)
    .single()
  
  if (!oldCredential) throw new Error('Credential not found')
  
  // Hash old credential for history
  const oldHash = crypto.createHash('sha256').update(
    decryptCredential(oldCredential.encrypted_value, oldCredential.encrypted_iv, oldCredential.encrypted_tag)
  ).digest('hex')
  
  // Encrypt new value
  const { encrypted, iv, tag } = encryptCredential(newValue)
  const newHash = crypto.createHash('sha256').update(newValue).digest('hex')
  
  // Update credential
  await supabase
    .from('credential_vault')
    .update({
      encrypted_value: encrypted,
      encrypted_iv: iv,
      encrypted_tag: tag,
      rotated_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', credentialId)
  
  // Log rotation
  await supabase
    .from('credential_rotation_history')
    .insert({
      credential_id: credentialId,
      rotated_by: userId,
      rotation_reason: reason,
      old_credential_hash: oldHash,
      new_credential_hash: newHash
    })
  
  // Resolve any security alerts
  await supabase
    .from('security_alerts')
    .update({
      status: 'resolved',
      resolved_by: userId,
      resolved_at: new Date().toISOString(),
      action_taken: 'Credential rotated',
      action_taken_by: userId,
      action_taken_at: new Date().toISOString()
    })
    .eq('credential_id', credentialId)
    .eq('status', 'open')
}

/**
 * Verify 2FA code
 */
export async function verify2FA(
  userId: string,
  code: string,
  method: 'totp' | 'sms' | 'email' | 'backup_code'
): Promise<boolean> {
  const supabase = createClient()
  
  // Get user's 2FA settings
  const { data: twoFactor } = await supabase
    .from('user_two_factor')
    .select('*')
    .eq('user_id', userId)
    .single()
  
  if (!twoFactor) return false
  
  // Verify based on method
  switch (method) {
    case 'totp':
      return verifyTOTP(twoFactor.totp_secret_encrypted, code)
    case 'sms':
      return verifySMSCode(userId, code)
    case 'email':
      return verifyEmailCode(userId, code)
    case 'backup_code':
      return verifyBackupCode(twoFactor.totp_backup_codes, code, userId)
    default:
      return false
  }
}

/**
 * Verify TOTP code
 */
function verifyTOTP(encryptedSecret: string, code: string): boolean {
  // Decrypt secret
  // Use library like 'otplib' or 'speakeasy'
  // This is a placeholder
  return true // Implement actual TOTP verification
}

/**
 * Verify SMS code
 */
async function verifySMSCode(userId: string, code: string): Promise<boolean> {
  const supabase = createClient()
  
  // Check 2FA session
  const { data: session } = await supabase
    .from('two_factor_sessions')
    .select('*')
    .eq('user_id', userId)
    .eq('verified', false)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .single()
  
  if (!session) return false
  
  // Verify code (compare hashed)
  const codeHash = crypto.createHash('sha256').update(code).digest('hex')
  const isValid = codeHash === session.code
  
  if (isValid) {
    await supabase
      .from('two_factor_sessions')
      .update({
        verified: true,
        verified_at: new Date().toISOString()
      })
      .eq('id', session.id)
  } else {
    await supabase
      .from('two_factor_sessions')
      .update({
        attempt_count: session.attempt_count + 1
      })
      .eq('id', session.id)
  }
  
  return isValid && session.attempt_count < session.max_attempts
}

/**
 * Verify email code
 */
async function verifyEmailCode(userId: string, code: string): Promise<boolean> {
  // Similar to SMS verification
  return verifySMSCode(userId, code)
}

/**
 * Verify backup code
 */
async function verifyBackupCode(
  encryptedBackupCodes: string[],
  code: string,
  userId: string
): Promise<boolean> {
  const supabase = createClient()
  
  // Get used codes
  const { data: twoFactor } = await supabase
    .from('user_two_factor')
    .select('backup_codes_used')
    .eq('user_id', userId)
    .single()
  
  if (!twoFactor) return false
  
  // Check if code is already used
  if (twoFactor.backup_codes_used?.includes(code)) {
    return false
  }
  
  // Decrypt and verify backup codes
  // This is simplified - implement proper decryption
  const isValid = encryptedBackupCodes.some(encrypted => {
    // Decrypt and compare
    return true // Placeholder
  })
  
  if (isValid) {
    // Mark code as used
    await supabase
      .from('user_two_factor')
      .update({
        backup_codes_used: [...(twoFactor.backup_codes_used || []), code]
      })
      .eq('user_id', userId)
  }
  
  return isValid
}

/**
 * Notify users of security alert
 */
async function notifySecurityAlert(
  organizationId: string,
  credentialId: string,
  alertType: string
) {
  const supabase = createClient()
  
  // Get security policy
  const { data: policy } = await supabase
    .from('security_policies')
    .select('alert_recipients')
    .eq('organization_id', organizationId)
    .eq('is_active', true)
    .single()
  
  if (!policy) return
  
  // Get alert
  const { data: alert } = await supabase
    .from('security_alerts')
    .select('*')
    .eq('credential_id', credentialId)
    .eq('alert_type', alertType)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()
  
  if (!alert) return
  
  // Send notifications to recipients
  // This would integrate with your email service
  // await sendEmail({...})
  
  // Update alert
  await supabase
    .from('security_alerts')
    .update({
      notified_users: policy.alert_recipients || [],
      notification_sent: true
    })
    .eq('id', alert.id)
}

/**
 * Run security scan for organization
 */
export async function runSecurityScan(organizationId: string, userId: string) {
  const supabase = createClient()
  
  // Create scan record
  const { data: scan } = await supabase
    .from('security_scans')
    .insert({
      organization_id: organizationId,
      scan_type: 'credential_exposure',
      status: 'running',
      triggered_by: userId,
      trigger_reason: 'manual'
    })
    .select()
    .single()
  
  if (!scan) return
  
  // Get all credentials for organization
  const { data: credentials } = await supabase
    .from('credential_vault')
    .select('id')
    .eq('organization_id', organizationId)
    .eq('is_active', true)
  
  if (!credentials) return
  
  const findings: any[] = []
  let criticalCount = 0
  let highCount = 0
  
  // Check each credential
  for (const credential of credentials) {
    const isExposed = await checkCredentialExposure(credential.id)
    
    if (isExposed) {
      findings.push({
        type: 'exposed_key',
        severity: 'critical',
        description: `Credential ${credential.id} is exposed`,
        credential_id: credential.id,
        recommendation: 'Rotate credential immediately'
      })
      criticalCount++
    }
  }
  
  // Update scan results
  await supabase
    .from('security_scans')
    .update({
      status: 'completed',
      findings,
      critical_count: criticalCount,
      high_count: highCount,
      completed_at: new Date().toISOString()
    })
    .eq('id', scan.id)
  
  return scan
}

