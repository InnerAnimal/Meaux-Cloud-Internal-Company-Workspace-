import Link from 'next/link'
import { Upload, MessageSquare, Plus, FileText } from 'lucide-react'

const actions = [
    { href: '/dashboard/assets', label: 'Upload Asset', icon: Upload, color: 'primary' },
    { href: '/dashboard/meoxtalk', label: 'New Message', icon: MessageSquare, color: 'accent' },
    { href: '/dashboard/vault', label: 'Add Secret', icon: Plus, color: 'success' },
    { href: '/dashboard/wallet', label: 'View Transactions', icon: FileText, color: 'primary' },
]

export function QuickActions() {
    return (
        <div className="glassmorphic rounded-xl p-6">
            <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {actions.map((action) => {
                    const Icon = action.icon
                    return (
                        <Link
                            key={action.href}
                            href={action.href}
                            className="flex flex-col items-center gap-3 p-4 rounded-lg border border-border hover:bg-muted transition-colors"
                        >
                            <div className={`w-12 h-12 rounded-lg bg-${action.color}/10 flex items-center justify-center`}>
                                <Icon className={`w-6 h-6 text-${action.color}`} />
                            </div>
                            <span className="font-medium text-sm">{action.label}</span>
                        </Link>
                    )
                })}
            </div>
        </div>
    )
}

