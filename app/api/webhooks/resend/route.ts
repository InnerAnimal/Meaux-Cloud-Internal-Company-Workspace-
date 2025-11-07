import { NextRequest, NextResponse } from 'next/server';
import { logEmailEvent, updateEmailStatus } from '@/lib/email/supabase-integration';
import type { EmailStatus } from '@/lib/email/types';

/**
 * POST /api/webhooks/resend
 * Handle Resend webhook events for email tracking
 *
 * Configure this webhook in Resend dashboard:
 * https://resend.com/webhooks
 * Endpoint: https://yourdomain.com/api/webhooks/resend
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate webhook has required fields
    if (!body.type || !body.data) {
      return NextResponse.json(
        { success: false, error: 'Invalid webhook payload' },
        { status: 400 }
      );
    }

    const eventType = body.type;
    const eventData = body.data;
    const emailId = eventData.email_id;

    console.log(`Received Resend webhook: ${eventType} for email ${emailId}`);

    // Map Resend event types to our email status
    const statusMap: Record<string, EmailStatus> = {
      'email.sent': 'sent',
      'email.delivered': 'delivered',
      'email.delivery_delayed': 'sent',
      'email.complained': 'complained',
      'email.bounced': 'bounced',
      'email.opened': 'opened',
      'email.clicked': 'clicked',
    };

    const status = statusMap[eventType];

    if (status && emailId) {
      // Update email status in database
      await updateEmailStatus(emailId, status);

      // Log the event
      await logEmailEvent({
        resendEmailId: emailId,
        eventType: eventType.replace('email.', '') as any,
        eventData: {
          ...eventData,
          email: eventData.to?.[0] || eventData.to,
          bounce_type: eventData.bounce?.type,
          reason: eventData.bounce?.message || eventData.delivery_delay?.reason,
          code: eventData.bounce?.code,
        },
        ipAddress: eventData.ip,
        userAgent: eventData.user_agent,
        location: eventData.location,
        rawPayload: body,
      });
    }

    // Handle specific event types
    switch (eventType) {
      case 'email.bounced':
        console.log(`Email bounced: ${emailId}`, {
          type: eventData.bounce?.type,
          message: eventData.bounce?.message,
        });
        break;

      case 'email.complained':
        console.log(`Email complained: ${emailId}`, eventData);
        break;

      case 'email.opened':
        console.log(`Email opened: ${emailId}`, {
          ip: eventData.ip,
          location: eventData.location,
        });
        break;

      case 'email.clicked':
        console.log(`Email clicked: ${emailId}`, {
          link: eventData.click?.link,
          ip: eventData.ip,
        });
        break;
    }

    return NextResponse.json({
      success: true,
      message: 'Webhook processed successfully',
      eventType,
      emailId,
    });
  } catch (error) {
    console.error('Error processing Resend webhook:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process webhook',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/webhooks/resend
 * Return webhook documentation
 */
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/webhooks/resend',
    method: 'POST',
    description: 'Resend webhook handler for email event tracking',
    supportedEvents: [
      'email.sent',
      'email.delivered',
      'email.delivery_delayed',
      'email.complained',
      'email.bounced',
      'email.opened',
      'email.clicked',
    ],
    setup: {
      step1: 'Go to https://resend.com/webhooks',
      step2: 'Add new webhook',
      step3: 'Set URL to: https://yourdomain.com/api/webhooks/resend',
      step4: 'Select all email events',
      step5: 'Save webhook',
    },
    note: 'This endpoint automatically tracks email delivery, opens, clicks, and bounces in your Supabase database',
  });
}
