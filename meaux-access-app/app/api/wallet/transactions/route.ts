import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe/client'

export async function GET() {
    try {
        const supabase = createSupabaseServerClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Get transactions from Supabase
        const { data: transactions, error } = await supabase
            .from('transactions')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(50)

        if (error) throw error

        // Optionally sync with Stripe
        // const charges = await stripe.charges.list({ limit: 100 })
        // You can sync Stripe charges to Supabase transactions here

        return NextResponse.json({ transactions: transactions || [] })
    } catch (error: any) {
        console.error('Transactions error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

