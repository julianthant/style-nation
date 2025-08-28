import { Car, CarImage, User } from '@/lib/types/car'

// Mock user for created by relation
const mockCreator: User = {
  id: 'user-1',
  email: 'admin@stylenation.com',
  role: 'ADMIN',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
}

// Helper to create car images
const createCarImages = (carId: string, imageCount: number): CarImage[] => {
  return Array.from({ length: imageCount }, (_, index) => ({
    id: `${carId}-img-${index + 1}`,
    carId,
    url: `https://images.unsplash.com/photo-${1500000000000 + index}?w=800&h=600&fit=crop&auto=format&q=80`,
    isPrimary: index === 0,
    order: index,
    createdAt: new Date(),
  }))
}

// Mock car data with realistic vehicle information
export const mockCars: Car[] = [
  {
    id: 'car-1',
    make: 'Tesla',
    model: 'Model S',
    year: 2023,
    price: 89990,
    mileage: 2500,
    vin: 'TEL12345678901234',
    condition: 'USED',
    transmissionType: 'AUTOMATIC',
    fuelType: 'ELECTRIC',
    bodyType: 'SEDAN',
    exteriorColor: 'Midnight Silver',
    interiorColor: 'Black Premium',
    engineSize: 'Dual Motor',
    features: ['Autopilot', 'Premium Sound System', 'Heated Seats', 'Glass Roof', 'Supercharging'],
    description: 'Experience the future of driving with this pristine Tesla Model S. Features cutting-edge technology, exceptional performance, and sustainable luxury.',
    images: createCarImages('car-1', 4),
    status: 'AVAILABLE',
    featuredUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Featured for 7 days
    createdAt: new Date('2024-08-20'),
    updatedAt: new Date('2024-08-20'),
    createdBy: 'user-1',
    creator: mockCreator,
    viewCount: 127,
  },
  {
    id: 'car-2',
    make: 'BMW',
    model: 'M3 Competition',
    year: 2024,
    price: 75900,
    mileage: 450,
    vin: 'BMW12345678901234',
    condition: 'NEW',
    transmissionType: 'AUTOMATIC',
    fuelType: 'GASOLINE',
    bodyType: 'SEDAN',
    exteriorColor: 'Alpine White',
    interiorColor: 'Black Leather',
    engineSize: '3.0L Twin-Turbo I6',
    features: ['M Sport Package', 'Carbon Fiber Trim', 'Adaptive M Suspension', 'Harman Kardon Audio', 'Wireless Charging'],
    description: 'The ultimate driving machine. This BMW M3 Competition delivers track-bred performance with luxury refinement.',
    images: createCarImages('car-2', 5),
    status: 'AVAILABLE',
    featuredUntil: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    createdAt: new Date('2024-08-18'),
    updatedAt: new Date('2024-08-18'),
    createdBy: 'user-1',
    creator: mockCreator,
    viewCount: 89,
  },
  {
    id: 'car-3',
    make: 'Mercedes-Benz',
    model: 'G-Class AMG G63',
    year: 2023,
    price: 156000,
    mileage: 1200,
    vin: 'MER12345678901234',
    condition: 'USED',
    transmissionType: 'AUTOMATIC',
    fuelType: 'GASOLINE',
    bodyType: 'SUV',
    exteriorColor: 'Obsidian Black',
    interiorColor: 'Red Leather',
    engineSize: '4.0L V8 Biturbo',
    features: ['AMG Performance Package', 'Night Package', 'Burmester Sound', 'Adaptive Suspension', '360° Camera'],
    description: 'Icon meets performance. This G63 combines legendary off-road capability with AMG performance and luxury.',
    images: createCarImages('car-3', 6),
    status: 'AVAILABLE',
    featuredUntil: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    createdAt: new Date('2024-08-15'),
    updatedAt: new Date('2024-08-15'),
    createdBy: 'user-1',
    creator: mockCreator,
    viewCount: 201,
  },
  {
    id: 'car-4',
    make: 'Porsche',
    model: '911 Turbo S',
    year: 2024,
    price: 207000,
    mileage: 150,
    vin: 'POR12345678901234',
    condition: 'NEW',
    transmissionType: 'DUAL_CLUTCH',
    fuelType: 'GASOLINE',
    bodyType: 'COUPE',
    exteriorColor: 'Guards Red',
    interiorColor: 'Black/Red Leather',
    engineSize: '3.8L Twin-Turbo H6',
    features: ['Sport Chrono Package', 'Carbon Ceramic Brakes', 'Adaptive Sport Seats Plus', 'BOSE Audio', 'Sport Exhaust'],
    description: 'The pinnacle of sports car engineering. This 911 Turbo S offers breathtaking performance with everyday usability.',
    images: createCarImages('car-4', 5),
    status: 'RESERVED',
    createdAt: new Date('2024-08-12'),
    updatedAt: new Date('2024-08-25'),
    createdBy: 'user-1',
    creator: mockCreator,
    viewCount: 342,
  },
  {
    id: 'car-5',
    make: 'Toyota',
    model: 'Camry Hybrid',
    year: 2023,
    price: 32000,
    mileage: 8500,
    vin: 'TOY12345678901234',
    condition: 'USED',
    transmissionType: 'CVT',
    fuelType: 'HYBRID',
    bodyType: 'SEDAN',
    exteriorColor: 'Celestial Silver',
    interiorColor: 'Black Fabric',
    engineSize: '2.5L I4 Hybrid',
    features: ['Toyota Safety Sense 2.0', 'Wireless Phone Charging', 'JBL Audio', 'Heated Seats', 'Blind Spot Monitor'],
    description: 'Fuel efficient and reliable. This Camry Hybrid offers the perfect balance of efficiency, comfort, and value.',
    images: createCarImages('car-5', 3),
    status: 'AVAILABLE',
    createdAt: new Date('2024-08-10'),
    updatedAt: new Date('2024-08-10'),
    createdBy: 'user-1',
    creator: mockCreator,
    viewCount: 67,
  },
  {
    id: 'car-6',
    make: 'Ford',
    model: 'F-150 Lightning',
    year: 2024,
    price: 68000,
    mileage: 0,
    vin: 'FOR12345678901234',
    condition: 'NEW',
    transmissionType: 'AUTOMATIC',
    fuelType: 'ELECTRIC',
    bodyType: 'TRUCK',
    exteriorColor: 'Lightning Blue',
    interiorColor: 'Black Interior',
    engineSize: 'Dual Electric Motors',
    features: ['Pro Power Onboard', '360° Camera System', 'Sync 4A', 'Intelligent Range', 'Over-the-Air Updates'],
    description: 'The future of trucks is here. This F-150 Lightning delivers truck capability with zero emissions.',
    images: createCarImages('car-6', 4),
    status: 'AVAILABLE',
    createdAt: new Date('2024-08-08'),
    updatedAt: new Date('2024-08-08'),
    createdBy: 'user-1',
    creator: mockCreator,
    viewCount: 156,
  },
  {
    id: 'car-7',
    make: 'Audi',
    model: 'RS6 Avant',
    year: 2023,
    price: 118000,
    mileage: 3200,
    vin: 'AUD12345678901234',
    condition: 'USED',
    transmissionType: 'AUTOMATIC',
    fuelType: 'GASOLINE',
    bodyType: 'WAGON',
    exteriorColor: 'Nardo Gray',
    interiorColor: 'Black Valcona Leather',
    engineSize: '4.0L Twin-Turbo V8',
    features: ['Quattro AWD', 'Air Suspension', 'Virtual Cockpit Plus', 'Bang & Olufsen Audio', 'Dynamic Package Plus'],
    description: 'Performance meets practicality. This RS6 Avant offers supercar performance with wagon versatility.',
    images: createCarImages('car-7', 5),
    status: 'AVAILABLE',
    createdAt: new Date('2024-08-05'),
    updatedAt: new Date('2024-08-05'),
    createdBy: 'user-1',
    creator: mockCreator,
    viewCount: 93,
  },
  {
    id: 'car-8',
    make: 'Lexus',
    model: 'RX 450h',
    year: 2024,
    price: 62000,
    mileage: 850,
    vin: 'LEX12345678901234',
    condition: 'NEW',
    transmissionType: 'CVT',
    fuelType: 'HYBRID',
    bodyType: 'SUV',
    exteriorColor: 'Atomic Silver',
    interiorColor: 'Rioja Red Leather',
    engineSize: '3.5L V6 Hybrid',
    features: ['Lexus Safety System+ 2.5', 'Mark Levinson Audio', 'Panoramic Roof', 'Heated & Cooled Seats', 'Head-Up Display'],
    description: 'Luxury redefined. This RX 450h combines Lexus craftsmanship with hybrid efficiency and advanced technology.',
    images: createCarImages('car-8', 4),
    status: 'AVAILABLE',
    createdAt: new Date('2024-08-03'),
    updatedAt: new Date('2024-08-03'),
    createdBy: 'user-1',
    creator: mockCreator,
    viewCount: 78,
  },
  {
    id: 'car-9',
    make: 'Chevrolet',
    model: 'Corvette Z06',
    year: 2024,
    price: 115000,
    mileage: 0,
    vin: 'CHE12345678901234',
    condition: 'NEW',
    transmissionType: 'AUTOMATIC',
    fuelType: 'GASOLINE',
    bodyType: 'COUPE',
    exteriorColor: 'Torch Red',
    interiorColor: 'Jet Black Leather',
    engineSize: '5.5L Flat-Plane V8',
    features: ['Z07 Performance Package', 'Magnetic Ride Control', 'Performance Data Recorder', 'Carbon Flash Badging', 'Competition Seats'],
    description: 'Pure American performance. This Z06 delivers track-ready capability with street-legal comfort.',
    images: createCarImages('car-9', 6),
    status: 'AVAILABLE',
    featuredUntil: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    createdAt: new Date('2024-08-01'),
    updatedAt: new Date('2024-08-01'),
    createdBy: 'user-1',
    creator: mockCreator,
    viewCount: 298,
  },
  {
    id: 'car-10',
    make: 'Honda',
    model: 'Pilot',
    year: 2023,
    price: 48000,
    mileage: 12000,
    vin: 'HON12345678901234',
    condition: 'USED',
    transmissionType: 'AUTOMATIC',
    fuelType: 'GASOLINE',
    bodyType: 'SUV',
    exteriorColor: 'Crystal Black Pearl',
    interiorColor: 'Gray Leather',
    engineSize: '3.5L V6',
    features: ['Honda Sensing', '8-Passenger Seating', 'Wireless CarPlay', 'Tri-Zone Climate', 'Remote Start'],
    description: 'Family adventure ready. This Pilot offers three-row seating, reliability, and Honda quality.',
    images: createCarImages('car-10', 3),
    status: 'AVAILABLE',
    createdAt: new Date('2024-07-28'),
    updatedAt: new Date('2024-07-28'),
    createdBy: 'user-1',
    creator: mockCreator,
    viewCount: 54,
  },
  {
    id: 'car-11',
    make: 'Volkswagen',
    model: 'Golf R',
    year: 2024,
    price: 45000,
    mileage: 0,
    vin: 'VOL12345678901234',
    condition: 'NEW',
    transmissionType: 'DUAL_CLUTCH',
    fuelType: 'GASOLINE',
    bodyType: 'HATCHBACK',
    exteriorColor: 'Lapiz Blue',
    interiorColor: 'Black Leather',
    engineSize: '2.0L Turbo I4',
    features: ['4Motion AWD', 'DCC Adaptive Suspension', 'Digital Cockpit Pro', 'Harman Kardon Audio', 'R Performance Package'],
    description: 'Hot hatch perfection. This Golf R combines everyday practicality with serious performance credentials.',
    images: createCarImages('car-11', 4),
    status: 'AVAILABLE',
    createdAt: new Date('2024-07-25'),
    updatedAt: new Date('2024-07-25'),
    createdBy: 'user-1',
    creator: mockCreator,
    viewCount: 112,
  },
  {
    id: 'car-12',
    make: 'Jeep',
    model: 'Wrangler Unlimited',
    year: 2023,
    price: 52000,
    mileage: 5600,
    vin: 'JEE12345678901234',
    condition: 'CERTIFIED_PREOWNED',
    transmissionType: 'AUTOMATIC',
    fuelType: 'GASOLINE',
    bodyType: 'SUV',
    exteriorColor: 'Firecracker Red',
    interiorColor: 'Black Interior',
    engineSize: '3.6L V6',
    features: ['Rubicon Package', 'Sky One-Touch Roof', 'Alpine Audio', 'Off-Road+ Mode', 'Rock Rails'],
    description: 'Adventure awaits. This Wrangler Unlimited is ready for any terrain with legendary Jeep capability.',
    images: createCarImages('car-12', 5),
    status: 'AVAILABLE',
    createdAt: new Date('2024-07-22'),
    updatedAt: new Date('2024-07-22'),
    createdBy: 'user-1',
    creator: mockCreator,
    viewCount: 87,
  }
]

// Helper functions for filtering and sorting
export const getFeaturedCars = (): Car[] => {
  const now = new Date()
  return mockCars.filter(car => 
    car.status === 'AVAILABLE' && 
    car.featuredUntil && 
    car.featuredUntil > now
  )
}

export const getAvailableCars = (): Car[] => {
  return mockCars.filter(car => car.status === 'AVAILABLE')
}

export const getCarsByCondition = (condition: string): Car[] => {
  return mockCars.filter(car => 
    car.condition === condition && car.status === 'AVAILABLE'
  )
}

export const getCarsByBodyType = (bodyType: string): Car[] => {
  return mockCars.filter(car => 
    car.bodyType === bodyType && car.status === 'AVAILABLE'
  )
}

export const searchCars = (query: string): Car[] => {
  const searchTerm = query.toLowerCase()
  return mockCars.filter(car => 
    car.status === 'AVAILABLE' && (
      car.make.toLowerCase().includes(searchTerm) ||
      car.model.toLowerCase().includes(searchTerm) ||
      car.description.toLowerCase().includes(searchTerm) ||
      car.features.some(feature => feature.toLowerCase().includes(searchTerm))
    )
  )
}

export const sortCars = (cars: Car[], sortBy: string): Car[] => {
  switch (sortBy) {
    case 'price_asc':
      return [...cars].sort((a, b) => a.price - b.price)
    case 'price_desc':
      return [...cars].sort((a, b) => b.price - a.price)
    case 'year_desc':
      return [...cars].sort((a, b) => b.year - a.year)
    case 'year_asc':
      return [...cars].sort((a, b) => a.year - b.year)
    case 'mileage_asc':
      return [...cars].sort((a, b) => (a.mileage || 0) - (b.mileage || 0))
    case 'mileage_desc':
      return [...cars].sort((a, b) => (b.mileage || 0) - (a.mileage || 0))
    case 'newest':
      return [...cars].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    case 'oldest':
      return [...cars].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    default:
      return cars
  }
}