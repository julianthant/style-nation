'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowUpRight, Bookmark, Gauge, Fuel, Settings, Calendar } from 'lucide-react'
import Image from 'next/image'

interface VehicleCardProps {
  id: string
  title: string
  description: string
  image: string
  price: string
  mileage: string
  fuelType: string
  transmission: string
  year: string
  badge?: {
    text: string
    color: 'green' | 'blue'
  }
  onViewDetails?: (id: string) => void
  onBookmark?: (id: string) => void
}

export function VehicleCard({
  id,
  title,
  description,
  image,
  price,
  mileage,
  fuelType,
  transmission,
  year,
  badge,
  onViewDetails,
  onBookmark,
}: VehicleCardProps) {
  const handleViewDetails = () => {
    onViewDetails?.(id)
  }

  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation()
    onBookmark?.(id)
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden w-full max-w-[328px] hover-lift">
      {/* Image Container */}
      <div className="relative h-[219px] w-full">
        <Image 
          src={image} 
          alt={title} 
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 328px"
          loading="lazy"
        />

        {/* Badge */}
        {badge && (
          <div className="absolute top-5 left-5">
            <Badge
              className={`px-4 py-1 text-sm font-medium capitalize rounded-full ${
                badge.color === 'green'
                  ? 'bg-[#3D923A] text-white hover:bg-[#3D923A]'
                  : 'bg-[#405FF2] text-white hover:bg-[#405FF2]'
              }`}
            >
              {badge.text}
            </Badge>
          </div>
        )}

        {/* Bookmark Icon */}
        <button 
          onClick={handleBookmark}
          className="absolute top-5 right-5 w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-shadow"
          aria-label="Bookmark vehicle"
        >
          <Bookmark className="w-3 h-3 text-[#050B20]" />
        </button>
      </div>

      {/* Content */}
      <div className="p-8 pb-5">
        {/* Title */}
        <h3 className="text-[#050B20] text-lg font-medium mb-1 leading-[21.6px]">
          {title}
        </h3>

        {/* Description */}
        <p className="text-[#050B20] text-sm leading-[14px] mb-4 opacity-80 line-clamp-2">
          {description}
        </p>

        {/* Specs */}
        <div className="space-y-3 py-4 mb-4">
          <div className="flex items-center gap-3">
            <Gauge className="w-[18px] h-[18px] text-[#050B20]" />
            <span className="text-[#050B20] text-sm">{mileage}</span>
            <Fuel className="w-[18px] h-[18px] text-[#050B20] ml-6" />
            <span className="text-[#050B20] text-sm">{fuelType}</span>
          </div>
          <div className="flex items-center gap-3">
            <Settings className="w-[18px] h-[18px] text-[#050B20]" />
            <span className="text-[#050B20] text-sm">{transmission}</span>
            <Calendar className="w-[18px] h-[18px] text-[#050B20] ml-6" />
            <span className="text-[#050B20] text-sm">{year}</span>
          </div>
        </div>

        {/* Price and CTA */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <span className="text-[#050B20] text-xl font-bold">{price}</span>
          <Button
            variant="ghost"
            onClick={handleViewDetails}
            className="text-[#405FF2] hover:text-[#405FF2]/80 p-0 h-auto font-medium text-[15px] group"
          >
            View Details
            <ArrowUpRight className="w-[14px] h-[14px] ml-2 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Button>
        </div>
      </div>
    </div>
  )
}