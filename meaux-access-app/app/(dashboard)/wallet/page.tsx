'use client'

import { useState, useEffect } from 'react'
import { Wallet, TrendingUp, TrendingDown } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils/formatters'

interface Transaction {
    id: string
    type: 'income' | 'expense'
    amount: number
    description: string
    created_at: string
}

export default function WalletPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [balance, setBalance] = useState(0)

    useEffect(() => {
        loadTransactions()
    }, [])

    async function loadTransactions() {
        const res = await fetch('/api/wallet/transactions')
        const data = await res.json()
        if (data.transactions) {
            setTransactions(data.transactions)
            const total = data.transactions.reduce((sum: number, t: Transaction) => {
                return sum + (t.type === 'income' ? t.amount : -t.amount)
            }, 0)
            setBalance(total)
        }
    }

    const income = transactions
        .filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0)
    const expenses = transactions
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0)

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold mb-2">Wallet</h1>
                <p className="text-muted-foreground">Financial tracking</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glassmorphic rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <Wallet className="w-5 h-5 text-primary" />
                        <span className="text-sm text-muted-foreground">Total Balance</span>
                    </div>
                    <p className="text-2xl font-bold">{formatCurrency(balance)}</p>
                </div>

                <div className="glassmorphic rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <TrendingUp className="w-5 h-5 text-success" />
                        <span className="text-sm text-muted-foreground">Revenue</span>
                    </div>
                    <p className="text-2xl font-bold text-success">{formatCurrency(income)}</p>
                </div>

                <div className="glassmorphic rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <TrendingDown className="w-5 h-5 text-destructive" />
                        <span className="text-sm text-muted-foreground">Expenses</span>
                    </div>
                    <p className="text-2xl font-bold text-destructive">{formatCurrency(expenses)}</p>
                </div>
            </div>

            <div className="glassmorphic rounded-xl p-6">
                <h2 className="text-xl font-bold mb-4">Recent Transactions</h2>
                <div className="space-y-2">
                    {transactions.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">No transactions yet</p>
                    ) : (
                        transactions.map((t) => (
                            <div
                                key={t.id}
                                className="flex items-center justify-between p-4 rounded-lg border border-border"
                            >
                                <div>
                                    <p className="font-medium">{t.description || 'Transaction'}</p>
                                    <p className="text-sm text-muted-foreground">{formatDate(t.created_at)}</p>
                                </div>
                                <p
                                    className={`font-bold ${t.type === 'income' ? 'text-success' : 'text-destructive'
                                        }`}
                                >
                                    {t.type === 'income' ? '+' : '-'}
                                    {formatCurrency(Math.abs(t.amount))}
                                </p>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}

