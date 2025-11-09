-- ================================================
-- MEAUXBILITY.ORG - Quick Setup SQL
-- Run this in Supabase SQL Editor after base schemas
-- ================================================

-- Step 1: Create Meauxbility Organization
INSERT INTO organizations (
  name,
  slug,
  description,
  industry,
  size,
  status,
  website
) VALUES (
  'Meauxbility',
  'meauxbility',
  '501(c)(3) nonprofit providing mobility grants to spinal cord injury survivors',
  'nonprofit',
  'small',
  'active',
  'https://meauxbility.org'
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  status = 'active'
RETURNING id;

-- Step 2: Create Meauxbility Branding Theme (Dual Theme Support)
INSERT INTO branding_themes (
  organization_id,
  name,
  slug,
  primary_color,
  secondary_color,
  accent_color,
  background_color,
  text_primary,
  text_secondary,
  theme_mode,
  metadata
)
SELECT 
  id,
  'Meauxbility',
  'meauxbility',
  '#60DFDF',  -- Teal (primary)
  '#4ECDC4',  -- Cyan (secondary)
  '#FF6B35',  -- Orange (accent - Meauxbility brand)
  '#0a0e12',  -- Dark background
  'rgba(255, 255, 255, 0.95)',
  'rgba(255, 255, 255, 0.7)',
  'auto',  -- Supports light/dark mode
  '{
    "light_theme": {
      "background_color": "#ffffff",
      "text_primary": "#0a0e12",
      "text_secondary": "#1a2026"
    },
    "dark_theme": {
      "background_color": "#0a0e12",
      "text_primary": "rgba(255, 255, 255, 0.95)",
      "text_secondary": "rgba(255, 255, 255, 0.7)"
    }
  }'::jsonb
FROM organizations WHERE slug = 'meauxbility'
ON CONFLICT (slug) DO UPDATE SET
  organization_id = EXCLUDED.organization_id,
  primary_color = EXCLUDED.primary_color,
  accent_color = EXCLUDED.accent_color;

-- Step 3: Create Volunteer Permission Group
INSERT INTO permission_groups (
  name,
  organization_id,
  permissions,
  description,
  is_system
)
SELECT 
  'Volunteer',
  id,
  '{
    "projects": {"view": true, "create": false, "edit": false, "delete": false},
    "tasks": {"view": true, "create": true, "edit": true, "delete": false},
    "ai_commands": {"view": true, "execute": true},
    "financials": {"view": false, "edit": false},
    "team": {"view": true, "manage": false},
    "settings": {"view": false, "edit": false},
    "donations": {"view": true, "create": false, "edit": false},
    "grants": {"view": true, "create": true, "edit": true, "delete": false},
    "volunteers": {"view": true, "create": false, "edit": false}
  }'::jsonb,
  'Volunteer access for Meauxbility - can process grants and use AI workflows',
  false
FROM organizations WHERE slug = 'meauxbility'
ON CONFLICT DO NOTHING;

-- Step 4: Create Donation Product
INSERT INTO products (
  organization_id,
  name,
  slug,
  description,
  short_description,
  price,
  product_type,
  is_donation,
  donation_min_amount,
  donation_max_amount,
  donation_suggested_amounts,
  donation_tax_deductible,
  status,
  featured,
  metadata
)
SELECT 
  id,
  'Mobility Grant Donation',
  'donation',
  'Support spinal cord injury survivors with mobility grants. Your donation helps provide essential mobility equipment and support to those who need it most.',
  'Support mobility grants for spinal cord injury survivors',
  25.00,
  'donation',
  true,
  5.00,
  10000.00,
  ARRAY[25.00, 50.00, 100.00, 250.00, 500.00, 1000.00],
  true,  -- Tax deductible (501c3)
  'active',
  true,
  '{
    "501c3": true,
    "tax_id": "YOUR_EIN_HERE",
    "receipt_template": "donation-receipt"
  }'::jsonb
FROM organizations WHERE slug = 'meauxbility'
ON CONFLICT (organization_id, slug) DO UPDATE SET
  status = 'active',
  featured = true;

-- Step 5: Create Meauxbility-Specific AI Commands
INSERT INTO ai_commands (code, name, description, category, command_type, is_favorite, metadata) VALUES
  (
    'MG',
    'Mobility Grant',
    'Create and process mobility grant application workflow',
    'meauxbility',
    'scaffold',
    true,
    '{
      "workflow_steps": ["application", "review", "approval", "funding", "followup"],
      "required_fields": ["applicant_name", "injury_date", "mobility_need", "amount_requested"]
    }'::jsonb
  ),
  (
    'VA',
    'Volunteer Application',
    'Process volunteer application and onboarding',
    'meauxbility',
    'scaffold',
    true,
    '{
      "workflow_steps": ["application", "interview", "background_check", "onboarding", "training"]
    }'::jsonb
  ),
  (
    'DR',
    'Donation Receipt',
    'Generate tax-deductible donation receipt for 501(c)(3)',
    'meauxbility',
    'generate',
    true,
    '{
      "template": "donation-receipt",
      "includes_tax_id": true,
      "auto_email": true
    }'::jsonb
  ),
  (
    'GS',
    'Grant Status',
    'Check grant application status and update stakeholders',
    'meauxbility',
    'monitor',
    true,
    '{}'::jsonb
  ),
  (
    'VR',
    'Volunteer Report',
    'Generate volunteer activity and impact report',
    'meauxbility',
    'generate',
    true,
    '{
      "includes_metrics": true,
      "time_period": "monthly"
    }'::jsonb
  ),
  (
    'GR',
    'Grant Report',
    'Generate grant impact and recipient report',
    'meauxbility',
    'generate',
    false,
    '{}'::jsonb
  )
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category;

-- Step 6: Create Default Chat Rooms for Meauxbility
INSERT INTO internal_chat_rooms (
  name,
  slug,
  description,
  room_type,
  organization_id,
  created_by,
  default_model,
  context_data
)
SELECT 
  'Meauxbility General',
  'meauxbility-general',
  'General discussion for Meauxbility team and volunteers',
  'team',
  id,
  (SELECT id FROM profiles LIMIT 1), -- Will be updated when admin user exists
  'gpt-4',
  '{
    "organization": "Meauxbility",
    "focus": "mobility grants, spinal cord injury support, nonprofit operations"
  }'::jsonb
FROM organizations WHERE slug = 'meauxbility'
ON CONFLICT (slug) DO NOTHING;

-- Step 7: Create Email Templates for Meauxbility
INSERT INTO email_templates (
  name,
  slug,
  subject,
  template_type,
  organization_id,
  html_content,
  variables,
  is_active
)
SELECT 
  'Donation Receipt',
  'donation-receipt',
  'Thank You for Your Donation to Meauxbility',
  'custom',
  id,
  '<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .header { background: #60DFDF; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; }
    .receipt { border: 2px solid #60DFDF; padding: 20px; margin: 20px 0; }
    .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Meauxbility</h1>
    <p>Thank You for Your Donation</p>
  </div>
  <div class="content">
    <p>Dear {{donor_name}},</p>
    <p>Thank you for your generous donation of ${{amount}} to Meauxbility.</p>
    <div class="receipt">
      <h2>Tax-Deductible Receipt</h2>
      <p><strong>Amount:</strong> ${{amount}}</p>
      <p><strong>Date:</strong> {{date}}</p>
      <p><strong>Tax ID:</strong> {{tax_id}}</p>
      <p>This donation is tax-deductible to the extent allowed by law.</p>
    </div>
    <p>Your support helps us provide mobility grants to spinal cord injury survivors.</p>
  </div>
  <div class="footer">
    <p>Meauxbility - For The Nameless Faces Voiceless</p>
  </div>
</body>
</html>',
  '[
    {"name": "donor_name", "description": "Donor full name"},
    {"name": "amount", "description": "Donation amount"},
    {"name": "date", "description": "Donation date"},
    {"name": "tax_id", "description": "501(c)(3) tax ID"}
  ]'::jsonb,
  true
FROM organizations WHERE slug = 'meauxbility'
ON CONFLICT (organization_id, slug) DO NOTHING;

-- Step 8: Get Organization ID for Reference
SELECT 
  id AS organization_id,
  name,
  slug,
  'Use this ID in your .env.local: NEXT_PUBLIC_MEAUXBILITY_ORG_ID' AS note
FROM organizations 
WHERE slug = 'meauxbility';

-- ================================================
-- Setup Complete!
-- ================================================
-- Next Steps:
-- 1. Copy the organization_id from above
-- 2. Add to .env.local: NEXT_PUBLIC_MEAUXBILITY_ORG_ID=<id>
-- 3. Run the deployment script
-- 4. Start building your pages!

