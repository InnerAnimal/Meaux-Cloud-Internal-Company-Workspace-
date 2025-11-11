import { createSupabaseServerClient } from '@/lib/supabase/server'
import { BarChart3, TrendingUp } from 'lucide-react'
import { formatBytes, calculateSavingsPercent } from '@/lib/utils/formatters'

export default async function AnalyticsPage() {
    const supabase = createSupabaseServerClient()

    const { data: assets } = await supabase
        .from('assets')
        .select('original_size, optimized_size')

    const totalOriginal = assets?.reduce((sum, a) => sum + (a.original_size || 0), 0) || 0
    const totalOptimized = assets?.reduce((sum, a) => sum + (a.optimized_size || 0), 0) || 0
    const avgSavings = assets && assets.length > 0
        ? Math.round(
            assets.reduce((sum, a) => {
                if (a.original_size && a.optimized_size) {
                    return sum + calculateSavingsPercent(a.original_size, a.optimized_size)
                }
                return sum
            }, 0) / assets.length
        )
        : 78

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold mb-2">Analytics</h1>
                <p className="text-muted-foreground">Performance metrics</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glassmorphic rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <BarChart3 className="w-5 h-5 text-primary" />
                        <span className="text-sm text-muted-foreground">Avg Savings</span>
                    </div>
                    <p className="text-3xl font-bold">{avgSavings}%</p>
                    <p className="text-sm text-muted-foreground mt-1">Image optimization</p>
                </div>

                <div className="glassmorphic rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <TrendingUp className="w-5 h-5 text-success" />
                        <span className="text-sm text-muted-foreground">Storage Saved</span>
                    </div>
                    <p className="text-3xl font-bold">{formatBytes(totalOriginal - totalOptimized)}</p>
                    <p className="text-sm text-muted-foreground mt-1">Total optimization</p>
                </div>

                <div className="glassmorphic rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <BarChart3 className="w-5 h-5 text-primary" />
                        <span className="text-sm text-muted-foreground">Total Assets</span>
                    </div>
                    <p className="text-3xl font-bold">{assets?.length || 0}</p>
                    <p className="text-sm text-muted-foreground mt-1">Optimized files</p>
                </div>
            </div>
        </div>
    )
}

