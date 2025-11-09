-- ================================================
-- INNERANIMAL MEDIA - SECURITY & VAULT EXTENSIONS
-- Credential Management, 2FA, Encryption, Security Monitoring
-- ================================================

-- =========================
-- Vault & Credential Management
-- =========================

-- Credential Vault (for storing API keys, passwords, etc.)
CREATE TABLE IF NOT EXISTS credential_vault (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  
  -- Credential Info
  name TEXT NOT NULL,
  description TEXT,
  credential_type TEXT NOT NULL CHECK (credential_type IN (
    'api_key',
    'password',
    'database',
    'ssh_key',
    'oauth_token',
    'webhook_secret',
    'encryption_key',
    'other'
  )),
  
  -- Encrypted Credential Data (encrypted at application level)
  encrypted_value TEXT NOT NULL, -- AES-256-GCM encrypted
  encrypted_iv TEXT NOT NULL, -- Initialization vector
  encrypted_tag TEXT NOT NULL, -- Authentication tag
  
  -- Metadata (unencrypted for searching)
  service_name TEXT, -- e.g., 'Stripe', 'Resend', 'Supabase'
  environment TEXT CHECK (environment IN ('development', 'staging', 'production')),
  username TEXT, -- If applicable
  url TEXT, -- Service URL
  
  -- Access Control
  created_by UUID NOT NULL REFERENCES profiles(id),
  last_accessed_by UUID REFERENCES profiles(id),
  last_accessed_at TIMESTAMPTZ,
  access_count INTEGER DEFAULT 0,
  
  -- Security
  requires_2fa BOOLEAN DEFAULT TRUE, -- Require 2FA to view
  auto_rotate BOOLEAN DEFAULT FALSE,
  rotation_schedule TEXT, -- Cron expression for rotation
  expires_at TIMESTAMPTZ,
  
  -- Sharing (encrypted sharing keys)
  shared_with UUID[], -- Array of user IDs who can access
  sharing_keys JSONB DEFAULT '{}'::jsonb, -- Encrypted keys per user
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  is_archived BOOLEAN DEFAULT FALSE,
  
  -- Audit
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  rotated_at TIMESTAMPTZ
);

-- Credential Access Log (audit trail)
CREATE TABLE IF NOT EXISTS credential_access_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  credential_id UUID NOT NULL REFERENCES credential_vault(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id),
  
  -- Access Details
  action TEXT NOT NULL CHECK (action IN ('view', 'copy', 'update', 'delete', 'rotate', 'share')),
  ip_address INET,
  user_agent TEXT,
  location JSONB, -- {country, city, lat, lng}
  
  -- 2FA Verification
  two_factor_verified BOOLEAN DEFAULT FALSE,
  two_factor_method TEXT CHECK (two_factor_method IN ('totp', 'sms', 'email', 'backup_code')),
  
  -- Result
  success BOOLEAN DEFAULT TRUE,
  failure_reason TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Credential Rotation History
CREATE TABLE IF NOT EXISTS credential_rotation_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  credential_id UUID NOT NULL REFERENCES credential_vault(id) ON DELETE CASCADE,
  
  -- Rotation Details
  rotated_by UUID NOT NULL REFERENCES profiles(id),
  rotation_reason TEXT CHECK (rotation_reason IN ('scheduled', 'manual', 'security_breach', 'expired')),
  old_credential_hash TEXT, -- Hash of old credential (for verification)
  new_credential_hash TEXT, -- Hash of new credential
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =========================
-- Two-Factor Authentication (2FA)
-- =========================

-- User 2FA Settings
CREATE TABLE IF NOT EXISTS user_two_factor (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- TOTP (Time-based One-Time Password)
  totp_secret_encrypted TEXT, -- Encrypted TOTP secret
  totp_enabled BOOLEAN DEFAULT FALSE,
  totp_backup_codes TEXT[], -- Encrypted backup codes
  
  -- SMS 2FA
  sms_phone_number TEXT,
  sms_enabled BOOLEAN DEFAULT FALSE,
  sms_verified BOOLEAN DEFAULT FALSE,
  
  -- Email 2FA
  email_2fa_enabled BOOLEAN DEFAULT FALSE,
  
  -- Recovery
  recovery_email TEXT,
  recovery_questions JSONB DEFAULT '[]'::jsonb, -- [{question, answer_hash}]
  
  -- Settings
  require_2fa_for_login BOOLEAN DEFAULT FALSE,
  require_2fa_for_sensitive_actions BOOLEAN DEFAULT TRUE,
  
  -- Backup Codes
  backup_codes_generated_at TIMESTAMPTZ,
  backup_codes_used TEXT[], -- Track used codes
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2FA Verification Sessions
CREATE TABLE IF NOT EXISTS two_factor_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Session Details
  session_token TEXT UNIQUE NOT NULL,
  verification_method TEXT NOT NULL CHECK (verification_method IN ('totp', 'sms', 'email', 'backup_code')),
  
  -- Verification
  code TEXT, -- Hashed verification code
  verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMPTZ,
  
  -- Context
  action_type TEXT, -- 'login', 'credential_access', 'sensitive_action'
  related_id UUID, -- Related resource (credential, etc.)
  
  -- Security
  ip_address INET,
  user_agent TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  
  -- Attempts
  attempt_count INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 5,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =========================
-- Security Monitoring & Key Exposure Detection
-- =========================

-- Security Scans (for exposed keys)
CREATE TABLE IF NOT EXISTS security_scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Scan Details
  scan_type TEXT NOT NULL CHECK (scan_type IN (
    'credential_exposure',
    'vulnerability',
    'dependency_check',
    'code_scan',
    'infrastructure_scan'
  )),
  
  -- Results
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  findings JSONB DEFAULT '[]'::jsonb, -- [{type, severity, description, credential_id, recommendation}]
  
  -- Severity Breakdown
  critical_count INTEGER DEFAULT 0,
  high_count INTEGER DEFAULT 0,
  medium_count INTEGER DEFAULT 0,
  low_count INTEGER DEFAULT 0,
  
  -- Scan Metadata
  scan_config JSONB DEFAULT '{}'::jsonb,
  scan_duration_ms INTEGER,
  
  -- Triggered By
  triggered_by UUID REFERENCES profiles(id),
  trigger_reason TEXT, -- 'scheduled', 'manual', 'webhook', 'api'
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Security Alerts (for exposed keys and vulnerabilities)
CREATE TABLE IF NOT EXISTS security_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  credential_id UUID REFERENCES credential_vault(id) ON DELETE SET NULL,
  scan_id UUID REFERENCES security_scans(id) ON DELETE SET NULL,
  
  -- Alert Details
  alert_type TEXT NOT NULL CHECK (alert_type IN (
    'exposed_key',
    'compromised_credential',
    'suspicious_access',
    'failed_2fa',
    'vulnerability',
    'breach_detected',
    'rotation_required'
  )),
  
  severity TEXT NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low', 'info')),
  
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  recommendation TEXT,
  
  -- Status
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'acknowledged', 'resolved', 'false_positive')),
  acknowledged_by UUID REFERENCES profiles(id),
  acknowledged_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES profiles(id),
  resolved_at TIMESTAMPTZ,
  
  -- Action Taken
  action_taken TEXT,
  action_taken_by UUID REFERENCES profiles(id),
  action_taken_at TIMESTAMPTZ,
  
  -- Notification
  notified_users UUID[],
  notification_sent BOOLEAN DEFAULT FALSE,
  
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Security Policies (organization-level)
CREATE TABLE IF NOT EXISTS security_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Policy Name
  name TEXT NOT NULL,
  description TEXT,
  
  -- Requirements
  require_2fa BOOLEAN DEFAULT TRUE,
  require_2fa_for_login BOOLEAN DEFAULT FALSE,
  require_2fa_for_credential_access BOOLEAN DEFAULT TRUE,
  require_2fa_for_admin_actions BOOLEAN DEFAULT TRUE,
  
  -- Password Policy
  min_password_length INTEGER DEFAULT 12,
  require_uppercase BOOLEAN DEFAULT TRUE,
  require_lowercase BOOLEAN DEFAULT TRUE,
  require_numbers BOOLEAN DEFAULT TRUE,
  require_special_chars BOOLEAN DEFAULT TRUE,
  
  -- Credential Policy
  credential_rotation_days INTEGER DEFAULT 90,
  require_credential_rotation BOOLEAN DEFAULT TRUE,
  max_credential_age_days INTEGER DEFAULT 365,
  
  -- Access Policy
  session_timeout_minutes INTEGER DEFAULT 60,
  max_failed_login_attempts INTEGER DEFAULT 5,
  lockout_duration_minutes INTEGER DEFAULT 30,
  
  -- Scan Policy
  auto_scan_enabled BOOLEAN DEFAULT TRUE,
  scan_frequency TEXT DEFAULT 'daily', -- 'hourly', 'daily', 'weekly'
  scan_schedule TEXT, -- Cron expression
  
  -- Notification Policy
  alert_on_critical BOOLEAN DEFAULT TRUE,
  alert_on_high BOOLEAN DEFAULT TRUE,
  alert_recipients UUID[], -- User IDs to notify
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id)
);

-- =========================
-- Encrypted Message Boards (for client key management)
-- =========================

-- Encrypted Messages (for secure client communication)
CREATE TABLE IF NOT EXISTS encrypted_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES internal_chat_rooms(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES ai_conversations(id) ON DELETE SET NULL,
  
  -- Message Content (encrypted)
  encrypted_content TEXT NOT NULL, -- AES-256-GCM encrypted
  encrypted_iv TEXT NOT NULL,
  encrypted_tag TEXT NOT NULL,
  
  -- Metadata (unencrypted)
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'credential', 'file', 'key_info')),
  subject TEXT, -- For credential/key messages
  
  -- Encryption Details
  encryption_key_id UUID, -- Reference to credential_vault if using stored key
  encryption_method TEXT DEFAULT 'aes-256-gcm',
  
  -- Recipients (who can decrypt)
  recipient_ids UUID[] NOT NULL,
  recipient_keys JSONB DEFAULT '{}'::jsonb, -- Encrypted keys per recipient
  
  -- Author
  author_id UUID NOT NULL REFERENCES profiles(id),
  
  -- Attachments (encrypted)
  attachments JSONB DEFAULT '[]'::jsonb, -- [{name, encrypted_url, encrypted_iv, encrypted_tag}]
  
  -- Status
  is_read BOOLEAN DEFAULT FALSE,
  read_by UUID[] DEFAULT '{}',
  
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Key Management Templates (for helping clients)
CREATE TABLE IF NOT EXISTS key_management_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Template Info
  name TEXT NOT NULL,
  description TEXT,
  service_name TEXT NOT NULL, -- e.g., 'Stripe', 'Resend', 'Supabase'
  
  -- Template Content
  instructions TEXT NOT NULL, -- Step-by-step guide
  example_format TEXT, -- Example of what key looks like
  where_to_find TEXT, -- Where to find the key in service dashboard
  
  -- Security Best Practices
  best_practices TEXT[] DEFAULT ARRAY[
    'Never commit keys to version control',
    'Use environment variables',
    'Rotate keys regularly',
    'Use least privilege principle',
    'Monitor key usage'
  ],
  
  -- Common Mistakes
  common_mistakes TEXT[],
  
  -- Visual Guide (optional)
  screenshot_urls TEXT[],
  video_url TEXT,
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id)
);

-- =========================
-- E-Commerce & Donations
-- =========================

-- Products
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Product Info
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  short_description TEXT,
  
  -- Pricing
  price DECIMAL(12,2) NOT NULL,
  compare_at_price DECIMAL(12,2),
  currency TEXT DEFAULT 'USD',
  is_donation BOOLEAN DEFAULT FALSE, -- If true, allow custom amounts
  
  -- Product Type
  product_type TEXT NOT NULL CHECK (product_type IN ('physical', 'digital', 'service', 'subscription', 'donation')),
  
  -- Inventory (for physical products)
  track_inventory BOOLEAN DEFAULT FALSE,
  inventory_quantity INTEGER,
  allow_backorder BOOLEAN DEFAULT FALSE,
  
  -- Digital Product
  digital_file_url TEXT,
  digital_delivery_method TEXT CHECK (digital_delivery_method IN ('email', 'download', 'stream')),
  
  -- Service Product
  service_duration_hours DECIMAL(5,2),
  service_category TEXT,
  
  -- Subscription
  subscription_interval TEXT CHECK (subscription_interval IN ('monthly', 'quarterly', 'yearly')),
  subscription_price DECIMAL(12,2),
  
  -- Donation
  donation_min_amount DECIMAL(12,2),
  donation_max_amount DECIMAL(12,2),
  donation_suggested_amounts DECIMAL(12,2)[],
  donation_tax_deductible BOOLEAN DEFAULT FALSE,
  
  -- Media
  images TEXT[],
  featured_image_url TEXT,
  
  -- Status
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived', 'sold_out')),
  featured BOOLEAN DEFAULT FALSE,
  
  -- SEO
  meta_title TEXT,
  meta_description TEXT,
  
  -- Metadata
  tags TEXT[],
  categories TEXT[],
  metadata JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id),
  
  UNIQUE(organization_id, slug)
);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Order Info
  order_number TEXT UNIQUE NOT NULL,
  order_type TEXT NOT NULL CHECK (order_type IN ('purchase', 'donation', 'subscription')),
  
  -- Customer
  customer_email TEXT NOT NULL,
  customer_name TEXT,
  customer_phone TEXT,
  customer_id UUID REFERENCES profiles(id), -- If logged in user
  
  -- Billing Address
  billing_address JSONB,
  
  -- Shipping Address (for physical products)
  shipping_address JSONB,
  shipping_method TEXT,
  shipping_cost DECIMAL(10,2) DEFAULT 0,
  tracking_number TEXT,
  
  -- Pricing
  subtotal DECIMAL(12,2) NOT NULL,
  tax_amount DECIMAL(12,2) DEFAULT 0,
  shipping_amount DECIMAL(12,2) DEFAULT 0,
  discount_amount DECIMAL(12,2) DEFAULT 0,
  total DECIMAL(12,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  
  -- Payment
  payment_method TEXT CHECK (payment_method IN ('stripe', 'paypal', 'bank_transfer', 'check', 'cash')),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'processing', 'paid', 'failed', 'refunded', 'partially_refunded')),
  payment_intent_id TEXT, -- Stripe payment intent ID
  payment_transaction_id TEXT,
  
  -- Status
  order_status TEXT DEFAULT 'pending' CHECK (order_status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')),
  
  -- Fulfillment
  fulfilled_at TIMESTAMPTZ,
  shipped_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  
  -- Notes
  customer_notes TEXT,
  internal_notes TEXT,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Order Items
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  
  -- Item Info
  name TEXT NOT NULL,
  description TEXT,
  sku TEXT,
  
  -- Pricing
  price DECIMAL(12,2) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  total DECIMAL(12,2) NOT NULL,
  
  -- Product Snapshot (in case product changes)
  product_snapshot JSONB, -- Store product details at time of purchase
  
  -- Digital Delivery
  digital_file_url TEXT,
  digital_access_granted BOOLEAN DEFAULT FALSE,
  digital_access_granted_at TIMESTAMPTZ,
  
  -- Service Booking
  service_scheduled_at TIMESTAMPTZ,
  service_completed_at TIMESTAMPTZ,
  
  -- Donation
  donation_amount DECIMAL(12,2), -- For custom donation amounts
  donation_dedication TEXT, -- In honor/memory of
  
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Donations (separate table for tracking)
CREATE TABLE IF NOT EXISTS donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  
  -- Donor Info
  donor_name TEXT,
  donor_email TEXT NOT NULL,
  donor_anonymous BOOLEAN DEFAULT FALSE,
  
  -- Donation Details
  amount DECIMAL(12,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  frequency TEXT DEFAULT 'one_time' CHECK (frequency IN ('one_time', 'monthly', 'quarterly', 'yearly')),
  
  -- Tax Deduction
  tax_deductible BOOLEAN DEFAULT FALSE,
  tax_receipt_sent BOOLEAN DEFAULT FALSE,
  tax_receipt_sent_at TIMESTAMPTZ,
  
  -- Dedication
  dedication_type TEXT CHECK (dedication_type IN ('honor', 'memory', 'none')),
  dedication_name TEXT,
  dedication_message TEXT,
  
  -- Payment
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed')),
  payment_method TEXT,
  payment_transaction_id TEXT,
  
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled', 'refunded')),
  
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Payment Methods (Stripe/PayPal configuration)
CREATE TABLE IF NOT EXISTS payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Payment Provider
  provider TEXT NOT NULL CHECK (provider IN ('stripe', 'paypal', 'square', 'custom')),
  
  -- Configuration (encrypted)
  encrypted_config JSONB NOT NULL, -- {api_key, webhook_secret, etc.}
  encrypted_iv TEXT NOT NULL,
  encrypted_tag TEXT NOT NULL,
  
  -- Settings
  is_active BOOLEAN DEFAULT TRUE,
  is_default BOOLEAN DEFAULT FALSE,
  supported_currencies TEXT[] DEFAULT ARRAY['USD'],
  
  -- Webhook
  webhook_url TEXT,
  webhook_secret TEXT,
  
  -- Status
  verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMPTZ,
  
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id)
);

-- =========================
-- Indexes
-- =========================

CREATE INDEX IF NOT EXISTS idx_credential_vault_org ON credential_vault(organization_id);
CREATE INDEX IF NOT EXISTS idx_credential_vault_project ON credential_vault(project_id);
CREATE INDEX IF NOT EXISTS idx_credential_vault_type ON credential_vault(credential_type);
CREATE INDEX IF NOT EXISTS idx_credential_vault_service ON credential_vault(service_name);
CREATE INDEX IF NOT EXISTS idx_credential_access_log_credential ON credential_access_log(credential_id);
CREATE INDEX IF NOT EXISTS idx_credential_access_log_user ON credential_access_log(user_id);
CREATE INDEX IF NOT EXISTS idx_credential_access_log_created ON credential_access_log(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_2fa_user ON user_two_factor(user_id);
CREATE INDEX IF NOT EXISTS idx_2fa_sessions_user ON two_factor_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_2fa_sessions_token ON two_factor_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_2fa_sessions_expires ON two_factor_sessions(expires_at);

CREATE INDEX IF NOT EXISTS idx_security_scans_org ON security_scans(organization_id);
CREATE INDEX IF NOT EXISTS idx_security_scans_status ON security_scans(status);
CREATE INDEX IF NOT EXISTS idx_security_alerts_org ON security_alerts(organization_id);
CREATE INDEX IF NOT EXISTS idx_security_alerts_credential ON security_alerts(credential_id);
CREATE INDEX IF NOT EXISTS idx_security_alerts_status ON security_alerts(status);
CREATE INDEX IF NOT EXISTS idx_security_alerts_severity ON security_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_security_policies_org ON security_policies(organization_id);

CREATE INDEX IF NOT EXISTS idx_encrypted_messages_room ON encrypted_messages(room_id);
CREATE INDEX IF NOT EXISTS idx_encrypted_messages_author ON encrypted_messages(author_id);
CREATE INDEX IF NOT EXISTS idx_key_templates_org ON key_management_templates(organization_id);
CREATE INDEX IF NOT EXISTS idx_key_templates_service ON key_management_templates(service_name);

CREATE INDEX IF NOT EXISTS idx_products_org ON products(organization_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(organization_id, slug);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_type ON products(product_type);
CREATE INDEX IF NOT EXISTS idx_orders_org ON orders(organization_id);
CREATE INDEX IF NOT EXISTS idx_orders_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(order_status);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_donations_org ON donations(organization_id);
CREATE INDEX IF NOT EXISTS idx_donations_order ON donations(order_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_org ON payment_methods(organization_id);

-- =========================
-- RLS Policies
-- =========================

ALTER TABLE credential_vault ENABLE ROW LEVEL SECURITY;
ALTER TABLE credential_access_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE credential_rotation_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_two_factor ENABLE ROW LEVEL SECURITY;
ALTER TABLE two_factor_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE encrypted_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE key_management_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;

-- Credential Vault: Team members can view, require 2FA for access
CREATE POLICY "Team can view credentials" ON credential_vault
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'team_member'))
    AND organization_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
      UNION
      SELECT id FROM organizations WHERE created_by = auth.uid()
    )
  );

-- Security Alerts: Team can view, admins can manage
CREATE POLICY "Team can view security alerts" ON security_alerts
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'team_member'))
    AND organization_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
      UNION
      SELECT id FROM organizations WHERE created_by = auth.uid()
    )
  );

-- Products: Public can view active products
CREATE POLICY "Public can view active products" ON products
  FOR SELECT USING (status = 'active');

-- Orders: Customers can view their own orders
CREATE POLICY "Customers view own orders" ON orders
  FOR SELECT USING (
    customer_id = auth.uid()
    OR customer_email IN (SELECT email FROM profiles WHERE id = auth.uid())
  );

-- =========================
-- Functions & Triggers
-- =========================

-- Function to check for exposed keys (to be called by external service)
CREATE OR REPLACE FUNCTION check_credential_exposure(credential_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  exposed BOOLEAN := FALSE;
BEGIN
  -- This would integrate with services like:
  -- - GitHub Secret Scanning
  -- - GitGuardian
  -- - TruffleHog
  -- For now, return false (implement actual check in application)
  RETURN exposed;
END;
$$ LANGUAGE plpgsql;

-- Function to create security alert
CREATE OR REPLACE FUNCTION create_security_alert(
  p_organization_id UUID,
  p_alert_type TEXT,
  p_severity TEXT,
  p_title TEXT,
  p_description TEXT,
  p_credential_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  alert_id UUID;
BEGIN
  INSERT INTO security_alerts (
    organization_id,
    credential_id,
    alert_type,
    severity,
    title,
    description,
    status
  ) VALUES (
    p_organization_id,
    p_credential_id,
    p_alert_type,
    p_severity,
    p_title,
    p_description,
    'open'
  ) RETURNING id INTO alert_id;
  
  RETURN alert_id;
END;
$$ LANGUAGE plpgsql;

-- Trigger to log credential access
CREATE OR REPLACE FUNCTION log_credential_access()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO credential_access_log (
    credential_id,
    user_id,
    action,
    success
  ) VALUES (
    NEW.id,
    NEW.last_accessed_by,
    'view',
    TRUE
  );
  
  UPDATE credential_vault
  SET access_count = access_count + 1,
      last_accessed_at = NOW()
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to check 2FA requirement
CREATE OR REPLACE FUNCTION check_2fa_requirement()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.requires_2fa = TRUE THEN
    -- Verify user has 2FA enabled
    IF NOT EXISTS (
      SELECT 1 FROM user_two_factor
      WHERE user_id = NEW.last_accessed_by
      AND (totp_enabled = TRUE OR sms_enabled = TRUE OR email_2fa_enabled = TRUE)
    ) THEN
      RAISE EXCEPTION '2FA required for credential access';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =========================
-- Initial Security Policies
-- =========================

-- Create default security policy template
INSERT INTO security_policies (
  organization_id,
  name,
  description,
  require_2fa,
  require_2fa_for_credential_access,
  credential_rotation_days,
  auto_scan_enabled
) VALUES (
  NULL, -- Will be set per organization
  'Default Security Policy',
  'Standard security policy for all organizations',
  TRUE,
  TRUE,
  90,
  TRUE
) ON CONFLICT DO NOTHING;

-- =========================
-- Grants
-- =========================

GRANT SELECT ON credential_vault, security_alerts, security_policies TO authenticated;
GRANT SELECT ON products, orders, donations TO authenticated;
GRANT EXECUTE ON FUNCTION check_credential_exposure, create_security_alert TO authenticated;

