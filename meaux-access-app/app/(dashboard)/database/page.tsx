import { createSupabaseServerClient } from '@/lib/supabase/server'
import { Database } from 'lucide-react'

const tables = [
    'profiles',
    'assets',
    'vault_secrets',
    'transactions',
    'messages',
]

export default async function DatabasePage() {
    const supabase = createSupabaseServerClient()

    const tableStats = await Promise.all(
        tables.map(async (table) => {
            const { count } = await supabase.from(table).select('*', { count: 'exact', head: true })
            return { name: table, count: count || 0 }
        })
    )

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold mb-2">Database</h1>
                <p className="text-muted-foreground">Supabase PostgreSQL overview</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tableStats.map((table) => (
                    <div key={table.name} className="glassmorphic rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <Database className="w-5 h-5 text-primary" />
                            <h3 className="font-semibold capitalize">{table.name}</h3>
                        </div>
                        <p className="text-2xl font-bold">{table.count}</p>
                        <p className="text-sm text-muted-foreground">rows</p>
                    </div>
                ))}
            </div>
        </div>
    )
}

