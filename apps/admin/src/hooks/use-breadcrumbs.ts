"use client"

import { usePathname } from 'next/navigation'
import { useMemo } from 'react'

interface BreadcrumbItem {
  label: string
  href: string
  isCurrentPage?: boolean
}

const routeLabels: Record<string, string> = {
  dashboard: 'Dashboard',
  cars: 'Cars',
  analytics: 'Analytics', 
  inquiries: 'Inquiries',
  users: 'Users',
  settings: 'Settings',
  create: 'Create',
  edit: 'Edit',
  overview: 'Overview'
}

export function useBreadcrumbs(): BreadcrumbItem[] {
  const pathname = usePathname()

  return useMemo(() => {
    if (!pathname) return []

    const segments = pathname.split('/').filter(Boolean)
    
    // Always start with Dashboard
    const breadcrumbs: BreadcrumbItem[] = [
      {
        label: 'Dashboard',
        href: '/dashboard'
      }
    ]

    // If we're on the root dashboard, add Overview
    if (segments.length === 1 && segments[0] === 'dashboard') {
      breadcrumbs.push({
        label: 'Overview',
        href: '/dashboard',
        isCurrentPage: true
      })
      return breadcrumbs
    }

    // Build breadcrumbs for nested routes
    let currentPath = ''
    
    segments.forEach((segment, index) => {
      if (segment === 'dashboard') return // Skip dashboard as it's already added
      
      currentPath += `/${segment}`
      const isLast = index === segments.length - 1
      
      // Get label from routeLabels or capitalize the segment
      const label = routeLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1)
      
      breadcrumbs.push({
        label,
        href: `/dashboard${currentPath}`,
        isCurrentPage: isLast
      })
    })

    return breadcrumbs
  }, [pathname])
}