"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";
import Image from "next/image";

interface ImageUploadProps {
    onImageSelect: (file: File | null) => void;
    currentImageUrl?: string;
    className?: string;
}

export function ImageUpload({ onImageSelect, currentImageUrl, className }: ImageUploadProps) {
    const [preview, setPreview] = useState<string | null>(currentImageUrl || null);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (file) {
            const objectUrl = URL.createObjectURL(file);
            setPreview(objectUrl);
            onImageSelect(file);
        }
    }, [onImageSelect]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.jpeg', '.jpg', '.png', '.gif']
        },
        maxFiles: 1,
        multiple: false
    });

    const handleRemove = () => {
        setPreview(null);
        onImageSelect(null);
    };

    return (
        <div className={`w-full ${className}`}>
            <div
                {...getRootProps()}
                className={`
          border-2 border-dashed rounded-lg p-4
          flex flex-col items-center justify-center
          cursor-pointer transition-colors
          ${isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary/50'}
          ${preview ? 'h-[200px]' : 'h-[150px]'}
        `}
            >
                <input {...getInputProps()} />

                {preview ? (
                    <div className="relative w-full h-full">
                        <Image
                            src={preview}
                            alt="Preview"
                            fill
                            className="object-contain rounded-lg"
                        />
                        <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleRemove();
                            }}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-2">
                        <Upload className="h-8 w-8 text-gray-400" />
                        <p className="text-sm text-gray-500">
                            {isDragActive ? (
                                "Drop the image here"
                            ) : (
                                "Drag & drop an image here, or click to select"
                            )}
                        </p>
                        <p className="text-xs text-gray-400">
                            Supports: JPG, PNG, GIF
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
} 