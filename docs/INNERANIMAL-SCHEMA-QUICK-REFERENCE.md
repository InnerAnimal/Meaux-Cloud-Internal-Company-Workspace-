# InnerAnimal Media Schema - Quick Reference

## Table Relationships

```
profiles (users)
├── team_members (1:1)
├── organizations (created_by)
└── projects (project_manager_id, created_by)

organizations (clients)
├── projects (client_id)
├── portfolio_items (client_id)
└── invoices (client_id)

projects
├── project_milestones
├── project_tasks
│   └── project_files
│   └── project_comments
├── time_entries
├── ai_command_executions
└── project_analytics

ai_commands
└── ai_command_executions
    └── ai_code_generations
    └── projects (if command creates project)

ai_conversations
└── ai_messages
```

## Key Enums

### Project Status
`draft → planning → in_progress → review → testing → deployed → maintenance/completed`

### Task Status
`todo → in_progress → review → done`

### Command Status
`pending → running → completed/failed`

### Project Types
`fullstack`, `saas`, `ecommerce`, `branding`, `website`, `mobile`, `automation`, `consulting`, `other`

## Essential Queries

### Create a Project
```sql
INSERT INTO projects (name, slug, client_id, project_type, tech_stack, created_by)
VALUES ('My Project', 'my-project', 'client-uuid', 'fullstack', ARRAY['nextjs', 'supabase'], auth.uid());
```

### Execute AI Command
```sql
INSERT INTO ai_command_executions (command_id, executed_by, input_data)
VALUES (
  (SELECT id FROM ai_commands WHERE code = 'FA'),
  auth.uid(),
  '{"project_name": "New App"}'::jsonb
);
```

### Get Active Tasks
```sql
SELECT pt.*, p.full_name AS assignee
FROM project_tasks pt
LEFT JOIN profiles p ON pt.assigned_to = p.id
WHERE pt.project_id = 'project-uuid' 
  AND pt.status IN ('todo', 'in_progress');
```

### Track Time
```sql
INSERT INTO time_entries (project_id, task_id, user_id, hours, date, billable)
VALUES ('project-uuid', 'task-uuid', auth.uid(), 2.5, CURRENT_DATE, true);
```

### Get Portfolio Items
```sql
SELECT pi.*, o.name AS client_name
FROM portfolio_items pi
LEFT JOIN organizations o ON pi.client_id = o.id
WHERE pi.status = 'published'
ORDER BY pi.featured DESC, pi.display_order;
```

## Common Filters

### Projects by Type
```sql
WHERE project_type = 'fullstack'
```

### Tasks by Status
```sql
WHERE status IN ('todo', 'in_progress')
```

### Recent Activity
```sql
WHERE created_at >= NOW() - INTERVAL '7 days'
```

### Using Tags/Arrays
```sql
WHERE 'nextjs' = ANY(tech_stack)
WHERE 'urgent' = ANY(tags)
```

### JSONB Queries
```sql
WHERE metadata->>'custom_field' = 'value'
WHERE metadata @> '{"feature": true}'::jsonb
```

## Views Available

- `project_summary` - Projects with aggregated stats
- `command_usage_stats` - AI command analytics
- `team_workload` - Team member task distribution

## Indexes to Know

- Foreign keys: Auto-indexed
- Status fields: Indexed for filtering
- Created_at: Indexed DESC for recent queries
- Tags/Tech Stack: GIN indexes for array searches
- Metadata: GIN indexes for JSONB queries

## RLS Quick Check

```sql
-- Check if user can access project
SELECT EXISTS (
  SELECT 1 FROM projects p
  WHERE p.id = 'project-uuid'
  AND (
    p.project_manager_id = auth.uid()
    OR p.client_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'team_member'))
  )
);
```

## Useful Functions

### Update Updated At (Auto)
Trigger automatically updates `updated_at` on these tables:
- profiles
- organizations  
- projects
- project_tasks
- ai_conversations

### Increment Command Usage (Auto)
When `ai_command_executions` inserted, `ai_commands.usage_count` increments

### Update Project Hours (Auto)
When task hours updated, project `actual_hours` recalculates

### Task Assignment Notification (Auto)
When task assigned, notification created for assignee

## API Patterns

### Supabase Client (TypeScript)

```typescript
// Get project with relations
const { data } = await supabase
  .from('projects')
  .select(`
    *,
    client:organizations(name, logo_url),
    manager:profiles!project_manager_id(full_name),
    tasks:project_tasks(*)
  `)
  .eq('id', projectId)
  .single();

// Create with transaction-like pattern
const project = await supabase
  .from('projects')
  .insert({...})
  .select()
  .single();

await supabase
  .from('project_tasks')
  .insert([
    { project_id: project.id, title: 'Task 1' },
    { project_id: project.id, title: 'Task 2' }
  ]);
```

## Migration Checklist

- [ ] Run schema SQL
- [ ] Verify extensions installed
- [ ] Check RLS policies
- [ ] Seed initial commands
- [ ] Seed initial services
- [ ] Create admin profile
- [ ] Test command execution
- [ ] Test project creation
- [ ] Verify triggers work
- [ ] Test RLS policies

## Performance Tips

1. Use `SELECT` with specific columns, not `*`
2. Add `LIMIT` to list queries
3. Use views for complex joins
4. Filter before joining when possible
5. Use array operators efficiently
6. Index frequently queried JSONB paths if needed

## Security Checklist

- [ ] RLS enabled on all tables
- [ ] Policies tested for each role
- [ ] Sensitive data protected (billing, etc.)
- [ ] Public access limited to published content
- [ ] Client isolation working
- [ ] Admin access restricted

