"use client"

import type React from "react"

import { useState, useRef } from "react"
import Image from "next/image"

type ImageFile = {
  file: File
  preview: string
  id: string
}

interface ImageUploadProps {
  onImagesSelected: (files: File[]) => void
}

export default function ImageUpload({ onImagesSelected }: ImageUploadProps) {
  const [selectedImages, setSelectedImages] = useState<ImageFile[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return

    const newFiles: ImageFile[] = []
    const filesToUpload: File[] = []

    Array.from(e.target.files).forEach((file) => {
      if (!file.type.startsWith("image/")) return

      const id = Math.random().toString(36).substring(2, 9)
      newFiles.push({
        file,
        preview: URL.createObjectURL(file),
        id,
      })
      filesToUpload.push(file)
    })

    // Create a new array instead of modifying the existing one
    const updatedImages = [...selectedImages, ...newFiles]
    setSelectedImages(updatedImages)

    // Pass ALL files to the parent component, not just the new ones
    const allFiles = updatedImages.map((img) => img.file)
    onImagesSelected(allFiles)

    // Reset the input so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const removeImage = (id: string) => {
    setSelectedImages((prev) => {
      const imageToRemove = prev.find((img) => img.id === id)
      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.preview)
      }
      const updatedImages = prev.filter((img) => img.id !== id)

      // Notify parent component about the change with ALL remaining files
      const remainingFiles = updatedImages.map((img) => img.file)
      onImagesSelected(remainingFiles)

      return updatedImages
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <label htmlFor="images" className="button">
          Add Images
        </label>
        <input
          type="file"
          id="images"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          multiple
          className="hidden"
        />
        <span className="text-sm text-gray-500">
          {selectedImages.length > 0
            ? `${selectedImages.length} image${selectedImages.length > 1 ? "s" : ""} selected`
            : "No images selected"}
        </span>
      </div>

      {selectedImages.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedImages.map((img) => (
            <div key={img.id} className="relative group">
              <div className="w-20 h-20 relative overflow-hidden border border-gray-200 rounded">
                <Image
                  src={img.preview || "/placeholder.svg"}
                  alt={img.file.name}
                  fill
                  style={{ objectFit: "cover" }}
                  sizes="80px"
                  quality={60}
                />
              </div>
              <button
                type="button"
                onClick={() => removeImage(img.id)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Remove image"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
