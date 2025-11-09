// Email service exports
export * from './types';
export * from './resend';
export * from './templates';
export * from './utils';

// Re-export commonly used functions
export { sendEmail, getEmail, listEmails, getDomainStatus, listDomains, verifyDomain } from './resend';
export { getTemplate, getAllTemplates, renderTemplate } from './templates';
export { isValidEmail, isVerifiedSender, getSenderAddresses, getDefaultSender } from './utils';
