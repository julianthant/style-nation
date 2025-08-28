import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const roundsOfHashing = 10;

async function main() {
  console.log('Seeding database...');

  // Create admin user
  const hashedAdminPassword = await bcrypt.hash('admin123', roundsOfHashing);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@stylenation.com' },
    update: {
      password: hashedAdminPassword,
      role: 'ADMIN',
    },
    create: {
      email: 'admin@stylenation.com',
      password: hashedAdminPassword,
      role: 'ADMIN',
      profile: {
        create: {
          firstName: 'Admin',
          lastName: 'User',
          phone: '+1-555-0100',
        },
      },
    },
  });

  // Create regular user
  const hashedUserPassword = await bcrypt.hash('user123', roundsOfHashing);
  const user = await prisma.user.upsert({
    where: { email: 'john@example.com' },
    update: {
      password: hashedUserPassword,
    },
    create: {
      email: 'john@example.com',
      password: hashedUserPassword,
      role: 'USER',
      profile: {
        create: {
          firstName: 'John',
          lastName: 'Doe',
          phone: '+1-555-0101',
        },
      },
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
      price: 28500.00,
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
      description: 'This 2023 Honda Accord is in excellent condition with low mileage. Features a reliable 2.0L engine and comes fully loaded with modern technology and comfort features.',
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
      price: 42900.00,
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
      description: 'Certified Pre-Owned BMW 330i with premium features and excellent performance. This luxury sedan combines comfort, technology, and driving dynamics.',
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
      price: 35200.00,
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
      description: 'Brand new 2024 Subaru Outback with legendary reliability and capability. Perfect for adventures with standard all-wheel drive and advanced safety features.',
      status: 'AVAILABLE',
      featuredUntil: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
      createdBy: admin.id,
      viewCount: 23,
    },
  });

  // Create sample car images
  await prisma.carImage.createMany({
    data: [
      {
        carId: car1.id,
        url: 'https://images.example.com/honda-accord-front.jpg',
        isPrimary: true,
        order: 1,
      },
      {
        carId: car1.id,
        url: 'https://images.example.com/honda-accord-side.jpg',
        isPrimary: false,
        order: 2,
      },
      {
        carId: car1.id,
        url: 'https://images.example.com/honda-accord-interior.jpg',
        isPrimary: false,
        order: 3,
      },
      {
        carId: car2.id,
        url: 'https://images.example.com/bmw-330i-front.jpg',
        isPrimary: true,
        order: 1,
      },
      {
        carId: car2.id,
        url: 'https://images.example.com/bmw-330i-side.jpg',
        isPrimary: false,
        order: 2,
      },
      {
        carId: car3.id,
        url: 'https://images.example.com/subaru-outback-front.jpg',
        isPrimary: true,
        order: 1,
      },
    ],
  });

  // Create sample inquiries
  await prisma.inquiry.createMany({
    data: [
      {
        carId: car1.id,
        userId: user.id,
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1-555-0101',
        message: 'Hi, I\'m interested in this Honda Accord. Is it still available? Can we schedule a test drive?',
        status: 'NEW',
      },
      {
        carId: car2.id,
        name: 'Jane Smith',
        email: 'jane.smith@email.com',
        phone: '+1-555-0102',
        message: 'Hello! I\'d like more information about the BMW 330i. What\'s included in the certified pre-owned warranty?',
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
    users: { admin, user },
    cars: { car1, car2, car3 },
  });
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });