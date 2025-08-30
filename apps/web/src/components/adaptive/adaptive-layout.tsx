'use client'

import { ReactNode } from 'react'
import { useDeviceDetection } from '@/lib/utils/device-detection'
import { AdaptiveHeader } from './adaptive-header'

interface AdaptiveLayoutProps {
  children: ReactNode
  variant?: 'hero' | 'default'
  showHeader?: boolean
}

export function AdaptiveLayout({ 
  children, 
  variant = 'default', 
  showHeader = true 
}: AdaptiveLayoutProps) {
  const { device, isHydrated } = useDeviceDetection()

  // Use mobile layout for mobile and tablet devices
  const shouldUseMobile = isHydrated && (device === 'mobile' || device === 'tablet')

  return (
    <div className={`min-h-screen flex flex-col ${
      shouldUseMobile ? 'mobile-layout' : 'desktop-layout'
    }`}>
      {showHeader && (
        <AdaptiveHeader variant={variant} />
      )}
      
      <main className={`flex-1 ${
        shouldUseMobile ? 'pb-20' : ''  // Account for mobile bottom navigation
      }`}>
        {children}
      </main>

      {/* Add any footer components here in the future */}
    </div>
  )
}