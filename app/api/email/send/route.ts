import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';
import { isValidEmail, isVerifiedSender } from '@/lib/email/utils';
import { logEmailToDatabase, incrementSenderUsage } from '@/lib/email/supabase-integration';
import type { SendEmailParams } from '@/lib/email/types';

/**
 * POST /api/email/send
 * Send an email via Resend
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.from || !body.to || !body.subject) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: from, to, subject',
        },
        { status: 400 }
      );
    }

    // Validate sender is from verified domain
    const fromEmail = typeof body.from === 'string' ? body.from : body.from.email;
    if (!isVerifiedSender(fromEmail)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Sender email must be from a verified domain (inneranimals.com, meauxbility.org, meauxbility.com)',
        },
        { status: 400 }
      );
    }

    // Validate recipients
    const recipients = Array.isArray(body.to) ? body.to : [body.to];
    const invalidRecipients = recipients.filter((email: string) => {
      const emailStr = typeof email === 'string' ? email : email.email;
      return !isValidEmail(emailStr);
    });

    if (invalidRecipients.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid recipient email addresses: ${invalidRecipients.join(', ')}`,
        },
        { status: 400 }
      );
    }

    // Validate content
    if (!body.html && !body.text) {
      return NextResponse.json(
        {
          success: false,
          error: 'Either html or text content is required',
        },
        { status: 400 }
      );
    }

    // Send email
    const params: SendEmailParams = {
      from: body.from,
      to: body.to,
      subject: body.subject,
      html: body.html,
      text: body.text,
      cc: body.cc,
      bcc: body.bcc,
      replyTo: body.replyTo,
      tags: body.tags,
      attachments: body.attachments,
    };

    const result = await sendEmail(params);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Failed to send email',
        },
        { status: 500 }
      );
    }

    // Log email to Supabase database
    try {
      const toEmails = Array.isArray(body.to)
        ? body.to.map((e: any) => typeof e === 'string' ? e : e.email)
        : [typeof body.to === 'string' ? body.to : body.to.email];

      await logEmailToDatabase({
        resendEmailId: result.id,
        from: fromEmail,
        fromName: typeof body.from === 'string' ? undefined : body.from.name,
        to: toEmails,
        cc: body.cc ? (Array.isArray(body.cc) ? body.cc : [body.cc]) : undefined,
        bcc: body.bcc ? (Array.isArray(body.bcc) ? body.bcc : [body.bcc]) : undefined,
        replyTo: body.replyTo,
        subject: body.subject,
        htmlBody: body.html,
        textBody: body.text,
        category: body.category || 'transactional',
        tags: body.tags,
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
        userAgent: request.headers.get('user-agent') || undefined,
      });

      // Increment sender usage counter
      await incrementSenderUsage(fromEmail);
    } catch (dbError) {
      // Log error but don't fail the request
      console.error('Error logging email to database:', dbError);
    }

    return NextResponse.json({
      success: true,
      emailId: result.id,
      message: 'Email sent successfully',
    });
  } catch (error) {
    console.error('Error in /api/email/send:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/email/send
 * Return API documentation
 */
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/email/send',
    method: 'POST',
    description: 'Send an email via Resend',
    requiredFields: ['from', 'to', 'subject', 'html OR text'],
    optionalFields: ['cc', 'bcc', 'replyTo', 'tags', 'attachments'],
    verifiedDomains: ['inneranimals.com', 'meauxbility.org', 'meauxbility.com'],
    example: {
      from: 'noreply@inneranimals.com',
      to: 'customer@example.com',
      subject: 'Welcome to Meaux Cloud',
      html: '<h1>Welcome!</h1><p>Thank you for joining us.</p>',
      text: 'Welcome! Thank you for joining us.',
    },
  });
}
