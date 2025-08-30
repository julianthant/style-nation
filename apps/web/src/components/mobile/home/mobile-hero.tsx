'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Search, Settings, ChevronRight, Car, ArrowRight } from 'lucide-react'

interface MobileHeroProps {
  onSearch?: (filters: SearchFilters) => void
}

interface SearchFilters {
  make?: string
  model?: string
  minPrice?: number
  maxPrice?: number
  condition?: string
}

export function MobileHero({ onSearch }: MobileHeroProps) {
  const [activeTab, setActiveTab] = useState<"new" | "used">("new")
  const [make, setMake] = useState("")
  const [model, setModel] = useState("")
  const [priceRange, setPriceRange] = useState([0, 250000])
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  // Background images for slideshow (mobile optimized)
  const backgroundImages = [
    'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=800&q=80', // Mobile-friendly car image
    'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&q=80', // Luxury sedan
    'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80', // Sports car
  ]

  // Auto-rotate slideshow
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % backgroundImages.length)
    }, 4000) // Faster rotation for mobile attention spans

    return () => clearInterval(interval)
  }, [backgroundImages.length])

  const handleSearch = () => {
    let searchFilters: SearchFilters = {
      make: make || undefined,
      model: model || undefined,
      minPrice: priceRange[0] || undefined,
      maxPrice: priceRange[1] || undefined,
    }
    
    // Add condition based on active tab
    if (activeTab === 'new') {
      searchFilters.condition = 'NEW'
    } else if (activeTab === 'used') {
      searchFilters.condition = 'USED'
    }
    
    setIsFilterOpen(false)
    onSearch?.(searchFilters)
  }

  const handleQuickSearch = () => {
    // Quick search with minimal filters
    onSearch?.({ condition: activeTab.toUpperCase() })
  }

  return (
    <section
      className="relative min-h-screen flex flex-col justify-between px-4 py-16 transition-all duration-1000 ease-in-out"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0.6) 0%, rgba(0, 0, 0, 0.4) 50%, rgba(0, 0, 0, 0.8) 100%), url('${backgroundImages[currentSlide]}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Top Section - Hero Content */}
      <div className="flex-1 flex flex-col justify-center text-center space-y-8">
        {/* Main Heading */}
        <div className="space-y-4">
          <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight">
            Find Your Dream Car
          </h1>
          <p className="text-white/90 text-lg font-medium">
            Tap, Swipe, Drive Away
          </p>
        </div>

        {/* Condition Toggle - Mobile Pill Style */}
        <div className="flex justify-center">
          <div className="bg-black/30 backdrop-blur-md rounded-full p-1.5 border border-white/20">
            <div className="flex">
              <button
                onClick={() => setActiveTab("new")}
                className={`px-8 py-3 rounded-full text-sm font-semibold transition-all duration-300 ${
                  activeTab === "new"
                    ? "bg-white text-black shadow-lg transform scale-105"
                    : "text-white/80 hover:text-white"
                }`}
              >
                New Cars
              </button>
              <button
                onClick={() => setActiveTab("used")}
                className={`px-8 py-3 rounded-full text-sm font-semibold transition-all duration-300 ${
                  activeTab === "used"
                    ? "bg-white text-black shadow-lg transform scale-105"
                    : "text-white/80 hover:text-white"
                }`}
              >
                Used Cars
              </button>
            </div>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="space-y-4">
          {/* Quick Search */}
          <Button 
            onClick={handleQuickSearch}
            className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full text-lg font-semibold shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            <Search className="w-5 h-5 mr-3" />
            Quick Search
            <ArrowRight className="w-5 h-5 ml-3" />
          </Button>

          {/* Advanced Search Sheet */}
          <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <SheetTrigger asChild>
              <Button 
                variant="outline"
                className="w-full h-12 bg-white/10 border-white/30 text-white hover:bg-white/20 rounded-full text-base font-medium backdrop-blur-md"
              >
                <Settings className="w-4 h-4 mr-2" />
                Advanced Search
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[80vh] rounded-t-3xl border-none">
              <SheetHeader className="space-y-4 pb-6">
                <SheetTitle className="text-xl font-bold text-center">Find Your Perfect Car</SheetTitle>
                
                {/* Condition Toggle in Sheet */}
                <div className="flex rounded-2xl border border-border overflow-hidden mx-4">
                  <button
                    onClick={() => setActiveTab("new")}
                    className={`flex-1 py-3 px-6 text-base font-medium transition-all duration-200 ${
                      activeTab === "new"
                        ? "bg-primary text-primary-foreground"
                        : "text-primary bg-background hover:bg-muted"
                    }`}
                  >
                    New
                  </button>
                  <button
                    onClick={() => setActiveTab("used")}
                    className={`flex-1 py-3 px-6 text-base font-medium transition-all duration-200 ${
                      activeTab === "used"
                        ? "bg-primary text-primary-foreground"
                        : "text-primary bg-background hover:bg-muted"
                    }`}
                  >
                    Used
                  </button>
                </div>
              </SheetHeader>

              <div className="space-y-6 px-4 pb-24 overflow-y-auto">
                {/* Make Selection */}
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    Make
                  </label>
                  <Select value={make} onValueChange={setMake}>
                    <SelectTrigger className="h-14 text-base border-2 focus:border-primary rounded-xl">
                      <SelectValue placeholder="Any Make" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="audi">Audi</SelectItem>
                      <SelectItem value="bmw">BMW</SelectItem>
                      <SelectItem value="mercedes">Mercedes</SelectItem>
                      <SelectItem value="toyota">Toyota</SelectItem>
                      <SelectItem value="honda">Honda</SelectItem>
                      <SelectItem value="ford">Ford</SelectItem>
                      <SelectItem value="chevrolet">Chevrolet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Model Selection */}
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    Model
                  </label>
                  <Select value={model} onValueChange={setModel}>
                    <SelectTrigger className="h-14 text-base border-2 focus:border-primary rounded-xl">
                      <SelectValue placeholder="Any Model" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="q7">Q7</SelectItem>
                      <SelectItem value="q5">Q5</SelectItem>
                      <SelectItem value="a4">A4</SelectItem>
                      <SelectItem value="x5">X5</SelectItem>
                      <SelectItem value="camry">Camry</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Price Range */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                      Price Range
                    </label>
                    <span className="text-sm text-primary font-medium">
                      ${priceRange[0].toLocaleString()} - ${priceRange[1].toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="space-y-6 px-2">
                    <Slider
                      value={priceRange}
                      onValueChange={setPriceRange}
                      max={250000}
                      min={0}
                      step={5000}
                      className="w-full"
                    />
                    
                    {/* Price Quick Select Buttons */}
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { label: "Under $25k", value: [0, 25000] },
                        { label: "$25k - $50k", value: [25000, 50000] },
                        { label: "$50k - $100k", value: [50000, 100000] },
                        { label: "Over $100k", value: [100000, 250000] },
                      ].map((preset) => (
                        <Button
                          key={preset.label}
                          variant="outline"
                          size="sm"
                          className="h-10 text-xs font-medium"
                          onClick={() => setPriceRange(preset.value)}
                        >
                          {preset.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Search Button - Fixed at bottom */}
                <div className="fixed bottom-8 left-4 right-4 z-10">
                  <Button 
                    onClick={handleSearch}
                    className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full text-lg font-semibold shadow-2xl"
                  >
                    <Search className="w-5 h-5 mr-3" />
                    Search Cars
                    <ArrowRight className="w-5 h-5 ml-3" />
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Bottom Section - Vehicle Types Carousel */}
      <div className="relative space-y-6">
        {/* Slideshow indicators */}
        <div className="flex justify-center space-x-2">
          {backgroundImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                currentSlide === index
                  ? 'w-8 bg-white'
                  : 'w-2 bg-white/40'
              }`}
            />
          ))}
        </div>

        {/* Swipeable Vehicle Type Cards */}
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex space-x-3 px-4 pb-2">
            {[
              { type: 'SUV', icon: '🚙', color: 'from-blue-500/20 to-blue-600/30' },
              { type: 'Sedan', icon: '🚗', color: 'from-green-500/20 to-green-600/30' },
              { type: 'Truck', icon: '🛻', color: 'from-orange-500/20 to-orange-600/30' },
              { type: 'Coupe', icon: '🏎️', color: 'from-red-500/20 to-red-600/30' },
              { type: 'Electric', icon: '⚡', color: 'from-purple-500/20 to-purple-600/30' },
              { type: 'Hybrid', icon: '🔋', color: 'from-teal-500/20 to-teal-600/30' }
            ].map(({ type, icon, color }) => (
              <div 
                key={type}
                className={`flex-shrink-0 bg-gradient-to-br ${color} backdrop-blur-sm border border-white/20 rounded-2xl px-4 py-3 flex flex-col items-center gap-2 cursor-pointer hover:scale-105 transition-all duration-200 min-w-[80px]`}
              >
                <span className="text-2xl">{icon}</span>
                <span className="text-white text-xs font-semibold whitespace-nowrap">{type}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll hint */}
        <div className="flex justify-center">
          <div className="animate-bounce">
            <Car className="w-6 h-6 text-white/60" />
          </div>
        </div>
      </div>
    </section>
  )
}