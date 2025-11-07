import { SENDER_ADDRESSES, VERIFIED_DOMAINS } from './types';
import type { SenderAddress, VerifiedDomain } from './types';

/**
 * Validate email address format
 * @param email - Email address
 * @returns True if valid
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Extract domain from email address
 * @param email - Email address
 * @returns Domain name
 */
export function getDomainFromEmail(email: string): string {
  return email.split('@')[1] || '';
}

/**
 * Check if a domain is verified
 * @param domain - Domain name
 * @returns True if domain is in verified list
 */
export function isDomainVerified(domain: string): boolean {
  return VERIFIED_DOMAINS.includes(domain as VerifiedDomain);
}

/**
 * Check if an email address can be used as sender
 * @param email - Email address
 * @returns True if sender is verified
 */
export function isVerifiedSender(email: string): boolean {
  const domain = getDomainFromEmail(email);
  return isDomainVerified(domain);
}

/**
 * Get all available sender addresses
 * @param verifiedOnly - Only return verified senders
 * @returns Array of sender addresses
 */
export function getSenderAddresses(verifiedOnly = false): SenderAddress[] {
  if (verifiedOnly) {
    return SENDER_ADDRESSES.filter((sender) => sender.verified);
  }
  return SENDER_ADDRESSES;
}

/**
 * Get sender address by email
 * @param email - Email address
 * @returns Sender address info or null
 */
export function getSenderByEmail(email: string): SenderAddress | null {
  return SENDER_ADDRESSES.find((sender) => sender.email === email) || null;
}

/**
 * Get default sender address
 * @returns Default sender address
 */
export function getDefaultSender(): SenderAddress {
  return (
    SENDER_ADDRESSES.find((sender) => sender.isDefault) || SENDER_ADDRESSES[0]
  );
}

/**
 * Format email address with name
 * @param email - Email address
 * @param name - Display name (optional)
 * @returns Formatted email string
 */
export function formatEmailAddress(email: string, name?: string): string {
  if (!name) return email;
  return `${name} <${email}>`;
}

/**
 * Parse email address from formatted string
 * @param emailString - Formatted email string
 * @returns Object with email and name
 */
export function parseEmailAddress(emailString: string): {
  email: string;
  name?: string;
} {
  const match = emailString.match(/^(.+)\s+<(.+)>$/);
  if (match) {
    return {
      name: match[1].trim(),
      email: match[2].trim(),
    };
  }
  return { email: emailString.trim() };
}

/**
 * Sanitize email content (basic XSS prevention)
 * @param content - HTML content
 * @returns Sanitized content
 */
export function sanitizeEmailContent(content: string): string {
  // Basic sanitization - in production, use a library like DOMPurify
  return content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/g, '')
    .replace(/on\w+='[^']*'/g, '');
}

/**
 * Validate recipient list
 * @param recipients - Array of email addresses
 * @returns Object with valid and invalid emails
 */
export function validateRecipients(recipients: string[]): {
  valid: string[];
  invalid: string[];
} {
  const valid: string[] = [];
  const invalid: string[] = [];

  recipients.forEach((email) => {
    if (isValidEmail(email)) {
      valid.push(email);
    } else {
      invalid.push(email);
    }
  });

  return { valid, invalid };
}

/**
 * Generate email preview text from HTML
 * @param html - HTML content
 * @param maxLength - Maximum length of preview
 * @returns Preview text
 */
export function generatePreviewText(html: string, maxLength = 150): string {
  // Strip HTML tags and get plain text
  const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

  if (text.length <= maxLength) {
    return text;
  }

  return text.substring(0, maxLength) + '...';
}

/**
 * Create unsubscribe link
 * @param email - Recipient email
 * @param token - Unsubscribe token
 * @returns Unsubscribe URL
 */
export function createUnsubscribeLink(email: string, token: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return `${baseUrl}/unsubscribe?email=${encodeURIComponent(email)}&token=${token}`;
}

/**
 * Get email delivery statistics
 * @param emails - Array of email logs
 * @returns Statistics object
 */
export function calculateEmailStats(
  emails: Array<{
    status: string;
    sentAt: Date;
    deliveredAt?: Date;
    openedAt?: Date;
  }>
): {
  total: number;
  sent: number;
  delivered: number;
  opened: number;
  bounced: number;
  openRate: number;
  deliveryRate: number;
} {
  const total = emails.length;
  const sent = emails.filter((e) => e.status === 'sent').length;
  const delivered = emails.filter((e) => e.status === 'delivered').length;
  const opened = emails.filter((e) => e.status === 'opened').length;
  const bounced = emails.filter((e) => e.status === 'bounced').length;

  return {
    total,
    sent,
    delivered,
    opened,
    bounced,
    openRate: delivered > 0 ? (opened / delivered) * 100 : 0,
    deliveryRate: sent > 0 ? (delivered / sent) * 100 : 0,
  };
}

/**
 * Format date for email display
 * @param date - Date object
 * @returns Formatted date string
 */
export function formatEmailDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

/**
 * Check if email should be rate limited
 * @param recentEmails - Number of recent emails sent
 * @param timeWindow - Time window in minutes
 * @param limit - Maximum emails per time window
 * @returns True if rate limit exceeded
 */
export function isRateLimited(
  recentEmails: number,
  timeWindow: number,
  limit: number
): boolean {
  return recentEmails >= limit;
}

/**
 * Generate email tracking pixel
 * @param emailId - Email ID
 * @returns HTML img tag with tracking pixel
 */
export function generateTrackingPixel(emailId: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return `<img src="${baseUrl}/api/email/track/open/${emailId}" width="1" height="1" alt="" />`;
}

/**
 * Generate link tracking URL
 * @param emailId - Email ID
 * @param originalUrl - Original link URL
 * @returns Tracking URL
 */
export function generateTrackingLink(
  emailId: string,
  originalUrl: string
): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return `${baseUrl}/api/email/track/click/${emailId}?url=${encodeURIComponent(originalUrl)}`;
}
