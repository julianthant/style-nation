'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Heart, 
  Eye,
  Fuel,
  Settings,
  Calendar,
  Gauge,
  Car
} from 'lucide-react'

interface DesktopCarCardProps {
  car: {
    id: string
    title: string
    description: string
    price: string
    year: number
    mileage?: string
    fuelType: string
    transmission: string
    image: string
    badge?: {
      text: string
      color: 'green' | 'blue' | 'yellow' | 'red'
    }
    onViewDetails?: (id: string) => void
    onBookmark?: (id: string) => void
  }
}

export function DesktopCarCard({ car }: DesktopCarCardProps) {
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked)
    car.onBookmark?.(car.id)
  }

  const handleViewDetails = () => {
    car.onViewDetails?.(car.id)
  }

  return (
    <div 
      className="group bg-card rounded-2xl overflow-hidden shadow-sm border border-border hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Section */}
      <div className="relative h-52 w-full overflow-hidden">
        <Image
          src={car.image || '/images/placeholder-car.jpg'}
          alt={car.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 1024px) 50vw, 33vw"
        />
        
        {/* Overlay on Hover */}
        <div className={`absolute inset-0 bg-black/20 transition-opacity duration-300 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`} />
        
        {/* Top Overlay - Badge and Bookmark */}
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
          {/* Condition Badge */}
          {car.badge && (
            <Badge 
              className={`${
                car.badge.color === 'green' ? 'bg-green-500 hover:bg-green-600' :
                car.badge.color === 'blue' ? 'bg-blue-500 hover:bg-blue-600' :
                car.badge.color === 'yellow' ? 'bg-yellow-500 hover:bg-yellow-600' :
                'bg-red-500 hover:bg-red-600'
              } text-white font-medium px-3 py-1 shadow-lg`}
            >
              {car.badge.text}
            </Badge>
          )}
          
          {/* Bookmark Button */}
          <Button
            size="sm"
            variant="ghost"
            className="bg-white/90 hover:bg-white backdrop-blur-sm p-2 h-auto shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={handleBookmark}
          >
            <Heart 
              className={`w-4 h-4 ${
                isBookmarked ? 'fill-red-500 text-red-500' : 'text-gray-700 hover:text-red-500'
              } transition-colors`} 
            />
          </Button>
        </div>

        {/* Bottom Overlay - Price and Quick View */}
        <div className={`absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent transition-opacity duration-300 ${
          isHovered ? 'opacity-100' : 'opacity-80'
        }`}>
          <div className="flex items-end justify-between">
            <div className="text-white">
              <span className="text-2xl font-bold">{car.price}</span>
            </div>
            
            <Button
              size="sm"
              variant="ghost"
              className={`bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm transition-all duration-300 ${
                isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
              }`}
              onClick={handleViewDetails}
            >
              <Eye className="w-4 h-4 mr-1" />
              Quick View
            </Button>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-5">
        {/* Title and Year */}
        <div className="mb-4">
          <h3 className="font-semibold text-lg leading-tight mb-1 group-hover:text-primary transition-colors">
            {car.title}
          </h3>
          <div className="flex items-center text-muted-foreground text-sm">
            <Calendar className="w-4 h-4 mr-1" />
            <span>{car.year} Model</span>
          </div>
        </div>

        {/* Car Details Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {car.mileage && (
            <div className="flex items-center text-sm text-muted-foreground">
              <Gauge className="w-4 h-4 mr-2 text-primary" />
              <span>{car.mileage}</span>
            </div>
          )}
          <div className="flex items-center text-sm text-muted-foreground">
            <Fuel className="w-4 h-4 mr-2 text-primary" />
            <span>{car.fuelType}</span>
          </div>
          <div className="flex items-center text-sm text-muted-foreground col-span-2">
            <Settings className="w-4 h-4 mr-2 text-primary" />
            <span>{car.transmission}</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground mb-5 line-clamp-2 leading-relaxed">
          {car.description}
        </p>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button 
            asChild
            className="flex-1 group-hover:bg-primary/90 transition-colors"
          >
            <Link href={`/cars/${car.id}`}>
              <Car className="w-4 h-4 mr-2" />
              View Details
            </Link>
          </Button>
          
          <Button 
            variant="outline"
            className="hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
            onClick={() => {
              // Handle contact action
              console.log('Contact clicked for car:', car.id)
            }}
          >
            Contact
          </Button>
        </div>
      </div>
    </div>
  )
}