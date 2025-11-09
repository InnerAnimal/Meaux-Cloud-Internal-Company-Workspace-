-- ================================================
-- INNERANIMAL MEDIA - AI-ENHANCED WEB BUILDING AGENCY
-- Comprehensive, Scalable, Future-Proof Schema
-- ================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For fuzzy text search

-- =========================
-- Core Identity & Auth (extends Supabase auth.users)
-- =========================

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'team_member', 'client')),
  company_id UUID, -- References organizations table
  phone TEXT,
  location TEXT,
  website TEXT,
  social_links JSONB DEFAULT '{}'::jsonb, -- {linkedin, twitter, github, etc}
  stripe_customer_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb, -- Flexible for future fields
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ
);

-- Organizations (Clients & Partners)
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  logo_url TEXT,
  website TEXT,
  industry TEXT,
  size TEXT CHECK (size IN ('startup', 'small', 'medium', 'large', 'enterprise')),
  address JSONB, -- {street, city, state, zip, country}
  contact_email TEXT,
  contact_phone TEXT,
  billing_email TEXT,
  stripe_customer_id TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id)
);

-- Team Members (Internal)
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL, -- e.g., "CEO / Founder", "CTO", "CMO"
  department TEXT CHECK (department IN ('design', 'development', 'marketing', 'operations', 'leadership')),
  skills TEXT[], -- Array of skills
  certifications JSONB DEFAULT '[]'::jsonb, -- [{name, issuer, date}]
  experience_years INTEGER,
  hourly_rate DECIMAL(10,2),
  availability_status TEXT DEFAULT 'available' CHECK (availability_status IN ('available', 'busy', 'unavailable')),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =========================
-- Services & Portfolio
-- =========================

CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  short_description TEXT,
  icon_name TEXT, -- SVG icon identifier
  category TEXT CHECK (category IN ('design', 'development', 'branding', 'marketing', 'consulting')),
  pricing_type TEXT CHECK (pricing_type IN ('fixed', 'hourly', 'project', 'subscription')),
  base_price DECIMAL(10,2),
  featured BOOLEAN DEFAULT FALSE,
  display_order INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS portfolio_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  short_description TEXT,
  client_id UUID REFERENCES organizations(id),
  project_type TEXT CHECK (project_type IN ('fullstack', 'saas', 'ecommerce', 'branding', 'website', 'mobile', 'other')),
  featured_image_url TEXT,
  gallery_urls TEXT[],
  tags TEXT[],
  technologies TEXT[], -- Tech stack used
  live_url TEXT,
  github_url TEXT,
  case_study_url TEXT,
  metrics JSONB DEFAULT '{}'::jsonb, -- {efficiency_gain: "50%", cost_reduction: "20%", etc}
  featured BOOLEAN DEFAULT FALSE,
  display_order INTEGER DEFAULT 0,
  status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id)
);

-- =========================
-- Projects & Project Management
-- =========================

CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  client_id UUID REFERENCES organizations(id),
  project_type TEXT NOT NULL CHECK (project_type IN ('fullstack', 'saas', 'ecommerce', 'branding', 'website', 'mobile', 'automation', 'consulting', 'other')),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'planning', 'in_progress', 'review', 'testing', 'deployed', 'maintenance', 'completed', 'cancelled')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  
  -- Project Details
  tech_stack TEXT[],
  repository_url TEXT,
  staging_url TEXT,
  production_url TEXT,
  domain TEXT,
  
  -- Timeline
  start_date DATE,
  target_completion_date DATE,
  actual_completion_date DATE,
  estimated_hours INTEGER,
  actual_hours INTEGER,
  
  -- Budget
  budget DECIMAL(12,2),
  spent DECIMAL(12,2) DEFAULT 0,
  billing_type TEXT CHECK (billing_type IN ('fixed', 'hourly', 'milestone', 'retainer')),
  
  -- Team
  project_manager_id UUID REFERENCES profiles(id),
  team_member_ids UUID[] DEFAULT '{}', -- Array of profile IDs
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb, -- Flexible for project-specific data
  tags TEXT[],
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id)
);

CREATE TABLE IF NOT EXISTS project_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'blocked', 'cancelled')),
  due_date DATE,
  completed_at TIMESTAMPTZ,
  display_order INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS project_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  milestone_id UUID REFERENCES project_milestones(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'review', 'done', 'blocked')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  assigned_to UUID REFERENCES profiles(id),
  estimated_hours DECIMAL(5,2),
  actual_hours DECIMAL(5,2),
  due_date DATE,
  completed_at TIMESTAMPTZ,
  tags TEXT[],
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id)
);

CREATE TABLE IF NOT EXISTS project_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  task_id UUID REFERENCES project_tasks(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT, -- mime type
  file_size BIGINT, -- bytes
  uploaded_by UUID REFERENCES profiles(id),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS project_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  task_id UUID REFERENCES project_tasks(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES project_comments(id) ON DELETE CASCADE, -- For threaded comments
  content TEXT NOT NULL,
  author_id UUID NOT NULL REFERENCES profiles(id),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =========================
-- AI-Enhanced Features
-- =========================

CREATE TABLE IF NOT EXISTS ai_commands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL, -- e.g., "FA", "SA", "MX", "EM"
  name TEXT NOT NULL,
  description TEXT,
  category TEXT CHECK (category IN ('app', 'saas', 'workflow', 'deployment', 'database', 'inner_animals', 'meauxbility', 'other')),
  command_type TEXT CHECK (command_type IN ('scaffold', 'deploy', 'migrate', 'generate', 'monitor', 'other')),
  is_favorite BOOLEAN DEFAULT FALSE,
  usage_count INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb, -- Command-specific config
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_command_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  command_id UUID REFERENCES ai_commands(id),
  executed_by UUID REFERENCES profiles(id),
  project_id UUID REFERENCES projects(id), -- If command created/updated a project
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
  input_data JSONB DEFAULT '{}'::jsonb, -- Command inputs
  output_data JSONB DEFAULT '{}'::jsonb, -- Command outputs/results
  error_message TEXT,
  execution_time_ms INTEGER,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id), -- Optional: link to project
  title TEXT,
  model TEXT NOT NULL DEFAULT 'gpt-4' CHECK (model IN ('gpt-4', 'gpt-3.5-turbo', 'claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku')),
  context_type TEXT CHECK (context_type IN ('general', 'project', 'code', 'design', 'deployment')),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  tokens_used INTEGER,
  model TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_code_generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id),
  command_execution_id UUID REFERENCES ai_command_executions(id),
  conversation_id UUID REFERENCES ai_conversations(id),
  language TEXT, -- e.g., 'typescript', 'python', 'sql'
  file_path TEXT,
  code_content TEXT NOT NULL,
  prompt TEXT,
  status TEXT DEFAULT 'generated' CHECK (status IN ('generated', 'reviewed', 'accepted', 'rejected', 'modified')),
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS project_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  project_type TEXT NOT NULL CHECK (project_type IN ('fullstack', 'saas', 'ecommerce', 'branding', 'website', 'mobile', 'automation')),
  tech_stack TEXT[],
  template_config JSONB NOT NULL DEFAULT '{}'::jsonb, -- Complete project structure/config
  is_public BOOLEAN DEFAULT FALSE,
  usage_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES profiles(id),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =========================
-- Content Management
-- =========================

CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  featured_image_url TEXT,
  author_id UUID NOT NULL REFERENCES profiles(id),
  category TEXT,
  tags TEXT[],
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  published_at TIMESTAMPTZ,
  views INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS case_studies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  project_id UUID REFERENCES projects(id),
  client_id UUID REFERENCES organizations(id),
  challenge TEXT,
  solution TEXT,
  results TEXT,
  metrics JSONB DEFAULT '{}'::jsonb,
  images TEXT[],
  featured BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id)
);

CREATE TABLE IF NOT EXISTS testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES organizations(id),
  author_name TEXT NOT NULL,
  author_title TEXT,
  author_avatar_url TEXT,
  content TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  project_id UUID REFERENCES projects(id),
  featured BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'archived')),
  approved_by UUID REFERENCES profiles(id),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =========================
-- Time Tracking & Billing
-- =========================

CREATE TABLE IF NOT EXISTS time_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  task_id UUID REFERENCES project_tasks(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES profiles(id),
  description TEXT,
  hours DECIMAL(5,2) NOT NULL CHECK (hours > 0),
  billable BOOLEAN DEFAULT TRUE,
  billing_rate DECIMAL(10,2),
  date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number TEXT UNIQUE NOT NULL,
  client_id UUID NOT NULL REFERENCES organizations(id),
  project_id UUID REFERENCES projects(id),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
  issue_date DATE NOT NULL,
  due_date DATE NOT NULL,
  paid_date DATE,
  subtotal DECIMAL(12,2) NOT NULL,
  tax_rate DECIMAL(5,4) DEFAULT 0,
  tax_amount DECIMAL(12,2) DEFAULT 0,
  total DECIMAL(12,2) NOT NULL,
  notes TEXT,
  stripe_invoice_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id)
);

CREATE TABLE IF NOT EXISTS invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity DECIMAL(10,2) DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  total DECIMAL(12,2) NOT NULL,
  time_entry_id UUID REFERENCES time_entries(id),
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =========================
-- Analytics & Tracking
-- =========================

CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL, -- 'page_view', 'command_execution', 'project_created', etc.
  user_id UUID REFERENCES profiles(id),
  session_id TEXT,
  project_id UUID REFERENCES projects(id),
  command_id UUID REFERENCES ai_commands(id),
  properties JSONB DEFAULT '{}'::jsonb, -- Event-specific properties
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS project_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  metric_name TEXT NOT NULL, -- 'views', 'deployments', 'commits', etc.
  metric_value DECIMAL(12,2) NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(project_id, date, metric_name)
);

-- =========================
-- Integrations & Webhooks
-- =========================

CREATE TABLE IF NOT EXISTS integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('github', 'vercel', 'stripe', 'slack', 'email', 'custom')),
  config JSONB NOT NULL DEFAULT '{}'::jsonb, -- Integration-specific config
  is_active BOOLEAN DEFAULT TRUE,
  organization_id UUID REFERENCES organizations(id),
  project_id UUID REFERENCES projects(id),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id)
);

CREATE TABLE IF NOT EXISTS webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  events TEXT[] NOT NULL, -- Array of event types to listen for
  secret TEXT, -- For signature verification
  is_active BOOLEAN DEFAULT TRUE,
  organization_id UUID REFERENCES organizations(id),
  project_id UUID REFERENCES projects(id),
  last_triggered_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id)
);

CREATE TABLE IF NOT EXISTS webhook_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_id UUID NOT NULL REFERENCES webhooks(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  status_code INTEGER,
  response_body TEXT,
  error_message TEXT,
  attempted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =========================
-- Notifications
-- =========================

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('project_update', 'task_assigned', 'comment', 'invoice', 'system', 'ai_completion')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =========================
-- Indexes for Performance
-- =========================

-- Profiles
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_company ON profiles(company_id);

-- Organizations
CREATE INDEX IF NOT EXISTS idx_organizations_slug ON organizations(slug);
CREATE INDEX IF NOT EXISTS idx_organizations_status ON organizations(status);
CREATE INDEX IF NOT EXISTS idx_organizations_created_by ON organizations(created_by);

-- Projects
CREATE INDEX IF NOT EXISTS idx_projects_client ON projects(client_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_type ON projects(project_type);
CREATE INDEX IF NOT EXISTS idx_projects_manager ON projects(project_manager_id);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_projects_slug ON projects(slug);

-- Tasks
CREATE INDEX IF NOT EXISTS idx_tasks_project ON project_tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned ON project_tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON project_tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_milestone ON project_tasks(milestone_id);

-- AI Commands
CREATE INDEX IF NOT EXISTS idx_ai_commands_code ON ai_commands(code);
CREATE INDEX IF NOT EXISTS idx_ai_commands_category ON ai_commands(category);
CREATE INDEX IF NOT EXISTS idx_ai_commands_favorite ON ai_commands(is_favorite) WHERE is_favorite = TRUE;

-- AI Command Executions
CREATE INDEX IF NOT EXISTS idx_ai_executions_command ON ai_command_executions(command_id);
CREATE INDEX IF NOT EXISTS idx_ai_executions_user ON ai_command_executions(executed_by);
CREATE INDEX IF NOT EXISTS idx_ai_executions_project ON ai_command_executions(project_id);
CREATE INDEX IF NOT EXISTS idx_ai_executions_status ON ai_command_executions(status);
CREATE INDEX IF NOT EXISTS idx_ai_executions_created ON ai_command_executions(created_at DESC);

-- AI Conversations
CREATE INDEX IF NOT EXISTS idx_ai_conversations_user ON ai_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_project ON ai_conversations(project_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_updated ON ai_conversations(updated_at DESC);

-- AI Messages
CREATE INDEX IF NOT EXISTS idx_ai_messages_conversation ON ai_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_ai_messages_created ON ai_messages(created_at);

-- Portfolio
CREATE INDEX IF NOT EXISTS idx_portfolio_slug ON portfolio_items(slug);
CREATE INDEX IF NOT EXISTS idx_portfolio_client ON portfolio_items(client_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_featured ON portfolio_items(featured) WHERE featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_portfolio_status ON portfolio_items(status);

-- Blog
CREATE INDEX IF NOT EXISTS idx_blog_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_author ON blog_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_blog_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_published ON blog_posts(published_at DESC) WHERE status = 'published';

-- Time Entries
CREATE INDEX IF NOT EXISTS idx_time_project ON time_entries(project_id);
CREATE INDEX IF NOT EXISTS idx_time_user ON time_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_time_date ON time_entries(date DESC);

-- Analytics
CREATE INDEX IF NOT EXISTS idx_analytics_user ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_created ON analytics_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_project_analytics_project ON project_analytics(project_id);
CREATE INDEX IF NOT EXISTS idx_project_analytics_date ON project_analytics(date DESC);

-- Notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);

-- Full-text search indexes (using GIN for JSONB and arrays)
CREATE INDEX IF NOT EXISTS idx_projects_tags_gin ON projects USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_projects_metadata_gin ON projects USING GIN(metadata);
CREATE INDEX IF NOT EXISTS idx_portfolio_tags_gin ON portfolio_items USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_blog_tags_gin ON blog_posts USING GIN(tags);

-- =========================
-- Row Level Security (RLS)
-- =========================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_commands ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_command_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_code_generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_studies ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Basic RLS Policies (adjust based on your security requirements)

-- Profiles: Users can read their own profile, admins can read all
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Organizations: Team members can view, clients can view their own
CREATE POLICY "Team can view organizations" ON organizations
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'team_member'))
    OR id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  );

-- Projects: Team members can view all, clients can view their own
CREATE POLICY "Team can view all projects" ON projects
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'team_member'))
    OR client_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  );

-- AI Commands: Public read, authenticated execute
CREATE POLICY "Anyone can view commands" ON ai_commands
  FOR SELECT USING (true);

CREATE POLICY "Authenticated can execute commands" ON ai_command_executions
  FOR INSERT WITH CHECK (auth.uid() = executed_by);

-- Portfolio: Public read
CREATE POLICY "Public can view published portfolio" ON portfolio_items
  FOR SELECT USING (status = 'published');

-- Blog: Public read published
CREATE POLICY "Public can view published blog" ON blog_posts
  FOR SELECT USING (status = 'published');

-- =========================
-- Triggers & Functions
-- =========================

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to relevant tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_tasks_updated_at BEFORE UPDATE ON project_tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_conversations_updated_at BEFORE UPDATE ON ai_conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update project spent hours
CREATE OR REPLACE FUNCTION update_project_hours()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE projects
  SET actual_hours = (
    SELECT COALESCE(SUM(actual_hours), 0)
    FROM project_tasks
    WHERE project_id = NEW.project_id AND actual_hours IS NOT NULL
  )
  WHERE id = NEW.project_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_project_hours_on_task_update
  AFTER INSERT OR UPDATE ON project_tasks
  FOR EACH ROW EXECUTE FUNCTION update_project_hours();

-- Function to increment command usage count
CREATE OR REPLACE FUNCTION increment_command_usage()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE ai_commands
  SET usage_count = usage_count + 1
  WHERE id = NEW.command_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER increment_command_usage_on_execution
  AFTER INSERT ON ai_command_executions
  FOR EACH ROW EXECUTE FUNCTION increment_command_usage();

-- Function to create notification on task assignment
CREATE OR REPLACE FUNCTION notify_task_assignment()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.assigned_to IS NOT NULL AND (OLD.assigned_to IS NULL OR NEW.assigned_to != OLD.assigned_to) THEN
    INSERT INTO notifications (user_id, type, title, message, link)
    VALUES (
      NEW.assigned_to,
      'task_assigned',
      'New Task Assigned',
      'You have been assigned to: ' || NEW.title,
      '/projects/' || NEW.project_id || '/tasks/' || NEW.id
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER notify_on_task_assignment
  AFTER INSERT OR UPDATE OF assigned_to ON project_tasks
  FOR EACH ROW EXECUTE FUNCTION notify_task_assignment();

-- =========================
-- Views for Common Queries
-- =========================

-- Project summary view
CREATE OR REPLACE VIEW project_summary AS
SELECT
  p.id,
  p.name,
  p.slug,
  p.status,
  p.project_type,
  p.client_id,
  o.name AS client_name,
  p.project_manager_id,
  pm.full_name AS project_manager_name,
  p.budget,
  p.spent,
  p.estimated_hours,
  p.actual_hours,
  p.start_date,
  p.target_completion_date,
  p.actual_completion_date,
  COUNT(DISTINCT pt.id) AS task_count,
  COUNT(DISTINCT pt.id) FILTER (WHERE pt.status = 'done') AS completed_tasks,
  COUNT(DISTINCT pm2.id) AS milestone_count,
  p.created_at,
  p.updated_at
FROM projects p
LEFT JOIN organizations o ON p.client_id = o.id
LEFT JOIN profiles pm ON p.project_manager_id = pm.id
LEFT JOIN project_tasks pt ON p.id = pt.project_id
LEFT JOIN project_milestones pm2 ON p.id = pm2.project_id
GROUP BY p.id, o.name, pm.full_name;

-- Command usage statistics
CREATE OR REPLACE VIEW command_usage_stats AS
SELECT
  ac.id,
  ac.code,
  ac.name,
  ac.category,
  ac.usage_count,
  COUNT(ace.id) AS execution_count,
  COUNT(ace.id) FILTER (WHERE ace.status = 'completed') AS successful_executions,
  COUNT(ace.id) FILTER (WHERE ace.status = 'failed') AS failed_executions,
  AVG(ace.execution_time_ms) AS avg_execution_time_ms,
  MAX(ace.created_at) AS last_executed_at
FROM ai_commands ac
LEFT JOIN ai_command_executions ace ON ac.id = ace.command_id
GROUP BY ac.id, ac.code, ac.name, ac.category, ac.usage_count;

-- Team member workload view
CREATE OR REPLACE VIEW team_workload AS
SELECT
  tm.id,
  tm.profile_id,
  p.full_name,
  tm.title,
  COUNT(DISTINCT pt.id) FILTER (WHERE pt.status IN ('todo', 'in_progress')) AS active_tasks,
  SUM(pt.estimated_hours) FILTER (WHERE pt.status IN ('todo', 'in_progress')) AS estimated_hours_remaining,
  SUM(te.hours) FILTER (WHERE te.date >= CURRENT_DATE - INTERVAL '30 days') AS hours_last_30_days,
  tm.availability_status
FROM team_members tm
JOIN profiles p ON tm.profile_id = p.id
LEFT JOIN project_tasks pt ON pt.assigned_to = p.id
LEFT JOIN time_entries te ON te.user_id = p.id
GROUP BY tm.id, tm.profile_id, p.full_name, tm.title, tm.availability_status;

-- =========================
-- Initial Data Seeds
-- =========================

-- Insert default AI commands
INSERT INTO ai_commands (code, name, description, category, command_type, is_favorite) VALUES
  ('FA', 'Fullstack App', 'Complete fullstack application scaffold', 'app', 'scaffold', true),
  ('SA', 'SaaS Platform', 'Software as a Service platform', 'saas', 'scaffold', true),
  ('EC', 'Ecommerce Store', 'Complete ecommerce solution', 'app', 'scaffold', false),
  ('MX', 'MEAUX Workflow', 'Meauxbility workflow automation', 'workflow', 'scaffold', true),
  ('EM', 'Email Monitor', 'Email monitoring & task extraction', 'workflow', 'monitor', true),
  ('DP', 'Deploy', 'Quick deployment', 'deployment', 'deploy', true),
  ('DB', 'Database', 'Database setup & migrations', 'database', 'migrate', true),
  ('IA', 'Inner Animals Deploy', 'Deploy to inneranimals.com', 'inner_animals', 'deploy', false),
  ('IB', 'Inner Animals Blog', 'Create blog post', 'inner_animals', 'generate', false),
  ('IP', 'Inner Animals Product', 'Add product page', 'inner_animals', 'generate', false),
  ('MB', 'Meauxbility Blog', 'Create blog post', 'meauxbility', 'generate', false),
  ('MP', 'Meauxbility Program', 'Add program page', 'meauxbility', 'generate', false),
  ('MD', 'Meauxbility Donation', 'Setup donation form', 'meauxbility', 'generate', false)
ON CONFLICT (code) DO NOTHING;

-- Insert default services
INSERT INTO services (name, slug, description, short_description, category, featured) VALUES
  ('UI/UX Design', 'ui-ux-design', 'We create visually compelling brand identities, websites, and marketing materials that captivate audiences.', 'Premium design services', 'design', true),
  ('Web Development', 'web-development', 'Custom web applications built with modern technologies and best practices.', 'Full-stack development', 'development', true),
  ('Brand Identity', 'brand-identity', 'Develop brand strategy, positioning, and messaging that resonates with your target audience.', 'Complete branding solutions', 'branding', true),
  ('Digital Marketing', 'digital-marketing', 'Drive marketing strategies including social media, SEO, and performance analytics that deliver ROI.', 'Data-driven marketing', 'marketing', true),
  ('E-commerce Solutions', 'ecommerce', 'Complete ecommerce platforms with payment integration and inventory management.', 'Online store solutions', 'development', true)
ON CONFLICT (slug) DO NOTHING;

-- =========================
-- Grants
-- =========================

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ai_commands, portfolio_items, services, blog_posts TO anon;
GRANT SELECT ON project_summary, command_usage_stats, team_workload TO authenticated;

-- =========================
-- Comments
-- =========================

COMMENT ON TABLE profiles IS 'User profiles extending Supabase auth.users';
COMMENT ON TABLE organizations IS 'Client organizations and partners';
COMMENT ON TABLE projects IS 'Main project management table';
COMMENT ON TABLE ai_commands IS 'AI command definitions for toolbox';
COMMENT ON TABLE ai_command_executions IS 'Execution history for AI commands';
COMMENT ON TABLE ai_conversations IS 'AI chat conversations';
COMMENT ON TABLE project_templates IS 'Reusable project templates for scaffolding';

