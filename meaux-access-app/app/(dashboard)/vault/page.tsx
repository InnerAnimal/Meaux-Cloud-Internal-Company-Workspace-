'use client'

import { useState, useEffect } from 'react'
import { Lock, Eye, EyeOff, Copy, Check } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { decrypt, maskKey } from '@/lib/utils/encryption'

interface Secret {
    id: string
    service_name: string
    encrypted_key: string
    created_at: string
}

const services = ['OpenAI', 'Anthropic', 'Cloudflare', 'Supabase', 'Stripe', 'GitHub']

export default function VaultPage() {
    const [secrets, setSecrets] = useState<Secret[]>([])
    const [revealed, setRevealed] = useState<Set<string>>(new Set())
    const [copied, setCopied] = useState<string | null>(null)

    useEffect(() => {
        loadSecrets()
    }, [])

    async function loadSecrets() {
        const { data } = await supabase.from('vault_secrets').select('*').order('created_at')
        if (data) setSecrets(data)
    }

    function toggleReveal(id: string) {
        const newRevealed = new Set(revealed)
        if (newRevealed.has(id)) {
            newRevealed.delete(id)
        } else {
            newRevealed.add(id)
        }
        setRevealed(newRevealed)
    }

    async function copyToClipboard(text: string, id: string) {
        await navigator.clipboard.writeText(text)
        setCopied(id)
        setTimeout(() => setCopied(null), 2000)
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold mb-2">Secure Vault</h1>
                <p className="text-muted-foreground">Encrypted API keys and secrets</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {services.map((service) => {
                    const secret = secrets.find((s) => s.service_name === service)
                    const isRevealed = secret ? revealed.has(secret.id) : false
                    const keyValue = secret && isRevealed ? decrypt(secret.encrypted_key) : secret ? maskKey(secret.encrypted_key) : 'Not set'

                    return (
                        <div key={service} className="glassmorphic rounded-xl p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                    <Lock className="w-5 h-5 text-primary" />
                                </div>
                                <h3 className="font-semibold">{service}</h3>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <code className="flex-1 text-sm bg-muted px-3 py-2 rounded font-mono break-all">
                                        {keyValue}
                                    </code>
                                    {secret && (
                                        <>
                                            <button
                                                onClick={() => toggleReveal(secret.id)}
                                                className="p-2 hover:bg-muted rounded transition-colors"
                                            >
                                                {isRevealed ? (
                                                    <EyeOff className="w-4 h-4" />
                                                ) : (
                                                    <Eye className="w-4 h-4" />
                                                )}
                                            </button>
                                            {isRevealed && (
                                                <button
                                                    onClick={() => copyToClipboard(decrypt(secret.encrypted_key), secret.id)}
                                                    className="p-2 hover:bg-muted rounded transition-colors"
                                                >
                                                    {copied === secret.id ? (
                                                        <Check className="w-4 h-4 text-success" />
                                                    ) : (
                                                        <Copy className="w-4 h-4" />
                                                    )}
                                                </button>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

