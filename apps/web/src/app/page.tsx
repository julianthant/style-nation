'use client'

import { useRouter } from 'next/navigation'
import { MainHeader } from '@/components/layout/main-header'
import { Footer } from '@/components/layout/footer'
import { HeroSection } from '@/components/home/hero-section'
import { VehicleShowcase } from '@/components/home/vehicle-showcase'
import { BrowseByType } from '@/components/home/browse-by-type'
import { CTASections } from '@/components/home/cta-sections'
import { OnlineEverywhereSection } from '@/components/home/online-everywhere'

export default function Home() {
  const router = useRouter()

  // Handler functions with proper Next.js navigation
  const handleSearch = (filters: any) => {
    console.log('Search filters:', filters)
    // Navigate to cars page with search filters
    const params = new URLSearchParams()
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        params.set(key, filters[key])
      }
    })
    router.push(`/cars?${params.toString()}`)
  }

  const handleViewAllVehicles = () => {
    router.push('/cars')
  }

  const handleVehicleClick = (id: string) => {
    router.push(`/cars/${id}`)
  }

  const handleBookmark = (id: string) => {
    console.log('Bookmark vehicle:', id)
    // TODO: Implement bookmark functionality with state management
  }

  const handleViewAllTypes = () => {
    router.push('/cars')
  }

  const handleTypeClick = (type: string) => {
    router.push(`/cars?type=${type.toLowerCase()}`)
  }

  const handleBuyCarClick = () => {
    router.push('/cars')
  }

  const handleSellCarClick = () => {
    router.push('/contact')
  }

  const handleGetStarted = () => {
    router.push('/register')
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section with integrated header */}
      <div className="relative">
        <MainHeader variant="hero" />
        <HeroSection onSearch={handleSearch} />
      </div>

      {/* Vehicle Showcase Section */}
      <VehicleShowcase 
        onViewAll={handleViewAllVehicles}
        onVehicleClick={handleVehicleClick}
        onBookmark={handleBookmark}
      />

      {/* Browse by Type Section */}
      <BrowseByType 
        onViewAll={handleViewAllTypes}
        onTypeClick={handleTypeClick}
      />

      {/* Call-to-Action Sections */}
      <CTASections 
        onBuyCarClick={handleBuyCarClick}
        onSellCarClick={handleSellCarClick}
      />

      {/* Online Everywhere Section */}
      <OnlineEverywhereSection onGetStarted={handleGetStarted} />

      {/* Footer */}
      <Footer />
    </div>
  )
}
