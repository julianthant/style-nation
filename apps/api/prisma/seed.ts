import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Hash passwords for admin users
  const adminPassword = await bcrypt.hash('admin123', 10);
  const devPassword = await bcrypt.hash('dev123', 10);

  // Create admin user
  const admin = await prisma.admin.upsert({
    where: { email: 'admin@stylenation.com' },
    update: {
      name: 'Admin User',
      role: 'ADMIN',
      password: adminPassword,
      failedLoginAttempts: 0,
      lockedUntil: null,
    },
    create: {
      email: 'admin@stylenation.com',
      name: 'Admin User',
      password: adminPassword,
      role: 'ADMIN',
      emailVerified: true,
    },
  });

  // Create second admin user for development
  const devAdmin = await prisma.admin.upsert({
    where: { email: 'dev@stylenation.com' },
    update: {
      name: 'Dev Admin',
      role: 'ADMIN',
      password: devPassword,
      failedLoginAttempts: 0,
      lockedUntil: null,
    },
    create: {
      email: 'dev@stylenation.com',
      name: 'Dev Admin',
      password: devPassword,
      role: 'ADMIN',
      emailVerified: true,
    },
  });

  // Create sample cars
  const car1 = await prisma.car.upsert({
    where: { vin: 'JM1BK32F781123456' },
    update: {},
    create: {
      make: 'Honda',
      model: 'Accord',
      year: 2023,
      price: 2850000, // $28,500.00 in cents
      mileage: 15000,
      vin: 'JM1BK32F781123456',
      condition: 'USED',
      transmissionType: 'AUTOMATIC',
      fuelType: 'GASOLINE',
      bodyType: 'SEDAN',
      exteriorColor: 'White',
      interiorColor: 'Black',
      engineSize: '2.0L',
      features: [
        'Apple CarPlay',
        'Android Auto',
        'Backup Camera',
        'Bluetooth',
        'Cruise Control',
        'Heated Seats',
      ],
      description:
        'This 2023 Honda Accord is in excellent condition with low mileage. Features a reliable 2.0L engine and comes fully loaded with modern technology and comfort features.',
      status: 'AVAILABLE',
      featuredUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      createdBy: admin.id,
      viewCount: 45,
    },
  });

  const car2 = await prisma.car.upsert({
    where: { vin: 'WBAXH5C55DD123456' },
    update: {},
    create: {
      make: 'BMW',
      model: '330i',
      year: 2022,
      price: 4290000, // $42,900.00 in cents
      mileage: 8500,
      vin: 'WBAXH5C55DD123456',
      condition: 'CERTIFIED_PREOWNED',
      transmissionType: 'AUTOMATIC',
      fuelType: 'GASOLINE',
      bodyType: 'SEDAN',
      exteriorColor: 'Black',
      interiorColor: 'Tan',
      engineSize: '2.0L Turbo',
      features: [
        'Navigation System',
        'Sunroof',
        'Leather Seats',
        'Heated Seats',
        'Premium Audio',
        'Keyless Entry',
        'LED Headlights',
      ],
      description:
        'Certified Pre-Owned BMW 330i with premium features and excellent performance. This luxury sedan combines comfort, technology, and driving dynamics.',
      status: 'AVAILABLE',
      createdBy: admin.id,
      viewCount: 78,
    },
  });

  const car3 = await prisma.car.upsert({
    where: { vin: 'JF2SJADC6MH123456' },
    update: {},
    create: {
      make: 'Subaru',
      model: 'Outback',
      year: 2024,
      price: 3520000, // $35,200.00 in cents
      mileage: 2500,
      vin: 'JF2SJADC6MH123456',
      condition: 'NEW',
      transmissionType: 'CVT',
      fuelType: 'GASOLINE',
      bodyType: 'WAGON',
      exteriorColor: 'Silver',
      interiorColor: 'Gray',
      engineSize: '2.5L',
      features: [
        'All-Wheel Drive',
        'EyeSight Safety Suite',
        'Infotainment System',
        'Roof Rails',
        'Power Liftgate',
        'Blind Spot Monitoring',
      ],
      description:
        'Brand new 2024 Subaru Outback with legendary reliability and capability. Perfect for adventures with standard all-wheel drive and advanced safety features.',
      status: 'AVAILABLE',
      featuredUntil: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
      createdBy: admin.id,
      viewCount: 23,
    },
  });

  const car4 = await prisma.car.upsert({
    where: { vin: '1FTFW1ET5DFC12345' },
    update: {},
    create: {
      make: 'Ford',
      model: 'F-150',
      year: 2023,
      price: 4850000, // $48,500.00 in cents
      mileage: 12000,
      vin: '1FTFW1ET5DFC12345',
      condition: 'USED',
      transmissionType: 'AUTOMATIC',
      fuelType: 'GASOLINE',
      bodyType: 'TRUCK',
      exteriorColor: 'Blue',
      interiorColor: 'Black',
      engineSize: '3.5L V6',
      features: [
        '4WD',
        'Tow Package',
        'Backup Camera',
        'Apple CarPlay',
        'Power Windows',
        'Air Conditioning',
      ],
      description:
        'Powerful 2023 Ford F-150 pickup truck with excellent towing capacity. Perfect for work or play with advanced features and reliable performance.',
      status: 'AVAILABLE',
      featuredUntil: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000), // 25 days from now
      createdBy: admin.id,
      viewCount: 67,
    },
  });

  const car5 = await prisma.car.upsert({
    where: { vin: '1HGCM82633A123456' },
    update: {},
    create: {
      make: 'Honda',
      model: 'Civic',
      year: 2024,
      price: 2650000, // $26,500.00 in cents
      mileage: 5000,
      vin: '1HGCM82633A123456',
      condition: 'NEW',
      transmissionType: 'CVT',
      fuelType: 'GASOLINE',
      bodyType: 'SEDAN',
      exteriorColor: 'Red',
      interiorColor: 'Black',
      engineSize: '2.0L',
      features: [
        'Honda Sensing Suite',
        'Automatic Climate Control',
        'Apple CarPlay',
        'Android Auto',
        'Keyless Start',
        'Backup Camera',
      ],
      description:
        'Brand new 2024 Honda Civic with outstanding fuel efficiency and modern technology. Perfect first car or daily commuter with Honda reliability.',
      status: 'AVAILABLE',
      createdBy: admin.id,
      viewCount: 34,
    },
  });

  const car6 = await prisma.car.upsert({
    where: { vin: 'WAUAF78E67A123456' },
    update: {},
    create: {
      make: 'Audi',
      model: 'A4',
      year: 2022,
      price: 3890000, // $38,900.00 in cents
      mileage: 18000,
      vin: 'WAUAF78E67A123456',
      condition: 'USED',
      transmissionType: 'AUTOMATIC',
      fuelType: 'GASOLINE',
      bodyType: 'SEDAN',
      exteriorColor: 'White',
      interiorColor: 'Tan',
      engineSize: '2.0L Turbo',
      features: [
        'Quattro AWD',
        'Premium Plus Package',
        'Leather Seats',
        'Sunroof',
        'Navigation',
        'Premium Audio',
        'LED Headlights',
      ],
      description:
        'Luxurious 2022 Audi A4 with Quattro all-wheel drive. Premium features and German engineering make this sedan a perfect blend of performance and comfort.',
      status: 'AVAILABLE',
      featuredUntil: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000), // 20 days from now
      createdBy: admin.id,
      viewCount: 89,
    },
  });

  const car7 = await prisma.car.upsert({
    where: { vin: '1N4AL3AP5DC123456' },
    update: {},
    create: {
      make: 'Nissan',
      model: 'Altima',
      year: 2023,
      price: 2750000, // $27,500.00 in cents
      mileage: 8500,
      vin: '1N4AL3AP5DC123456',
      condition: 'CERTIFIED_PREOWNED',
      transmissionType: 'CVT',
      fuelType: 'GASOLINE',
      bodyType: 'SEDAN',
      exteriorColor: 'Gray',
      interiorColor: 'Black',
      engineSize: '2.5L',
      features: [
        'ProPILOT Assist',
        'Intelligent Emergency Braking',
        'Blind Spot Warning',
        'Apple CarPlay',
        'Remote Start',
        'Heated Seats',
      ],
      description:
        'Certified Pre-Owned 2023 Nissan Altima with advanced safety features and excellent fuel economy. Perfect midsize sedan for families.',
      status: 'AVAILABLE',
      createdBy: admin.id,
      viewCount: 42,
    },
  });

  const car8 = await prisma.car.upsert({
    where: { vin: 'KMHD84LF5EA123456' },
    update: {},
    create: {
      make: 'Hyundai',
      model: 'Elantra',
      year: 2024,
      price: 2390000, // $23,900.00 in cents
      mileage: 1200,
      vin: 'KMHD84LF5EA123456',
      condition: 'NEW',
      transmissionType: 'CVT',
      fuelType: 'GASOLINE',
      bodyType: 'SEDAN',
      exteriorColor: 'Black',
      interiorColor: 'Gray',
      engineSize: '2.0L',
      features: [
        'Hyundai SmartSense',
        'Wireless Phone Charger',
        'Digital Cockpit',
        'Automatic Climate Control',
        'Rear Cross-Traffic Alert',
        'Lane Keeping Assist',
      ],
      description:
        'Brand new 2024 Hyundai Elantra with cutting-edge technology and impressive warranty coverage. Modern design meets exceptional value.',
      status: 'AVAILABLE',
      featuredUntil: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
      createdBy: admin.id,
      viewCount: 28,
    },
  });

  // Create sample car images
  await prisma.carImage.createMany({
    data: [
      // Honda Accord images
      {
        carId: car1.id,
        url: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&h=600&fit=crop&crop=center',
        isPrimary: true,
        order: 1,
      },
      {
        carId: car1.id,
        url: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&h=600&fit=crop&crop=center',
        isPrimary: false,
        order: 2,
      },
      // BMW 330i images
      {
        carId: car2.id,
        url: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&h=600&fit=crop&crop=center',
        isPrimary: true,
        order: 1,
      },
      {
        carId: car2.id,
        url: 'https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=800&h=600&fit=crop&crop=center',
        isPrimary: false,
        order: 2,
      },
      // Subaru Outback images
      {
        carId: car3.id,
        url: 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=800&h=600&fit=crop&crop=center',
        isPrimary: true,
        order: 1,
      },
      // Ford F-150 images
      {
        carId: car4.id,
        url: 'https://images.unsplash.com/photo-1593450123013-dbac15a2a77e?w=800&h=600&fit=crop&crop=center',
        isPrimary: true,
        order: 1,
      },
      // Honda Civic images
      {
        carId: car5.id,
        url: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&h=600&fit=crop&crop=center',
        isPrimary: true,
        order: 1,
      },
      // Audi A4 images
      {
        carId: car6.id,
        url: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&h=600&fit=crop&crop=center',
        isPrimary: true,
        order: 1,
      },
      // Nissan Altima images
      {
        carId: car7.id,
        url: 'https://images.unsplash.com/photo-1542362567-b07e54358753?w=800&h=600&fit=crop&crop=center',
        isPrimary: true,
        order: 1,
      },
      // Hyundai Elantra images
      {
        carId: car8.id,
        url: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800&h=600&fit=crop&crop=center',
        isPrimary: true,
        order: 1,
      },
    ],
  });

  // Create sample inquiries (no user accounts - just contact info)
  await prisma.inquiry.createMany({
    data: [
      {
        carId: car1.id,
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1-555-0101',
        message:
          "Hi, I'm interested in this Honda Accord. Is it still available? Can we schedule a test drive?",
        status: 'NEW',
      },
      {
        carId: car2.id,
        name: 'Jane Smith',
        email: 'jane.smith@email.com',
        phone: '+1-555-0102',
        message:
          "Hello! I'd like more information about the BMW 330i. What's included in the certified pre-owned warranty?",
        status: 'CONTACTED',
      },
      {
        carId: car1.id,
        name: 'Mike Johnson',
        email: 'mike.j@email.com',
        phone: '+1-555-0103',
        message: 'Is the Honda Accord price negotiable? Also, do you accept trade-ins?',
        status: 'NEW',
      },
    ],
  });

  console.log('Database seeded successfully!');
  console.log({
    admins: { admin, devAdmin },
    cars: { car1, car2, car3, car4, car5, car6, car7, car8 },
  });
}

main()
  .catch(e => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
