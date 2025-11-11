import { Image, Wallet, Users, MessageSquare, Lock, Cloud, Database, BarChart3 } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

const icons = {
    Image,
    Wallet,
    Users,
    MessageSquare,
    Lock,
    Cloud,
    Database,
    BarChart3,
}

interface StatsCardProps {
    title: string
    value: string
    description?: string
    icon: keyof typeof icons
    trend?: {
        value: number
        isPositive: boolean
    }
}

export function StatsCard({ title, value, description, icon, trend }: StatsCardProps) {
    const Icon = icons[icon]

    return (
        <div className="glassmorphic rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-primary" />
                </div>
                {trend && (
                    <span
                        className={cn(
                            'text-sm font-medium',
                            trend.isPositive ? 'text-success' : 'text-destructive'
                        )}
                    >
                        {trend.isPositive ? '+' : ''}{trend.value}%
                    </span>
                )}
            </div>
            <h3 className="text-2xl font-bold mb-1">{value}</h3>
            <p className="text-sm text-muted-foreground">{title}</p>
            {description && (
                <p className="text-xs text-muted-foreground mt-1">{description}</p>
            )}
        </div>
    )
}

