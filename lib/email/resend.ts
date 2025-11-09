import { Resend } from 'resend';
import type { SendEmailParams, EmailResponse } from './types';

// Initialize Resend client
if (!process.env.RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY is not defined in environment variables');
}

export const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Send an email using Resend
 * @param params - Email parameters
 * @returns Promise with email response
 */
export async function sendEmail(
  params: SendEmailParams
): Promise<EmailResponse> {
  try {
    const { data, error } = await resend.emails.send({
      from: typeof params.from === 'string'
        ? params.from
        : `${params.from.name} <${params.from.email}>`,
      to: params.to,
      subject: params.subject,
      html: params.html,
      text: params.text,
      cc: params.cc,
      bcc: params.bcc,
      reply_to: params.replyTo,
      tags: params.tags,
      attachments: params.attachments,
    });

    if (error) {
      console.error('Resend error:', error);
      return {
        id: '',
        success: false,
        error: error.message || 'Failed to send email',
      };
    }

    return {
      id: data?.id || '',
      success: true,
    };
  } catch (error) {
    console.error('Email sending error:', error);
    return {
      id: '',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get email by ID
 * @param emailId - Resend email ID
 * @returns Email data
 */
export async function getEmail(emailId: string) {
  try {
    const { data, error } = await resend.emails.get(emailId);

    if (error) {
      console.error('Error fetching email:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error fetching email:', error);
    return null;
  }
}

/**
 * List sent emails (requires Resend Pro plan)
 * @returns List of emails
 */
export async function listEmails() {
  try {
    const { data, error } = await resend.emails.list();

    if (error) {
      console.error('Error listing emails:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error listing emails:', error);
    return [];
  }
}

/**
 * Get domain verification status
 * @param domain - Domain name
 * @returns Domain verification info
 */
export async function getDomainStatus(domain: string) {
  try {
    const { data, error } = await resend.domains.get(domain);

    if (error) {
      console.error('Error getting domain status:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error getting domain status:', error);
    return null;
  }
}

/**
 * List all verified domains
 * @returns List of domains
 */
export async function listDomains() {
  try {
    const { data, error } = await resend.domains.list();

    if (error) {
      console.error('Error listing domains:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error listing domains:', error);
    return [];
  }
}

/**
 * Verify domain DNS records
 * @param domain - Domain name
 * @returns Verification result
 */
export async function verifyDomain(domain: string) {
  try {
    const { data, error } = await resend.domains.verify(domain);

    if (error) {
      console.error('Error verifying domain:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error verifying domain:', error);
    return null;
  }
}

/**
 * Cancel a scheduled email (requires email to be scheduled)
 * @param emailId - Resend email ID
 * @returns Cancellation result
 */
export async function cancelEmail(emailId: string) {
  try {
    const { data, error } = await resend.emails.cancel(emailId);

    if (error) {
      console.error('Error canceling email:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error canceling email:', error);
    return false;
  }
}

// Export the client for direct access if needed
export default resend;
