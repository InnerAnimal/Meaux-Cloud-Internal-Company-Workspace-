'use client'

import { useState, useEffect } from 'react'
import { Cloud, Folder } from 'lucide-react'
import { formatBytes } from '@/lib/utils/formatters'

interface R2Object {
    Key: string
    Size: number
    LastModified: string
}

export default function R2Page() {
    const [objects, setObjects] = useState<R2Object[]>([])
    const [selectedBrand, setSelectedBrand] = useState<string>('meauxbility')

    useEffect(() => {
        loadObjects()
    }, [selectedBrand])

    async function loadObjects() {
        const res = await fetch(`/api/r2/list?prefix=${selectedBrand}/`)
        const data = await res.json()
        if (data.objects) setObjects(data.objects)
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold mb-2">R2 Storage</h1>
                <p className="text-muted-foreground">Cloudflare R2 bucket browser</p>
            </div>

            <div className="glassmorphic rounded-xl p-6">
                <div className="flex gap-2 mb-6">
                    {['meauxbility', 'inneranimals', 'iautodidact'].map((brand) => (
                        <button
                            key={brand}
                            onClick={() => setSelectedBrand(brand)}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${selectedBrand === brand
                                    ? 'bg-primary text-white'
                                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                }`}
                        >
                            {brand}
                        </button>
                    ))}
                </div>

                <div className="space-y-2">
                    {objects.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">No files found</p>
                    ) : (
                        objects.map((obj) => (
                            <div
                                key={obj.Key}
                                className="flex items-center justify-between p-4 rounded-lg border border-border"
                            >
                                <div className="flex items-center gap-3">
                                    <Folder className="w-5 h-5 text-muted-foreground" />
                                    <div>
                                        <p className="font-medium">{obj.Key}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {formatBytes(obj.Size)} • {new Date(obj.LastModified).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}

