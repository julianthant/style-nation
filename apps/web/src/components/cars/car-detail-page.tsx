'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { 
  ArrowLeft,
  Heart,
  Share2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Gauge,
  Fuel,
  Settings,
  Car,
  Eye,
  AlertCircle,
  Loader2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { carsAPI } from '@/lib/api/cars'
import { Car } from '@/lib/types/car'
import { formatPrice, formatMileage } from '@/lib/utils/placeholder'

interface CarDetailPageProps {
  carId: string
}

export function CarDetailPage({ carId }: CarDetailPageProps) {
  const router = useRouter()
  const [car, setCar] = useState<Car | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isBookmarked, setIsBookmarked] = useState(false)

  useEffect(() => {
    const fetchCar = async () => {
      setIsLoading(true)
      setError(null)
      
      try {
        // Increment view count and fetch car details
        await Promise.all([
          carsAPI.incrementViewCount(carId),
          carsAPI.getCar(carId)
        ]).then(([_, carData]) => {
          setCar(carData)
        })
      } catch (err) {
        console.error('Error fetching car:', err)
        setError('Failed to load car details')
      } finally {
        setIsLoading(false)
      }
    }

    if (carId) {
      fetchCar()
    }
  }, [carId])

  const handleNextImage = () => {
    if (car?.images && car.images.length > 1) {
      setCurrentImageIndex((prev) => 
        prev === car.images.length - 1 ? 0 : prev + 1
      )
    }
  }

  const handlePrevImage = () => {
    if (car?.images && car.images.length > 1) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? car.images.length - 1 : prev - 1
      )
    }
  }

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked)
    // TODO: Implement actual bookmark functionality
  }

  const handleShare = () => {
    if (navigator.share && car) {
      navigator.share({
        title: `${car.year} ${car.make} ${car.model}`,
        text: car.description,
        url: window.location.href,
      })
    } else {
      // Fallback to copying URL
      navigator.clipboard.writeText(window.location.href)
      alert('Link copied to clipboard!')
    }
  }

  const handleInquiry = () => {
    // TODO: Open inquiry modal or navigate to contact form
    console.log('Open inquiry form')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Loading car details...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !car) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Button 
            variant="ghost" 
            onClick={() => router.back()}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error || 'Car not found'}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  const images = car.images?.sort((a, b) => a.order - b.order) || []
  const currentImage = images[currentImageIndex]

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button 
            variant="ghost" 
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Listings
          </Button>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleBookmark}>
              <Heart className={`w-4 h-4 mr-2 ${isBookmarked ? 'fill-red-500 text-red-500' : ''}`} />
              {isBookmarked ? 'Saved' : 'Save'}
            </Button>
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Images and Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <Card>
              <CardContent className="p-0">
                <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                  {currentImage ? (
                    <img 
                      src={currentImage.url} 
                      alt={`${car.make} ${car.model}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Car className="w-16 h-16 text-muted-foreground" />
                    </div>
                  )}
                  
                  {images.length > 1 && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handlePrevImage}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleNextImage}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                      
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 rounded-full px-3 py-1">
                        <span className="text-white text-sm">
                          {currentImageIndex + 1} / {images.length}
                        </span>
                      </div>
                    </>
                  )}
                </div>
                
                {/* Thumbnail Strip */}
                {images.length > 1 && (
                  <div className="flex gap-2 p-4 overflow-x-auto">
                    {images.map((image, index) => (
                      <button
                        key={image.id}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`flex-shrink-0 w-16 h-12 rounded overflow-hidden border-2 ${
                          index === currentImageIndex ? 'border-primary' : 'border-transparent'
                        }`}
                      >
                        <img 
                          src={image.url} 
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Vehicle Details */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl">
                      {car.year} {car.make} {car.model}
                    </CardTitle>
                    <p className="text-3xl font-bold text-primary mt-2">
                      {formatPrice(Number(car.price))}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant={car.condition === 'NEW' ? 'default' : 'secondary'}>
                      {car.condition.replace('_', ' ')}
                    </Badge>
                    <Badge variant={car.status === 'AVAILABLE' ? 'default' : 'secondary'}>
                      {car.status}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Year</p>
                      <p className="font-medium">{car.year}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Gauge className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Mileage</p>
                      <p className="font-medium">{formatMileage(car.mileage)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Fuel className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Fuel Type</p>
                      <p className="font-medium">{car.fuelType.replace('_', ' ')}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Settings className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Transmission</p>
                      <p className="font-medium">{car.transmissionType.replace('_', ' ')}</p>
                    </div>
                  </div>
                </div>

                <Separator className="my-6" />

                <div>
                  <h3 className="font-semibold mb-3">Description</h3>
                  <p className="text-muted-foreground leading-relaxed">{car.description}</p>
                </div>

                {car.features && car.features.length > 0 && (
                  <>
                    <Separator className="my-6" />
                    <div>
                      <h3 className="font-semibold mb-3">Features</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {car.features.map((feature, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                            <span className="text-sm">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Contact and Specs */}
          <div className="space-y-6">
            {/* Contact Card */}
            <Card>
              <CardHeader>
                <CardTitle>Interested in this car?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={handleInquiry} className="w-full" size="lg">
                  <Mail className="w-4 h-4 mr-2" />
                  Send Inquiry
                </Button>
                
                <Button variant="outline" className="w-full" size="lg">
                  <Phone className="w-4 h-4 mr-2" />
                  Call Now
                </Button>
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Eye className="w-4 h-4" />
                  <span>{car.viewCount} people have viewed this car</span>
                </div>
              </CardContent>
            </Card>

            {/* Vehicle Specifications */}
            <Card>
              <CardHeader>
                <CardTitle>Vehicle Specifications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">VIN</span>
                  <span className="font-medium font-mono text-sm">{car.vin}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Body Type</span>
                  <span className="font-medium">{car.bodyType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Exterior Color</span>
                  <span className="font-medium">{car.exteriorColor}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Interior Color</span>
                  <span className="font-medium">{car.interiorColor}</span>
                </div>
                {car.engineSize && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Engine Size</span>
                    <span className="font-medium">{car.engineSize}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}