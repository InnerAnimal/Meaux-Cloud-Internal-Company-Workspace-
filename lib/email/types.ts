// Email service types

export interface EmailAddress {
  email: string;
  name?: string;
}

export interface SendEmailParams {
  from: string | EmailAddress;
  to: string | string[] | EmailAddress | EmailAddress[];
  subject: string;
  html?: string;
  text?: string;
  cc?: string | string[] | EmailAddress | EmailAddress[];
  bcc?: string | string[] | EmailAddress | EmailAddress[];
  replyTo?: string | EmailAddress;
  tags?: { name: string; value: string }[];
  attachments?: {
    filename: string;
    content: string | Buffer;
    contentType?: string;
  }[];
}

export interface EmailResponse {
  id: string;
  success: boolean;
  error?: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  html: string;
  text: string;
  variables?: string[];
}

export interface DomainInfo {
  domain: string;
  verified: boolean;
  dnsRecords: {
    spf: boolean;
    dkim: boolean;
    dmarc: boolean;
  };
}

export interface SenderAddress {
  email: string;
  name: string;
  domain: string;
  verified: boolean;
  isDefault: boolean;
}

// Available domains configuration
export const VERIFIED_DOMAINS = [
  'inneranimals.com',
  'meauxbility.org',
  'meauxbility.com',
] as const;

export type VerifiedDomain = typeof VERIFIED_DOMAINS[number];

// Common sender addresses
export const SENDER_ADDRESSES: SenderAddress[] = [
  {
    email: 'info@inneranimals.com',
    name: 'Inner Animals',
    domain: 'inneranimals.com',
    verified: true,
    isDefault: true,
  },
  {
    email: 'noreply@inneranimals.com',
    name: 'Inner Animals (No Reply)',
    domain: 'inneranimals.com',
    verified: true,
    isDefault: false,
  },
  {
    email: 'sam@meauxbility.org',
    name: 'Sam - Meauxbility',
    domain: 'meauxbility.org',
    verified: false, // Will be true once domain is verified in Resend
    isDefault: false,
  },
  {
    email: 'contact@meauxbility.com',
    name: 'Meauxbility Contact',
    domain: 'meauxbility.com',
    verified: false, // Will be true once domain is verified in Resend
    isDefault: false,
  },
  {
    email: 'support@meauxbility.org',
    name: 'Meauxbility Support',
    domain: 'meauxbility.org',
    verified: false,
    isDefault: false,
  },
];

// Email categories for tracking
export enum EmailCategory {
  TRANSACTIONAL = 'transactional',
  MARKETING = 'marketing',
  NOTIFICATION = 'notification',
  SUPPORT = 'support',
  INTERNAL = 'internal',
}

// Email status for tracking
export enum EmailStatus {
  SENT = 'sent',
  DELIVERED = 'delivered',
  OPENED = 'opened',
  CLICKED = 'clicked',
  BOUNCED = 'bounced',
  COMPLAINED = 'complained',
  FAILED = 'failed',
}

export interface EmailLog {
  id: string;
  from: string;
  to: string[];
  subject: string;
  category: EmailCategory;
  status: EmailStatus;
  sentAt: Date;
  deliveredAt?: Date;
  openedAt?: Date;
  clickedAt?: Date;
  error?: string;
}
