import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { uploadToR2 } from '@/lib/cloudflare/r2'
import sharp from 'sharp'

export async function POST(request: NextRequest) {
    try {
        const supabase = createSupabaseServerClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const formData = await request.formData()
        const file = formData.get('file') as File
        const brand = formData.get('brand') as string

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 })
        }

        const buffer = Buffer.from(await file.arrayBuffer())
        const originalSize = buffer.length

        // Optimize image with Sharp
        const optimizedBuffer = await sharp(buffer)
            .webp({ quality: 80 })
            .toBuffer()

        const optimizedSize = optimizedBuffer.length
        const savingsPercent = Math.round(((originalSize - optimizedSize) / originalSize) * 100)

        // Upload to R2
        const timestamp = Date.now()
        const filename = `${brand}/${timestamp}-${file.name.replace(/\.[^/.]+$/, '')}.webp`
        const cdnUrl = await uploadToR2(filename, optimizedBuffer, 'image/webp')

        // Save metadata to Supabase
        const { data, error } = await supabase.from('assets').insert({
            user_id: user.id,
            brand,
            filename: file.name,
            original_size: originalSize,
            optimized_size: optimizedSize,
            savings_percent: savingsPercent,
            r2_path: filename,
            cdn_url: cdnUrl,
            file_type: 'image/webp',
        })

        if (error) throw error

        return NextResponse.json({
            success: true,
            asset: data,
            cdnUrl,
            savingsPercent,
        })
    } catch (error: any) {
        console.error('Upload error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

