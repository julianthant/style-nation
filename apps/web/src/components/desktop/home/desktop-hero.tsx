'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Search } from 'lucide-react'

interface DesktopHeroProps {
  onSearch?: (filters: SearchFilters) => void
}

interface SearchFilters {
  make?: string
  model?: string
  minPrice?: number
  maxPrice?: number
  condition?: string
}

export function DesktopHero({ onSearch }: DesktopHeroProps) {
  const [activeTab, setActiveTab] = useState<"new" | "used">("new")
  const [make, setMake] = useState("audi")
  const [model, setModel] = useState("q7")
  const [priceRange, setPriceRange] = useState([0, 250000])
  const [currentSlide, setCurrentSlide] = useState(0)

  // Background images for slideshow
  const backgroundImages = [
    'https://api.builder.io/api/v1/image/assets/TEMP/7c73df32d0cb2a7164a1d4977a2fa4fe1ea45363?width=3720',
    'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=3720&q=80', // Modern sports car
    'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=3720&q=80', // Luxury sedan
  ]

  // Auto-rotate slideshow
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % backgroundImages.length)
    }, 5000) // Change slide every 5 seconds

    return () => clearInterval(interval)
  }, [backgroundImages.length])

  const handleSearch = () => {
    let searchFilters: SearchFilters = {
      make,
      model,
      minPrice: priceRange[0] || undefined,
      maxPrice: priceRange[1] || undefined,
    }
    
    // Add condition based on active tab
    if (activeTab === 'new') {
      searchFilters.condition = 'NEW'
    } else if (activeTab === 'used') {
      searchFilters.condition = 'USED'
    }
    
    onSearch?.(searchFilters)
  }

  return (
    <section
      className="relative h-[650px] sm:h-[700px] lg:h-[750px] flex items-center justify-start px-4 sm:px-6 lg:px-8 transition-all duration-1000 ease-in-out"
      style={{
        backgroundImage: `linear-gradient(rgba(5, 11, 32, 0.8), rgba(5, 11, 32, 0.8)), url('${backgroundImages[currentSlide]}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Slideshow Indicator Bars */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
        {backgroundImages.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`h-1 rounded-full transition-all duration-300 ${
              currentSlide === index
                ? 'w-12 bg-white'
                : 'w-8 bg-white/50 hover:bg-white/70'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
      <div className="w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-start lg:items-center gap-8 lg:gap-16">
        {/* Left side - Title and Form */}
        <div className="flex-1 max-w-lg">
          {/* Title */}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-medium text-white leading-tight mb-6 lg:mb-8">
            Let's Find Your Perfect Car
          </h1>

          {/* Search Form */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-2xl max-w-md">
            <div className="space-y-5">
              {/* New/Used Toggle */}
              <div className="flex rounded-2xl border border-primary overflow-hidden">
                <button
                  onClick={() => setActiveTab("new")}
                  className={`flex-1 py-3 px-6 text-base font-medium transition-all duration-200 ${
                    activeTab === "new"
                      ? "bg-primary text-primary-foreground"
                      : "text-primary bg-white hover:bg-gray-50"
                  }`}
                >
                  New
                </button>
                <button
                  onClick={() => setActiveTab("used")}
                  className={`flex-1 py-3 px-6 text-base font-medium transition-all duration-200 ${
                    activeTab === "used"
                      ? "bg-primary text-primary-foreground"
                      : "text-primary bg-white hover:bg-gray-50"
                  }`}
                >
                  Used
                </button>
              </div>

              {/* Make Selection */}
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
                  Select Makes
                </label>
                <Select value={make} onValueChange={setMake}>
                  <SelectTrigger className="h-14 text-base border-border focus:border-primary">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="audi">Audi</SelectItem>
                    <SelectItem value="bmw">BMW</SelectItem>
                    <SelectItem value="mercedes">Mercedes</SelectItem>
                    <SelectItem value="toyota">Toyota</SelectItem>
                    <SelectItem value="honda">Honda</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Model Selection */}
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
                  Select Models
                </label>
                <Select value={model} onValueChange={setModel}>
                  <SelectTrigger className="h-14 text-base border-border focus:border-primary">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="q7">Q7</SelectItem>
                    <SelectItem value="q5">Q5</SelectItem>
                    <SelectItem value="a4">A4</SelectItem>
                    <SelectItem value="a6">A6</SelectItem>
                    <SelectItem value="a8">A8</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Price Range */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-foreground">Select Price</h3>
                
                <div className="space-y-4">
                  <Slider
                    value={priceRange}
                    onValueChange={setPriceRange}
                    max={250000}
                    min={0}
                    step={1000}
                    className="w-full"
                  />
                  
                  {/* Price Labels */}
                  <div className="flex justify-between">
                    <span className="inline-flex items-center px-3 py-1 rounded-lg bg-primary/10 text-primary text-sm font-medium">
                      ${priceRange[0].toLocaleString()}
                    </span>
                    <span className="inline-flex items-center px-3 py-1 rounded-lg bg-primary/10 text-primary text-sm font-medium">
                      ${priceRange[1].toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Search Button */}
              <Button 
                className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground text-base font-medium rounded-2xl"
                onClick={handleSearch}
              >
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
            </div>
          </div>
        </div>

        {/* Right side space for car silhouette in background */}
        <div className="flex-1 hidden lg:block" />
      </div>
    </section>
  )
}