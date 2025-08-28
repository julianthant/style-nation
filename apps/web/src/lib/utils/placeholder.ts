import { Car } from '@/lib/types/car'

export function getCarPlaceholderImage(car: Car): string {
  // Generate a placeholder image based on car make and model
  const make = car.make.toLowerCase()
  const model = car.model.toLowerCase()
  
  // Use a consistent placeholder service with car-specific styling
  const color = getCarColor(car.exteriorColor)
  return `https://via.placeholder.com/400x250/${color}/ffffff?text=${encodeURIComponent(car.make + ' ' + car.model)}`
}

function getCarColor(exteriorColor: string): string {
  const colorMap: Record<string, string> = {
    'white': 'f8f9fa',
    'black': '343a40',
    'silver': '6c757d',
    'gray': '6c757d',
    'red': 'dc3545',
    'blue': '007bff',
    'green': '28a745',
    'yellow': 'ffc107',
    'orange': 'fd7e14',
    'purple': '6f42c1',
    'brown': '795548'
  }
  
  const color = exteriorColor.toLowerCase()
  return colorMap[color] || '6c757d' // default to gray
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

export function formatMileage(mileage?: number): string {
  if (!mileage) return 'N/A'
  return `${mileage.toLocaleString()} mi`
}

export function formatCondition(condition: string): string {
  return condition
    .split('_')
    .map(word => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ')
}

export function formatTransmission(transmission: string): string {
  return transmission
    .split('_')
    .map(word => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ')
}

export function formatFuelType(fuelType: string): string {
  return fuelType
    .split('_')
    .map(word => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ')
}