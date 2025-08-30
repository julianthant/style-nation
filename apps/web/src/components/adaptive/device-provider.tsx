'use client'

import { createContext, useContext, ReactNode } from 'react'
import { useDeviceDetection, DeviceType } from '@/lib/utils/device-detection'

interface DeviceContextType {
  device: DeviceType
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  isHydrated: boolean
  shouldUseMobileLayout: boolean
}

const DeviceContext = createContext<DeviceContextType | undefined>(undefined)

export function useDevice() {
  const context = useContext(DeviceContext)
  if (context === undefined) {
    throw new Error('useDevice must be used within a DeviceProvider')
  }
  return context
}

interface DeviceProviderProps {
  children: ReactNode
}

export function DeviceProvider({ children }: DeviceProviderProps) {
  const { device, isMobile, isTablet, isDesktop, isHydrated } = useDeviceDetection()
  
  const shouldUseMobileLayout = isMobile || isTablet

  const value: DeviceContextType = {
    device,
    isMobile,
    isTablet,
    isDesktop,
    isHydrated,
    shouldUseMobileLayout
  }

  return (
    <DeviceContext.Provider value={value}>
      {children}
    </DeviceContext.Provider>
  )
}