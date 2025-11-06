import { NextRequest, NextResponse } from 'next/server';
import { listDomains, getDomainStatus, verifyDomain } from '@/lib/email';
import { VERIFIED_DOMAINS } from '@/lib/email/types';

/**
 * GET /api/email/domains
 * Get all domains and their verification status
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const domain = searchParams.get('domain');

    // If specific domain requested
    if (domain) {
      const status = await getDomainStatus(domain);
      if (!status) {
        return NextResponse.json(
          {
            success: false,
            error: `Domain '${domain}' not found in Resend`,
          },
          { status: 404 }
        );
      }
      return NextResponse.json({
        success: true,
        domain: status,
      });
    }

    // Get all domains
    const domains = await listDomains();
    return NextResponse.json({
      success: true,
      domains,
      configuredDomains: VERIFIED_DOMAINS,
    });
  } catch (error) {
    console.error('Error in /api/email/domains:', error);
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
 * POST /api/email/domains/verify
 * Verify domain DNS records
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.domain) {
      return NextResponse.json(
        {
          success: false,
          error: 'domain is required',
        },
        { status: 400 }
      );
    }

    const result = await verifyDomain(body.domain);
    if (!result) {
      return NextResponse.json(
        {
          success: false,
          error: `Failed to verify domain '${body.domain}'`,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      verification: result,
    });
  } catch (error) {
    console.error('Error in /api/email/domains/verify:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
