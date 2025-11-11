import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { listR2Objects } from '@/lib/cloudflare/r2'

export async function GET(request: NextRequest) {
    try {
        const supabase = createSupabaseServerClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const searchParams = request.nextUrl.searchParams
        const prefix = searchParams.get('prefix') || ''

        const objects = await listR2Objects(prefix)

        return NextResponse.json({
            objects: objects.map((obj) => ({
                Key: obj.Key,
                Size: obj.Size || 0,
                LastModified: obj.LastModified?.toISOString() || new Date().toISOString(),
            })),
        })
    } catch (error: any) {
        console.error('R2 list error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

