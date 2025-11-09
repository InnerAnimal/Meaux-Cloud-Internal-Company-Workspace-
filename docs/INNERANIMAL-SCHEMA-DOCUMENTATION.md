# InnerAnimal Media - Supabase Schema Documentation

## Overview

This schema is designed for a **scalable, AI-enhanced web building agency** platform. It supports project management, AI-powered code generation, client management, team collaboration, and comprehensive analytics.

## Architecture Principles

1. **Scalability**: Designed to handle growth from startup to enterprise
2. **Flexibility**: JSONB metadata fields allow extensibility without migrations
3. **Future-Proof**: Built-in support for AI features, webhooks, and integrations
4. **Security**: Row Level Security (RLS) policies protect sensitive data
5. **Performance**: Strategic indexes for common query patterns

## Core Modules

### 1. Identity & Access (`profiles`, `organizations`, `team_members`)

**Purpose**: User management and organizational structure

**Key Features**:
- Extends Supabase `auth.users` with profile data
- Multi-role system (user, admin, team_member, client)
- Organization/client management
- Team member profiles with skills and certifications

**Usage Example**:
```sql
-- Get team member with their profile
SELECT p.*, tm.title, tm.skills
FROM profiles p
JOIN team_members tm ON p.id = tm.profile_id
WHERE tm.department = 'development';
```

### 2. Projects & Project Management

**Tables**: `projects`, `project_milestones`, `project_tasks`, `project_files`, `project_comments`

**Purpose**: Complete project lifecycle management

**Key Features**:
- Multiple project types (fullstack, saas, ecommerce, etc.)
- Milestone and task tracking
- File attachments
- Comment threads
- Time tracking integration
- Budget and billing tracking

**Project Status Flow**:
```
draft → planning → in_progress → review → testing → deployed → maintenance/completed
```

**Usage Example**:
```sql
-- Get project with summary stats
SELECT * FROM project_summary WHERE client_id = '...';

-- Get active tasks for a project
SELECT pt.*, p.full_name AS assignee_name
FROM project_tasks pt
LEFT JOIN profiles p ON pt.assigned_to = p.id
WHERE pt.project_id = '...' AND pt.status IN ('todo', 'in_progress');
```

### 3. AI-Enhanced Features

**Tables**: `ai_commands`, `ai_command_executions`, `ai_conversations`, `ai_messages`, `ai_code_generations`, `project_templates`

**Purpose**: AI-powered development tools and code generation

**Key Features**:
- Command system (like `/FA`, `/SA`, `/MX` from toolbox)
- Execution history and analytics
- AI conversations with context
- Code generation tracking
- Reusable project templates

**Command Categories**:
- `app`: Application scaffolding
- `saas`: SaaS platform templates
- `workflow`: Automation workflows
- `deployment`: Deployment commands
- `database`: Database operations
- `inner_animals`: Inner Animals specific
- `meauxbility`: Meauxbility specific

**Usage Example**:
```sql
-- Execute a command (via API)
INSERT INTO ai_command_executions (command_id, executed_by, input_data)
VALUES (
  (SELECT id FROM ai_commands WHERE code = 'FA'),
  auth.uid(),
  '{"project_name": "My App", "tech_stack": ["nextjs", "supabase"]}'::jsonb
);

-- Get command usage stats
SELECT * FROM command_usage_stats WHERE code = 'FA';
```

### 4. Portfolio & Content

**Tables**: `portfolio_items`, `blog_posts`, `case_studies`, `testimonials`, `services`

**Purpose**: Public-facing content and showcase

**Key Features**:
- Portfolio items linked to projects
- Blog system with categories and tags
- Case studies with metrics
- Client testimonials
- Service catalog

**Usage Example**:
```sql
-- Get featured portfolio items
SELECT pi.*, o.name AS client_name
FROM portfolio_items pi
LEFT JOIN organizations o ON pi.client_id = o.id
WHERE pi.featured = true AND pi.status = 'published'
ORDER BY pi.display_order;
```

### 5. Time Tracking & Billing

**Tables**: `time_entries`, `invoices`, `invoice_items`

**Purpose**: Time tracking and financial management

**Key Features**:
- Billable/non-billable time tracking
- Invoice generation
- Stripe integration support
- Project-based billing

**Usage Example**:
```sql
-- Get billable hours for a project
SELECT 
  SUM(hours) AS total_hours,
  SUM(hours * billing_rate) AS total_amount
FROM time_entries
WHERE project_id = '...' AND billable = true;
```

### 6. Analytics & Tracking

**Tables**: `analytics_events`, `project_analytics`

**Purpose**: Comprehensive analytics and event tracking

**Key Features**:
- Event-based analytics
- Project-specific metrics
- User behavior tracking
- Command usage analytics

**Usage Example**:
```sql
-- Get recent command executions
SELECT 
  ac.code,
  ac.name,
  COUNT(*) AS execution_count,
  AVG(ace.execution_time_ms) AS avg_time_ms
FROM ai_command_executions ace
JOIN ai_commands ac ON ace.command_id = ac.id
WHERE ace.created_at >= NOW() - INTERVAL '7 days'
GROUP BY ac.id, ac.code, ac.name
ORDER BY execution_count DESC;
```

### 7. Integrations & Webhooks

**Tables**: `integrations`, `webhooks`, `webhook_deliveries`

**Purpose**: Third-party integrations and automation

**Key Features**:
- GitHub, Vercel, Stripe integrations
- Custom webhook support
- Delivery tracking
- Event-based triggers

## Key Design Patterns

### 1. JSONB Metadata Fields

Many tables include `metadata JSONB` fields for extensibility:

```sql
-- Store custom data without migrations
UPDATE projects 
SET metadata = jsonb_set(
  metadata, 
  '{custom_field}', 
  '"custom_value"'
)
WHERE id = '...';
```

### 2. Array Fields

Use arrays for tags, tech stacks, and team assignments:

```sql
-- Find projects using specific tech
SELECT * FROM projects 
WHERE 'nextjs' = ANY(tech_stack);

-- Find tasks with specific tags
SELECT * FROM project_tasks 
WHERE 'urgent' = ANY(tags);
```

### 3. Status Enums

Consistent status fields with CHECK constraints:

```sql
-- Projects: draft, planning, in_progress, review, testing, deployed, maintenance, completed, cancelled
-- Tasks: todo, in_progress, review, done, blocked
-- Commands: pending, running, completed, failed, cancelled
```

### 4. Audit Trail

Most tables include:
- `created_at`: When record was created
- `updated_at`: Automatically updated via triggers
- `created_by`: User who created the record

## API Integration Patterns

### Creating a Project via AI Command

```typescript
// 1. Execute command
const execution = await supabase
  .from('ai_command_executions')
  .insert({
    command_id: commandId,
    executed_by: userId,
    input_data: { project_name, tech_stack, ... }
  })
  .select()
  .single();

// 2. Create project (if command generates one)
const project = await supabase
  .from('projects')
  .insert({
    name: projectName,
    project_type: 'fullstack',
    tech_stack: ['nextjs', 'supabase'],
    created_by: userId,
    metadata: { command_execution_id: execution.id }
  })
  .select()
  .single();

// 3. Update execution with project reference
await supabase
  .from('ai_command_executions')
  .update({ project_id: project.id, status: 'completed' })
  .eq('id', execution.id);
```

### Querying Project Dashboard

```typescript
// Get project summary with related data
const { data } = await supabase
  .from('project_summary')
  .select('*')
  .eq('client_id', clientId)
  .order('created_at', { ascending: false });

// Get active tasks
const { data: tasks } = await supabase
  .from('project_tasks')
  .select(`
    *,
    assignee:profiles!assigned_to(full_name, avatar_url),
    project:projects(name, slug)
  `)
  .eq('project_id', projectId)
  .in('status', ['todo', 'in_progress']);
```

## Security Considerations

### Row Level Security (RLS)

Basic policies are included, but you should customize:

1. **Team Members**: Can view all projects
2. **Clients**: Can only view their own projects
3. **Public**: Can view published portfolio/blog content
4. **Admins**: Full access

### Recommended Additional Policies

```sql
-- Clients can only update their own organization
CREATE POLICY "Clients update own org" ON organizations
  FOR UPDATE USING (
    id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  );

-- Team members can create projects
CREATE POLICY "Team can create projects" ON projects
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'team_member')
    )
  );
```

## Performance Optimization

### Indexes Included

- Foreign key indexes
- Status/enum indexes
- Date-based indexes for time-series queries
- GIN indexes for JSONB and array searches
- Composite indexes for common query patterns

### Query Optimization Tips

1. **Use views** for complex joins (`project_summary`, `command_usage_stats`)
2. **Filter early** with WHERE clauses before joins
3. **Use array operators** (`ANY`, `@>`) for tag/tech stack searches
4. **Leverage JSONB** for flexible queries without joins

## Migration Strategy

### Phase 1: Core Setup
1. Run schema SQL
2. Set up RLS policies
3. Seed initial data (commands, services)

### Phase 2: Team Onboarding
1. Create team member profiles
2. Set up organizations for clients
3. Configure integrations

### Phase 3: AI Features
1. Test command executions
2. Set up project templates
3. Configure AI conversation context

### Phase 4: Analytics
1. Set up event tracking
2. Configure webhooks
3. Build dashboards

## Future Enhancements

The schema supports future additions:

1. **Multi-tenancy**: Organization-based isolation
2. **Version Control**: Git integration tracking
3. **Deployment Tracking**: Vercel/GitHub deployments
4. **Resource Management**: Server/domain tracking
5. **Advanced AI**: Fine-tuned models, custom prompts
6. **Collaboration**: Real-time editing, mentions
7. **Reporting**: Custom report generation

## Common Queries

### Get User's Dashboard Data

```sql
SELECT 
  (SELECT COUNT(*) FROM projects WHERE project_manager_id = auth.uid()) AS managed_projects,
  (SELECT COUNT(*) FROM project_tasks WHERE assigned_to = auth.uid() AND status IN ('todo', 'in_progress')) AS active_tasks,
  (SELECT SUM(hours) FROM time_entries WHERE user_id = auth.uid() AND date >= CURRENT_DATE - INTERVAL '7 days') AS hours_this_week;
```

### Get Recent Activity

```sql
SELECT 
  'project' AS type,
  p.name AS title,
  p.updated_at AS timestamp
FROM projects p
WHERE p.project_manager_id = auth.uid()
UNION ALL
SELECT 
  'task' AS type,
  pt.title AS title,
  pt.updated_at AS timestamp
FROM project_tasks pt
WHERE pt.assigned_to = auth.uid()
ORDER BY timestamp DESC
LIMIT 20;
```

### Get Command Favorites

```sql
SELECT ac.*, COUNT(ace.id) AS recent_executions
FROM ai_commands ac
LEFT JOIN ai_command_executions ace ON ac.id = ace.command_id 
  AND ace.created_at >= NOW() - INTERVAL '30 days'
WHERE ac.is_favorite = true
GROUP BY ac.id
ORDER BY recent_executions DESC;
```

## Support & Maintenance

### Regular Maintenance Tasks

1. **Archive old projects**: Move completed projects to archived status
2. **Clean analytics**: Archive old analytics events (keep last 2 years)
3. **Update indexes**: Monitor query performance and add indexes as needed
4. **Review RLS**: Audit security policies quarterly

### Monitoring

- Track slow queries (>100ms)
- Monitor RLS policy performance
- Review JSONB field sizes
- Check index usage

## Conclusion

This schema provides a solid foundation for an AI-enhanced web building agency. It's designed to scale, adapt, and support advanced features while maintaining performance and security.

For questions or contributions, refer to the InnerAnimal Media development team.

