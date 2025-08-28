'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Share2, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CarDetailGallery } from '@/components/cars/car-detail-gallery'
import { CarDetailInfo } from '@/components/cars/car-detail-info'
import { CarDetailSidebar } from '@/components/cars/car-detail-sidebar'
import { Footer } from '@/components/layout/footer'
import { Car } from '@/lib/types/car'

// Mock data for demonstration - same as in car-listing.tsx
const MOCK_CARS: Car[] = [
  {
    id: '1',
    make: 'Toyota',
    model: 'Camry',
    year: 2023,
    price: 28500,
    mileage: 15000,
    vin: '1234567890',
    condition: 'USED',
    transmissionType: 'AUTOMATIC',
    fuelType: 'GASOLINE',
    bodyType: 'SEDAN',
    exteriorColor: 'Silver',
    interiorColor: 'Black',
    engineSize: '2.5L',
    features: ['Bluetooth', 'Backup Camera', 'Apple CarPlay', 'Heated Seats', 'Lane Keeping Assist', 'Adaptive Cruise Control'],
    description: 'Excellent condition Toyota Camry with low mileage. This reliable sedan has been meticulously maintained and comes with a comprehensive service history. Perfect for daily commuting and long road trips. Features include advanced safety systems, comfortable interior, and excellent fuel economy.',
    images: [
      {
        id: '1-1',
        carId: '1',
        url: '/images/cars/toyota-camry-1.jpg',
        isPrimary: true,
        order: 1,
        createdAt: new Date()
      },
      {
        id: '1-2',
        carId: '1',
        url: '/images/cars/toyota-camry-2.jpg',
        isPrimary: false,
        order: 2,
        createdAt: new Date()
      },
      {
        id: '1-3',
        carId: '1',
        url: '/images/cars/toyota-camry-3.jpg',
        isPrimary: false,
        order: 3,
        createdAt: new Date()
      }
    ],
    status: 'AVAILABLE',
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: '1',
    creator: { id: '1', email: 'admin@example.com', role: 'ADMIN', createdAt: new Date(), updatedAt: new Date() },
    viewCount: 45
  },
  {
    id: '2',
    make: 'Honda',
    model: 'Civic',
    year: 2022,
    price: 24000,
    mileage: 28000,
    vin: '0987654321',
    condition: 'USED',
    transmissionType: 'MANUAL',
    fuelType: 'GASOLINE',
    bodyType: 'SEDAN',
    exteriorColor: 'Blue',
    interiorColor: 'Gray',
    engineSize: '2.0L',
    features: ['Manual Transmission', 'Fuel Efficient', 'Sporty Design', 'LED Headlights', 'USB Ports'],
    description: 'Well-maintained Honda Civic with manual transmission. Perfect for driving enthusiasts who appreciate the connection between driver and machine. This car offers excellent fuel efficiency combined with sporty handling.',
    images: [
      {
        id: '2-1',
        carId: '2',
        url: '/images/cars/honda-civic-1.jpg',
        isPrimary: true,
        order: 1,
        createdAt: new Date()
      }
    ],
    status: 'AVAILABLE',
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: '1',
    creator: { id: '1', email: 'admin@example.com', role: 'ADMIN', createdAt: new Date(), updatedAt: new Date() },
    viewCount: 32
  },
  {
    id: '3',
    make: 'Tesla',
    model: 'Model 3',
    year: 2024,
    price: 42000,
    mileage: 5000,
    vin: '1122334455',
    condition: 'NEW',
    transmissionType: 'AUTOMATIC',
    fuelType: 'ELECTRIC',
    bodyType: 'SEDAN',
    exteriorColor: 'White',
    interiorColor: 'Black',
    features: ['Autopilot', 'Supercharging', 'Over-the-Air Updates', '15" Touchscreen', 'Premium Audio', 'Glass Roof'],
    description: 'Brand new Tesla Model 3 with the latest features and technology. This electric vehicle represents the future of transportation with its cutting-edge autopilot system, over-the-air updates, and exceptional range.',
    images: [
      {
        id: '3-1',
        carId: '3',
        url: '/images/cars/tesla-model3-1.jpg',
        isPrimary: true,
        order: 1,
        createdAt: new Date()
      },
      {
        id: '3-2',
        carId: '3',
        url: '/images/cars/tesla-model3-2.jpg',
        isPrimary: false,
        order: 2,
        createdAt: new Date()
      }
    ],
    status: 'AVAILABLE',
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: '1',
    creator: { id: '1', email: 'admin@example.com', role: 'ADMIN', createdAt: new Date(), updatedAt: new Date() },
    viewCount: 78
  },
  {
    id: '4',
    make: 'BMW',
    model: 'X5',
    year: 2023,
    price: 65000,
    mileage: 12000,
    vin: '5544332211',
    condition: 'CERTIFIED_PREOWNED',
    transmissionType: 'AUTOMATIC',
    fuelType: 'GASOLINE',
    bodyType: 'SUV',
    exteriorColor: 'Black',
    interiorColor: 'Tan',
    engineSize: '3.0L',
    features: ['AWD', 'Premium Sound', 'Panoramic Sunroof', 'Navigation', 'Leather Seats', 'Wireless Charging'],
    description: 'Certified pre-owned BMW X5 with premium features and luxury appointments. This SUV combines performance, comfort, and practicality in one exceptional package. Comes with remaining factory warranty.',
    images: [
      {
        id: '4-1',
        carId: '4',
        url: '/images/cars/bmw-x5-1.jpg',
        isPrimary: true,
        order: 1,
        createdAt: new Date()
      }
    ],
    status: 'AVAILABLE',
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: '1',
    creator: { id: '1', email: 'admin@example.com', role: 'ADMIN', createdAt: new Date(), updatedAt: new Date() },
    viewCount: 56
  }
]

export default function CarDetailPage() {
  const params = useParams()
  const carId = params.id as string
  const [car, setCar] = useState<Car | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate API call to fetch car details
    const fetchCar = () => {
      setIsLoading(true)
      setTimeout(() => {
        const foundCar = MOCK_CARS.find(c => c.id === carId)
        setCar(foundCar || null)
        setIsLoading(false)
      }, 500)
    }

    fetchCar()
  }, [carId])

  const handleShare = () => {
    if (navigator.share && car) {
      navigator.share({
        title: `${car.year} ${car.make} ${car.model}`,
        text: car.description,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      // TODO: Show toast notification
    }
  }

  const handleBookmark = () => {
    // TODO: Implement bookmark functionality
    console.log('Bookmark toggled')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header Navigation */}
        <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
          <div className="container mx-auto max-w-[1400px] px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href="/cars">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Cars
                  </Button>
                </Link>
                <div className="h-6 w-px bg-border" />
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Style Nation</h1>
                  <p className="text-sm text-muted-foreground">Car Details</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Loading State */}
        <div className="container mx-auto max-w-[1400px] px-6 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded mb-4 w-64"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="h-[400px] bg-muted rounded-2xl mb-6"></div>
                <div className="space-y-4">
                  <div className="h-6 bg-muted rounded w-48"></div>
                  <div className="h-4 bg-muted rounded"></div>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                </div>
              </div>
              <div className="lg:col-span-1">
                <div className="h-[300px] bg-muted rounded-2xl"></div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (!car) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header Navigation */}
        <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
          <div className="container mx-auto max-w-[1400px] px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href="/cars">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Cars
                  </Button>
                </Link>
                <div className="h-6 w-px bg-border" />
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Style Nation</h1>
                  <p className="text-sm text-muted-foreground">Car Not Found</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Not Found State */}
        <div className="container mx-auto max-w-[1400px] px-6 py-16">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-foreground mb-4">Car Not Found</h1>
            <p className="text-muted-foreground mb-8">The car you're looking for doesn't exist or has been removed.</p>
            <Link href="/cars">
              <Button>Browse All Cars</Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header Navigation */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto max-w-[1400px] px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/cars">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Cars
                </Button>
              </Link>
              <div className="h-6 w-px bg-border" />
              <div>
                <h1 className="text-2xl font-bold text-foreground">Style Nation</h1>
                <p className="text-sm text-muted-foreground">Car Details</p>
              </div>
            </div>
            
            <div className="hidden md:flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={handleShare} className="gap-2">
                <Share2 className="h-4 w-4" />
                Share
              </Button>
              <Button variant="ghost" size="sm" onClick={handleBookmark} className="gap-2">
                <Heart className="h-4 w-4" />
                Save
              </Button>
              <nav className="flex items-center gap-6">
                <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  About
                </Link>
                <Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Contact
                </Link>
                <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Login
                </Link>
              </nav>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto max-w-[1400px] px-6 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
          <span>/</span>
          <Link href="/cars" className="hover:text-foreground transition-colors">Cars</Link>
          <span>/</span>
          <span className="text-foreground">{car.year} {car.make} {car.model}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Images and Details */}
          <div className="lg:col-span-2 space-y-8">
            <CarDetailGallery images={car.images} carTitle={`${car.year} ${car.make} ${car.model}`} />
            <CarDetailInfo car={car} />
          </div>

          {/* Sidebar - Actions and Contact */}
          <div className="lg:col-span-1">
            <CarDetailSidebar car={car} />
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}