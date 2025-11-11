'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils/cn'
import {
    LayoutDashboard,
    MessageSquare,
    Image,
    Lock,
    Wallet,
    Cloud,
    Database,
    BarChart3,
    LogOut,
} from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const navItems = [
    { href: '/dashboard/overview', label: 'Overview', icon: LayoutDashboard },
    { href: '/dashboard/meoxtalk', label: 'MeauxTalk', icon: MessageSquare },
    { href: '/dashboard/assets', label: 'Assets', icon: Image },
    { href: '/dashboard/vault', label: 'Vault', icon: Lock },
    { href: '/dashboard/wallet', label: 'Wallet', icon: Wallet },
    { href: '/dashboard/r2', label: 'R2 Storage', icon: Cloud },
    { href: '/dashboard/database', label: 'Database', icon: Database },
    { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
]

export function Sidebar() {
    const pathname = usePathname()
    const router = useRouter()

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.push('/login')
    }

    return (
        <aside className="fixed left-0 top-0 h-screen w-[280px] bg-card border-r border-border flex flex-col">
            <div className="p-6 border-b border-border">
                <h2 className="text-xl font-bold text-primary">Meaux Access</h2>
                <p className="text-sm text-muted-foreground">Team Workspace</p>
            </div>

            <nav className="flex-1 p-4 space-y-1">
                {navItems.map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                                isActive
                                    ? 'bg-primary text-white'
                                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                            )}
                        >
                            <Icon className="w-5 h-5" />
                            <span className="font-medium">{item.label}</span>
                        </Link>
                    )
                })}
            </nav>

            <div className="p-4 border-t border-border">
                <button
                    onClick={handleSignOut}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground w-full transition-colors"
                >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Sign Out</span>
                </button>
            </div>
        </aside>
    )
}

