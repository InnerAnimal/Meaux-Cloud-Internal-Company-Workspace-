import { format, formatDistanceToNow } from 'date-fns'

export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(amount)
}

export function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

export function formatDate(date: Date | string): string {
    return format(new Date(date), 'MMM d, yyyy')
}

export function formatDateTime(date: Date | string): string {
    return format(new Date(date), 'MMM d, yyyy h:mm a')
}

export function formatRelativeTime(date: Date | string): string {
    return formatDistanceToNow(new Date(date), { addSuffix: true })
}

export function calculateSavingsPercent(original: number, optimized: number): number {
    return Math.round(((original - optimized) / original) * 100)
}

