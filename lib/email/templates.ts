import type { EmailTemplate } from './types';

/**
 * Email templates with HTML and plain text versions
 */

export const templates: Record<string, EmailTemplate> = {
  welcome: {
    id: 'welcome',
    name: 'Welcome Email',
    subject: 'Welcome to {{company_name}}!',
    variables: ['company_name', 'user_name', 'dashboard_url'],
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); color: white; padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: white; padding: 40px 20px; border: 1px solid #e2e8f0; border-top: none; }
            .button { display: inline-block; background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #64748b; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome, {{user_name}}!</h1>
            </div>
            <div class="content">
              <p>We're excited to have you on board at <strong>{{company_name}}</strong>!</p>
              <p>Your workspace is ready and waiting for you. Get started by exploring your dashboard and connecting your favorite tools.</p>
              <p style="text-align: center;">
                <a href="{{dashboard_url}}" class="button">Go to Dashboard</a>
              </p>
              <p>If you have any questions, feel free to reach out. We're here to help!</p>
            </div>
            <div class="footer">
              <p>&copy; {{company_name}}. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
Welcome, {{user_name}}!

We're excited to have you on board at {{company_name}}!

Your workspace is ready and waiting for you. Get started by exploring your dashboard and connecting your favorite tools.

Go to Dashboard: {{dashboard_url}}

If you have any questions, feel free to reach out. We're here to help!

---
© {{company_name}}. All rights reserved.
    `,
  },

  notification: {
    id: 'notification',
    name: 'System Notification',
    subject: '{{notification_title}}',
    variables: ['notification_title', 'notification_message', 'action_url', 'action_text'],
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .content { background: white; padding: 30px; border: 1px solid #e2e8f0; border-radius: 10px; }
            .alert { background: #eff6ff; border-left: 4px solid #2563eb; padding: 15px; margin: 20px 0; }
            .button { display: inline-block; background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #64748b; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="content">
              <h2>{{notification_title}}</h2>
              <div class="alert">
                <p>{{notification_message}}</p>
              </div>
              {{#if action_url}}
              <p style="text-align: center;">
                <a href="{{action_url}}" class="button">{{action_text}}</a>
              </p>
              {{/if}}
            </div>
            <div class="footer">
              <p>You're receiving this because you have an account with us.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
{{notification_title}}

{{notification_message}}

{{#if action_url}}
{{action_text}}: {{action_url}}
{{/if}}

---
You're receiving this because you have an account with us.
    `,
  },

  invoice: {
    id: 'invoice',
    name: 'Invoice/Receipt',
    subject: 'Your invoice from {{company_name}}',
    variables: ['company_name', 'customer_name', 'invoice_number', 'amount', 'date', 'invoice_url'],
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .content { background: white; padding: 40px; border: 1px solid #e2e8f0; border-radius: 10px; }
            .invoice-header { border-bottom: 2px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px; }
            .invoice-details { background: #f8fafc; padding: 20px; border-radius: 6px; margin: 20px 0; }
            .amount { font-size: 32px; font-weight: bold; color: #2563eb; }
            .button { display: inline-block; background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="content">
              <div class="invoice-header">
                <h1>Invoice</h1>
                <p><strong>Invoice #{{invoice_number}}</strong></p>
                <p>Date: {{date}}</p>
              </div>
              <p>Hi {{customer_name}},</p>
              <p>Thank you for your payment!</p>
              <div class="invoice-details">
                <p><strong>Amount Paid:</strong></p>
                <p class="amount">{{amount}}</p>
              </div>
              <p style="text-align: center;">
                <a href="{{invoice_url}}" class="button">View Invoice</a>
              </p>
              <p>If you have any questions about this invoice, please contact us.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
INVOICE

Invoice #{{invoice_number}}
Date: {{date}}

Hi {{customer_name}},

Thank you for your payment!

Amount Paid: {{amount}}

View Invoice: {{invoice_url}}

If you have any questions about this invoice, please contact us.
    `,
  },

  support: {
    id: 'support',
    name: 'Support Response',
    subject: 'Re: {{ticket_subject}}',
    variables: ['customer_name', 'ticket_subject', 'ticket_number', 'response_message', 'support_url'],
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .content { background: white; padding: 30px; border: 1px solid #e2e8f0; border-radius: 10px; }
            .ticket-info { background: #f8fafc; padding: 15px; border-radius: 6px; margin: 20px 0; font-size: 14px; }
            .response { background: #eff6ff; border-left: 4px solid #2563eb; padding: 20px; margin: 20px 0; }
            .button { display: inline-block; background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="content">
              <h2>Support Update</h2>
              <p>Hi {{customer_name}},</p>
              <div class="ticket-info">
                <p><strong>Ticket #{{ticket_number}}</strong></p>
                <p>Subject: {{ticket_subject}}</p>
              </div>
              <div class="response">
                <p>{{response_message}}</p>
              </div>
              <p style="text-align: center;">
                <a href="{{support_url}}" class="button">View Full Conversation</a>
              </p>
              <p>If you need further assistance, just reply to this email!</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
Support Update

Hi {{customer_name}},

Ticket #{{ticket_number}}
Subject: {{ticket_subject}}

---

{{response_message}}

---

View Full Conversation: {{support_url}}

If you need further assistance, just reply to this email!
    `,
  },
};

/**
 * Replace template variables with actual values
 * @param template - Template string
 * @param variables - Object with variable values
 * @returns Processed template
 */
export function processTemplate(
  template: string,
  variables: Record<string, string>
): string {
  let processed = template;

  // Simple template variable replacement
  Object.keys(variables).forEach((key) => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    processed = processed.replace(regex, variables[key]);
  });

  // Handle conditional blocks (simple implementation)
  // {{#if variable}} content {{/if}}
  processed = processed.replace(
    /{{#if\s+(\w+)}}([\s\S]*?){{\/if}}/g,
    (match, variable, content) => {
      return variables[variable] ? content : '';
    }
  );

  return processed;
}

/**
 * Get a template by ID
 * @param templateId - Template ID
 * @returns Email template
 */
export function getTemplate(templateId: string): EmailTemplate | undefined {
  return templates[templateId];
}

/**
 * Get all available templates
 * @returns Array of templates
 */
export function getAllTemplates(): EmailTemplate[] {
  return Object.values(templates);
}

/**
 * Render a template with variables
 * @param templateId - Template ID
 * @param variables - Variables to replace
 * @returns Rendered HTML and text
 */
export function renderTemplate(
  templateId: string,
  variables: Record<string, string>
): { html: string; text: string; subject: string } | null {
  const template = getTemplate(templateId);
  if (!template) return null;

  return {
    html: processTemplate(template.html, variables),
    text: processTemplate(template.text, variables),
    subject: processTemplate(template.subject, variables),
  };
}
