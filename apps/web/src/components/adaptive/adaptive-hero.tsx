'use client'

import { useDeviceDetection } from '@/lib/utils/device-detection'
import { MobileHero } from '@/components/mobile/home/mobile-hero'
import { DesktopHero } from '@/components/desktop/home/desktop-hero'

interface SearchFilters {
  make?: string
  model?: string
  minPrice?: number
  maxPrice?: number
  condition?: string
}

interface AdaptiveHeroProps {
  onSearch?: (filters: SearchFilters) => void
}

export function AdaptiveHero({ onSearch }: AdaptiveHeroProps) {
  const { device, isHydrated } = useDeviceDetection()

  // Show desktop version during SSR to prevent layout shift
  if (!isHydrated) {
    return <DesktopHero onSearch={onSearch} />
  }

  // Use mobile layout for mobile and tablet devices
  const shouldUseMobile = device === 'mobile' || device === 'tablet'

  return shouldUseMobile ? (
    <MobileHero onSearch={onSearch} />
  ) : (
    <DesktopHero onSearch={onSearch} />
  )
}