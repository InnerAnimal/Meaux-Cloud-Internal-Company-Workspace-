import { NextRequest, NextResponse } from 'next/server';
import { listEmails, getEmail } from '@/lib/email';

/**
 * GET /api/email/history
 * Get email sending history
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const emailId = searchParams.get('id');

    // If specific email ID requested
    if (emailId) {
      const email = await getEmail(emailId);
      if (!email) {
        return NextResponse.json(
          {
            success: false,
            error: `Email '${emailId}' not found`,
          },
          { status: 404 }
        );
      }
      return NextResponse.json({
        success: true,
        email,
      });
    }

    // Get email list (requires Resend Pro plan for pagination)
    const emails = await listEmails();
    return NextResponse.json({
      success: true,
      emails,
      note: 'Full email history requires Resend Pro plan. Free plan shows limited history.',
    });
  } catch (error) {
    console.error('Error in /api/email/history:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
