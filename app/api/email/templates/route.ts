import { NextRequest, NextResponse } from 'next/server';
import { getAllTemplates, getTemplate, renderTemplate } from '@/lib/email/templates';

/**
 * GET /api/email/templates
 * Get all available email templates
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const templateId = searchParams.get('id');

    // If template ID is provided, return specific template
    if (templateId) {
      const template = getTemplate(templateId);
      if (!template) {
        return NextResponse.json(
          {
            success: false,
            error: `Template '${templateId}' not found`,
          },
          { status: 404 }
        );
      }
      return NextResponse.json({
        success: true,
        template,
      });
    }

    // Return all templates
    const templates = getAllTemplates();
    return NextResponse.json({
      success: true,
      templates: templates.map((t) => ({
        id: t.id,
        name: t.name,
        subject: t.subject,
        variables: t.variables,
      })),
    });
  } catch (error) {
    console.error('Error in /api/email/templates:', error);
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
 * POST /api/email/templates/render
 * Render a template with variables
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.templateId) {
      return NextResponse.json(
        {
          success: false,
          error: 'templateId is required',
        },
        { status: 400 }
      );
    }

    if (!body.variables || typeof body.variables !== 'object') {
      return NextResponse.json(
        {
          success: false,
          error: 'variables object is required',
        },
        { status: 400 }
      );
    }

    const rendered = renderTemplate(body.templateId, body.variables);
    if (!rendered) {
      return NextResponse.json(
        {
          success: false,
          error: `Template '${body.templateId}' not found`,
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      rendered,
    });
  } catch (error) {
    console.error('Error in /api/email/templates/render:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
