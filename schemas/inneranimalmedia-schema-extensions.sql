-- ================================================
-- INNERANIMAL MEDIA - SCHEMA EXTENSIONS
-- Multi-Tenancy, Branding, Embedded AI Chats, Resend Integration
-- ================================================

-- =========================
-- Multi-Tenancy & Branding
-- =========================

-- Branding Themes (Meaux Cloud, InnerAnimal Media, Meauxbility, etc.)
CREATE TABLE IF NOT EXISTS branding_themes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- e.g., "Meaux Cloud", "InnerAnimal Media", "Meauxbility"
  slug TEXT UNIQUE NOT NULL,
  
  -- Brand Colors
  primary_color TEXT NOT NULL DEFAULT '#60DFDF', -- Teal
  secondary_color TEXT NOT NULL DEFAULT '#4ECDC4', -- Cyan
  accent_color TEXT, -- Orange for Meauxbility
  background_color TEXT DEFAULT '#0a0e12', -- Dark
  text_primary TEXT DEFAULT 'rgba(255, 255, 255, 0.95)',
  text_secondary TEXT DEFAULT 'rgba(255, 255, 255, 0.7)',
  
  -- Brand Assets
  logo_url TEXT,
  favicon_url TEXT,
  og_image_url TEXT,
  
  -- Typography
  font_family TEXT DEFAULT 'Inter',
  heading_font TEXT,
  
  -- UI Theme
  theme_mode TEXT DEFAULT 'dark' CHECK (theme_mode IN ('light', 'dark', 'auto')),
  
  -- Admin Center Branding (Meaux Cloud)
  is_admin_theme BOOLEAN DEFAULT FALSE,
  admin_center_name TEXT DEFAULT 'Meaux Cloud',
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User Dashboard Preferences
CREATE TABLE IF NOT EXISTS user_dashboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Dashboard Configuration
  dashboard_name TEXT NOT NULL DEFAULT 'My Dashboard',
  layout_config JSONB NOT NULL DEFAULT '{
    "widgets": [],
    "columns": 3,
    "compact_mode": false
  }'::jsonb,
  
  -- Widget Preferences
  visible_widgets TEXT[] DEFAULT ARRAY[
    'projects_overview',
    'recent_tasks',
    'time_tracking',
    'ai_commands',
    'notifications',
    'team_activity'
  ],
  
  -- Branding Override (user can override org theme)
  branding_theme_id UUID REFERENCES branding_themes(id),
  
  -- Filters & Views
  default_project_filter TEXT DEFAULT 'all', -- all, my_projects, active, completed
  default_time_range TEXT DEFAULT '7d', -- 1d, 7d, 30d, all
  
  -- Notification Preferences
  email_notifications JSONB DEFAULT '{
    "task_assigned": true,
    "project_updates": true,
    "ai_completions": true,
    "team_mentions": false,
    "daily_digest": false
  }'::jsonb,
  
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(user_id, organization_id)
);

-- =========================
-- Enhanced AI Chat Embedding
-- =========================

-- Internal AI Chat Rooms (embedded in dashboard)
CREATE TABLE IF NOT EXISTS internal_chat_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  
  -- Room Type
  room_type TEXT NOT NULL CHECK (room_type IN ('general', 'project', 'team', 'board', 'private')),
  
  -- Access Control
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES profiles(id),
  
  -- Participants (if private room)
  participant_ids UUID[] DEFAULT '{}',
  
  -- Room Settings
  is_archived BOOLEAN DEFAULT FALSE,
  is_pinned BOOLEAN DEFAULT FALSE,
  
  -- AI Model Configuration
  default_model TEXT DEFAULT 'gpt-4' CHECK (default_model IN ('gpt-4', 'gpt-3.5-turbo', 'claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku')),
  system_prompt TEXT, -- Custom system prompt for this room
  
  -- Context
  context_data JSONB DEFAULT '{}'::jsonb, -- Project context, team info, etc.
  
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_message_at TIMESTAMPTZ
);

-- Chat Messages (enhanced for internal chats)
ALTER TABLE ai_messages ADD COLUMN IF NOT EXISTS room_id UUID REFERENCES internal_chat_rooms(id) ON DELETE CASCADE;
ALTER TABLE ai_messages ADD COLUMN IF NOT EXISTS is_internal BOOLEAN DEFAULT FALSE;
ALTER TABLE ai_messages ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]'::jsonb; -- File attachments
ALTER TABLE ai_messages ADD COLUMN IF NOT EXISTS mentions UUID[] DEFAULT '{}'; -- User mentions
ALTER TABLE ai_messages ADD COLUMN IF NOT EXISTS reactions JSONB DEFAULT '{}'::jsonb; -- Emoji reactions

-- Chat Room Members (for access control)
CREATE TABLE IF NOT EXISTS chat_room_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES internal_chat_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_read_at TIMESTAMPTZ,
  notification_preferences JSONB DEFAULT '{
    "mute": false,
    "mentions_only": false
  }'::jsonb,
  UNIQUE(room_id, user_id)
);

-- =========================
-- Resend Email Integration
-- =========================

-- Email Templates (Resend templates)
CREATE TABLE IF NOT EXISTS email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  subject TEXT NOT NULL,
  
  -- Template Type
  template_type TEXT NOT NULL CHECK (template_type IN (
    'notification',
    'project_update',
    'task_assigned',
    'invoice',
    'welcome',
    'password_reset',
    'ai_completion',
    'team_invite',
    'board_update',
    'custom'
  )),
  
  -- Resend Template ID (if using Resend templates)
  resend_template_id TEXT,
  
  -- HTML Content (if not using Resend templates)
  html_content TEXT,
  text_content TEXT,
  
  -- Branding
  branding_theme_id UUID REFERENCES branding_themes(id),
  
  -- Variables (for template substitution)
  variables JSONB DEFAULT '[]'::jsonb, -- [{name, description, default}]
  
  -- Organization-specific
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id)
);

-- Email Queue (for async sending)
CREATE TABLE IF NOT EXISTS email_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Recipient
  to_email TEXT NOT NULL,
  to_name TEXT,
  cc_emails TEXT[],
  bcc_emails TEXT[],
  
  -- Email Content
  template_id UUID REFERENCES email_templates(id),
  subject TEXT NOT NULL,
  html_content TEXT,
  text_content TEXT,
  
  -- Template Variables
  template_variables JSONB DEFAULT '{}'::jsonb,
  
  -- Sender
  from_email TEXT NOT NULL,
  from_name TEXT,
  reply_to TEXT,
  
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sending', 'sent', 'failed', 'bounced')),
  priority INTEGER DEFAULT 5 CHECK (priority >= 1 AND priority <= 10), -- 1 = highest
  
  -- Resend Response
  resend_email_id TEXT,
  resend_response JSONB,
  error_message TEXT,
  
  -- Retry Logic
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  next_retry_at TIMESTAMPTZ,
  
  -- Context
  user_id UUID REFERENCES profiles(id),
  organization_id UUID REFERENCES organizations(id),
  project_id UUID REFERENCES projects(id),
  related_type TEXT, -- 'project', 'task', 'invoice', etc.
  related_id UUID,
  
  -- Tracking
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  sent_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Email Log (for tracking and analytics)
CREATE TABLE IF NOT EXISTS email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email_queue_id UUID REFERENCES email_queue(id),
  
  -- Event Type
  event_type TEXT NOT NULL CHECK (event_type IN (
    'sent',
    'delivered',
    'opened',
    'clicked',
    'bounced',
    'complained',
    'unsubscribed'
  )),
  
  -- Event Data
  event_data JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamp
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Resend Configuration (per organization)
CREATE TABLE IF NOT EXISTS resend_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID UNIQUE REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- API Configuration
  api_key_encrypted TEXT NOT NULL, -- Encrypted Resend API key
  domain TEXT NOT NULL, -- Verified domain
  
  -- Default Settings
  default_from_email TEXT NOT NULL,
  default_from_name TEXT NOT NULL,
  default_reply_to TEXT,
  
  -- Rate Limits
  daily_limit INTEGER DEFAULT 10000,
  monthly_limit INTEGER DEFAULT 300000,
  
  -- Webhook Configuration
  webhook_secret TEXT,
  webhook_url TEXT,
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  verified_at TIMESTAMPTZ,
  
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =========================
-- Board of Directors & Permissions
-- =========================

-- Board Members
CREATE TABLE IF NOT EXISTS board_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Board Role
  role TEXT NOT NULL CHECK (role IN ('chair', 'vice_chair', 'treasurer', 'secretary', 'member')),
  title TEXT, -- Custom title
  
  -- Permissions
  can_view_financials BOOLEAN DEFAULT FALSE,
  can_approve_projects BOOLEAN DEFAULT FALSE,
  can_manage_team BOOLEAN DEFAULT FALSE,
  can_access_admin_center BOOLEAN DEFAULT TRUE,
  
  -- Term
  term_start DATE,
  term_end DATE,
  is_active BOOLEAN DEFAULT TRUE,
  
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(profile_id, organization_id)
);

-- Permission Groups (for fine-grained access control)
CREATE TABLE IF NOT EXISTS permission_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Permissions (JSONB for flexibility)
  permissions JSONB NOT NULL DEFAULT '{
    "projects": {"view": true, "create": false, "edit": false, "delete": false},
    "tasks": {"view": true, "create": false, "edit": false, "delete": false},
    "ai_commands": {"view": true, "execute": false},
    "financials": {"view": false, "edit": false},
    "team": {"view": true, "manage": false},
    "settings": {"view": false, "edit": false}
  }'::jsonb,
  
  description TEXT,
  is_system BOOLEAN DEFAULT FALSE, -- System groups can't be deleted
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User Permission Assignments
CREATE TABLE IF NOT EXISTS user_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  permission_group_id UUID REFERENCES permission_groups(id) ON DELETE SET NULL,
  
  -- Override Permissions (if not using group)
  custom_permissions JSONB,
  
  -- Effective Permissions (computed)
  effective_permissions JSONB,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(user_id, organization_id)
);

-- =========================
-- Indexes
-- =========================

CREATE INDEX IF NOT EXISTS idx_branding_org ON branding_themes(organization_id);
CREATE INDEX IF NOT EXISTS idx_branding_admin ON branding_themes(is_admin_theme) WHERE is_admin_theme = TRUE;
CREATE INDEX IF NOT EXISTS idx_user_dashboards_user ON user_dashboards(user_id);
CREATE INDEX IF NOT EXISTS idx_user_dashboards_org ON user_dashboards(organization_id);

CREATE INDEX IF NOT EXISTS idx_chat_rooms_org ON internal_chat_rooms(organization_id);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_project ON internal_chat_rooms(project_id);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_type ON internal_chat_rooms(room_type);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_last_message ON internal_chat_rooms(last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_members_room ON chat_room_members(room_id);
CREATE INDEX IF NOT EXISTS idx_chat_members_user ON chat_room_members(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_messages_room ON ai_messages(room_id);
CREATE INDEX IF NOT EXISTS idx_ai_messages_internal ON ai_messages(is_internal) WHERE is_internal = TRUE;

CREATE INDEX IF NOT EXISTS idx_email_templates_type ON email_templates(template_type);
CREATE INDEX IF NOT EXISTS idx_email_templates_org ON email_templates(organization_id);
CREATE INDEX IF NOT EXISTS idx_email_queue_status ON email_queue(status);
CREATE INDEX IF NOT EXISTS idx_email_queue_priority ON email_queue(priority DESC, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_email_queue_retry ON email_queue(next_retry_at) WHERE status = 'failed';
CREATE INDEX IF NOT EXISTS idx_email_logs_queue ON email_logs(email_queue_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_type ON email_logs(event_type);

CREATE INDEX IF NOT EXISTS idx_board_members_org ON board_members(organization_id);
CREATE INDEX IF NOT EXISTS idx_board_members_profile ON board_members(profile_id);
CREATE INDEX IF NOT EXISTS idx_user_permissions_user ON user_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_permissions_org ON user_permissions(organization_id);

-- =========================
-- RLS Policies
-- =========================

ALTER TABLE branding_themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_dashboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE internal_chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_room_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE resend_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE board_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE permission_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_permissions ENABLE ROW LEVEL SECURITY;

-- Branding Themes: Team can view, admins can manage
CREATE POLICY "Team can view branding themes" ON branding_themes
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'team_member'))
    OR organization_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  );

-- User Dashboards: Users can manage their own
CREATE POLICY "Users manage own dashboard" ON user_dashboards
  FOR ALL USING (auth.uid() = user_id);

-- Chat Rooms: Members can access
CREATE POLICY "Chat room members can access" ON internal_chat_rooms
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM chat_room_members WHERE room_id = id AND user_id = auth.uid())
    OR created_by = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'team_member'))
  );

-- Email Queue: System/Admin only
CREATE POLICY "Admins manage email queue" ON email_queue
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Board Members: Board members can view
CREATE POLICY "Board members can view board" ON board_members
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM board_members WHERE profile_id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- =========================
-- Triggers
-- =========================

-- Update last_message_at when message added to room
CREATE OR REPLACE FUNCTION update_chat_room_last_message()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.room_id IS NOT NULL THEN
    UPDATE internal_chat_rooms
    SET last_message_at = NOW()
    WHERE id = NEW.room_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_chat_room_last_message
  AFTER INSERT ON ai_messages
  FOR EACH ROW EXECUTE FUNCTION update_chat_room_last_message();

-- Auto-add creator to chat room members
CREATE OR REPLACE FUNCTION add_creator_to_chat_room()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO chat_room_members (room_id, user_id, role)
  VALUES (NEW.id, NEW.created_by, 'owner')
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER add_creator_to_chat_room
  AFTER INSERT ON internal_chat_rooms
  FOR EACH ROW EXECUTE FUNCTION add_creator_to_chat_room();

-- Update email queue status
CREATE TRIGGER update_email_queue_updated_at BEFORE UPDATE ON email_queue
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =========================
-- Views
-- =========================

-- User Dashboard Summary
CREATE OR REPLACE VIEW user_dashboard_summary AS
SELECT
  ud.id,
  ud.user_id,
  ud.organization_id,
  p.full_name,
  o.name AS organization_name,
  bt.name AS theme_name,
  bt.primary_color,
  bt.secondary_color,
  COUNT(DISTINCT pt.id) FILTER (WHERE pt.assigned_to = ud.user_id AND pt.status IN ('todo', 'in_progress')) AS active_tasks,
  COUNT(DISTINCT pr.id) FILTER (WHERE pr.project_manager_id = ud.user_id) AS managed_projects,
  COUNT(DISTINCT icr.id) FILTER (WHERE EXISTS (SELECT 1 FROM chat_room_members WHERE room_id = icr.id AND user_id = ud.user_id)) AS chat_rooms
FROM user_dashboards ud
JOIN profiles p ON ud.user_id = p.id
LEFT JOIN organizations o ON ud.organization_id = o.id
LEFT JOIN branding_themes bt ON ud.branding_theme_id = bt.id
LEFT JOIN project_tasks pt ON pt.assigned_to = ud.user_id
LEFT JOIN projects pr ON pr.project_manager_id = ud.user_id
LEFT JOIN internal_chat_rooms icr ON icr.organization_id = ud.organization_id
GROUP BY ud.id, ud.user_id, ud.organization_id, p.full_name, o.name, bt.name, bt.primary_color, bt.secondary_color;

-- Email Analytics
CREATE OR REPLACE VIEW email_analytics AS
SELECT
  DATE(created_at) AS date,
  template_id,
  COUNT(*) AS total_sent,
  COUNT(*) FILTER (WHERE status = 'sent') AS successful,
  COUNT(*) FILTER (WHERE status = 'failed') AS failed,
  COUNT(*) FILTER (WHERE opened_at IS NOT NULL) AS opened,
  COUNT(*) FILTER (WHERE clicked_at IS NOT NULL) AS clicked
FROM email_queue
GROUP BY DATE(created_at), template_id;

-- =========================
-- Initial Data
-- =========================

-- Create Meaux Cloud admin theme
INSERT INTO branding_themes (name, slug, primary_color, secondary_color, background_color, is_admin_theme, admin_center_name)
VALUES (
  'Meaux Cloud',
  'meaux-cloud',
  '#60DFDF', -- Teal
  '#4ECDC4', -- Cyan
  '#0a0e12', -- Dark
  TRUE,
  'Meaux Cloud'
) ON CONFLICT DO NOTHING;

-- Create default permission groups
INSERT INTO permission_groups (name, permissions, is_system, description) VALUES
  ('Admin', '{"projects": {"view": true, "create": true, "edit": true, "delete": true}, "tasks": {"view": true, "create": true, "edit": true, "delete": true}, "ai_commands": {"view": true, "execute": true}, "financials": {"view": true, "edit": true}, "team": {"view": true, "manage": true}, "settings": {"view": true, "edit": true}}'::jsonb, TRUE, 'Full system access'),
  ('Team Member', '{"projects": {"view": true, "create": true, "edit": true, "delete": false}, "tasks": {"view": true, "create": true, "edit": true, "delete": false}, "ai_commands": {"view": true, "execute": true}, "financials": {"view": false, "edit": false}, "team": {"view": true, "manage": false}, "settings": {"view": false, "edit": false}}'::jsonb, TRUE, 'Standard team member access'),
  ('Board Member', '{"projects": {"view": true, "create": false, "edit": false, "delete": false}, "tasks": {"view": true, "create": false, "edit": false, "delete": false}, "ai_commands": {"view": true, "execute": false}, "financials": {"view": true, "edit": false}, "team": {"view": true, "manage": false}, "settings": {"view": false, "edit": false}}'::jsonb, TRUE, 'Board of directors access'),
  ('Client', '{"projects": {"view": true, "create": false, "edit": false, "delete": false}, "tasks": {"view": true, "create": false, "edit": false, "delete": false}, "ai_commands": {"view": false, "execute": false}, "financials": {"view": false, "edit": false}, "team": {"view": false, "manage": false}, "settings": {"view": false, "edit": false}}'::jsonb, TRUE, 'Client access')
ON CONFLICT DO NOTHING;

-- =========================
-- Grants
-- =========================

GRANT SELECT ON branding_themes, user_dashboards, internal_chat_rooms, chat_room_members TO authenticated;
GRANT SELECT ON user_dashboard_summary, email_analytics TO authenticated;
GRANT ALL ON email_queue, email_templates TO authenticated WHERE EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin');

