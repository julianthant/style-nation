'use client'

import { useDeviceDetection } from '@/lib/utils/device-detection'
import { MobileHeader } from '@/components/mobile/layout/mobile-header'
import { DesktopHeader } from '@/components/desktop/layout/desktop-header'

interface AdaptiveHeaderProps {
  variant?: 'hero' | 'default'
  className?: string
}

export function AdaptiveHeader({ variant = 'default', className = '' }: AdaptiveHeaderProps) {
  const { device, isHydrated } = useDeviceDetection()

  // Show desktop version during SSR to prevent layout shift
  // Will be replaced with correct version after hydration
  if (!isHydrated) {
    return <DesktopHeader variant={variant} className={className} />
  }

  // Use mobile layout for mobile and tablet devices
  const shouldUseMobile = device === 'mobile' || device === 'tablet'

  return shouldUseMobile ? (
    <MobileHeader variant={variant} className={className} />
  ) : (
    <DesktopHeader variant={variant} className={className} />
  )
}