-- =====================================================
-- MEAUX CLOUD - EMAIL SYSTEM DATABASE SCHEMA
-- =====================================================
-- Run this script in your Supabase SQL Editor
-- This creates all necessary tables for the email system
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLE: email_domains
-- Tracks all configured email domains and their status
-- =====================================================
CREATE TABLE IF NOT EXISTS email_domains (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  domain_name VARCHAR(255) NOT NULL UNIQUE,
  resend_domain_id VARCHAR(255),
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'failed')),

  -- DNS Records Status
  spf_verified BOOLEAN DEFAULT false,
  dkim_verified BOOLEAN DEFAULT false,
  dmarc_verified BOOLEAN DEFAULT false,

  -- Metadata
  region VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  verified_at TIMESTAMP WITH TIME ZONE,
  last_checked_at TIMESTAMP WITH TIME ZONE,

  -- Notes and configuration
  notes TEXT,
  is_active BOOLEAN DEFAULT true
);

-- Index for fast domain lookups
CREATE INDEX IF NOT EXISTS idx_email_domains_domain_name ON email_domains(domain_name);
CREATE INDEX IF NOT EXISTS idx_email_domains_status ON email_domains(status);

-- =====================================================
-- TABLE: email_sender_addresses
-- Manages available sender email addresses
-- =====================================================
CREATE TABLE IF NOT EXISTS email_sender_addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) NOT NULL UNIQUE,
  display_name VARCHAR(255) NOT NULL,
  domain_id UUID REFERENCES email_domains(id) ON DELETE CASCADE,

  -- Status
  is_verified BOOLEAN DEFAULT false,
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,

  -- Usage tracking
  emails_sent INTEGER DEFAULT 0,
  last_used_at TIMESTAMP WITH TIME ZONE,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT
);

-- Indexes for sender lookups
CREATE INDEX IF NOT EXISTS idx_sender_addresses_email ON email_sender_addresses(email);
CREATE INDEX IF NOT EXISTS idx_sender_addresses_domain ON email_sender_addresses(domain_id);
CREATE INDEX IF NOT EXISTS idx_sender_addresses_active ON email_sender_addresses(is_active) WHERE is_active = true;

-- =====================================================
-- TABLE: email_templates
-- Stores reusable email templates
-- =====================================================
CREATE TABLE IF NOT EXISTS email_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id VARCHAR(100) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  subject VARCHAR(500) NOT NULL,

  -- Content
  html_content TEXT,
  text_content TEXT,

  -- Variables
  variables JSONB DEFAULT '[]'::jsonb,

  -- Categorization
  category VARCHAR(100) CHECK (category IN ('transactional', 'marketing', 'notification', 'support', 'internal')),
  tags TEXT[],

  -- Status
  is_active BOOLEAN DEFAULT true,

  -- Usage tracking
  times_used INTEGER DEFAULT 0,
  last_used_at TIMESTAMP WITH TIME ZONE,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by VARCHAR(255),
  notes TEXT
);

-- Indexes for template lookups
CREATE INDEX IF NOT EXISTS idx_email_templates_template_id ON email_templates(template_id);
CREATE INDEX IF NOT EXISTS idx_email_templates_category ON email_templates(category);
CREATE INDEX IF NOT EXISTS idx_email_templates_active ON email_templates(is_active) WHERE is_active = true;

-- =====================================================
-- TABLE: email_logs
-- Tracks all sent emails
-- =====================================================
CREATE TABLE IF NOT EXISTS email_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Resend Email ID
  resend_email_id VARCHAR(255) UNIQUE,

  -- Sender & Recipients
  from_email VARCHAR(255) NOT NULL,
  from_name VARCHAR(255),
  to_emails TEXT[] NOT NULL,
  cc_emails TEXT[],
  bcc_emails TEXT[],
  reply_to VARCHAR(255),

  -- Content
  subject VARCHAR(1000) NOT NULL,
  html_body TEXT,
  text_body TEXT,

  -- Template info (if used)
  template_id UUID REFERENCES email_templates(id) ON DELETE SET NULL,
  template_variables JSONB,

  -- Status
  status VARCHAR(50) DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'opened', 'clicked', 'bounced', 'complained', 'failed')),

  -- Delivery tracking
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  delivered_at TIMESTAMP WITH TIME ZONE,
  opened_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  bounced_at TIMESTAMP WITH TIME ZONE,

  -- Error tracking
  error_message TEXT,
  error_code VARCHAR(50),

  -- Categorization
  category VARCHAR(100) CHECK (category IN ('transactional', 'marketing', 'notification', 'support', 'internal')),
  tags JSONB DEFAULT '[]'::jsonb,

  -- Metadata
  user_id UUID,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for email log queries
CREATE INDEX IF NOT EXISTS idx_email_logs_resend_id ON email_logs(resend_email_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_from_email ON email_logs(from_email);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON email_logs(status);
CREATE INDEX IF NOT EXISTS idx_email_logs_category ON email_logs(category);
CREATE INDEX IF NOT EXISTS idx_email_logs_sent_at ON email_logs(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_logs_user_id ON email_logs(user_id);

-- =====================================================
-- TABLE: email_events
-- Tracks detailed email events (webhooks from Resend)
-- =====================================================
CREATE TABLE IF NOT EXISTS email_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email_log_id UUID REFERENCES email_logs(id) ON DELETE CASCADE,
  resend_email_id VARCHAR(255),

  -- Event details
  event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('sent', 'delivered', 'delivery_delayed', 'complained', 'bounced', 'opened', 'clicked')),
  event_data JSONB,

  -- Timing
  occurred_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Additional context
  ip_address INET,
  user_agent TEXT,
  location JSONB, -- Country, city, etc.

  -- Raw webhook payload
  raw_payload JSONB,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for event tracking
CREATE INDEX IF NOT EXISTS idx_email_events_email_log_id ON email_events(email_log_id);
CREATE INDEX IF NOT EXISTS idx_email_events_resend_id ON email_events(resend_email_id);
CREATE INDEX IF NOT EXISTS idx_email_events_event_type ON email_events(event_type);
CREATE INDEX IF NOT EXISTS idx_email_events_occurred_at ON email_events(occurred_at DESC);

-- =====================================================
-- TABLE: email_statistics
-- Daily email statistics for analytics
-- =====================================================
CREATE TABLE IF NOT EXISTS email_statistics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Date tracking
  stat_date DATE NOT NULL,

  -- Domain/sender breakdown
  domain_name VARCHAR(255),
  sender_email VARCHAR(255),
  category VARCHAR(100),

  -- Counts
  total_sent INTEGER DEFAULT 0,
  total_delivered INTEGER DEFAULT 0,
  total_opened INTEGER DEFAULT 0,
  total_clicked INTEGER DEFAULT 0,
  total_bounced INTEGER DEFAULT 0,
  total_complained INTEGER DEFAULT 0,
  total_failed INTEGER DEFAULT 0,

  -- Rates (calculated)
  delivery_rate DECIMAL(5,2),
  open_rate DECIMAL(5,2),
  click_rate DECIMAL(5,2),
  bounce_rate DECIMAL(5,2),

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Unique constraint for daily stats
  UNIQUE(stat_date, domain_name, sender_email, category)
);

-- Indexes for statistics queries
CREATE INDEX IF NOT EXISTS idx_email_stats_date ON email_statistics(stat_date DESC);
CREATE INDEX IF NOT EXISTS idx_email_stats_domain ON email_statistics(domain_name);
CREATE INDEX IF NOT EXISTS idx_email_stats_sender ON email_statistics(sender_email);
CREATE INDEX IF NOT EXISTS idx_email_stats_category ON email_statistics(category);

-- =====================================================
-- TABLE: email_bounces
-- Tracks bounced email addresses
-- =====================================================
CREATE TABLE IF NOT EXISTS email_bounces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) NOT NULL,

  -- Bounce details
  bounce_type VARCHAR(50) CHECK (bounce_type IN ('hard', 'soft', 'complaint')),
  bounce_reason TEXT,
  bounce_code VARCHAR(50),

  -- Tracking
  first_bounced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_bounced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  bounce_count INTEGER DEFAULT 1,

  -- Status
  is_suppressed BOOLEAN DEFAULT false,
  suppressed_at TIMESTAMP WITH TIME ZONE,

  -- Notes
  notes TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(email)
);

-- Indexes for bounce lookups
CREATE INDEX IF NOT EXISTS idx_email_bounces_email ON email_bounces(email);
CREATE INDEX IF NOT EXISTS idx_email_bounces_suppressed ON email_bounces(is_suppressed);
CREATE INDEX IF NOT EXISTS idx_email_bounces_type ON email_bounces(bounce_type);

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for email_sender_addresses
DROP TRIGGER IF EXISTS update_sender_addresses_updated_at ON email_sender_addresses;
CREATE TRIGGER update_sender_addresses_updated_at
  BEFORE UPDATE ON email_sender_addresses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for email_templates
DROP TRIGGER IF EXISTS update_email_templates_updated_at ON email_templates;
CREATE TRIGGER update_email_templates_updated_at
  BEFORE UPDATE ON email_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to update email_logs status based on events
CREATE OR REPLACE FUNCTION update_email_log_status()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE email_logs
  SET
    status = NEW.event_type,
    delivered_at = CASE WHEN NEW.event_type = 'delivered' THEN NEW.occurred_at ELSE delivered_at END,
    opened_at = CASE WHEN NEW.event_type = 'opened' THEN NEW.occurred_at ELSE opened_at END,
    clicked_at = CASE WHEN NEW.event_type = 'clicked' THEN NEW.occurred_at ELSE clicked_at END,
    bounced_at = CASE WHEN NEW.event_type = 'bounced' THEN NEW.occurred_at ELSE bounced_at END
  WHERE id = NEW.email_log_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update email_logs when events are created
DROP TRIGGER IF EXISTS update_email_status_on_event ON email_events;
CREATE TRIGGER update_email_status_on_event
  AFTER INSERT ON email_events
  FOR EACH ROW
  EXECUTE FUNCTION update_email_log_status();

-- Function to track bounce emails
CREATE OR REPLACE FUNCTION track_email_bounce()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.event_type = 'bounced' THEN
    -- Extract recipient email from event data
    INSERT INTO email_bounces (email, bounce_type, bounce_reason, bounce_code)
    VALUES (
      (NEW.event_data->>'email')::VARCHAR,
      CASE
        WHEN NEW.event_data->>'bounce_type' = 'hard' THEN 'hard'
        WHEN NEW.event_data->>'bounce_type' = 'soft' THEN 'soft'
        ELSE 'soft'
      END,
      NEW.event_data->>'reason',
      NEW.event_data->>'code'
    )
    ON CONFLICT (email) DO UPDATE
    SET
      last_bounced_at = NOW(),
      bounce_count = email_bounces.bounce_count + 1,
      bounce_reason = EXCLUDED.bounce_reason,
      bounce_code = EXCLUDED.bounce_code,
      is_suppressed = CASE
        WHEN EXCLUDED.bounce_type = 'hard' THEN true
        WHEN email_bounces.bounce_count + 1 >= 3 THEN true
        ELSE email_bounces.is_suppressed
      END,
      suppressed_at = CASE
        WHEN EXCLUDED.bounce_type = 'hard' THEN NOW()
        WHEN email_bounces.bounce_count + 1 >= 3 THEN NOW()
        ELSE email_bounces.suppressed_at
      END;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to track bounces
DROP TRIGGER IF EXISTS track_bounce_on_event ON email_events;
CREATE TRIGGER track_bounce_on_event
  AFTER INSERT ON email_events
  FOR EACH ROW
  EXECUTE FUNCTION track_email_bounce();

-- =====================================================
-- VIEWS FOR ANALYTICS
-- =====================================================

-- View: Recent email activity
CREATE OR REPLACE VIEW v_recent_email_activity AS
SELECT
  el.id,
  el.resend_email_id,
  el.from_email,
  el.to_emails,
  el.subject,
  el.status,
  el.category,
  el.sent_at,
  el.delivered_at,
  el.opened_at,
  et.name as template_name,
  CASE
    WHEN el.opened_at IS NOT NULL THEN true
    ELSE false
  END as was_opened,
  EXTRACT(EPOCH FROM (el.delivered_at - el.sent_at)) as delivery_time_seconds
FROM email_logs el
LEFT JOIN email_templates et ON el.template_id = et.id
ORDER BY el.sent_at DESC
LIMIT 100;

-- View: Email performance by sender
CREATE OR REPLACE VIEW v_email_performance_by_sender AS
SELECT
  from_email,
  COUNT(*) as total_sent,
  COUNT(CASE WHEN status = 'delivered' THEN 1 END) as delivered,
  COUNT(CASE WHEN status = 'opened' THEN 1 END) as opened,
  COUNT(CASE WHEN status = 'clicked' THEN 1 END) as clicked,
  COUNT(CASE WHEN status = 'bounced' THEN 1 END) as bounced,
  COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed,
  ROUND(
    COUNT(CASE WHEN status = 'delivered' THEN 1 END)::DECIMAL /
    NULLIF(COUNT(*), 0) * 100, 2
  ) as delivery_rate,
  ROUND(
    COUNT(CASE WHEN status = 'opened' THEN 1 END)::DECIMAL /
    NULLIF(COUNT(CASE WHEN status = 'delivered' THEN 1 END), 0) * 100, 2
  ) as open_rate
FROM email_logs
GROUP BY from_email
ORDER BY total_sent DESC;

-- View: Daily email summary
CREATE OR REPLACE VIEW v_daily_email_summary AS
SELECT
  DATE(sent_at) as date,
  COUNT(*) as total_sent,
  COUNT(CASE WHEN status = 'delivered' THEN 1 END) as delivered,
  COUNT(CASE WHEN status = 'opened' THEN 1 END) as opened,
  COUNT(CASE WHEN status = 'bounced' THEN 1 END) as bounced,
  COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed,
  ROUND(
    COUNT(CASE WHEN status = 'delivered' THEN 1 END)::DECIMAL /
    NULLIF(COUNT(*), 0) * 100, 2
  ) as delivery_rate,
  ROUND(
    COUNT(CASE WHEN status = 'opened' THEN 1 END)::DECIMAL /
    NULLIF(COUNT(CASE WHEN status = 'delivered' THEN 1 END), 0) * 100, 2
  ) as open_rate
FROM email_logs
WHERE sent_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(sent_at)
ORDER BY date DESC;

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- Enable RLS on all tables
-- =====================================================

-- Enable RLS
ALTER TABLE email_domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_sender_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_bounces ENABLE ROW LEVEL SECURITY;

-- Policies for email_domains (allow service role full access)
CREATE POLICY "Service role can manage domains" ON email_domains
  FOR ALL USING (auth.role() = 'service_role');

-- Policies for email_sender_addresses
CREATE POLICY "Service role can manage sender addresses" ON email_sender_addresses
  FOR ALL USING (auth.role() = 'service_role');

-- Policies for email_templates
CREATE POLICY "Service role can manage templates" ON email_templates
  FOR ALL USING (auth.role() = 'service_role');

-- Policies for email_logs
CREATE POLICY "Service role can manage email logs" ON email_logs
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Users can view their own email logs" ON email_logs
  FOR SELECT USING (auth.uid() = user_id);

-- Policies for email_events
CREATE POLICY "Service role can manage email events" ON email_events
  FOR ALL USING (auth.role() = 'service_role');

-- Policies for email_statistics
CREATE POLICY "Service role can manage email statistics" ON email_statistics
  FOR ALL USING (auth.role() = 'service_role');

-- Policies for email_bounces
CREATE POLICY "Service role can manage email bounces" ON email_bounces
  FOR ALL USING (auth.role() = 'service_role');

-- =====================================================
-- SEED DATA - Initial configuration
-- =====================================================

-- Insert configured domains
INSERT INTO email_domains (domain_name, status, is_active) VALUES
  ('inneranimals.com', 'pending', true),
  ('meauxbility.org', 'pending', true),
  ('meauxbility.com', 'pending', true)
ON CONFLICT (domain_name) DO NOTHING;

-- Insert sender addresses (linked to domains)
INSERT INTO email_sender_addresses (email, display_name, domain_id, is_verified, is_default)
SELECT
  'info@inneranimals.com',
  'Inner Animals',
  id,
  true,
  true
FROM email_domains WHERE domain_name = 'inneranimals.com'
ON CONFLICT (email) DO NOTHING;

INSERT INTO email_sender_addresses (email, display_name, domain_id, is_verified, is_default)
SELECT
  'noreply@inneranimals.com',
  'Inner Animals (No Reply)',
  id,
  true,
  false
FROM email_domains WHERE domain_name = 'inneranimals.com'
ON CONFLICT (email) DO NOTHING;

INSERT INTO email_sender_addresses (email, display_name, domain_id, is_verified, is_default)
SELECT
  'sam@meauxbility.org',
  'Sam - Meauxbility',
  id,
  false,
  false
FROM email_domains WHERE domain_name = 'meauxbility.org'
ON CONFLICT (email) DO NOTHING;

INSERT INTO email_sender_addresses (email, display_name, domain_id, is_verified, is_default)
SELECT
  'contact@meauxbility.com',
  'Meauxbility Contact',
  id,
  false,
  false
FROM email_domains WHERE domain_name = 'meauxbility.com'
ON CONFLICT (email) DO NOTHING;

INSERT INTO email_sender_addresses (email, display_name, domain_id, is_verified, is_default)
SELECT
  'support@meauxbility.org',
  'Meauxbility Support',
  id,
  false,
  false
FROM email_domains WHERE domain_name = 'meauxbility.org'
ON CONFLICT (email) DO NOTHING;

-- Insert default email templates
INSERT INTO email_templates (template_id, name, subject, html_content, text_content, category, variables) VALUES
(
  'welcome',
  'Welcome Email',
  'Welcome to {{company_name}}!',
  '<!DOCTYPE html><html><body><h1>Welcome, {{user_name}}!</h1><p>We''re excited to have you on board at <strong>{{company_name}}</strong>!</p></body></html>',
  'Welcome, {{user_name}}! We''re excited to have you on board at {{company_name}}!',
  'transactional',
  '["company_name", "user_name", "dashboard_url"]'::jsonb
),
(
  'notification',
  'System Notification',
  '{{notification_title}}',
  '<!DOCTYPE html><html><body><h2>{{notification_title}}</h2><p>{{notification_message}}</p></body></html>',
  '{{notification_title}}\n\n{{notification_message}}',
  'notification',
  '["notification_title", "notification_message", "action_url", "action_text"]'::jsonb
),
(
  'invoice',
  'Invoice/Receipt',
  'Your invoice from {{company_name}}',
  '<!DOCTYPE html><html><body><h1>Invoice</h1><p>Thank you for your payment!</p><p><strong>Amount:</strong> {{amount}}</p></body></html>',
  'Invoice\n\nThank you for your payment!\nAmount: {{amount}}',
  'transactional',
  '["company_name", "customer_name", "invoice_number", "amount", "date", "invoice_url"]'::jsonb
),
(
  'support',
  'Support Response',
  'Re: {{ticket_subject}}',
  '<!DOCTYPE html><html><body><h2>Support Update</h2><p>Hi {{customer_name}},</p><p>{{response_message}}</p></body></html>',
  'Support Update\n\nHi {{customer_name}},\n\n{{response_message}}',
  'support',
  '["customer_name", "ticket_subject", "ticket_number", "response_message", "support_url"]'::jsonb
)
ON CONFLICT (template_id) DO NOTHING;

-- =====================================================
-- GRANTS - Ensure service role has access
-- =====================================================

GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '==============================================';
  RAISE NOTICE 'Email System Database Schema Created Successfully!';
  RAISE NOTICE '==============================================';
  RAISE NOTICE 'Tables created:';
  RAISE NOTICE '  - email_domains';
  RAISE NOTICE '  - email_sender_addresses';
  RAISE NOTICE '  - email_templates';
  RAISE NOTICE '  - email_logs';
  RAISE NOTICE '  - email_events';
  RAISE NOTICE '  - email_statistics';
  RAISE NOTICE '  - email_bounces';
  RAISE NOTICE '';
  RAISE NOTICE 'Views created:';
  RAISE NOTICE '  - v_recent_email_activity';
  RAISE NOTICE '  - v_email_performance_by_sender';
  RAISE NOTICE '  - v_daily_email_summary';
  RAISE NOTICE '';
  RAISE NOTICE 'Seed data inserted:';
  RAISE NOTICE '  - 3 domains';
  RAISE NOTICE '  - 5 sender addresses';
  RAISE NOTICE '  - 4 email templates';
  RAISE NOTICE '';
  RAISE NOTICE 'Your email system database is ready!';
  RAISE NOTICE '==============================================';
END $$;
