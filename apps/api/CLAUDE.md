# CLAUDE.md - Style Nation API Architecture

## Overview

The Style Nation API is a production-ready NestJS backend that serves both public car browsing endpoints and admin-only management functionality. It implements a comprehensive car dealership system with authentication, car management, customer inquiries, and file storage capabilities.

## Architecture Philosophy

### Three-Tier Architecture
- **Controllers**: HTTP request handling and validation
- **Services**: Business logic and data processing  
- **Database**: Prisma ORM with PostgreSQL

### Mixed Authentication Strategy
- **Public Endpoints**: Open access for car browsing and inquiries
- **Admin Endpoints**: JWT-protected for administrative operations
- **No User Registration**: Admin-only system, no public user accounts

### Core Design Patterns
- **Entity Constructor Pattern**: Proper nested relation handling
- **Global Exception Handling**: Unified error responses
- **Decorator-Based Security**: Fine-grained access control
- **DTO Validation**: Comprehensive input sanitization
- **Modular Architecture**: Feature-based organization

## Project Structure

```
apps/api/
├── src/
│   ├── controllers/                    # HTTP Request Handlers
│   │   ├── app.controller.ts           # Health checks & system info
│   │   ├── auth.controller.ts          # Admin authentication
│   │   ├── admin.controller.ts         # Admin management
│   │   ├── cars.controller.ts          # Car CRUD operations
│   │   ├── inquiries.controller.ts     # Customer inquiries
│   │   └── upload.controller.ts        # File upload handling
│   │
│   ├── services/                       # Business Logic Layer
│   │   ├── app.service.ts              # Application services
│   │   ├── auth.service.ts             # JWT & authentication
│   │   ├── admin.service.ts            # Admin management
│   │   ├── cars.service.ts             # Car business logic
│   │   └── inquiries.service.ts        # Inquiry management
│   │
│   ├── entities/                       # Data Models with Serialization
│   │   ├── admin.entity.ts             # Admin user model
│   │   ├── auth.entity.ts              # Authentication response
│   │   ├── car.entity.ts               # Car listing model
│   │   ├── car-image.entity.ts         # Car image model
│   │   └── inquiry.entity.ts           # Customer inquiry model
│   │
│   ├── dto/                           # Data Transfer Objects
│   │   ├── auth/                      # Authentication DTOs
│   │   │   ├── login.dto.ts
│   │   │   └── refresh-token.dto.ts
│   │   ├── cars/                      # Car management DTOs
│   │   │   ├── create-car.dto.ts
│   │   │   ├── update-car.dto.ts
│   │   │   └── search-cars.dto.ts
│   │   └── upload/                    # File & inquiry DTOs
│   │       ├── upload-image.dto.ts
│   │       ├── create-inquiry.dto.ts
│   │       ├── update-inquiry.dto.ts
│   │       └── search-inquiries.dto.ts
│   │
│   ├── guards/                        # Authentication & Authorization
│   │   ├── jwt-auth.guard.ts          # JWT token validation
│   │   ├── local-auth.guard.ts        # Login credential validation
│   │   └── roles.guard.ts             # Role-based access control
│   │
│   ├── decorators/                    # Custom Decorators
│   │   ├── public.decorator.ts        # Skip authentication
│   │   ├── roles.decorator.ts         # Role requirements
│   │   └── current-admin.decorator.ts # Extract current admin
│   │
│   ├── strategies/                    # Passport Authentication
│   │   ├── jwt.strategy.ts            # JWT token strategy
│   │   └── local.strategy.ts          # Username/password strategy
│   │
│   ├── prisma/                        # Database Layer
│   │   ├── prisma.service.ts          # Database connection
│   │   ├── prisma.module.ts           # Global database module
│   │   └── prisma-client-exception.filter.ts # DB error handling
│   │
│   ├── storage/                       # File Storage Service
│   │   ├── storage.service.ts         # Supabase storage integration
│   │   └── storage.module.ts          # Storage module config
│   │
│   ├── modules/                       # Feature Modules
│   │   └── inquiries.module.ts        # Inquiry feature module
│   │
│   ├── app.module.ts                  # Root application module
│   └── main.ts                        # Application bootstrap
│
├── prisma/                            # Database Schema & Migrations
│   ├── schema.prisma                  # Complete data model
│   └── seed.ts                        # Demo data seeder
│
├── test/                             # Testing Infrastructure
│   ├── e2e/                          # End-to-end tests
│   ├── unit/                         # Unit tests
│   ├── utils/                        # Test utilities
│   │   ├── test.helper.ts             # Common test functions
│   │   └── test-data.factory.ts       # Mock data generation
│   └── setup.ts                      # Test environment setup
│
├── docs/                             # API Documentation
│   ├── architecture.md               # System architecture
│   └── security.md                   # Security guidelines
│
├── .env                              # Environment configuration
├── .env.example                      # Environment template
├── package.json                      # Dependencies & scripts
├── tsconfig.json                     # TypeScript configuration
├── jest.config.js                    # Jest test configuration
├── CLAUDE.md                         # This documentation file
└── PROMPT.md                         # Development prompts
```

## Core Implementation Patterns

### 1. Entity Constructor Pattern

All entity classes follow this pattern for handling nested relations:

```typescript
export class CarEntity implements Car {
  constructor({ images, creator, ...data }: Partial<CarEntity>) {
    Object.assign(this, data);
    
    // Handle array relations
    if (images) {
      this.images = images.map(img => new CarImageEntity(img));
    }
    
    // Handle single relations
    if (creator) {
      this.creator = new AdminEntity(creator);
    }
  }

  @Exclude()
  sensitiveField: string; // Excluded from API responses
  
  @ApiProperty({ type: [CarImageEntity] })
  images?: CarImageEntity[];

  @ApiProperty({ type: AdminEntity })
  creator?: AdminEntity;
}
```

### 2. Service Layer Patterns

Services implement business logic with proper error handling:

```typescript
@Injectable()
export class CarsService {
  constructor(private prisma: PrismaService) {}

  async findOne(id: string): Promise<CarEntity> {
    const car = await this.prisma.car.findUnique({
      where: { id },
      include: {
        images: { orderBy: { order: 'asc' } },
        creator: true,
      },
    });

    if (!car) {
      throw new NotFoundException(`Car with ID ${id} not found`);
    }

    return new CarEntity(car);
  }
}
```

### 3. DTO Validation Pattern

All DTOs use class-validator decorators:

```typescript
export class CreateCarDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Toyota' })
  make: string;

  @IsNumber()
  @Min(1900)
  @Max(new Date().getFullYear() + 1)
  @ApiProperty({ example: 2023 })
  year: number;

  @IsDecimal({ decimal_digits: '0,2' })
  @ApiProperty({ example: 28500.00 })
  price: number;
}
```

### 4. Controller Security Pattern

Controllers use decorators for authentication and authorization:

```typescript
@Controller('admin/cars')
@UseGuards(JwtAuthGuard) // Global admin authentication
@ApiBearerAuth('JWT-auth') // Swagger auth documentation
export class CarsController {
  
  @Get()
  @Public() // Override global auth for public endpoint
  async findAll(@Query() searchDto: SearchCarsDto) {
    return this.carsService.findAll(searchDto);
  }
  
  @Post()
  @Roles(Role.ADMIN) // Admin-only endpoint
  async create(@Body() createDto: CreateCarDto) {
    return this.carsService.create(createDto);
  }
}
```

## Database Architecture

### Schema Overview

```prisma
// Admin users - no public user accounts
model Admin {
  id                  String @id @default(uuid())
  name                String?
  email               String @unique
  password            String
  role                Role   @default(ADMIN)
  failedLoginAttempts Int    @default(0)
  refreshToken        String?
  createdCars         Car[]  @relation("CreatedBy")
}

// Car listings with comprehensive details
model Car {
  id               String        @id @default(uuid())
  make             String
  model            String
  year             Int
  price            Decimal       @db.Decimal(10, 2)
  vin              String        @unique
  condition        Condition
  transmissionType Transmission
  fuelType         FuelType
  bodyType         BodyType
  features         String[]
  description      String        @db.Text
  status           ListingStatus @default(AVAILABLE)
  featured         Boolean       @default(false)
  featuredUntil    DateTime?
  viewCount        Int           @default(0)
  images           CarImage[]
  inquiries        Inquiry[]
  creator          Admin         @relation("CreatedBy")

  // Performance indexes
  @@index([status])
  @@index([featured])
  @@index([price])
  @@index([make, model])
}

// Car images with ordering
model CarImage {
  id        String  @id @default(uuid())
  carId     String
  url       String
  isPrimary Boolean @default(false)
  order     Int
  car       Car     @relation(fields: [carId], references: [id], onDelete: Cascade)
}

// Customer inquiries (public submissions)
model Inquiry {
  id        String        @id @default(uuid())
  carId     String
  name      String
  email     String
  phone     String?
  message   String        @db.Text
  status    InquiryStatus @default(NEW)
  car       Car           @relation(fields: [carId], references: [id])
}
```

### Key Design Decisions

1. **Admin-Only Users**: No public user registration, only admin accounts
2. **Soft Deletes**: Cars use status field (INACTIVE) rather than hard deletion
3. **Image Ordering**: Car images have explicit order for consistent display
4. **UUID Primary Keys**: For security and scalability
5. **Performance Indexes**: Strategic indexing on query-heavy fields

## API Endpoints Architecture

### Public Endpoints (No Authentication)

#### Car Browsing
```
GET    /api/cars                    # List cars with filters & pagination
GET    /api/cars/featured           # Get featured cars
GET    /api/cars/popular-makes      # Get popular manufacturers
GET    /api/cars/:id               # Get car details
POST   /api/cars/:id/views         # Increment view count
```

#### Customer Contact
```
POST   /api/inquiries              # Submit car inquiry
```

#### System Health
```
GET    /api/health                 # API health check
```

### Admin Endpoints (JWT Authentication Required)

#### Authentication
```
POST   /api/auth/login             # Admin login (returns JWT)
POST   /api/auth/refresh           # Refresh access token
POST   /api/auth/logout            # Invalidate refresh token
```

#### Car Management
```
POST   /api/cars                   # Create car listing
PATCH  /api/cars/:id              # Update car listing
DELETE /api/cars/:id              # Soft delete car
DELETE /api/cars/:id/hard         # Permanently delete car
POST   /api/cars/:id/images       # Upload car images
PATCH  /api/cars/images/:imageId   # Update image details
DELETE /api/cars/images/:imageId   # Delete car image
PATCH  /api/cars/:id/feature      # Feature car listing
DELETE /api/cars/:id/feature      # Unfeature car listing
GET    /api/cars/admin/statistics  # Car statistics
```

#### Inquiry Management
```
GET    /api/inquiries              # List all inquiries
GET    /api/inquiries/statistics   # Inquiry statistics
GET    /api/inquiries/recent       # Recent inquiries
GET    /api/inquiries/:id          # Get inquiry details
PATCH  /api/inquiries/:id          # Update inquiry status
DELETE /api/inquiries/:id          # Delete inquiry
```

#### File Upload
```
POST   /api/upload/images          # Upload images to storage
```

## Authentication & Security

### JWT Implementation

```typescript
// JWT Strategy
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}
```

### Security Features

1. **JWT Access + Refresh Tokens**: Secure token rotation
2. **Failed Login Tracking**: Account lockout after 5 failed attempts
3. **Rate Limiting**: Global throttling (100 req/min, 5/min for login)
4. **Input Validation**: Comprehensive DTO validation
5. **Output Serialization**: Sensitive data exclusion
6. **CORS Configuration**: Restricted origins
7. **Helmet Security**: HTTP security headers

### Global Guards Configuration

```typescript
// Applied in app.module.ts
{
  provide: APP_GUARD,
  useClass: ThrottlerGuard, // Rate limiting
},
{
  provide: APP_GUARD,
  useClass: JwtAuthGuard,   // JWT authentication (default)
}
```

## Testing Architecture

### Testing Strategy

- **Unit Tests**: Isolated component testing with mocks
- **Integration Tests**: Module interaction testing
- **E2E Tests**: Full request/response cycle testing
- **Coverage Target**: 80% minimum, 90% for services

### Unit Test Pattern

```typescript
describe('CarsService', () => {
  let service: CarsService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        CarsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<CarsService>(CarsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should return CarEntity with proper serialization', async () => {
    const mockCar = TestDataFactory.createCar();
    jest.spyOn(prismaService.car, 'findUnique').mockResolvedValue(mockCar);

    const result = await service.findOne('car-id');

    expect(result).toBeInstanceOf(CarEntity);
    expect(result.creator).toBeInstanceOf(AdminEntity);
  });
});
```

### E2E Test Pattern

```typescript
describe('Cars (e2e)', () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    app = await TestHelper.createTestApp();
    authToken = await TestHelper.getAuthToken(app, {
      email: 'admin@test.com',
      password: 'admin123'
    });
  });

  it('/api/cars (POST) should create car', () => {
    return request(app.getHttpServer())
      .post('/api/cars')
      .set('Authorization', `Bearer ${authToken}`)
      .send(TestDataFactory.createCarDto())
      .expect(201)
      .expect(res => {
        expect(res.body).toHaveProperty('id');
        expect(res.body.make).toBe('Toyota');
      });
  });
});
```

### Test Utilities

```typescript
// TestHelper provides common testing functions
export class TestHelper {
  static async cleanDatabase(prisma: PrismaService): Promise<void>
  static async createTestApp(): Promise<INestApplication>
  static async getAuthToken(app: INestApplication, credentials): Promise<string>
  static createMockPrismaService()
  static expectValidationError(response: Response, field: string)
  static expectUnauthorized(response: Response)
}

// TestDataFactory generates mock data
export class TestDataFactory {
  static createCar(overrides?: Partial<Car>): Car
  static createAdmin(overrides?: Partial<Admin>): Admin
  static createInquiry(overrides?: Partial<Inquiry>): Inquiry
}
```

## Development Workflow

### Adding New Features

1. **Create Module**: `nest g resource feature-name`
2. **Define DTOs**: Add validation and Swagger documentation
3. **Create Entity**: Implement constructor pattern and serialization
4. **Implement Service**: Add business logic with error handling
5. **Create Controller**: Add endpoints with proper guards
6. **Write Tests**: Unit and E2E test coverage
7. **Update Documentation**: API docs and this file

### Service Implementation Pattern

```typescript
@Injectable()
export class FeatureService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreateFeatureDto): Promise<FeatureEntity> {
    // Validate business rules
    await this.validateBusinessRules(createDto);

    // Create with relations
    const feature = await this.prisma.feature.create({
      data: createDto,
      include: { relations: true },
    });

    // Return entity instance
    return new FeatureEntity(feature);
  }

  private async validateBusinessRules(dto: CreateFeatureDto): Promise<void> {
    // Custom validation logic
    if (await this.isDuplicate(dto.uniqueField)) {
      throw new ConflictException('Resource already exists');
    }
  }
}
```

### Controller Implementation Pattern

```typescript
@Controller('features')
@ApiTags('features')
export class FeatureController {
  constructor(private readonly featureService: FeatureService) {}

  @Post()
  @ApiOperation({ summary: 'Create new feature' })
  @ApiResponse({ status: 201, type: FeatureEntity })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async create(@Body() createDto: CreateFeatureDto): Promise<FeatureEntity> {
    return this.featureService.create(createDto);
  }
}
```

## Configuration & Environment

### Required Environment Variables

```bash
# Core Configuration
NODE_ENV=development
PORT=3001

# Database (Supabase PostgreSQL)
DATABASE_URL="postgresql://postgres.xxx:password@aws-0-us-east-1.pooler.supabase.com:6543/postgres"
DIRECT_URL="postgresql://postgres.xxx:password@aws-0-us-east-1.pooler.supabase.com:5432/postgres"

# JWT Authentication
JWT_SECRET="your-256-bit-secret-key"
JWT_EXPIRES_IN="1h"
REFRESH_TOKEN_EXPIRES_IN="7d"

# CORS Configuration
CORS_ORIGINS="http://localhost:3000,http://localhost:3002"

# Rate Limiting
THROTTLE_TTL=60000      # 60 seconds
THROTTLE_LIMIT=100      # 100 requests per TTL

# File Storage (Supabase)
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_SERVICE_KEY="your_supabase_service_key"
SUPABASE_BUCKET="car-images"

# Optional: Email Notifications
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### Bootstrap Configuration

```typescript
// main.ts - Production configuration
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security middleware
  app.use(helmet());
  app.use(compression());
  
  // CORS configuration
  app.enableCors({
    origin: configService.get('CORS_ORIGINS')?.split(','),
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Global prefix
  app.setGlobalPrefix('api');

  // Global pipes & interceptors
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));
  
  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(app.get(Reflector))
  );

  // Exception handling
  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new PrismaClientExceptionFilter(httpAdapter));

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Style Nation API')
    .setVersion('1.0.0')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
    }, 'JWT-auth')
    .build();
    
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(3001);
}
```

## Performance Optimization

### Database Optimization

1. **Strategic Indexing**: Query-optimized database indexes
2. **Selective Loading**: Only fetch required fields
3. **Relation Optimization**: Proper include/select usage
4. **Connection Pooling**: Supabase connection pooling

```typescript
// Optimized query example
const cars = await this.prisma.car.findMany({
  select: {
    id: true,
    make: true,
    model: true,
    year: true,
    price: true,
    status: true,
    images: {
      select: { url: true, isPrimary: true },
      where: { isPrimary: true },
    },
  },
  where: { status: 'AVAILABLE' },
  orderBy: { createdAt: 'desc' },
  take: 20,
});
```

### Caching Strategy

1. **Redis Caching**: Popular cars and search results
2. **Response Caching**: Static content caching
3. **Query Optimization**: Efficient database queries

### API Performance

1. **Rate Limiting**: Prevent abuse and ensure stability
2. **Response Compression**: Reduce payload size
3. **Validation Optimization**: Early request validation
4. **Error Handling**: Efficient error responses

## Security Best Practices

### Input Validation

```typescript
// Comprehensive DTO validation
export class CreateCarDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
  @Matches(/^[a-zA-Z0-9\s\-]+$/) // Alphanumeric with spaces and hyphens
  make: string;

  @IsDecimal({ decimal_digits: '0,2' })
  @Min(0)
  @Max(999999.99)
  price: number;

  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  @Length(1, 100, { each: true })
  features: string[];
}
```

### Authentication Security

1. **Password Hashing**: bcrypt with 12 rounds
2. **JWT Security**: Short-lived access tokens
3. **Refresh Token Rotation**: Secure token refresh
4. **Account Lockout**: Failed login attempt protection
5. **Session Management**: Proper logout handling

### Data Protection

1. **Output Serialization**: Sensitive data exclusion
2. **SQL Injection Prevention**: Prisma ORM protection
3. **XSS Prevention**: Input sanitization
4. **CSRF Protection**: Token-based protection

## Error Handling

### Global Exception Filter

```typescript
@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaClientExceptionFilter extends BaseExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    switch (exception.code) {
      case 'P2002':
        return new ConflictException('Resource already exists');
      case 'P2025':
        return new NotFoundException('Resource not found');
      case 'P2003':
        return new BadRequestException('Foreign key constraint violation');
      default:
        return new InternalServerErrorException('Database error');
    }
  }
}
```

### Validation Error Responses

```typescript
// Automatic validation error formatting
{
  "statusCode": 400,
  "message": [
    "make should not be empty",
    "year must be a number",
    "price must be a positive number"
  ],
  "error": "Bad Request"
}
```

## Development Commands

### Daily Development

```bash
# Start development server
npm run start:dev

# Database operations
npm run prisma:generate    # Generate Prisma client
npm run prisma:migrate     # Run migrations
npm run prisma:seed        # Seed demo data
npm run prisma:studio      # Open database GUI

# Testing
npm run test               # Unit tests
npm run test:watch         # Test watch mode
npm run test:e2e          # End-to-end tests
npm run test:cov          # Coverage report

# Code quality
npm run lint              # ESLint checking
npm run lint:fix          # Auto-fix lint issues
npm run format            # Prettier formatting
```

### Production Commands

```bash
# Build for production
npm run build

# Start production server
npm run start:prod

# Database production operations
npm run prisma:migrate:deploy    # Deploy migrations
npm run prisma:seed:prod        # Seed production data
```

## Deployment Checklist

### Pre-Deployment

- [ ] All tests passing (`npm run test` & `npm run test:e2e`)
- [ ] Environment variables configured
- [ ] Database migrations up to date
- [ ] Security headers configured
- [ ] CORS origins properly set
- [ ] Rate limiting enabled
- [ ] Swagger documentation updated

### Production Environment

- [ ] SSL/TLS certificates installed
- [ ] Database connection pool configured
- [ ] Monitoring and logging setup
- [ ] Error reporting (Sentry) configured
- [ ] Performance monitoring enabled
- [ ] Backup strategy implemented
- [ ] Health check endpoints working

### Security Verification

- [ ] JWT secrets properly configured
- [ ] No secrets in code repository
- [ ] Input validation comprehensive
- [ ] Authentication working correctly
- [ ] Authorization rules enforced
- [ ] File upload restrictions in place

## Troubleshooting

### Common Issues

#### Database Connection Errors
```bash
# Check environment variables
echo $DATABASE_URL

# Test connection
npm run prisma:studio

# Reset database (development only)
npm run prisma:migrate:reset
```

#### Authentication Issues
```bash
# Verify JWT configuration
node -e "console.log(process.env.JWT_SECRET?.length)"

# Check token expiration
# Use jwt.io to decode and verify tokens
```

#### Performance Issues
```bash
# Check database queries
# Enable Prisma query logging in development
# DATABASE_URL="...?log=query"

# Monitor memory usage
node --inspect=0.0.0.0:9229 dist/main.js
```

### Development Issues

1. **Module Resolution**: Ensure paths are configured in `tsconfig.json`
2. **Circular Dependencies**: Use forward references with `forwardRef()`
3. **Validation Errors**: Check DTO decorators and global validation pipe
4. **Entity Serialization**: Verify constructor patterns and `@Exclude()` decorators

## Resources & Documentation

### API Documentation
- **Swagger UI**: http://localhost:3001/api/docs
- **Health Check**: http://localhost:3001/api/health
- **Prisma Studio**: `npm run prisma:studio`

### External Documentation
- [NestJS Documentation](https://docs.nestjs.com)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [JWT.io Token Debugger](https://jwt.io)

### Project Documentation
- **Main Architecture**: `../../CLAUDE.md`
- **Frontend Documentation**: `../../apps/web/CLAUDE.md`
- **Admin Panel**: `../../apps/admin/CLAUDE.md`
- **API Security**: `./docs/security.md`
- **System Architecture**: `./docs/architecture.md`

---

**Last Updated**: Comprehensive architecture documentation
**Status**: Production-ready implementation
**Version**: 3.0.0
**Maintainer**: Style Nation Development Team