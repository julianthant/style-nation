'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FilterSidebar } from '@/components/cars/filter-sidebar'
import { CarListing } from '@/components/cars/car-listing'
import { Footer } from '@/components/layout/footer'
import { CarFilters, SortOption } from '@/lib/types/car'

export default function CarsPage() {
  const [filters, setFilters] = useState<CarFilters>({})
  const [sortBy, setSortBy] = useState<SortOption>('price_asc')

  const handleFiltersChange = useCallback((newFilters: CarFilters) => {
    setFilters(newFilters)
  }, [])

  const handleSortChange = useCallback((newSort: SortOption) => {
    setSortBy(newSort)
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* Header Navigation */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto max-w-[1400px] px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Home
                </Button>
              </Link>
              <div className="h-6 w-px bg-border" />
              <div>
                <h1 className="text-2xl font-bold text-foreground">Style Nation</h1>
                <p className="text-sm text-muted-foreground">Find Your Perfect Car</p>
              </div>
            </div>
            <nav className="hidden md:flex items-center gap-6">
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
      </header>

      {/* Main Content */}
      <div className="container mx-auto max-w-[1400px] px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <FilterSidebar onFiltersChange={handleFiltersChange} />
          <CarListing 
            filters={filters}
            sortBy={sortBy}
            onSortChange={handleSortChange}
          />
        </div>
      </div>

      <Footer />
    </div>
  )
}