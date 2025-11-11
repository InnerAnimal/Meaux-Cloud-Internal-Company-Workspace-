'use client'

import { useState } from 'react'
import { Upload, Image as ImageIcon } from 'lucide-react'

export default function AssetsPage() {
    const [uploading, setUploading] = useState(false)

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setUploading(true)
        try {
            const formData = new FormData()
            formData.append('file', file)
            formData.append('brand', 'meauxbility')

            const res = await fetch('/api/assets/upload', {
                method: 'POST',
                body: formData,
            })

            if (!res.ok) throw new Error('Upload failed')

            alert('Asset uploaded successfully!')
        } catch (error) {
            alert('Upload failed')
        } finally {
            setUploading(false)
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold mb-2">Asset Manager</h1>
                <p className="text-muted-foreground">Upload and optimize images</p>
            </div>

            <div className="glassmorphic rounded-xl p-6">
                <div className="border-2 border-dashed border-border rounded-lg p-12 text-center">
                    <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">Upload Asset</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                        Drag and drop or click to select
                    </p>
                    <label className="inline-block px-6 py-3 bg-primary text-white rounded-lg cursor-pointer hover:bg-primary-dark transition-colors">
                        {uploading ? 'Uploading...' : 'Choose File'}
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleUpload}
                            disabled={uploading}
                            className="hidden"
                        />
                    </label>
                </div>
            </div>

            <div className="glassmorphic rounded-xl p-6">
                <h2 className="text-xl font-bold mb-4">Recent Assets</h2>
                <div className="text-center text-muted-foreground py-12">
                    <ImageIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No assets yet. Upload your first asset to get started.</p>
                </div>
            </div>
        </div>
    )
}

