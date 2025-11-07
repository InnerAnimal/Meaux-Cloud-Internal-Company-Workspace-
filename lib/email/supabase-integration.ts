import { createClient } from '@/lib/supabase/server';
import type { EmailCategory, EmailStatus } from './types';

/**
 * Log an email to Supabase database
 */
export async function logEmailToDatabase(params: {
  resendEmailId: string;
  from: string;
  fromName?: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  replyTo?: string;
  subject: string;
  htmlBody?: string;
  textBody?: string;
  templateId?: string;
  templateVariables?: Record<string, any>;
  category?: EmailCategory;
  tags?: { name: string; value: string }[];
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
}) {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('email_logs')
      .insert({
        resend_email_id: params.resendEmailId,
        from_email: params.from,
        from_name: params.fromName,
        to_emails: params.to,
        cc_emails: params.cc,
        bcc_emails: params.bcc,
        reply_to: params.replyTo,
        subject: params.subject,
        html_body: params.htmlBody,
        text_body: params.textBody,
        template_variables: params.templateVariables,
        category: params.category || 'transactional',
        tags: params.tags || [],
        user_id: params.userId,
        ip_address: params.ipAddress,
        user_agent: params.userAgent,
        status: 'sent',
        sent_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error logging email to database:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in logEmailToDatabase:', error);
    return null;
  }
}

/**
 * Update email status in database
 */
export async function updateEmailStatus(
  resendEmailId: string,
  status: EmailStatus,
  errorMessage?: string
) {
  try {
    const supabase = await createClient();

    const updates: any = { status };

    // Update timestamp based on status
    switch (status) {
      case 'delivered':
        updates.delivered_at = new Date().toISOString();
        break;
      case 'opened':
        updates.opened_at = new Date().toISOString();
        break;
      case 'clicked':
        updates.clicked_at = new Date().toISOString();
        break;
      case 'bounced':
        updates.bounced_at = new Date().toISOString();
        break;
    }

    if (errorMessage) {
      updates.error_message = errorMessage;
    }

    const { error } = await supabase
      .from('email_logs')
      .update(updates)
      .eq('resend_email_id', resendEmailId);

    if (error) {
      console.error('Error updating email status:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in updateEmailStatus:', error);
    return false;
  }
}

/**
 * Log an email event (from webhook)
 */
export async function logEmailEvent(params: {
  resendEmailId: string;
  eventType: 'sent' | 'delivered' | 'delivery_delayed' | 'complained' | 'bounced' | 'opened' | 'clicked';
  eventData?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  location?: Record<string, any>;
  rawPayload?: Record<string, any>;
}) {
  try {
    const supabase = await createClient();

    // Get email_log_id from resend_email_id
    const { data: emailLog } = await supabase
      .from('email_logs')
      .select('id')
      .eq('resend_email_id', params.resendEmailId)
      .single();

    const { error } = await supabase
      .from('email_events')
      .insert({
        email_log_id: emailLog?.id,
        resend_email_id: params.resendEmailId,
        event_type: params.eventType,
        event_data: params.eventData,
        ip_address: params.ipAddress,
        user_agent: params.userAgent,
        location: params.location,
        raw_payload: params.rawPayload,
        occurred_at: new Date().toISOString(),
      });

    if (error) {
      console.error('Error logging email event:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in logEmailEvent:', error);
    return false;
  }
}

/**
 * Get email logs from database with filters
 */
export async function getEmailLogs(params?: {
  limit?: number;
  offset?: number;
  status?: EmailStatus;
  category?: EmailCategory;
  fromEmail?: string;
  userId?: string;
  startDate?: Date;
  endDate?: Date;
}) {
  try {
    const supabase = await createClient();

    let query = supabase
      .from('email_logs')
      .select('*')
      .order('sent_at', { ascending: false });

    if (params?.limit) {
      query = query.limit(params.limit);
    }

    if (params?.offset) {
      query = query.range(params.offset, params.offset + (params.limit || 10) - 1);
    }

    if (params?.status) {
      query = query.eq('status', params.status);
    }

    if (params?.category) {
      query = query.eq('category', params.category);
    }

    if (params?.fromEmail) {
      query = query.eq('from_email', params.fromEmail);
    }

    if (params?.userId) {
      query = query.eq('user_id', params.userId);
    }

    if (params?.startDate) {
      query = query.gte('sent_at', params.startDate.toISOString());
    }

    if (params?.endDate) {
      query = query.lte('sent_at', params.endDate.toISOString());
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error getting email logs:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getEmailLogs:', error);
    return [];
  }
}

/**
 * Get email statistics
 */
export async function getEmailStatistics(params?: {
  startDate?: Date;
  endDate?: Date;
  groupBy?: 'day' | 'sender' | 'category';
}) {
  try {
    const supabase = await createClient();

    // Use the appropriate view based on groupBy
    let viewName = 'v_daily_email_summary';
    if (params?.groupBy === 'sender') {
      viewName = 'v_email_performance_by_sender';
    }

    const { data, error } = await supabase
      .from(viewName)
      .select('*')
      .limit(30);

    if (error) {
      console.error('Error getting email statistics:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getEmailStatistics:', error);
    return [];
  }
}

/**
 * Check if email is in bounce list
 */
export async function isEmailBounced(email: string): Promise<boolean> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('email_bounces')
      .select('is_suppressed')
      .eq('email', email)
      .single();

    if (error || !data) {
      return false;
    }

    return data.is_suppressed;
  } catch (error) {
    console.error('Error checking bounce status:', error);
    return false;
  }
}

/**
 * Update domain verification status
 */
export async function updateDomainStatus(params: {
  domainName: string;
  status: 'pending' | 'verified' | 'failed';
  resendDomainId?: string;
  spfVerified?: boolean;
  dkimVerified?: boolean;
  dmarcVerified?: boolean;
}) {
  try {
    const supabase = await createClient();

    const updates: any = {
      status: params.status,
      last_checked_at: new Date().toISOString(),
    };

    if (params.resendDomainId) {
      updates.resend_domain_id = params.resendDomainId;
    }

    if (params.spfVerified !== undefined) {
      updates.spf_verified = params.spfVerified;
    }

    if (params.dkimVerified !== undefined) {
      updates.dkim_verified = params.dkimVerified;
    }

    if (params.dmarcVerified !== undefined) {
      updates.dmarc_verified = params.dmarcVerified;
    }

    if (params.status === 'verified') {
      updates.verified_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from('email_domains')
      .update(updates)
      .eq('domain_name', params.domainName);

    if (error) {
      console.error('Error updating domain status:', error);
      return false;
    }

    // If domain is verified, update sender addresses
    if (params.status === 'verified') {
      await supabase
        .from('email_sender_addresses')
        .update({ is_verified: true })
        .eq('domain_id', (
          await supabase
            .from('email_domains')
            .select('id')
            .eq('domain_name', params.domainName)
            .single()
        ).data?.id);
    }

    return true;
  } catch (error) {
    console.error('Error in updateDomainStatus:', error);
    return false;
  }
}

/**
 * Get all domains with status
 */
export async function getDomains() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('email_domains')
      .select('*')
      .eq('is_active', true)
      .order('domain_name');

    if (error) {
      console.error('Error getting domains:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getDomains:', error);
    return [];
  }
}

/**
 * Increment sender usage counter
 */
export async function incrementSenderUsage(email: string) {
  try {
    const supabase = await createClient();

    const { error } = await supabase.rpc('increment_sender_usage', {
      sender_email: email,
    });

    // If RPC doesn't exist, use update with increment
    if (error) {
      const { data: sender } = await supabase
        .from('email_sender_addresses')
        .select('emails_sent')
        .eq('email', email)
        .single();

      if (sender) {
        await supabase
          .from('email_sender_addresses')
          .update({
            emails_sent: (sender.emails_sent || 0) + 1,
            last_used_at: new Date().toISOString(),
          })
          .eq('email', email);
      }
    }

    return true;
  } catch (error) {
    console.error('Error incrementing sender usage:', error);
    return false;
  }
}
