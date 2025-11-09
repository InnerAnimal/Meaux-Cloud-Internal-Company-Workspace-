// ================================================
// Resend Email Service - Multi-Tenant Implementation
// ================================================

import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'

// Initialize Resend (fallback to env var)
const resend = new Resend(process.env.RESEND_API_KEY)

interface EmailOptions {
  organizationId?: string
  templateSlug?: string
  to: string | string[]
  subject?: string
  html?: string
  text?: string
  variables?: Record<string, any>
  from?: string
  fromName?: string
  replyTo?: string
  priority?: number
  relatedType?: 'project' | 'task' | 'invoice' | 'ai_completion' | 'team_invite' | 'board_update'
  relatedId?: string
  userId?: string
}

/**
 * Send email using Resend with organization-specific configuration
 */
export async function sendEmail(options: EmailOptions) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  let fromEmail = options.from || 'noreply@inneranimalmedia.com'
  let fromName = options.fromName || 'InnerAnimal Media'
  let templateId: string | null = null
  let templateVariables: Record<string, any> = {}

  // Get organization-specific Resend config if provided
  if (options.organizationId) {
    const { data: resendConfig } = await supabase
      .from('resend_configurations')
      .select('*')
      .eq('organization_id', options.organizationId)
      .eq('is_active', true)
      .single()

    if (resendConfig) {
      // Use organization's Resend API key (decrypt in production)
      const orgResend = new Resend(resendConfig.api_key_encrypted)
      fromEmail = resendConfig.default_from_email
      fromName = resendConfig.default_from_name
      
      // Use org Resend instance
      resend = orgResend
    }

    // Get branding theme for email styling
    const { data: branding } = await supabase
      .from('branding_themes')
      .select('*')
      .eq('organization_id', options.organizationId)
      .single()

    // Get email template if slug provided
    if (options.templateSlug) {
      const { data: template } = await supabase
        .from('email_templates')
        .select('*')
        .eq('slug', options.templateSlug)
        .eq('organization_id', options.organizationId)
        .eq('is_active', true)
        .single()

      if (template) {
        templateId = template.id
        templateVariables = options.variables || {}
        
        // Use template subject/content if not provided
        if (!options.subject) {
          options.subject = replaceTemplateVariables(template.subject, templateVariables)
        }
        if (!options.html && template.html_content) {
          options.html = replaceTemplateVariables(template.html_content, templateVariables)
        }
        if (!options.text && template.text_content) {
          options.text = replaceTemplateVariables(template.text_content, templateVariables)
        }
      }
    }
  }

  // Queue email in database (for tracking and async processing)
  const { data: emailQueue, error: queueError } = await supabase
    .from('email_queue')
    .insert({
      to_email: Array.isArray(options.to) ? options.to[0] : options.to,
      to_name: Array.isArray(options.to) ? undefined : undefined, // Extract name if email format
      cc_emails: Array.isArray(options.to) && options.to.length > 1 ? options.to.slice(1) : [],
      subject: options.subject || 'No Subject',
      html_content: options.html,
      text_content: options.text,
      template_id: templateId,
      template_variables: templateVariables,
      from_email: fromEmail,
      from_name: fromName,
      reply_to: options.replyTo,
      priority: options.priority || 5,
      status: 'pending',
      user_id: options.userId,
      organization_id: options.organizationId,
      related_type: options.relatedType,
      related_id: options.relatedId
    })
    .select()
    .single()

  if (queueError) {
    console.error('Failed to queue email:', queueError)
    throw queueError
  }

  // Send email via Resend
  try {
    const result = await resend.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to: Array.isArray(options.to) ? options.to : [options.to],
      subject: options.subject || 'No Subject',
      html: options.html,
      text: options.text,
      reply_to: options.replyTo
    })

    // Update queue with Resend response
    await supabase
      .from('email_queue')
      .update({
        status: 'sent',
        resend_email_id: result.data?.id,
        resend_response: result as any,
        sent_at: new Date().toISOString()
      })
      .eq('id', emailQueue.id)

    return {
      success: true,
      queueId: emailQueue.id,
      resendId: result.data?.id
    }
  } catch (error: any) {
    // Update queue with error
    await supabase
      .from('email_queue')
      .update({
        status: 'failed',
        error_message: error.message,
        retry_count: 1,
        next_retry_at: new Date(Date.now() + 5 * 60 * 1000).toISOString() // Retry in 5 min
      })
      .eq('id', emailQueue.id)

    throw error
  }
}

/**
 * Replace template variables in string
 */
function replaceTemplateVariables(
  template: string,
  variables: Record<string, any>
): string {
  let result = template
  for (const [key, value] of Object.entries(variables)) {
    result = result.replace(new RegExp(`{{${key}}}`, 'g'), String(value))
    result = result.replace(new RegExp(`{${key}}`, 'g'), String(value))
  }
  return result
}

/**
 * Send email using Resend template ID
 */
export async function sendTemplateEmail(
  templateId: string,
  to: string | string[],
  variables: Record<string, any>,
  options?: {
    organizationId?: string
    from?: string
  }
) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Get template
  const { data: template } = await supabase
    .from('email_templates')
    .select('*')
    .eq('id', templateId)
    .single()

  if (!template) {
    throw new Error('Template not found')
  }

  // Use Resend template if available
  if (template.resend_template_id) {
    const result = await resend.emails.send({
      from: options?.from || 'noreply@inneranimalmedia.com',
      to: Array.isArray(to) ? to : [to],
      template_id: template.resend_template_id,
      template_data: variables
    })

    return result
  }

  // Fallback to custom template
  return sendEmail({
    organizationId: options?.organizationId || template.organization_id,
    templateSlug: template.slug,
    to,
    variables,
    from: options?.from
  })
}

/**
 * Process email queue (run as cron job)
 */
export async function processEmailQueue() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Get pending emails, ordered by priority
  const { data: pendingEmails } = await supabase
    .from('email_queue')
    .select('*')
    .eq('status', 'pending')
    .or('next_retry_at.is.null,next_retry_at.lte.' + new Date().toISOString())
    .order('priority', { ascending: false })
    .order('created_at', { ascending: true })
    .limit(50)

  if (!pendingEmails || pendingEmails.length === 0) {
    return { processed: 0 }
  }

  let processed = 0
  let failed = 0

  for (const email of pendingEmails) {
    try {
      // Mark as sending
      await supabase
        .from('email_queue')
        .update({ status: 'sending' })
        .eq('id', email.id)

      // Send email
      const result = await resend.emails.send({
        from: `${email.from_name} <${email.from_email}>`,
        to: email.to_email,
        cc: email.cc_emails,
        subject: email.subject,
        html: email.html_content,
        text: email.text_content,
        reply_to: email.reply_to
      })

      // Update success
      await supabase
        .from('email_queue')
        .update({
          status: 'sent',
          resend_email_id: result.data?.id,
          resend_response: result as any,
          sent_at: new Date().toISOString()
        })
        .eq('id', email.id)

      processed++
    } catch (error: any) {
      const retryCount = (email.retry_count || 0) + 1
      const shouldRetry = retryCount < (email.max_retries || 3)

      await supabase
        .from('email_queue')
        .update({
          status: shouldRetry ? 'pending' : 'failed',
          error_message: error.message,
          retry_count: retryCount,
          next_retry_at: shouldRetry
            ? new Date(Date.now() + Math.pow(2, retryCount) * 60 * 1000).toISOString() // Exponential backoff
            : null
        })
        .eq('id', email.id)

      failed++
    }
  }

  return { processed, failed, total: pendingEmails.length }
}

/**
 * Common email sending functions
 */
export const emailService = {
  // Project emails
  async sendProjectUpdate(projectId: string, userId: string) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: project } = await supabase
      .from('projects')
      .select('*, client:organizations(*)')
      .eq('id', projectId)
      .single()

    if (!project) return

    // Get team members
    const { data: teamMembers } = await supabase
      .from('profiles')
      .select('email, full_name')
      .in('id', project.team_member_ids || [])

    const emails = teamMembers?.map(m => m.email) || []

    return sendEmail({
      organizationId: project.client_id,
      templateSlug: 'project-update',
      to: emails,
      variables: {
        project_name: project.name,
        project_status: project.status,
        project_url: `${process.env.NEXT_PUBLIC_APP_URL}/projects/${project.id}`
      },
      relatedType: 'project',
      relatedId: projectId
    })
  },

  // Task assignment
  async sendTaskAssigned(taskId: string, assigneeId: string) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: task } = await supabase
      .from('project_tasks')
      .select('*, project:projects(*, client:organizations(*)), assignee:profiles!assigned_to(*)')
      .eq('id', taskId)
      .single()

    if (!task || !task.assignee) return

    return sendEmail({
      organizationId: task.project?.client_id,
      templateSlug: 'task-assigned',
      to: task.assignee.email,
      variables: {
        task_title: task.title,
        project_name: task.project?.name,
        task_url: `${process.env.NEXT_PUBLIC_APP_URL}/projects/${task.project_id}/tasks/${taskId}`
      },
      relatedType: 'task',
      relatedId: taskId,
      userId: assigneeId
    })
  },

  // AI completion notification
  async sendAICompletion(executionId: string, userId: string) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: execution } = await supabase
      .from('ai_command_executions')
      .select('*, command:ai_commands(*), executor:profiles!executed_by(*)')
      .eq('id', executionId)
      .single()

    if (!execution) return

    return sendEmail({
      templateSlug: 'ai-completion',
      to: execution.executor?.email,
      variables: {
        command_name: execution.command?.name,
        command_code: execution.command?.code,
        status: execution.status,
        execution_url: `${process.env.NEXT_PUBLIC_APP_URL}/ai/executions/${executionId}`
      },
      relatedType: 'ai_completion',
      relatedId: executionId,
      userId
    })
  },

  // Board update
  async sendBoardUpdate(organizationId: string, updateType: string, data: any) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Get board members
    const { data: boardMembers } = await supabase
      .from('board_members')
      .select('profile:profiles(email, full_name)')
      .eq('organization_id', organizationId)
      .eq('is_active', true)

    const emails = boardMembers?.map(b => b.profile?.email).filter(Boolean) || []

    return sendEmail({
      organizationId,
      templateSlug: 'board-update',
      to: emails,
      variables: {
        update_type: updateType,
        ...data
      },
      relatedType: 'board_update',
      priority: 7 // Higher priority for board
    })
  }
}

