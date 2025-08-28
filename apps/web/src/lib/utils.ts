import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format price in USD currency
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

// Format mileage with comma separators
export function formatMileage(mileage: number | undefined): string {
  if (!mileage) return 'New Vehicle'
  return new Intl.NumberFormat('en-US').format(mileage) + ' mi'
}

// Format condition for display
export function formatCondition(condition: string): string {
  switch (condition) {
    case 'NEW':
      return 'New'
    case 'USED':
      return 'Used'
    case 'CERTIFIED_PREOWNED':
      return 'Certified Pre-Owned'
    default:
      return condition
  }
}

// Format transmission type for display
export function formatTransmission(transmission: string): string {
  switch (transmission) {
    case 'MANUAL':
      return 'Manual'
    case 'AUTOMATIC':
      return 'Automatic'
    case 'CVT':
      return 'CVT'
    case 'DUAL_CLUTCH':
      return 'Dual Clutch'
    default:
      return transmission
  }
}

// Format fuel type for display
export function formatFuelType(fuelType: string): string {
  switch (fuelType) {
    case 'GASOLINE':
      return 'Gasoline'
    case 'DIESEL':
      return 'Diesel'
    case 'ELECTRIC':
      return 'Electric'
    case 'HYBRID':
      return 'Hybrid'
    case 'PLUG_IN_HYBRID':
      return 'Plug-in Hybrid'
    default:
      return fuelType
  }
}

// Format body type for display
export function formatBodyType(bodyType: string): string {
  switch (bodyType) {
    case 'SEDAN':
      return 'Sedan'
    case 'SUV':
      return 'SUV'
    case 'TRUCK':
      return 'Truck'
    case 'COUPE':
      return 'Coupe'
    case 'CONVERTIBLE':
      return 'Convertible'
    case 'WAGON':
      return 'Wagon'
    case 'VAN':
      return 'Van'
    case 'HATCHBACK':
      return 'Hatchback'
    default:
      return bodyType
  }
}

// Format listing status for display
export function formatStatus(status: string): string {
  switch (status) {
    case 'AVAILABLE':
      return 'Available'
    case 'SOLD':
      return 'Sold'
    case 'RESERVED':
      return 'Reserved'
    case 'INACTIVE':
      return 'Inactive'
    default:
      return status
  }
}

// Get status color for badges
export function getStatusColor(status: string): string {
  switch (status) {
    case 'AVAILABLE':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    case 'SOLD':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    case 'RESERVED':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
    case 'INACTIVE':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
  }
}

// Get condition color for badges
export function getConditionColor(condition: string): string {
  switch (condition) {
    case 'NEW':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
    case 'USED':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
    case 'CERTIFIED_PREOWNED':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
  }
}

// Get fuel type color for badges
export function getFuelTypeColor(fuelType: string): string {
  switch (fuelType) {
    case 'ELECTRIC':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    case 'HYBRID':
    case 'PLUG_IN_HYBRID':
      return 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200'
    case 'DIESEL':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
    case 'GASOLINE':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
  }
}

// Check if a car is featured
export function isFeatured(featuredUntil?: Date): boolean {
  if (!featuredUntil) return false
  return new Date() < new Date(featuredUntil)
}

// Get relative time (e.g., "2 days ago")
export function getRelativeTime(date: Date | string): string {
  const now = new Date()
  const targetDate = new Date(date)
  const diffInSeconds = Math.floor((now.getTime() - targetDate.getTime()) / 1000)

  if (diffInSeconds < 60) return 'Just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
  
  return targetDate.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: now.getFullYear() !== targetDate.getFullYear() ? 'numeric' : undefined 
  })
}

// Truncate text with ellipsis
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trim() + '...'
}