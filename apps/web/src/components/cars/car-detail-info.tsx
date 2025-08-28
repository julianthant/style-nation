'use client'

import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { 
  Calendar, 
  Gauge, 
  Fuel, 
  Settings, 
  Car, 
  Palette, 
  Hash,
  Zap,
  Eye,
  CheckCircle
} from 'lucide-react'
import { Car as CarType } from '@/lib/types/car'
import { 
  formatPrice, 
  formatMileage, 
  formatCondition, 
  formatTransmission, 
  formatFuelType 
} from '@/lib/utils/placeholder'

interface CarDetailInfoProps {
  car: CarType
}

export function CarDetailInfo({ car }: CarDetailInfoProps) {
  const getBadgeColor = (condition: string) => {
    switch (condition) {
      case 'NEW':
        return 'bg-[#3D923A] text-white hover:bg-[#3D923A]'
      case 'CERTIFIED_PREOWNED':
        return 'bg-[#405FF2] text-white hover:bg-[#405FF2]'
      default:
        return 'bg-muted text-muted-foreground'
    }
  }

  const specifications = [
    { icon: Calendar, label: 'Year', value: car.year.toString() },
    { icon: Gauge, label: 'Mileage', value: formatMileage(car.mileage) },
    { icon: Settings, label: 'Transmission', value: formatTransmission(car.transmissionType) },
    { icon: Fuel, label: 'Fuel Type', value: formatFuelType(car.fuelType) },
    { icon: Car, label: 'Body Type', value: car.bodyType.replace('_', ' ') },
    { icon: Palette, label: 'Exterior Color', value: car.exteriorColor },
    { icon: Palette, label: 'Interior Color', value: car.interiorColor },
    ...(car.engineSize ? [{ icon: Zap, label: 'Engine Size', value: car.engineSize }] : []),
    { icon: Hash, label: 'VIN', value: car.vin },
    { icon: Eye, label: 'Views', value: car.viewCount.toString() },
  ]

  return (
    <div className="space-y-8">
      {/* Title and Price Section */}
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground leading-tight">
              {car.year} {car.make} {car.model}
            </h1>
            <p className="text-xl font-bold text-foreground mt-2">
              {formatPrice(car.price)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              className={`px-4 py-1 text-sm font-medium capitalize rounded-full ${getBadgeColor(car.condition)}`}
            >
              {formatCondition(car.condition)}
            </Badge>
            {car.status === 'AVAILABLE' && (
              <Badge className="px-4 py-1 text-sm font-medium bg-green-100 text-green-800 rounded-full">
                Available
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Description</h2>
        <p className="text-muted-foreground leading-relaxed">
          {car.description}
        </p>
      </div>

      {/* Key Specifications */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-6">Key Specifications</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {specifications.map((spec, index) => (
            <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
              <spec.icon className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{spec.label}</p>
                <p className="text-sm text-muted-foreground truncate">{spec.value}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Features */}
      {car.features && car.features.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-6">Features & Equipment</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {car.features.map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                <span className="text-sm text-foreground">{feature}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Additional Information */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-6">Additional Information</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center py-2 border-b border-border">
            <span className="text-sm font-medium text-muted-foreground">Listing Date</span>
            <span className="text-sm text-foreground">
              {car.createdAt.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-border">
            <span className="text-sm font-medium text-muted-foreground">Last Updated</span>
            <span className="text-sm text-foreground">
              {car.updatedAt.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-sm font-medium text-muted-foreground">Stock ID</span>
            <span className="text-sm text-foreground font-mono">{car.id.toUpperCase()}</span>
          </div>
        </div>
      </Card>
    </div>
  )
}