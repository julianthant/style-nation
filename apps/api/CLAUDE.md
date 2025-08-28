# CLAUDE.md - Style Nation API with Supabase Authentication

## API Structure & Implementation Status

This file documents the current state and implementation details of the Style Nation NestJS API with Supabase authentication.

## 🔐 Supabase Authentication Implementation

### Authentication Strategy

The API uses Supabase JWT tokens for authentication following this pattern:

#### JWT Strategy (`/auth/strategies/supabase.strategy.ts`)
```typescript
import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class SupabaseStrategy extends PassportStrategy(Strategy) {
  public constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    })
  }

  async validate(payload: any): Promise<any> {
    return payload
  }
}
```

#### JWT Auth Guard (`/auth/guards/jwt.auth.guard.ts`)
```typescript
import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }
    return super.canActivate(context);
  }
}
```

### Authentication Decorators

#### Public Decorator (`/auth/decorators/public.decorator.ts`)
```typescript
import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
```

#### Roles Decorator (`/auth/decorators/roles.decorator.ts`)
```typescript
import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
```

#### Current User Decorator (`/auth/decorators/current-user.decorator.ts`)
```typescript
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
```

### Protected Route Example

The API includes a protected route example:

```typescript
@Get('/protected')
@UseGuards(JwtAuthGuard)
async protected(@Req() req) {
  return {
    "message": "AuthGuard works 🎉",
    "authenticated_user": req.user
  };
}
```

## 📁 Current Project Structure

```
apps/api/
├── src/
│   ├── auth/                          ✅ COMPLETE
│   │   ├── decorators/
│   │   │   ├── current-user.decorator.ts
│   │   │   ├── public.decorator.ts
│   │   │   └── roles.decorator.ts
│   │   ├── dto/
│   │   │   └── login.dto.ts
│   │   ├── entities/
│   │   │   └── auth.entity.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.module.ts
│   │   ├── auth.service.ts
│   │   ├── jwt-auth.guard.ts
│   │   ├── jwt.strategy.ts
│   │   └── roles.guard.ts
│   │
│   ├── users/                         ✅ COMPLETE
│   │   ├── dto/
│   │   │   ├── change-password.dto.ts
│   │   │   ├── create-user.dto.ts
│   │   │   └── update-user.dto.ts
│   │   ├── entities/
│   │   │   └── user.entity.ts
│   │   ├── users.controller.ts
│   │   ├── users.module.ts
│   │   └── users.service.ts
│   │
│   ├── prisma/                        ✅ COMPLETE
│   │   ├── prisma.module.ts
│   │   └── prisma.service.ts
│   │
│   ├── cars/                          ⏳ TODO
│   ├── inquiries/                     ⏳ TODO
│   ├── facebook/                      ⏳ TODO
│   │
│   ├── app.controller.ts              ✅ COMPLETE
│   ├── app.module.ts                  ✅ COMPLETE
│   ├── app.service.ts                 ✅ COMPLETE
│   └── main.ts                        ✅ COMPLETE
│
├── prisma/                            ✅ COMPLETE
│   ├── schema.prisma
│   └── seed.ts
│
├── .env                               ✅ COMPLETE
├── .env.example                       ✅ COMPLETE
├── .gitignore                         ✅ COMPLETE
├── nest-cli.json                      ✅ COMPLETE
├── package.json                       ✅ COMPLETE
├── tsconfig.json                      ✅ COMPLETE
├── tsconfig.build.json                ✅ COMPLETE
├── TASKS.md                           ✅ COMPLETE
└── CLAUDE.md                          ✅ COMPLETE (this file)
```

## 🔐 Authentication Implementation

### JWT Strategy
- **Secret**: Configurable via `JWT_SECRET` environment variable
- **Expiration**: Configurable via `JWT_EXPIRES_IN` (default: 7d)
- **Token Format**: Bearer token in Authorization header
- **Strategy**: passport-jwt with extraction from auth header

### Guards & Decorators
- **JwtAuthGuard**: Global authentication guard (applied to all routes by default)
- **RolesGuard**: Role-based authorization guard
- **@Public()**: Decorator to exclude routes from authentication
- **@Roles(Role.ADMIN)**: Decorator for admin-only endpoints
- **@CurrentUser()**: Decorator to inject authenticated user into controller methods

### Password Security
- **Hashing**: bcrypt with 10 rounds
- **Validation**: Minimum 6 characters required
- **Change Password**: Requires current password verification

## 👥 User Management

### User Model Structure
```typescript
User {
  id: string (UUID)
  email: string (unique)
  password: string (hashed)
  role: Role (USER | ADMIN)
  profile?: Profile (optional relation)
  createdAt: DateTime
  updatedAt: DateTime
}

Profile {
  id: string (UUID)
  userId: string (FK to User)
  firstName?: string
  lastName?: string
  phone?: string
  avatar?: string
}
```

### Available Endpoints
```
POST   /api/users              (Admin) Create user
POST   /api/users/register     (Public) User registration  
GET    /api/users              (Admin) List all users
GET    /api/users/me           (Auth) Current user profile
GET    /api/users/:id          (Admin) Get user by ID
PATCH  /api/users/me           (Auth) Update own profile
PATCH  /api/users/:id          (Admin) Update user by ID
POST   /api/users/change-password (Auth) Change password
DELETE /api/users/:id          (Admin) Delete user
```

## 🔑 Environment Configuration

### Required Environment Variables
```bash
# Core
NODE_ENV=development
PORT=3001

# Database (Supabase)
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."  # For migrations

# Authentication
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="7d"

# Supabase
SUPABASE_URL="https://project.supabase.co"
SUPABASE_SERVICE_KEY="eyJ..."
SUPABASE_JWT_SECRET="your-supabase-jwt-secret"

# Security
CORS_ORIGINS="http://localhost:3000"
API_RATE_LIMIT=100
```

## 🗃️ Database Schema

### Core Models Implemented
- ✅ **User**: Authentication and profile management
- ✅ **Profile**: User profile information (linked to User)
- ✅ **Car**: Vehicle listings (schema defined, module pending)
- ✅ **CarImage**: Car images (schema defined, module pending)
- ✅ **Inquiry**: Customer inquiries (schema defined, module pending)

### Database Indexes
Performance indexes are configured for:
- Car status, price, make/model, year, creation date
- Inquiry car ID and status
- User email uniqueness

## 🚀 API Features

### Global Features
- ✅ **CORS**: Configurable origins
- ✅ **Validation**: Global validation pipe with whitelist
- ✅ **Serialization**: Class-transformer for response serialization
- ✅ **Swagger**: Complete API documentation at `/api/docs`
- ✅ **Health Checks**: `/api` and `/api/health` endpoints
- ✅ **Security**: Helmet security headers
- ✅ **Compression**: Response compression enabled

### Swagger Documentation
- **URL**: `http://localhost:3001/api/docs`
- **Features**: 
  - Interactive API testing
  - JWT authentication support
  - Request/response schemas
  - Grouped endpoints by feature
  - Example requests and responses

## 📱 API Usage Examples

### Authentication
```bash
# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@stylenation.com","password":"admin123"}'

# Response
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "clm123...",
    "email": "admin@stylenation.com",
    "role": "ADMIN"
  }
}

# Use token in subsequent requests
curl -X GET http://localhost:3001/api/users/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### User Registration
```bash
curl -X POST http://localhost:3001/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1-555-0123"
  }'
```

## 🧑‍💻 Development Commands

```bash
# Install dependencies
npm install

# Database setup
npm run prisma:generate    # Generate Prisma client
npm run prisma:migrate     # Run migrations  
npm run prisma:seed        # Seed with demo data
npm run prisma:studio      # Open Prisma Studio

# Development
npm run start:dev          # Start with hot reload
npm run build              # Build for production
npm run start:prod         # Start production build

# Testing
npm run test              # Run unit tests
npm run test:e2e          # Run e2e tests
npm run test:cov          # Run with coverage
```

## 🔄 Development Workflow

### Adding New Modules
1. Generate module: `nest g resource module-name`
2. Create DTOs with validation decorators
3. Create entity classes with Swagger documentation
4. Implement service with Prisma integration
5. Create controller with proper guards and decorators
6. Add module to AppModule imports
7. Update this documentation

### Database Changes
1. Modify `prisma/schema.prisma`
2. Run `npm run prisma:migrate`
3. Update seed file if needed
4. Generate new Prisma client: `npm run prisma:generate`

## 🐛 Common Issues & Solutions

### Authentication Issues
- **401 Unauthorized**: Check JWT token format (Bearer token)
- **403 Forbidden**: Verify user has required role (ADMIN for admin endpoints)
- **Token Expired**: Login again to get fresh token

### Database Issues
- **Connection Failed**: Check DATABASE_URL format and database availability
- **Migration Issues**: Ensure database is accessible and migrations are up to date
- **Seed Failures**: Check for unique constraint violations

### Development Issues
- **Module Not Found**: Ensure paths are configured correctly in tsconfig.json
- **Validation Errors**: Check DTO definitions and class-validator decorators
- **CORS Errors**: Update CORS_ORIGINS environment variable

## 🎯 Next Implementation Priorities

1. **Cars Module** (High Priority)
   - Complete CRUD operations
   - Search and filtering
   - Image management endpoints

2. **Inquiries Module** (Medium Priority)
   - Customer inquiry submission
   - Admin inquiry management
   - Email notifications

3. **Facebook Integration** (Medium Priority)
   - Auto-posting to Facebook
   - Post management
   - Settings configuration

4. **Advanced Features** (Low Priority)
   - Analytics endpoints
   - Background job processing
   - Advanced caching

## 🎨 NestJS Best Practices Implementation

### Exception Handling
Following the NestJS tutorial patterns, we implement proper exception handling:

#### Prisma Exception Filter
```typescript
// src/prisma-client-exception.filter.ts
@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaClientExceptionFilter extends BaseExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    switch (exception.code) {
      case 'P2002': return 409 // Unique constraint violation
      case 'P2025': return 404 // Record not found
      case 'P2014': return 400 // Relation violation
      case 'P2003': return 400 // Foreign key constraint violation
    }
  }
}
```

Applied globally in `main.ts`:
```typescript
const { httpAdapter } = app.get(HttpAdapterHost);
app.useGlobalFilters(new PrismaClientExceptionFilter(httpAdapter));
```

### Entity Classes with Proper Serialization

#### Entity Constructor Pattern
All entity classes follow this pattern for handling relations:
```typescript
export class UserEntity implements User {
  constructor({ profile, ...data }: Partial<UserEntity>) {
    Object.assign(this, data);
    
    // Handle nested relations
    if (profile) {
      this.profile = new ProfileEntity(profile);
    }
  }

  @Exclude()
  password: string; // Excluded from API responses
  
  @ApiProperty({ type: ProfileEntity })
  profile?: ProfileEntity;
}
```

#### Global Configuration
```typescript
// main.ts - Required for entity serialization
app.useGlobalInterceptors(
  new ClassSerializerInterceptor(app.get(Reflector))
);
```

### Validation and Transformation

#### Global Validation Pipeline
```typescript
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,           // Strip non-whitelisted properties
    forbidNonWhitelisted: true, // Throw error for extra properties
    transform: true,            // Transform payloads to DTO instances
    transformOptions: {
      enableImplicitConversion: true,
    },
  })
);
```

#### DTO Validation Examples
```typescript
export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @IsString()
  @MinLength(6)
  @ApiProperty({ minLength: 6 })
  password: string;

  @IsEnum(Role)
  @IsOptional()
  @ApiProperty({ enum: Role, default: Role.USER })
  role?: Role = Role.USER;
}
```

### Service Layer Patterns

#### Proper Error Handling in Services
```typescript
async findOne(id: string): Promise<UserEntity> {
  const user = await this.prisma.user.findUnique({
    where: { id },
    include: { profile: true }, // Include relations
  });

  if (!user) {
    throw new NotFoundException(`User with ID ${id} not found`);
  }

  return new UserEntity(user); // Always return entity instances
}
```

#### Relational Data Handling
```typescript
// Always include related data when needed
const user = await this.prisma.user.create({
  data: {
    email,
    password: hashedPassword,
    profile: firstName || lastName || phone ? {
      create: { firstName, lastName, phone }
    } : undefined,
  },
  include: { profile: true }, // Include for complete response
});

return new UserEntity(user); // Proper entity serialization
```

### Controller Best Practices

#### Proper Type Annotations
```typescript
@Post()
@ApiResponse({ status: 201, type: UserEntity })
async create(@Body() createUserDto: CreateUserDto): Promise<UserEntity> {
  return this.usersService.create(createUserDto);
}

// Use ParseIntPipe for integer IDs (not needed for UUIDs)
@Get(':id')
findOne(@Param('id', ParseIntPipe) id: number) { /* ... */ }
```

#### Authentication & Authorization
```typescript
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard) // Global guards
export class UsersController {
  
  @Post()
  @Roles(Role.ADMIN) // Role-based access
  @ApiBearerAuth('JWT-auth') // Swagger auth
  async create(@Body() dto: CreateUserDto): Promise<UserEntity> { /* ... */ }
  
  @Post('register')
  @Public() // Exclude from authentication
  async register(@Body() dto: CreateUserDto): Promise<UserEntity> { /* ... */ }
}
```

### Module Implementation Patterns

#### Standard Module Structure
```typescript
@Module({
  controllers: [UsersController],
  providers: [UsersService],
  imports: [PrismaModule], // Always import PrismaModule
  exports: [UsersService], // Export services if needed by other modules
})
export class UsersModule {}
```

### Future Module Implementation Guidelines

When creating new modules (Cars, Inquiries, etc.), follow these patterns:

#### Entity Classes
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
      this.creator = new UserEntity(creator);
    }
  }

  @ApiProperty({ type: [CarImageEntity] })
  images?: CarImageEntity[];

  @ApiProperty({ type: UserEntity })
  creator?: UserEntity;
}
```

#### Service Methods with Relations
```typescript
async findOne(id: string): Promise<CarEntity> {
  const car = await this.prisma.car.findUnique({
    where: { id },
    include: {
      images: true,
      creator: { include: { profile: true } }, // Nested includes
      inquiries: { include: { user: true } },
    },
  });

  if (!car) {
    throw new NotFoundException(`Car with ID ${id} not found`);
  }

  return new CarEntity(car);
}
```

#### Search and Filtering
```typescript
async findAll(searchDto: SearchCarsDto): Promise<CarEntity[]> {
  const cars = await this.prisma.car.findMany({
    where: {
      make: searchDto.make ? { contains: searchDto.make, mode: 'insensitive' } : undefined,
      price: {
        gte: searchDto.minPrice,
        lte: searchDto.maxPrice,
      },
      status: ListingStatus.AVAILABLE,
    },
    include: { images: true, creator: true },
    orderBy: { createdAt: 'desc' },
    take: searchDto.limit || 20,
    skip: searchDto.offset || 0,
  });

  return cars.map(car => new CarEntity(car));
}
```

### Testing Patterns

#### Unit Test Example
```typescript
describe('UsersService', () => {
  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();
  });

  it('should return UserEntity instance', async () => {
    const result = await service.findOne('user-id');
    expect(result).toBeInstanceOf(UserEntity);
    expect(result.password).toBeUndefined(); // Should be excluded
  });
});
```

### Performance Optimization

#### Database Indexes
Ensure proper indexes in Prisma schema:
```prisma
model Car {
  // Performance indexes
  @@index([status])
  @@index([price])
  @@index([make, model])
  @@index([createdAt(sort: Desc)])
}
```

#### Selective Field Loading
```typescript
// Only select needed fields for performance
const cars = await this.prisma.car.findMany({
  select: {
    id: true,
    make: true,
    model: true,
    price: true,
    images: { select: { url: true, isPrimary: true } },
  },
});
```

### Error Handling Best Practices

#### Common HTTP Status Codes
- `201 Created`: Successful resource creation
- `200 OK`: Successful retrieval/update
- `204 No Content`: Successful deletion
- `400 Bad Request`: Validation errors
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `409 Conflict`: Resource conflict (unique constraints)

#### Validation Error Messages
```typescript
@IsString()
@IsNotEmpty({ message: 'Title cannot be empty' })
@MinLength(5, { message: 'Title must be at least 5 characters' })
@ApiProperty({ minLength: 5 })
title: string;
```

### Security Best Practices

#### Input Sanitization
```typescript
// ValidationPipe with whitelist prevents extra fields
app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

// @Exclude() prevents sensitive data exposure
@Exclude()
password: string;
```

#### Rate Limiting (Future Implementation)
```typescript
// For public endpoints
@Throttle(10, 60) // 10 requests per minute
@Public()
async register() { /* ... */ }
```

## 🧪 NestJS Testing Best Practices

Automated testing is essential for maintaining code quality and ensuring reliable deployments. Our testing strategy follows NestJS best practices with comprehensive unit and E2E testing.

### Testing Architecture Overview

#### Testing Types Implemented
- **Unit Tests**: Test individual components (services, controllers) in isolation
- **Integration Tests**: Test module interactions and database operations
- **End-to-End Tests**: Test complete request/response cycles via HTTP

#### Testing Tools & Framework
- **Jest**: Test runner and assertion framework
- **Supertest**: HTTP testing for E2E tests
- **@nestjs/testing**: NestJS testing utilities
- **Test Doubles**: Mocking services and dependencies

### Unit Testing Patterns

#### Basic Unit Test Structure
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';

describe('UsersService', () => {
  let service: UsersService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
```

#### Auto-Mocking Strategy
```typescript
import { ModuleMocker, MockMetadata } from 'jest-mock';

const moduleMocker = new ModuleMocker(global);

describe('UsersController', () => {
  let controller: UsersController;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [UsersController],
    })
      .useMocker((token) => {
        if (token === UsersService) {
          return {
            findAll: jest.fn().mockResolvedValue([]),
            findOne: jest.fn().mockResolvedValue(new UserEntity({})),
            create: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          };
        }
        if (typeof token === 'function') {
          const mockMetadata = moduleMocker.getMetadata(token) as MockMetadata<any>;
          const Mock = moduleMocker.generateFromMetadata(mockMetadata);
          return new Mock();
        }
      })
      .compile();

    controller = moduleRef.get(UsersController);
  });
});
```

#### Service Testing Best Practices
```typescript
describe('UsersService', () => {
  describe('create', () => {
    it('should create user with hashed password', async () => {
      const createUserDto = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
      };

      const mockUser = {
        id: 'user-123',
        email: createUserDto.email,
        password: 'hashed-password',
        role: Role.USER,
        profile: {
          firstName: createUserDto.firstName,
          lastName: createUserDto.lastName,
        },
      };

      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);
      jest.spyOn(prismaService.user, 'create').mockResolvedValue(mockUser);

      const result = await service.create(createUserDto);

      expect(result).toBeInstanceOf(UserEntity);
      expect(result.email).toBe(createUserDto.email);
      expect(result.password).toBeUndefined(); // Should be excluded
      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          email: createUserDto.email,
          password: expect.any(String), // Should be hashed
        }),
        include: { profile: true },
      });
    });

    it('should throw ConflictException for duplicate email', async () => {
      const createUserDto = { email: 'existing@example.com', password: 'password' };
      
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue({} as any);

      await expect(service.create(createUserDto)).rejects.toThrow(ConflictException);
    });
  });
});
```

#### Controller Testing with Guards
```typescript
describe('UsersController', () => {
  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: UsersService, useValue: mockUsersService },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = moduleRef.get<UsersController>(UsersController);
  });
});
```

### End-to-End Testing Patterns

#### E2E Test Structure
```typescript
import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { INestApplication } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Users (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let authToken: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    
    // Apply same middleware as production
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }));

    await app.init();
    
    prismaService = moduleRef.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await app.close();
  });
});
```

#### Authentication Flow Testing
```typescript
describe('/auth/login (POST)', () => {
  it('should login valid user and return JWT', () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'admin@stylenation.com',
        password: 'admin123',
      })
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('accessToken');
        expect(res.body.user).toHaveProperty('email');
        expect(res.body.user.password).toBeUndefined();
      });
  });

  it('should reject invalid credentials', () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'invalid@example.com',
        password: 'wrongpassword',
      })
      .expect(401);
  });
});
```

#### Protected Route Testing
```typescript
describe('/users/me (GET)', () => {
  it('should return current user profile when authenticated', () => {
    return request(app.getHttpServer())
      .get('/users/me')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body).toHaveProperty('email');
        expect(res.body.password).toBeUndefined();
      });
  });

  it('should reject unauthenticated requests', () => {
    return request(app.getHttpServer())
      .get('/users/me')
      .expect(401);
  });
});
```

### Testing Utilities

#### Mock Data Factory
```typescript
// test/utils/test-data.factory.ts
export class TestDataFactory {
  static createUser(overrides?: Partial<User>): User {
    return {
      id: 'test-user-id',
      email: 'test@example.com',
      password: 'hashed-password',
      role: Role.USER,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  }

  static createUserWithProfile(overrides?: Partial<User & { profile: Profile }>): User & { profile: Profile } {
    return {
      ...TestDataFactory.createUser(overrides),
      profile: {
        id: 'profile-id',
        userId: 'test-user-id',
        firstName: 'John',
        lastName: 'Doe',
        phone: '+1234567890',
        avatar: null,
        ...overrides?.profile,
      },
    };
  }
}
```

#### Database Testing Helpers
```typescript
// test/utils/test.helper.ts
export class TestHelper {
  static async cleanDatabase(prisma: PrismaService) {
    // Clean up test data in proper order (respecting foreign keys)
    await prisma.inquiry.deleteMany({});
    await prisma.carImage.deleteMany({});
    await prisma.car.deleteMany({});
    await prisma.profile.deleteMany({});
    await prisma.user.deleteMany({});
  }

  static async getAuthToken(app: INestApplication, credentials: LoginDto): Promise<string> {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send(credentials)
      .expect(200);
      
    return response.body.accessToken;
  }
}
```

### Test Database Configuration

#### Separate Test Database
```typescript
// For E2E tests, use a separate test database
beforeAll(async () => {
  // Switch to test database
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
  
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();
  
  app = moduleRef.createNestApplication();
  await app.init();
});
```

### Coverage Goals and Standards

#### Target Metrics
- **Unit Tests**: 80% code coverage minimum
- **Service Layer**: 90% coverage (critical business logic)
- **Controller Layer**: 85% coverage (API contract validation)
- **E2E Tests**: Cover all critical user flows

#### Testing Standards
1. **Every service method must have unit tests**
2. **All controller endpoints must have unit tests**
3. **Critical flows must have E2E test coverage**
4. **Error scenarios must be tested**
5. **Authentication and authorization must be tested**
6. **Database operations must be tested with mocks**

### Running Tests

#### Development Commands
```bash
# Unit tests
npm run test                    # Run all unit tests
npm run test:watch              # Run tests in watch mode
npm run test:cov                # Run tests with coverage report

# E2E tests  
npm run test:e2e                # Run end-to-end tests

# Debug tests
npm run test:debug              # Debug test execution
```

#### CI/CD Integration
```bash
# Production test pipeline
npm run test                    # Unit tests must pass
npm run test:e2e                # E2E tests must pass
npm run test:cov                # Coverage must meet thresholds
```

### Test Organization

#### File Naming Conventions
- **Unit Tests**: `*.spec.ts` (next to source files)
- **E2E Tests**: `*.e2e-spec.ts` (in `test/` directory)
- **Test Utilities**: `test/utils/` directory

#### Test Structure Guidelines
```typescript
describe('ClassName', () => {
  describe('methodName', () => {
    describe('when condition', () => {
      it('should behavior', async () => {
        // Arrange
        const input = {};
        const expected = {};
        
        // Act
        const result = await method(input);
        
        // Assert
        expect(result).toEqual(expected);
      });
    });
  });
});
```

### Mock Strategy Guidelines

#### When to Mock
- **External Services**: Always mock (Prisma, HTTP clients)
- **Complex Dependencies**: Mock for isolated testing  
- **Database Operations**: Mock for unit tests, real DB for E2E
- **Authentication**: Mock guards for unit tests, real auth for E2E

#### Mock Implementation Examples
```typescript
// Prisma service mock
const mockPrismaService = {
  user: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  // Add other models as needed
};

// Guard mock for testing protected endpoints
const mockJwtAuthGuard = {
  canActivate: jest.fn().mockImplementation((context) => {
    const req = context.switchToHttp().getRequest();
    req.user = { id: 'test-user', role: Role.USER };
    return true;
  }),
};
```

## 📞 Support & Resources

- **API Documentation**: http://localhost:3001/api/docs
- **Health Check**: http://localhost:3001/api/health
- **Database Studio**: `npm run prisma:studio`
- **Main Documentation**: `../../CLAUDE.md`
- **Project Tasks**: `./TASKS.md`

---

**Last Updated**: Enhanced with NestJS best practices
**Status**: Production-ready patterns implemented
**Version**: 2.0.0