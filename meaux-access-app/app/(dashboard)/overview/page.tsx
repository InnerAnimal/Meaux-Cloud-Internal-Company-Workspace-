import { createSupabaseServerClient } from '@/lib/supabase/server'
import { StatsCard } from '@/components/dashboard/StatsCard'
import { QuickActions } from '@/components/dashboard/QuickActions'

export default async function OverviewPage() {
    const supabase = createSupabaseServerClient()

    // Fetch stats
    const [assetsResult, transactionsResult] = await Promise.all([
        supabase.from('assets').select('id', { count: 'exact', head: true }),
        supabase.from('transactions').select('id', { count: 'exact', head: true }),
    ])

    const assetCount = assetsResult.count || 0
    const transactionCount = transactionsResult.count || 0

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold mb-2">Overview</h1>
                <p className="text-muted-foreground">Welcome to your team workspace</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatsCard
                    title="Total Assets"
                    value={assetCount.toString()}
                    description="Optimized files"
                    icon="Image"
                />
                <StatsCard
                    title="Transactions"
                    value={transactionCount.toString()}
                    description="This month"
                    icon="Wallet"
                />
                <StatsCard
                    title="Team Members"
                    value="4"
                    description="Active users"
                    icon="Users"
                />
            </div>

            <QuickActions />
        </div>
    )
}

