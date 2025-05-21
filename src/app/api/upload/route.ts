import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData()
        const file = formData.get('file') as File
        const filename = formData.get('filename') as string

        if (!file || !filename) {
            return NextResponse.json(
                { error: 'File or filename is missing' },
                { status: 400 }
            )
        }

        // Convert File to Buffer
        const buffer = Buffer.from(await file.arrayBuffer())

        // Ensure directory exists
        const uploadDir = join(process.cwd(), 'public', 'assets', 'spareparts')
        await mkdir(uploadDir, { recursive: true })

        // Write file
        const filepath = join(uploadDir, filename)
        await writeFile(filepath, buffer)

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error in upload handler:', error)
        return NextResponse.json(
            { error: 'Failed to upload file' },
            { status: 500 }
        )
    }
} 