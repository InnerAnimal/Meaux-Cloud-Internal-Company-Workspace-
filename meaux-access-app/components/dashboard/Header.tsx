'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'

export function Header() {
    const [user, setUser] = useState<User | null>(null)

    useEffect(() => {
        supabase.auth.getUser().then(({ data: { user } }) => {
            setUser(user)
        })

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null)
        })

        return () => subscription.unsubscribe()
    }, [])

    const initials = user?.email
        ?.split('@')[0]
        .substring(0, 2)
        .toUpperCase() || 'U'

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border bg-card/80 backdrop-blur-lg">
            <div className="flex h-16 items-center justify-between px-6 ml-[280px]">
                <div className="flex items-center gap-4">
                    <h1 className="text-lg font-semibold">Dashboard</h1>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-semibold">
                            {initials}
                        </div>
                        <div className="hidden md:block">
                            <p className="text-sm font-medium">{user?.email}</p>
                            <p className="text-xs text-muted-foreground">Team Member</p>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    )
}

