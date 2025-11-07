import { NextRequest, NextResponse } from 'next/server';
import { getEmailLogs, getEmailStatistics } from '@/lib/email/supabase-integration';

/**
 * GET /api/email/history
 * Get email sending history from Supabase database
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Get query parameters
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const status = searchParams.get('status') as any;
    const category = searchParams.get('category') as any;
    const fromEmail = searchParams.get('from') || undefined;
    const stats = searchParams.get('stats') === 'true';

    // If stats requested, return statistics
    if (stats) {
      const statistics = await getEmailStatistics({
        startDate: searchParams.get('startDate')
          ? new Date(searchParams.get('startDate')!)
          : undefined,
        endDate: searchParams.get('endDate')
          ? new Date(searchParams.get('endDate')!)
          : undefined,
        groupBy: (searchParams.get('groupBy') as any) || 'day',
      });

      return NextResponse.json({
        success: true,
        statistics,
      });
    }

    // Get email logs from database
    const emails = await getEmailLogs({
      limit,
      offset,
      status,
      category,
      fromEmail,
    });

    return NextResponse.json({
      success: true,
      emails,
      count: emails.length,
      limit,
      offset,
      note: 'Email history stored in Supabase database. Full history available with filtering and pagination.',
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
