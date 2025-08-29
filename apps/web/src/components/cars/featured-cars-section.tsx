'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { VehicleCard } from '@/components/vehicles/vehicle-card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Star,
  TrendingUp,
  Eye,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Loader2,
  Sparkles
} from 'lucide-react'
import { Car } from '@/lib/types/car'
import { carsAPI } from '@/lib/api/cars'
import { getCarPlaceholderImage, formatPrice, formatMileage } from '@/lib/utils/placeholder'

interface FeaturedCarsSectionProps {
  limit?: number
  showHeader?: boolean
  compact?: boolean
}

export function FeaturedCarsSection({ 
  limit = 8, 
  showHeader = true,
  compact = false 
}: FeaturedCarsSectionProps) {
  const router = useRouter()
  const [cars, setCars] = useState<Car[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)

  // Fetch featured cars
  useEffect(() => {
    const fetchFeaturedCars = async () => {
      setIsLoading(true)
      setError(null)
      
      try {
        const featuredCars = await carsAPI.getFeaturedCars(limit)
        setCars(featuredCars)
      } catch (err) {
        console.error('Error fetching featured cars:', err)
        setError('Failed to load featured cars')
      } finally {
        setIsLoading(false)
      }
    }

    fetchFeaturedCars()
  }, [limit])

  const handleVehicleClick = async (id: string) => {
    // Increment view count
    try {
      await carsAPI.incrementViewCount(id)
    } catch (err) {
      console.warn('Failed to increment view count:', err)
    }
    
    // Navigate to car detail page
    router.push(`/cars/${id}`)
  }

  const handleBookmark = (id: string) => {
    console.log('Bookmark clicked:', id)
    // TODO: Implement bookmark functionality
  }

  const handleViewAll = () => {
    router.push('/cars')
  }

  // Convert Car to VehicleCard props
  const convertToVehicleCardProps = (car: Car) => {
    const primaryImage = car.images?.find(img => img.isPrimary) || car.images?.[0]
    
    return {
      id: car.id,
      title: `${car.year} ${car.make} ${car.model}`,
      description: car.description,
      image: primaryImage?.url || getCarPlaceholderImage(car),
      price: formatPrice(Number(car.price)),
      mileage: formatMileage(car.mileage),
      fuelType: car.fuelType.replace('_', ' '),
      transmission: car.transmissionType.replace('_', ' '),
      year: car.year.toString(),
      badge: car.condition === 'NEW' ? { text: 'New', color: 'green' as const } :
             car.condition === 'CERTIFIED_PREOWNED' ? { text: 'Certified', color: 'blue' as const } : undefined,
      onViewDetails: handleVehicleClick,
      onBookmark: handleBookmark,
    }
  }

  // Carousel navigation
  const handleNext = () => {
    if (currentIndex < cars.length - (compact ? 3 : 4)) {
      setCurrentIndex(prev => prev + 1)
    }
  }

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1)
    }
  }

  if (error) {
    return (
      <div className="py-8">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (isLoading) {
    return (
      <section className={compact ? "py-8" : "py-16"}>
        <div className="container mx-auto px-4">
          {showHeader && (
            <div className="text-center mb-12">
              <div className="h-8 bg-muted rounded w-64 mx-auto mb-4 animate-pulse" />
              <div className="h-4 bg-muted rounded w-96 mx-auto animate-pulse" />
            </div>
          )}
          
          <div className={compact ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "cars-grid"}>
            {Array.from({ length: compact ? 6 : 8 }).map((_, i) => (
              <div key={i} className="bg-card rounded-2xl overflow-hidden shadow-sm border border-border animate-pulse">
                <div className="h-[219px] bg-muted" />
                <div className="p-6">
                  <div className="space-y-3">
                    <div className="h-6 bg-muted rounded" />
                    <div className="h-8 bg-muted rounded w-32" />
                    <div className="grid grid-cols-2 gap-2">
                      <div className="h-4 bg-muted rounded" />
                      <div className="h-4 bg-muted rounded" />
                    </div>
                  </div>
                  <div className="mt-4 h-10 bg-muted rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (cars.length === 0) {
    return (
      <section className={compact ? "py-8" : "py-16"}>
        <div className="container mx-auto px-4">
          {showHeader && (
            <div className="text-center mb-12">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Sparkles className="w-8 h-8 text-primary" />
                <h2 className="text-4xl font-bold text-foreground">Featured Cars</h2>
              </div>
              <p className="text-muted-foreground text-lg">
                Discover our hand-picked selection of premium vehicles
              </p>
            </div>
          )}
          
          <div className="text-center py-12">
            <Star className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-lg">
              No featured cars available at the moment
            </p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className={compact ? "py-8" : "py-16 bg-muted/30"}>
      <div className="container mx-auto px-4">
        {/* Header */}
        {showHeader && (
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-4xl font-bold text-foreground">Featured Cars</h2>
            </div>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Discover our carefully selected premium vehicles, each offering exceptional 
              value and outstanding quality
            </p>
          </div>
        )}

        {/* Stats */}
        {!compact && showHeader && (
          <div className="flex justify-center mb-12">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Star className="w-4 h-4 text-yellow-500" />
                <span>{cars.length} featured cars</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span>Updated daily</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Eye className="w-4 h-4 text-blue-500" />
                <span>Most popular picks</span>
              </div>
            </div>
          </div>
        )}

        {/* Cars Grid/Carousel */}
        <div className="relative">
          {compact && cars.length > 3 ? (
            // Carousel view for compact mode
            <div className="relative overflow-hidden">
              <div 
                className="flex transition-transform duration-300 ease-in-out gap-6"
                style={{ 
                  transform: `translateX(-${currentIndex * (100 / 3)}%)`,
                  width: `${Math.ceil(cars.length / 3) * 100}%`
                }}
              >
                {cars.map((car) => (
                  <div key={car.id} className="flex-shrink-0 w-1/3">
                    <VehicleCard
                      {...convertToVehicleCardProps(car)}
                    />
                  </div>
                ))}
              </div>

              {/* Navigation Arrows */}
              {currentIndex > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrev}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-background/80 backdrop-blur-sm"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
              )}

              {currentIndex < cars.length - 3 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNext}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-background/80 backdrop-blur-sm"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          ) : (
            // Grid view for normal mode
            <div className={compact ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "cars-grid"}>
              {cars.map((car) => (
                <div key={car.id} className="hover-lift relative">
                  <Badge 
                    className="absolute top-4 left-4 z-10 bg-primary text-primary-foreground"
                  >
                    <Star className="w-3 h-3 mr-1" />
                    Featured
                  </Badge>
                  <VehicleCard
                    {...convertToVehicleCardProps(car)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* View All Button */}
        {showHeader && !compact && (
          <div className="text-center mt-12">
            <Button 
              onClick={handleViewAll}
              size="lg"
              className="px-8"
            >
              View All Cars
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}
      </div>
    </section>
  )
}