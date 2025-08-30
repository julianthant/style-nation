'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Heart, 
  Phone, 
  MessageSquare, 
  Fuel,
  Settings,
  Calendar,
  Gauge
} from 'lucide-react'

interface MobileCarCardProps {
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

export function MobileCarCard({ car }: MobileCarCardProps) {
  const [isBookmarked, setIsBookmarked] = useState(false)

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked)
    car.onBookmark?.(car.id)
  }

  const handleViewDetails = () => {
    car.onViewDetails?.(car.id)
  }

  return (
    <div className="bg-card rounded-2xl overflow-hidden shadow-sm border border-border hover:shadow-md transition-shadow">
      {/* Image Section */}
      <div className="relative h-48 w-full">
        <Image
          src={car.image || '/images/placeholder-car.jpg'}
          alt={car.title}
          fill
          className="object-cover"
          sizes="100vw"
        />
        
        {/* Badges and Actions Overlay */}
        <div className="absolute inset-0 p-3 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            {/* Condition Badge */}
            {car.badge && (
              <Badge 
                className={`${
                  car.badge.color === 'green' ? 'bg-green-500' :
                  car.badge.color === 'blue' ? 'bg-blue-500' :
                  car.badge.color === 'yellow' ? 'bg-yellow-500' :
                  'bg-red-500'
                } text-white font-medium px-3 py-1`}
              >
                {car.badge.text}
              </Badge>
            )}
            
            {/* Bookmark Button */}
            <Button
              size="sm"
              variant="ghost"
              className="bg-black/20 backdrop-blur-sm hover:bg-black/30 p-2 h-auto"
              onClick={handleBookmark}
            >
              <Heart 
                className={`w-4 h-4 ${
                  isBookmarked ? 'fill-red-500 text-red-500' : 'text-white'
                }`} 
              />
            </Button>
          </div>

          {/* Price Tag */}
          <div className="self-end">
            <div className="bg-black/80 backdrop-blur-sm text-white px-3 py-2 rounded-lg">
              <span className="text-lg font-bold">{car.price}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4">
        {/* Title and Year */}
        <div className="mb-3">
          <h3 className="font-semibold text-lg leading-tight mb-1">{car.title}</h3>
          <div className="flex items-center text-muted-foreground text-sm">
            <Calendar className="w-4 h-4 mr-1" />
            <span>{car.year}</span>
          </div>
        </div>

        {/* Car Details */}
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
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {car.description}
        </p>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button 
            asChild
            className="flex-1 h-12 text-base font-medium"
          >
            <Link href={`/cars/${car.id}`}>
              View Details
            </Link>
          </Button>
          
          <Button 
            variant="outline"
            size="sm"
            className="h-12 px-4"
            onClick={() => {
              // Handle call action
              console.log('Call clicked for car:', car.id)
            }}
          >
            <Phone className="w-4 h-4" />
          </Button>
          
          <Button 
            variant="outline"
            size="sm"
            className="h-12 px-4"
            onClick={() => {
              // Handle message action
              console.log('Message clicked for car:', car.id)
            }}
          >
            <MessageSquare className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}