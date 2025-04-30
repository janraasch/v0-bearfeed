"use client"

import { useState, useEffect } from "react"
import Image from "next/image"

type PostImage = {
  id: string
  storage_path: string
  file_name: string
  content_type: string
  display_order: number
  signedUrl?: string
}

interface ImageGalleryProps {
  images: PostImage[]
  initialIndex: number
  onClose: () => void
}

export default function ImageGallery({ images, initialIndex, onClose }: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)

  useEffect(() => {
    // Add event listener for keyboard navigation
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()
      } else if (e.key === "ArrowLeft") {
        navigate(-1)
      } else if (e.key === "ArrowRight") {
        navigate(1)
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    // Prevent scrolling while gallery is open
    document.body.style.overflow = "hidden"

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.body.style.overflow = "auto"
    }
  }, [currentIndex])

  const navigate = (direction: number) => {
    const newIndex = currentIndex + direction
    if (newIndex >= 0 && newIndex < images.length) {
      setCurrentIndex(newIndex)
    }
  }

  const currentImage = images[currentIndex]

  if (!currentImage || !currentImage.signedUrl) {
    return null
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white text-2xl hover:text-gray-300"
        aria-label="Close gallery"
      >
        ×
      </button>

      <div className="flex items-center justify-center w-full h-full px-4">
        {images.length > 1 && currentIndex > 0 && (
          <button
            onClick={() => navigate(-1)}
            className="absolute left-4 text-white text-4xl hover:text-gray-300"
            aria-label="Previous image"
          >
            ‹
          </button>
        )}

        <div className="relative max-w-full max-h-full">
          <div className="relative" style={{ maxHeight: "calc(100vh - 100px)", width: "auto" }}>
            <Image
              src={currentImage.signedUrl}
              alt={currentImage.file_name || "Full size image"}
              placeholder="blur"
              blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAEtAJJXIDTjwAAAABJRU5ErkJggg=="
              width={1200}
              height={800}
              style={{ objectFit: "contain", maxHeight: "calc(100vh - 100px)" }}
              className="max-w-full max-h-full"
              sizes="(max-width: 768px) 100vw, 80vw"
              priority
            />
          </div>
          <div className="absolute bottom-0 left-0 right-0 text-center text-white text-sm py-2">
            {currentIndex + 1} / {images.length}
          </div>
        </div>

        {images.length > 1 && currentIndex < images.length - 1 && (
          <button
            onClick={() => navigate(1)}
            className="absolute right-4 text-white text-4xl hover:text-gray-300"
            aria-label="Next image"
          >
            ›
          </button>
        )}
      </div>
    </div>
  )
}
