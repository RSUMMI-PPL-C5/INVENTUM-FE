import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Card } from '@/components/ui/card'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface ImageUploadProps {
    onImageSelect: (imagePath: string) => void
    currentImage?: string
    className?: string
}

export function ImageUpload({ onImageSelect, currentImage, className }: ImageUploadProps) {
    const [previewUrl, setPreviewUrl] = useState<string | null>(currentImage || null)
    const [isUploading, setIsUploading] = useState(false)

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        const file = acceptedFiles[0]
        if (file) {
            try {
                setIsUploading(true)

                // Generate filename
                const timestamp = new Date().getTime()
                const filename = `sparepart-${timestamp}.png`
                const publicPath = `/assets/spareparts/${filename}`

                // Create preview URL
                const previewUrl = URL.createObjectURL(file)
                setPreviewUrl(previewUrl)

                // Create form data
                const formData = new FormData()
                formData.append('file', file)
                formData.append('filename', filename)

                // Upload file
                const response = await fetch('/next-api/upload', {
                    method: 'POST',
                    body: formData
                })

                if (!response.ok) {
                    throw new Error('Failed to upload file')
                }

                // Update form with public path
                onImageSelect(publicPath)
                toast.success('Gambar berhasil disimpan')
            } catch (error) {
                console.error('Error uploading file:', error)
                toast.error('Gagal menyimpan gambar')
                setPreviewUrl(null)
            } finally {
                setIsUploading(false)
            }
        }
    }, [onImageSelect])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.png', '.jpg', '.jpeg']
        },
        maxFiles: 1,
        maxSize: 5 * 1024 * 1024 // 5MB
    })

    return (
        <Card
            {...getRootProps()}
            className={cn(
                "p-4 border-2 border-dashed cursor-pointer hover:border-primary transition-colors",
                isDragActive && "border-primary bg-primary/5",
                isUploading && "opacity-50 cursor-not-allowed",
                className
            )}
        >
            <input {...getInputProps()} disabled={isUploading} />

            {previewUrl ? (
                <div className="relative aspect-video w-full">
                    <Image
                        src={previewUrl}
                        alt="Preview"
                        fill
                        className="object-contain rounded-md"
                    />
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-8 text-sm text-gray-600">
                    {isUploading ? (
                        <p>Mengunggah gambar...</p>
                    ) : (
                        <>
                            <p>Drag & drop gambar spare part di sini</p>
                            <p>atau klik untuk memilih file</p>
                            <p className="text-xs text-gray-400 mt-2">PNG, JPG atau JPEG (maks. 5MB)</p>
                        </>
                    )}
                </div>
            )}
        </Card>
    )
} 