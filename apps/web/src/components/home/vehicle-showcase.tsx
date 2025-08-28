'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowUpRight } from 'lucide-react'
import { VehicleCard } from '@/components/vehicles/vehicle-card'

interface VehicleShowcaseProps {
  onViewAll?: () => void
  onVehicleClick?: (id: string) => void
  onBookmark?: (id: string) => void
}

export function VehicleShowcase({ onViewAll, onVehicleClick, onBookmark }: VehicleShowcaseProps) {
  const [activeTab, setActiveTab] = useState('Recent Cars')

  const tabs = ['Recent Cars', 'Featured Cars', 'Popular Cars']

  // Mock data - in a real app this would come from props or API
  const vehicles = [
    {
      id: '1',
      title: 'Toyota Camry New',
      description: '3.5 D5 PowerPulse Momentum 5dr AW… Geartronic Estate',
      image: 'https://api.builder.io/api/v1/image/assets/TEMP/b3c8fd55c53ace6fc163d3baa58b19756ca515eb?width=655',
      price: '$40,000',
      mileage: '20 Miles',
      fuelType: 'Petrol',
      transmission: 'Automatic',
      year: '2023',
      badge: { text: 'Great Price', color: 'green' as const },
    },
    {
      id: '2',
      title: 'T-Cross – 2023',
      description: '4.0 D5 PowerPulse Momentum 5dr AW… Geartronic Estate',
      image: 'https://api.builder.io/api/v1/image/assets/TEMP/d9da5e061a7250283b0a94b9fadc0a56125eab27?width=655',
      price: '$15,000',
      mileage: '15 Miles',
      fuelType: 'Petrol',
      transmission: 'CVT',
      year: '2023',
    },
    {
      id: '3',
      title: 'C-Class – 2023',
      description: '4.0 D5 PowerPulse Momentum 5dr AW… Geartronic Estate',
      image: 'https://api.builder.io/api/v1/image/assets/TEMP/c91381d9d0b8d8db5e00989523eff091d8004418?width=655',
      price: '$150,000',
      mileage: '50 Miles',
      fuelType: 'Petrol',
      transmission: 'Automatic',
      year: '2023',
    },
    {
      id: '4',
      title: 'Ford Transit – 2021',
      description: '4.0 D5 PowerPulse Momentum 5dr AW… Geartronic Estate',
      image: 'https://api.builder.io/api/v1/image/assets/TEMP/584bc4fc82a8039fee4ca736af05f766c8a19cc8?width=655',
      price: '$22,000',
      mileage: '2500 Miles',
      fuelType: 'Diesel',
      transmission: 'Manual',
      year: '2021',
      badge: { text: 'Great Price', color: 'green' as const },
    },
    {
      id: '5',
      title: 'New GLC – 2023',
      description: '4.0 D5 PowerPulse Momentum 5dr AW… Geartronic Estate',
      image: 'https://api.builder.io/api/v1/image/assets/TEMP/98afdef903c7616c9c7905fe87a2472e7e023764?width=655',
      price: '$95,000',
      mileage: '50 Miles',
      fuelType: 'Petrol',
      transmission: 'Automatic',
      year: '2023',
      badge: { text: 'Low Mileage', color: 'blue' as const },
    },
    {
      id: '6',
      title: 'Audi A6 3.5 – New',
      description: '3.5 D5 PowerPulse Momentum 5dr AW… Geartronic Estate',
      image: 'https://api.builder.io/api/v1/image/assets/TEMP/1693f880832006bf630abbad3af5776f2159b2ac?width=655',
      price: '$58,000',
      mileage: '100 Miles',
      fuelType: 'Petrol',
      transmission: 'Automatic',
      year: '2023',
    },
    {
      id: '7',
      title: 'Corolla Altis – 2023',
      description: '3.5 D5 PowerPulse Momentum 5dr AW… Geartronic Estate',
      image: 'https://api.builder.io/api/v1/image/assets/TEMP/cee703c1143bcf2ed6c24596623ddf55c7834a99?width=655',
      price: '$45,000',
      mileage: '15000 Miles',
      fuelType: 'Petrol',
      transmission: 'CVT',
      year: '2023',
    },
    {
      id: '8',
      title: 'Ford Explorer 2023',
      description: '3.5 D5 PowerPulse Momentum 5dr AW… Geartronic Estate',
      image: 'https://api.builder.io/api/v1/image/assets/TEMP/65fe0280a948bd2967d1e39193b8817269dbc69c?width=655',
      price: '$35,000',
      mileage: '10 Miles',
      fuelType: 'Diesel',
      transmission: 'CVT',
      year: '2023',
      badge: { text: 'Great Price', color: 'green' as const },
    },
  ]

  return (
    <section className="py-16 bg-white">
      <div className="max-w-[1400px] mx-auto px-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-[40px] font-bold text-[#050B20] leading-[40px]">
            Explore All Vehicles
          </h2>
          <Button
            variant="ghost"
            onClick={onViewAll}
            className="text-[#050B20] hover:text-[#050B20]/80 p-0 h-auto font-medium text-[15px] group"
          >
            View All
            <ArrowUpRight className="w-[14px] h-[14px] ml-2 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Button>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-[#E9E9E9] mb-12">
          <div className="flex gap-8">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 relative ${
                  activeTab === tab
                    ? 'text-[#050B20] font-medium'
                    : 'text-[#050B20] font-normal hover:text-[#050B20]/80'
                } text-[16px] leading-[29.6px] transition-colors`}
              >
                {tab}
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#405FF2]" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Vehicle Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 justify-items-center">
          {vehicles.map((vehicle) => (
            <VehicleCard
              key={vehicle.id}
              id={vehicle.id}
              title={vehicle.title}
              description={vehicle.description}
              image={vehicle.image}
              price={vehicle.price}
              mileage={vehicle.mileage}
              fuelType={vehicle.fuelType}
              transmission={vehicle.transmission}
              year={vehicle.year}
              badge={vehicle.badge}
              onViewDetails={onVehicleClick}
              onBookmark={onBookmark}
            />
          ))}
        </div>
      </div>
    </section>
  )
}