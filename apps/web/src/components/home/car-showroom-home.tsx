'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Car, Users, Shield, Star, Filter, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { CarSearch } from '@/components/cars/car-search'
import { CarGrid } from '@/components/cars/car-grid'
import { FeaturedCars } from '@/components/cars/featured-cars'
import { CarFilters, CarFiltersMobile } from '@/components/cars/car-filters'
import { mockCars, getFeaturedCars, searchCars, sortCars } from '@/lib/data/mock-cars'
import { CarFilters as ICarFilters, Car as ICar } from '@/lib/types/car'
import useAuthStore from '@/lib/auth-store'
import { UserNav } from '@/components/auth/user-nav'

export function CarShowroomHome() {
  const { user, loading, initialized } = useAuthStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [filters, setFilters] = useState<ICarFilters>({})
  
  const featuredCars = getFeaturedCars()
  
  // Filter and search cars
  const filteredCars = useMemo(() => {
    let cars = mockCars

    // Apply search
    if (searchQuery.trim()) {
      cars = searchCars(searchQuery)
    }

    // Apply filters
    if (filters.make) {
      cars = cars.filter(car => car.make.toLowerCase() === filters.make?.toLowerCase())
    }
    
    if (filters.bodyType?.length) {
      cars = cars.filter(car => filters.bodyType?.includes(car.bodyType))
    }
    
    if (filters.condition?.length) {
      cars = cars.filter(car => filters.condition?.includes(car.condition))
    }
    
    if (filters.transmission?.length) {
      cars = cars.filter(car => filters.transmission?.includes(car.transmissionType))
    }
    
    if (filters.fuelType?.length) {
      cars = cars.filter(car => filters.fuelType?.includes(car.fuelType))
    }
    
    if (filters.minPrice || filters.maxPrice) {
      cars = cars.filter(car => {
        const price = car.price
        if (filters.minPrice && price < filters.minPrice) return false
        if (filters.maxPrice && price > filters.maxPrice) return false
        return true
      })
    }
    
    if (filters.minYear || filters.maxYear) {
      cars = cars.filter(car => {
        if (filters.minYear && car.year < filters.minYear) return false
        if (filters.maxYear && car.year > filters.maxYear) return false
        return true
      })
    }

    // Only show available cars by default
    return cars.filter(car => car.status === 'AVAILABLE')
  }, [searchQuery, filters])

  const handleCarClick = (car: ICar) => {
    // In a real app, this would navigate to car detail page
    console.log('Car clicked:', car)
  }

  const handleResetFilters = () => {
    setFilters({})
    setSearchQuery('')
  }

  const stats = [
    { label: 'Premium Vehicles', value: mockCars.length.toString() },
    { label: 'Happy Customers', value: '2,500+' },
    { label: 'Years in Business', value: '15+' },
    { label: 'Available Now', value: mockCars.filter(car => car.status === 'AVAILABLE').length.toString() },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Navigation */}
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Car className="h-8 w-8 text-primary mr-2" />
              <h1 className="text-xl font-bold text-foreground">Style Nation</h1>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              {initialized && !loading && (
                <>
                  {user ? (
                    <UserNav />
                  ) : (
                    <>
                      <Button variant="ghost" asChild>
                        <Link href="/login">Sign In</Link>
                      </Button>
                      <Button asChild>
                        <Link href="/register">Get Started</Link>
                      </Button>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section with Search */}
      <section className="relative min-h-[80vh] flex items-center">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <div className="relative w-full h-full bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900">
            <div 
              className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-60"
              style={{
                backgroundImage: "url('https://images.unsplash.com/photo-1503376780353-7e6692767b70?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')"
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-black/60" />
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Text Content */}
            <div className="space-y-8">
              <div className="space-y-6">
                <div className="text-white/90 text-lg font-medium">
                  Welcome to Style Nation
                </div>
                <h1 className="text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-tight">
                  <span className="text-blue-400">{mockCars.length}</span> Vehicles
                  <br />
                  Available
                </h1>
                <p className="text-xl text-white/80 max-w-lg leading-relaxed">
                  Discover exceptional vehicles from trusted dealers. Experience outstanding service and find your dream car.
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg">
                  Browse Cars
                </Button>
                <Button variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10 px-8 py-4 text-lg">
                  Learn More
                </Button>
              </div>
            </div>

            {/* Right Column - Search Filters */}
            <div className="lg:ml-auto">
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-2xl max-w-md">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Find Your Perfect Car
                </h3>
                
                {/* Search Bar */}
                <div className="mb-4">
                  <CarSearch 
                    onSearch={setSearchQuery}
                    className="w-full"
                  />
                </div>

                {/* Quick Filter Options */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-left justify-start"
                    onClick={() => setFilters({...filters, condition: ['NEW']})}
                  >
                    New Cars
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-left justify-start"
                    onClick={() => setFilters({...filters, condition: ['USED']})}
                  >
                    Used Cars
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-left justify-start"
                    onClick={() => setFilters({...filters, bodyType: ['SUV']})}
                  >
                    SUVs
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-left justify-start"
                    onClick={() => setFilters({...filters, bodyType: ['SEDAN']})}
                  >
                    Sedans
                  </Button>
                </div>

                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  Search All Cars
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Brand Logos Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Explore Our Premium Brands</h2>
            <p className="text-gray-600">View All Brands →</p>
          </div>
          
          <div className="grid grid-cols-3 lg:grid-cols-6 gap-8 items-center justify-items-center">
            {/* Brand logos would be better with actual SVG logos, but using text for now */}
            <div className="flex flex-col items-center group cursor-pointer transition-transform hover:scale-105">
              <div className="w-20 h-20 bg-gray-50 hover:bg-gray-100 rounded-2xl flex items-center justify-center mb-3 transition-all shadow-sm hover:shadow-md">
                <span className="text-lg font-bold text-gray-700">AUDI</span>
              </div>
              <span className="text-sm font-medium text-gray-600">Audi</span>
            </div>
            
            <div className="flex flex-col items-center group cursor-pointer transition-transform hover:scale-105">
              <div className="w-20 h-20 bg-gray-50 hover:bg-gray-100 rounded-2xl flex items-center justify-center mb-3 transition-all shadow-sm hover:shadow-md">
                <span className="text-lg font-bold text-gray-700">BMW</span>
              </div>
              <span className="text-sm font-medium text-gray-600">BMW</span>
            </div>
            
            <div className="flex flex-col items-center group cursor-pointer transition-transform hover:scale-105">
              <div className="w-20 h-20 bg-gray-50 hover:bg-gray-100 rounded-2xl flex items-center justify-center mb-3 transition-all shadow-sm hover:shadow-md">
                <span className="text-lg font-bold text-gray-700">FORD</span>
              </div>
              <span className="text-sm font-medium text-gray-600">Ford</span>
            </div>
            
            <div className="flex flex-col items-center group cursor-pointer transition-transform hover:scale-105">
              <div className="w-20 h-20 bg-gray-50 hover:bg-gray-100 rounded-2xl flex items-center justify-center mb-3 transition-all shadow-sm hover:shadow-md">
                <span className="text-lg font-bold text-gray-700">MB</span>
              </div>
              <span className="text-sm font-medium text-gray-600">Mercedes-Benz</span>
            </div>
            
            <div className="flex flex-col items-center group cursor-pointer transition-transform hover:scale-105">
              <div className="w-20 h-20 bg-gray-50 hover:bg-gray-100 rounded-2xl flex items-center justify-center mb-3 transition-all shadow-sm hover:shadow-md">
                <span className="text-lg font-bold text-gray-700">PEU</span>
              </div>
              <span className="text-sm font-medium text-gray-600">Peugeot</span>
            </div>
            
            <div className="flex flex-col items-center group cursor-pointer transition-transform hover:scale-105">
              <div className="w-20 h-20 bg-gray-50 hover:bg-gray-100 rounded-2xl flex items-center justify-center mb-3 transition-all shadow-sm hover:shadow-md">
                <span className="text-lg font-bold text-gray-700">VW</span>
              </div>
              <span className="text-sm font-medium text-gray-600">Volkswagen</span>
            </div>
          </div>
        </div>
      </section>

      {/* Our Services Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Services</h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Service 1 - Premium Car Sales */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow group cursor-pointer">
              <div className="aspect-[4/3] relative">
                <div 
                  className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-300"
                  style={{
                    backgroundImage: "url('https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80')"
                  }}
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">2022 BMW x5M 40d xDrive Executive</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.
                </p>
                <div className="text-blue-600 text-sm font-medium">
                  January 29, 2022
                </div>
              </div>
            </div>

            {/* Service 2 - BMW i4 M50 */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow group cursor-pointer">
              <div className="aspect-[4/3] relative">
                <div 
                  className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-300"
                  style={{
                    backgroundImage: "url('https://images.unsplash.com/photo-1555215695-3004980ad54e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80')"
                  }}
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">BMW i4 M50 is designed to exceed your</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.
                </p>
                <div className="text-blue-600 text-sm font-medium">
                  January 29, 2022
                </div>
              </div>
            </div>

            {/* Service 3 - BMW i4 M50 Light */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow group cursor-pointer">
              <div className="aspect-[4/3] relative">
                <div 
                  className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-300"
                  style={{
                    backgroundImage: "url('https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80')"
                  }}
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">BMW i4 M50 New Steering Light in</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.
                </p>
                <div className="text-blue-600 text-sm font-medium">
                  January 29, 2022
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl lg:text-5xl font-bold text-gray-900 mb-2">636M</div>
              <div className="text-sm text-gray-600">Cars for sale</div>
            </div>
            
            <div className="text-center">
              <div className="text-4xl lg:text-5xl font-bold text-gray-900 mb-2">738M</div>
              <div className="text-sm text-gray-600">Dealer Reviews</div>
            </div>
            
            <div className="text-center">
              <div className="text-4xl lg:text-5xl font-bold text-gray-900 mb-2">100M</div>
              <div className="text-sm text-gray-600">Visitors per day</div>
            </div>
            
            <div className="text-center">
              <div className="text-4xl lg:text-5xl font-bold text-gray-900 mb-2">238M</div>
              <div className="text-sm text-gray-600">Verified dealers</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Cars Section */}
      {featuredCars.length > 0 && (
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Listings</h2>
              <p className="text-gray-600">View All →</p>
            </div>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredCars.slice(0, 4).map((car) => (
                <div key={car.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group cursor-pointer" onClick={() => handleCarClick(car)}>
                  <div className="aspect-[4/3] relative overflow-hidden">
                    <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                      <div className="text-6xl">🚗</div>
                    </div>
                    <div className="absolute top-3 left-3">
                      <div className="bg-black/70 text-white px-2 py-1 rounded text-xs font-medium">
                        {car.condition === 'NEW' ? 'New' : car.condition === 'USED' ? 'Used' : 'Certified'}
                      </div>
                    </div>
                    <div className="absolute top-3 right-3">
                      <div className="bg-black/70 text-white px-2 py-1 rounded text-xs">
                        {car.year}
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="flex text-yellow-400">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className="h-3 w-3 fill-current" />
                          ))}
                        </div>
                        <span className="text-xs text-gray-500">({car.viewCount})</span>
                      </div>
                      <div className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                        Available
                      </div>
                    </div>
                    
                    <h3 className="font-semibold text-gray-900 mb-2">
                      {car.year} {car.make} {car.model}
                    </h3>
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                      <span>{car.mileage ? `${car.mileage.toLocaleString()} mi` : 'New'}</span>
                      <span>{car.transmissionType}</span>
                      <span>{car.fuelType}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-2xl font-bold text-gray-900">
                        ${car.price.toLocaleString()}
                      </div>
                      <button className="text-blue-600 text-sm font-medium hover:underline">
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Call-to-Action Section - Sell Your Car */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Image */}
            <div className="relative">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden">
                <div 
                  className="w-full h-full bg-cover bg-center"
                  style={{
                    backgroundImage: "url('https://images.unsplash.com/photo-1494976048781-8bda65d26505?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80')"
                  }}
                />
              </div>
              {/* Play Button Overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg cursor-pointer hover:scale-110 transition-transform">
                  <div className="w-0 h-0 border-l-[12px] border-l-blue-600 border-y-[8px] border-y-transparent ml-1"></div>
                </div>
              </div>
            </div>

            {/* Right Column - Content */}
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                  Get A Fair Price For Your Car Sell To Us Today
                </h2>
                <p className="text-gray-600 text-lg">
                  We provide hassle-free car selling experience with competitive prices and quick transactions.
                </p>
              </div>

              {/* Features List */}
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">We buy your car within a week with financing</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Market evaluation and instant offer</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Free pickup and paperwork assistance</div>
                  </div>
                </div>
              </div>

              {/* CTA Button */}
              <div className="pt-4">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4">
                  Get Your Quote
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Inventory Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters Sidebar - Desktop */}
            <div className="hidden lg:block w-80 shrink-0">
              <CarFilters
                filters={filters}
                onFiltersChange={setFilters}
                onReset={handleResetFilters}
                collapsible={false}
              />
            </div>

            {/* Main Content */}
            <div className="flex-1 space-y-6">
              {/* Mobile Filter Button */}
              <div className="lg:hidden flex justify-between items-center">
                <h2 className="text-2xl font-bold">Our Inventory</h2>
                <Button
                  variant="outline"
                  onClick={() => setShowMobileFilters(true)}
                  className="flex items-center gap-2"
                >
                  <Filter className="w-4 h-4" />
                  Filters
                </Button>
              </div>

              {/* Desktop Title */}
              <div className="hidden lg:block">
                <h2 className="text-2xl font-bold mb-2">Our Inventory</h2>
                <p className="text-muted-foreground">
                  Browse our selection of premium vehicles
                </p>
              </div>

              {/* Car Grid */}
              <CarGrid
                cars={filteredCars}
                onCarClick={handleCarClick}
                showFilters={false}
                showSort={true}
                showViewToggle={true}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Customer Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What our customers say</h2>
            <p className="text-gray-600">Recent testimonials and 5-star reviews from customers</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-gray-50 rounded-2xl p-8">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-current" />
                  ))}
                </div>
              </div>
              <blockquote className="text-gray-700 mb-6">
                &quot;Getting my Tesla was a nightmare with other dealers, but Style Nation made it so easy. They had exactly what I wanted and the process was smooth from start to finish.&quot;
              </blockquote>
              <div className="flex items-center">
                <div 
                  className="w-12 h-12 bg-cover bg-center rounded-full mr-4"
                  style={{
                    backgroundImage: "url('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80')"
                  }}
                />
                <div>
                  <div className="font-semibold text-gray-900">James Wilson</div>
                  <div className="text-sm text-gray-600">Tesla Model S Owner</div>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-gray-50 rounded-2xl p-8">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-current" />
                  ))}
                </div>
              </div>
              <blockquote className="text-gray-700 mb-6">
                &quot;I was hesitant to buy a luxury car, but the team at Style Nation made me feel confident in my purchase. They explained everything clearly and gave me a fair trade-in value.&quot;
              </blockquote>
              <div className="flex items-center">
                <div 
                  className="w-12 h-12 bg-cover bg-center rounded-full mr-4"
                  style={{
                    backgroundImage: "url('https://images.unsplash.com/photo-1494790108755-2616b2e10e39?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80')"
                  }}
                />
                <div>
                  <div className="font-semibold text-gray-900">Sarah Chen</div>
                  <div className="text-sm text-gray-600">BMW M3 Owner</div>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-gray-50 rounded-2xl p-8">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-current" />
                  ))}
                </div>
              </div>
              <blockquote className="text-gray-700 mb-6">
                &quot;Outstanding service! They found me the perfect family SUV within my budget. The financing options were flexible and the whole experience was stress-free.&quot;
              </blockquote>
              <div className="flex items-center">
                <div 
                  className="w-12 h-12 bg-cover bg-center rounded-full mr-4"
                  style={{
                    backgroundImage: "url('https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80')"
                  }}
                />
                <div>
                  <div className="font-semibold text-gray-900">Michael Torres</div>
                  <div className="text-sm text-gray-600">Honda Pilot Owner</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Team</h2>
            <p className="text-gray-600">Meet our car experts →</p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8">
            {/* Team Member 1 */}
            <div className="text-center group cursor-pointer">
              <div className="aspect-[3/4] rounded-2xl overflow-hidden mb-4">
                <div 
                  className="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-300"
                  style={{
                    backgroundImage: "url('https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80')"
                  }}
                />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Jessica Moore</h3>
                <p className="text-sm text-gray-600 mb-1">Sales Manager</p>
                <p className="text-xs text-gray-500">10+ years experience</p>
              </div>
            </div>

            {/* Team Member 2 */}
            <div className="text-center group cursor-pointer">
              <div className="aspect-[3/4] rounded-2xl overflow-hidden mb-4">
                <div 
                  className="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-300"
                  style={{
                    backgroundImage: "url('https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80')"
                  }}
                />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">David Park</h3>
                <p className="text-sm text-gray-600 mb-1">Finance Specialist</p>
                <p className="text-xs text-gray-500">8+ years experience</p>
              </div>
            </div>

            {/* Team Member 3 */}
            <div className="text-center group cursor-pointer">
              <div className="aspect-[3/4] rounded-2xl overflow-hidden mb-4">
                <div 
                  className="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-300"
                  style={{
                    backgroundImage: "url('https://images.unsplash.com/photo-1558222218-b7b54eede3f3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80')"
                  }}
                />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Lisa Rodriguez</h3>
                <p className="text-sm text-gray-600 mb-1">Luxury Car Specialist</p>
                <p className="text-xs text-gray-500">12+ years experience</p>
              </div>
            </div>

            {/* Team Member 4 */}
            <div className="text-center group cursor-pointer">
              <div className="aspect-[3/4] rounded-2xl overflow-hidden mb-4">
                <div 
                  className="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-300"
                  style={{
                    backgroundImage: "url('https://images.unsplash.com/photo-1507591064344-4c6ce005b128?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80')"
                  }}
                />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Alex Johnson</h3>
                <p className="text-sm text-gray-600 mb-1">Service Advisor</p>
                <p className="text-xs text-gray-500">6+ years experience</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose Us?
            </h2>
            <p className="text-lg text-gray-600">
              Experience the difference with our commitment to excellence
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Special Financing Offers</h3>
              <p className="text-gray-600 text-sm">
                Flexible financing options with competitive rates to help you get your dream car.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Trusted Car Dealership</h3>
              <p className="text-gray-600 text-sm">
                Award-winning dealership with thousands of satisfied customers and 5-star reviews.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Transparent Pricing</h3>
              <p className="text-gray-600 text-sm">
                No hidden fees, no surprises. What you see is what you get with our upfront pricing.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Car className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Expert Car Service</h3>
              <p className="text-gray-600 text-sm">
                Professional maintenance and repair services to keep your vehicle running perfectly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Dark Footer with Search */}
      <footer className="bg-slate-900 text-white">
        {/* Main Footer Content */}
        <div className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Column - Search Info */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                    <Car className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">Search over 150,000 vehicles</h3>
                  </div>
                </div>
                
                <p className="text-gray-300 text-lg">
                  Phasellus non mauris vitae mauris molestie viverra lorem ipsum
                  dolor sit amet consectetur adipiscing elit.
                </p>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8">
                    Find A Car
                  </Button>
                  <Button variant="outline" className="border-gray-600 text-white hover:bg-gray-800 px-8">
                    Sell A Car
                  </Button>
                </div>
              </div>

              {/* Right Column - Links */}
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <h4 className="text-lg font-semibold mb-4">For Buyers</h4>
                  <div className="space-y-3 text-gray-300">
                    <Link href="/inventory" className="block hover:text-white transition-colors">
                      Browse Inventory
                    </Link>
                    <Link href="/financing" className="block hover:text-white transition-colors">
                      Financing Options
                    </Link>
                    <Link href="/trade-in" className="block hover:text-white transition-colors">
                      Trade-in Value
                    </Link>
                    <Link href="/warranty" className="block hover:text-white transition-colors">
                      Extended Warranty
                    </Link>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold mb-4">For Sellers</h4>
                  <div className="space-y-3 text-gray-300">
                    <Link href="/sell" className="block hover:text-white transition-colors">
                      Sell Your Car
                    </Link>
                    <Link href="/valuation" className="block hover:text-white transition-colors">
                      Free Valuation
                    </Link>
                    <Link href="/instant-offer" className="block hover:text-white transition-colors">
                      Instant Offer
                    </Link>
                    <Link href="/pickup" className="block hover:text-white transition-colors">
                      Free Pickup
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-2">
                <Car className="h-6 w-6 text-blue-600" />
                <span className="text-xl font-bold">Style Nation</span>
              </div>
              
              <div className="text-sm text-gray-400">
                &copy; 2024 Style Nation. All rights reserved.
              </div>
              
              <div className="flex gap-6 text-sm text-gray-400">
                <Link href="/privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
                <Link href="/terms" className="hover:text-white transition-colors">
                  Terms of Service
                </Link>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Contact
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Mobile Filters Modal */}
      <CarFiltersMobile
        filters={filters}
        onFiltersChange={setFilters}
        onReset={handleResetFilters}
        isOpen={showMobileFilters}
        onClose={() => setShowMobileFilters(false)}
      />
    </div>
  )
}