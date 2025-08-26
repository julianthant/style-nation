import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@cardealership.com' },
    update: {},
    create: {
      email: 'admin@cardealership.com',
      role: 'ADMIN',
      profile: {
        create: {
          firstName: 'Admin',
          lastName: 'User',
          phone: '+1234567890',
        },
      },
    },
    include: {
      profile: true,
    },
  });

  console.log('✅ Created admin user:', adminUser.email);

  // Create sample cars
  const sampleCars = [
    {
      make: 'Toyota',
      model: 'Camry',
      year: 2023,
      price: 28500,
      mileage: 12000,
      vin: '1HGCM82633A123456',
      condition: 'USED',
      transmissionType: 'AUTOMATIC',
      fuelType: 'GASOLINE',
      bodyType: 'SEDAN',
      exteriorColor: 'Silver',
      interiorColor: 'Black',
      engineSize: '2.5L I4',
      features: ['Backup Camera', 'Bluetooth', 'Keyless Entry', 'Cruise Control'],
      description: 'Well-maintained Toyota Camry with excellent fuel economy and reliability. Perfect for daily commuting.',
      createdBy: adminUser.id,
    },
    {
      make: 'Honda',
      model: 'CR-V',
      year: 2022,
      price: 32000,
      mileage: 18000,
      vin: '2HKRM4H57NH123457',
      condition: 'USED',
      transmissionType: 'CVT',
      fuelType: 'GASOLINE',
      bodyType: 'SUV',
      exteriorColor: 'White',
      interiorColor: 'Gray',
      engineSize: '1.5L Turbo',
      features: ['All-Wheel Drive', 'Apple CarPlay', 'Lane Departure Warning', 'Adaptive Cruise Control'],
      description: 'Spacious and reliable Honda CR-V with advanced safety features and all-wheel drive capability.',
      createdBy: adminUser.id,
    },
    {
      make: 'Tesla',
      model: 'Model 3',
      year: 2024,
      price: 42000,
      mileage: 5000,
      vin: '5YJ3E1EA1LF123458',
      condition: 'USED',
      transmissionType: 'AUTOMATIC',
      fuelType: 'ELECTRIC',
      bodyType: 'SEDAN',
      exteriorColor: 'Blue',
      interiorColor: 'White',
      engineSize: 'Electric Motor',
      features: ['Autopilot', 'Over-the-Air Updates', 'Supercharging', 'Premium Audio'],
      description: 'Nearly new Tesla Model 3 with Autopilot and access to Supercharger network. Excellent range and performance.',
      createdBy: adminUser.id,
      status: 'AVAILABLE',
      featuredUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    },
  ];

  for (const carData of sampleCars) {
    const car = await prisma.car.create({
      data: {
        ...carData,
        images: {
          create: [
            {
              url: `https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&h=600&fit=crop`,
              isPrimary: true,
              order: 1,
            },
            {
              url: `https://images.unsplash.com/photo-1550355291-bbee04a92027?w=800&h=600&fit=crop`,
              isPrimary: false,
              order: 2,
            },
          ],
        },
      },
      include: {
        images: true,
      },
    });

    console.log(`✅ Created car: ${car.year} ${car.make} ${car.model}`);
  }

  // Create system settings
  const defaultSettings = [
    { key: 'site_name', value: 'Car Showroom', category: 'general' },
    { key: 'site_description', value: 'Find your perfect car at our showroom', category: 'general' },
    { key: 'contact_email', value: 'info@cardealership.com', category: 'contact' },
    { key: 'contact_phone', value: '+1234567890', category: 'contact' },
    { key: 'address', value: '123 Main St, City, State 12345', category: 'contact' },
    { key: 'facebook_auto_post', value: 'true', category: 'social' },
    { key: 'max_images_per_car', value: '10', category: 'uploads' },
    { key: 'max_image_size_mb', value: '10', category: 'uploads' },
  ];

  for (const setting of defaultSettings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    });
  }

  console.log('✅ Created system settings');

  console.log('🌱 Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Database seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });