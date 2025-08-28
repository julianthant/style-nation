'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CarImage } from '@/lib/types/car'
import { getCarPlaceholderImage } from '@/lib/utils/placeholder'

interface CarDetailGalleryProps {
  images: CarImage[]
  carTitle: string
}

export function CarDetailGallery({ images, carTitle }: CarDetailGalleryProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)

  // Use placeholder if no images
  const displayImages = images.length > 0 ? images : [
    {
      id: 'placeholder',
      carId: 'placeholder',
      url: `https://via.placeholder.com/800x600/6c757d/ffffff?text=${encodeURIComponent(carTitle)}`,
      isPrimary: true,
      order: 1,
      createdAt: new Date()
    }
  ]

  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index)
    setIsLightboxOpen(true)
  }

  const handlePrevious = () => {
    setSelectedImageIndex((prev) => 
      prev === 0 ? displayImages.length - 1 : prev - 1
    )
  }

  const handleNext = () => {
    setSelectedImageIndex((prev) => 
      prev === displayImages.length - 1 ? 0 : prev + 1
    )
  }

  const closeLightbox = () => {
    setIsLightboxOpen(false)
  }

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-muted hover-lift cursor-pointer">
        <Image
          src={displayImages[selectedImageIndex].url}
          alt={`${carTitle} - Main view`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 800px"
          onClick={() => handleImageClick(selectedImageIndex)}
        />
        
        {/* Navigation Arrows - only show if multiple images */}
        {displayImages.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="sm"
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-foreground rounded-full w-10 h-10 p-0"
              onClick={(e) => {
                e.stopPropagation()
                handlePrevious()
              }}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-foreground rounded-full w-10 h-10 p-0"
              onClick={(e) => {
                e.stopPropagation()
                handleNext()
              }}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </>
        )}

        {/* Image counter */}
        {displayImages.length > 1 && (
          <div className="absolute bottom-4 right-4 bg-black/75 text-white px-3 py-1 rounded-full text-sm">
            {selectedImageIndex + 1} / {displayImages.length}
          </div>
        )}
      </div>

      {/* Thumbnail Gallery - only show if multiple images */}
      {displayImages.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {displayImages.map((image, index) => (
            <button
              key={image.id}
              className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                index === selectedImageIndex
                  ? 'border-primary ring-2 ring-primary/20'
                  : 'border-border hover:border-primary/50'
              }`}
              onClick={() => setSelectedImageIndex(index)}
            >
              <Image
                src={image.url}
                alt={`${carTitle} - View ${index + 1}`}
                fill
                className="object-cover"
                sizes="80px"
              />
              {index === selectedImageIndex && (
                <div className="absolute inset-0 bg-primary/10" />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <div className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center">
          <div className="relative w-full h-full flex items-center justify-center p-4">
            {/* Close Button */}
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white rounded-full w-10 h-10 p-0 z-10"
              onClick={closeLightbox}
            >
              <X className="h-5 w-5" />
            </Button>

            {/* Main Lightbox Image */}
            <div className="relative w-full h-full max-w-4xl max-h-[90vh]">
              <Image
                src={displayImages[selectedImageIndex].url}
                alt={`${carTitle} - Lightbox view`}
                fill
                className="object-contain"
                sizes="100vw"
              />
            </div>

            {/* Navigation - only show if multiple images */}
            {displayImages.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white rounded-full w-12 h-12 p-0"
                  onClick={handlePrevious}
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white rounded-full w-12 h-12 p-0"
                  onClick={handleNext}
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>

                {/* Image counter */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/75 text-white px-4 py-2 rounded-full">
                  {selectedImageIndex + 1} of {displayImages.length}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}