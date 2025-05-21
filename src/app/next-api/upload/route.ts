import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData()
        const file = formData.get('file') as File
        const filename = formData.get('filename') as string

        if (!file || !filename) {
            return NextResponse.json({ error: 'File or filename is missing' }, { status: 400 })
        }

        const buffer = Buffer.from(await file.arrayBuffer())
        const uploadDir = join('/app/uploads/spareparts')
        await mkdir(uploadDir, { recursive: true })

        const filepath = join(uploadDir, filename)
        await writeFile(filepath, buffer)

        // Return URL that points to nginx path
        return NextResponse.json({ success: true, url: `/uploads/spareparts/${filename}` })
    } catch (error) {
        console.error('Error in upload handler:', error)
        return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
    }
}
