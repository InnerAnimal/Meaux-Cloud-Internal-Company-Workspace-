import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';
import { getDefaultSender } from '@/lib/email/utils';

/**
 * POST /api/email/test
 * Send a test email
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.to) {
      return NextResponse.json(
        {
          success: false,
          error: 'Recipient email (to) is required',
        },
        { status: 400 }
      );
    }

    const defaultSender = getDefaultSender();
    const from = body.from || `${defaultSender.name} <${defaultSender.email}>`;

    // Send test email
    const result = await sendEmail({
      from,
      to: body.to,
      subject: body.subject || 'Test Email from Meaux Cloud',
      html: body.html || `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 40px auto; padding: 20px; }
              .content { background: white; padding: 40px; border: 2px solid #2563eb; border-radius: 10px; }
              .badge { background: #2563eb; color: white; padding: 8px 16px; border-radius: 20px; display: inline-block; margin-bottom: 20px; }
              .success { color: #10b981; font-size: 48px; text-align: center; margin: 20px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="content">
                <span class="badge">TEST EMAIL</span>
                <h1>Email System Test</h1>
                <div class="success">✓</div>
                <p>Congratulations! Your email system is working correctly.</p>
                <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
                <h3>Email Configuration:</h3>
                <ul>
                  <li><strong>From:</strong> ${from}</li>
                  <li><strong>To:</strong> ${body.to}</li>
                  <li><strong>Sent:</strong> ${new Date().toLocaleString()}</li>
                  <li><strong>Service:</strong> Resend API</li>
                </ul>
                <p style="margin-top: 30px; color: #64748b; font-size: 14px;">
                  This is an automated test email from your Meaux Cloud internal workspace.
                </p>
              </div>
            </div>
          </body>
        </html>
      `,
      text: body.text || `
Email System Test
==================

✓ Congratulations! Your email system is working correctly.

Email Configuration:
- From: ${from}
- To: ${body.to}
- Sent: ${new Date().toLocaleString()}
- Service: Resend API

This is an automated test email from your Meaux Cloud internal workspace.
      `,
      tags: [
        { name: 'category', value: 'test' },
        { name: 'environment', value: process.env.NODE_ENV || 'development' },
      ],
    });

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Failed to send test email',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      emailId: result.id,
      message: 'Test email sent successfully',
      from,
      to: body.to,
    });
  } catch (error) {
    console.error('Error in /api/email/test:', error);
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
 * GET /api/email/test
 * Return test endpoint documentation
 */
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/email/test',
    method: 'POST',
    description: 'Send a test email to verify your email system is working',
    requiredFields: ['to'],
    optionalFields: ['from', 'subject', 'html', 'text'],
    example: {
      to: 'your-email@example.com',
    },
  });
}
