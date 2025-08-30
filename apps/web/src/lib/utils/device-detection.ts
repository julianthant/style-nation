'use client'

import { useEffect, useState } from 'react'

export type DeviceType = 'mobile' | 'tablet' | 'desktop'

/**
 * Server-side device detection using user-agent
 * This is used for SSR to prevent hydration mismatches
 */
export function detectDeviceFromUserAgent(userAgent: string): DeviceType {
  const ua = userAgent.toLowerCase()
  
  // Mobile patterns
  const mobilePatterns = [
    /android/i,
    /iphone/i,
    /ipod/i,
    /blackberry/i,
    /windows phone/i,
    /mobile/i
  ]
  
  // Tablet patterns (more specific check)
  const tabletPatterns = [
    /ipad/i,
    /android(?!.*mobile)/i,
    /tablet/i,
    /kindle/i,
    /playbook/i
  ]
  
  // Check for tablet first (more specific)
  if (tabletPatterns.some(pattern => pattern.test(ua))) {
    return 'tablet'
  }
  
  // Then check for mobile
  if (mobilePatterns.some(pattern => pattern.test(ua))) {
    return 'mobile'
  }
  
  return 'desktop'
}

/**
 * Client-side device detection using viewport width and user-agent
 * This provides more accurate detection after hydration
 */
export function detectDeviceFromViewport(): DeviceType {
  if (typeof window === 'undefined') return 'desktop'
  
  const width = window.innerWidth
  const userAgent = navigator.userAgent
  
  // First check user-agent for mobile devices
  const deviceFromUA = detectDeviceFromUserAgent(userAgent)
  
  // Override with viewport-based detection for edge cases
  if (width <= 768) {
    return 'mobile'
  } else if (width <= 1024) {
    // If UA says mobile but viewport is medium, it might be a tablet
    return deviceFromUA === 'mobile' ? 'tablet' : 'tablet'
  } else {
    return 'desktop'
  }
}

/**
 * React hook for device detection with proper hydration handling
 * Returns the device type with SSR-safe hydration
 */
export function useDeviceDetection() {
  // Start with server-side detection if available
  const [device, setDevice] = useState<DeviceType>(() => {
    if (typeof window !== 'undefined') {
      return detectDeviceFromViewport()
    }
    // Default to desktop for SSR
    return 'desktop'
  })
  
  const [isHydrated, setIsHydrated] = useState(false)
  
  useEffect(() => {
    // Update device type after hydration
    setDevice(detectDeviceFromViewport())
    setIsHydrated(true)
    
    // Listen for viewport changes
    const handleResize = () => {
      setDevice(detectDeviceFromViewport())
    }
    
    window.addEventListener('resize', handleResize)
    
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])
  
  return {
    device,
    isMobile: device === 'mobile',
    isTablet: device === 'tablet',
    isDesktop: device === 'desktop',
    isHydrated
  }
}

/**
 * Utility function to get device type from request headers (for middleware/API routes)
 */
export function getDeviceFromHeaders(headers: Headers): DeviceType {
  const userAgent = headers.get('user-agent') || ''
  return detectDeviceFromUserAgent(userAgent)
}

/**
 * CSS media query breakpoints that match our device detection
 */
export const BREAKPOINTS = {
  mobile: '(max-width: 768px)',
  tablet: '(min-width: 769px) and (max-width: 1024px)',
  desktop: '(min-width: 1025px)'
} as const

/**
 * Tailwind-compatible breakpoint values
 */
export const TAILWIND_BREAKPOINTS = {
  mobile: 768,
  tablet: 1024,
  desktop: 1025
} as const

/**
 * Helper function to determine if we should show mobile-optimized content
 * This includes both mobile phones and tablets for a touch-friendly experience
 */
export function shouldUseMobileLayout(device: DeviceType): boolean {
  return device === 'mobile' || device === 'tablet'
}

/**
 * Helper function for component naming consistency
 */
export function getComponentVariant(device: DeviceType): 'mobile' | 'desktop' {
  return shouldUseMobileLayout(device) ? 'mobile' : 'desktop'
}