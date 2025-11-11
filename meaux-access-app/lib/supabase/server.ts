import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

export const createSupabaseServerClient = () => {
    const cookieStore = cookies()

    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            auth: {
                persistSession: false,
                autoRefreshToken: false,
            },
            global: {
                headers: {
                    Cookie: cookieStore.toString(),
                },
            },
        }
    )
}

export const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

