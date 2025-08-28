# CLAUDE.md - Style Nation Web Application

## Project Overview

This is Style Nation - a full-stack web application for a car showroom that enables administrators to manage vehicle inventory and automatically post listings to Facebook. The application features role-based access control, advanced search capabilities, and social media integration.

## Tech Stack (Current Implementation)

### Frontend

- **Framework**: Next.js 15.5 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS + shadcn/ui
- **Authentication**: Supabase Auth with server actions
- **State Management**: Server state via Axios + local state
- **Font**: Inter (Google Fonts)
- **Theme**: Dark/light mode with system detection
- **Deployment**: Vercel

### Backend

- **Framework**: NestJS with TypeScript
- **Authentication**: JWT with Passport.js (Supabase token validation)
- **ORM**: Prisma with PostgreSQL
- **API**: RESTful with Swagger documentation
- **Security**: bcrypt, CORS, helmet, validation pipes
- **Deployment**: Railway or Vercel Functions

### Infrastructure

- **Database**: Supabase PostgreSQL with RLS
- **Authentication**: Supabase Auth (JWT tokens)
- **File Storage**: Supabase Storage (ready)
- **API Documentation**: Swagger UI
- **Development**: Hot reload, Prisma Studio

## Project Structure (Current Implementation)

```
style-nation/
├── apps/
│   ├── web/                           # Next.js 15.5 Frontend ✅
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── auth/actions/      # Server actions for auth ✅
│   │   │   │   ├── login/             # Login page ✅
│   │   │   │   ├── register/          # Registration page ✅
│   │   │   │   ├── profile/           # User profile page ✅
│   │   │   │   ├── admin/             # Admin dashboard ✅
│   │   │   │   ├── dashboard/         # User dashboard ✅
│   │   │   │   ├── reset-password/    # Password reset flow ✅
│   │   │   │   ├── unauthorized/      # Access denied page ✅
│   │   │   │   ├── layout.tsx         # Root layout with providers ✅
│   │   │   │   └── page.tsx           # Homepage ✅
│   │   │   ├── components/
│   │   │   │   ├── ui/               # shadcn/ui components (15+) ✅
│   │   │   │   ├── auth/             # Auth components ✅
│   │   │   │   ├── cars/             # Car display components ✅
│   │   │   │   ├── home/             # Homepage components ✅
│   │   │   │   └── providers/        # Theme, auth, query providers ✅
│   │   │   ├── lib/
│   │   │   │   ├── types/car.ts      # TypeScript interfaces ✅
│   │   │   │   ├── hooks/            # Custom hooks ✅
│   │   │   │   └── axios.ts          # API client ✅
│   │   │   ├── utils/supabase/       # Supabase clients ✅
│   │   │   └── middleware.ts         # Route protection ✅
│   │   ├── components.json            # shadcn/ui config ✅
│   │   └── claude.md                  # Frontend documentation ✅
│   │
│   └── api/                           # NestJS Backend ✅
│       ├── src/
│       │   ├── auth/                  # Authentication module ✅
│       │   │   ├── decorators/        # Security decorators ✅
│       │   │   ├── dto/               # Login validation ✅
│       │   │   ├── entities/          # Auth entities ✅
│       │   │   ├── auth.controller.ts # Auth endpoints ✅
│       │   │   ├── auth.service.ts    # JWT logic ✅
│       │   │   ├── jwt.strategy.ts    # Passport strategy ✅
│       │   │   └── guards/            # Auth & role guards ✅
│       │   ├── users/                 # User management ✅
│       │   │   ├── dto/               # User DTOs ✅
│       │   │   ├── entities/          # User entities ✅
│       │   │   ├── users.controller.ts # User endpoints ✅
│       │   │   ├── users.service.ts   # User logic ✅
│       │   │   └── users.module.ts    # Module config ✅
│       │   ├── prisma/                # Database service ✅
│       │   │   ├── prisma.service.ts  # Prisma client ✅
│       │   │   ├── prisma.module.ts   # Global DB module ✅
│       │   │   └── exception.filter.ts # Error handling ✅
│       │   ├── cars/                  # Cars module (pending) ⏳
│       │   ├── inquiries/             # Inquiries module (pending) ⏳
│       │   ├── facebook/              # Facebook integration (pending) ⏳
│       │   ├── app.controller.ts      # Health checks ✅
│       │   ├── app.service.ts         # App services ✅
│       │   ├── app.module.ts          # Root module ✅
│       │   └── main.ts                # Bootstrap ✅
│       ├── prisma/
│       │   ├── schema.prisma          # Complete DB schema ✅
│       │   └── seed.ts                # Demo data ✅
│       ├── CLAUDE.md                  # Backend documentation ✅
│       ├── TASKS.md                   # Backend task tracking ✅
│       └── SUMMARY.md                 # Backend session summary ✅
│
├── CLAUDE.md                          # This file (project overview) ✅
├── TASKS.md                           # Unified task tracking ✅
├── SUMMARY.md                         # Project summary ✅
├── PRD.md                             # Product requirements ✅
├── PLANNING.md                        # Development planning ✅
├── package.json                       # Root package config ✅
└── pnpm-workspace.yaml                # Workspace configuration ✅
```

## Database Schema

```prisma
// Main entities - always include these in Prisma schema

model User {
  id            String    @id @default(uuid())
  email         String    @unique
  role          Role      @default(USER)
  profile       Profile?
  inquiries     Inquiry[]
  createdCars   Car[]     @relation("CreatedBy")
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model Car {
  id                String        @id @default(uuid())
  make              String
  model             String
  year              Int
  price             Decimal       @db.Decimal(10, 2)
  mileage           Int?
  vin               String        @unique
  condition         Condition
  transmissionType  Transmission
  fuelType          FuelType
  bodyType          BodyType
  exteriorColor     String
  interiorColor     String
  engineSize        String?
  features          String[]
  description       String        @db.Text
  images            CarImage[]
  status            ListingStatus @default(AVAILABLE)
  featuredUntil     DateTime?
  facebookPostId    String?
  createdAt         DateTime      @default(now())
  updatedAt         DateTime      @updatedAt
  createdBy         String
  creator           User          @relation("CreatedBy", fields: [createdBy], references: [id])
  inquiries         Inquiry[]
  viewCount         Int           @default(0)

  @@index([status])
  @@index([price])
  @@index([make, model])
  @@index([year])
  @@index([createdAt(sort: Desc)])
}

model CarImage {
  id        String   @id @default(uuid())
  carId     String
  car       Car      @relation(fields: [carId], references: [id], onDelete: Cascade)
  url       String
  isPrimary Boolean  @default(false)
  order     Int
  createdAt DateTime @default(now())

  @@index([carId])
}

model Inquiry {
  id        String   @id @default(uuid())
  carId     String
  car       Car      @relation(fields: [carId], references: [id])
  userId    String?
  user      User?    @relation(fields: [userId], references: [id])
  name      String
  email     String
  phone     String?
  message   String   @db.Text
  status    InquiryStatus @default(NEW)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([carId])
  @@index([status])
}

// Enums
enum Role {
  USER
  ADMIN
}

enum Condition {
  NEW
  USED
  CERTIFIED_PREOWNED
}

enum ListingStatus {
  AVAILABLE
  SOLD
  RESERVED
  INACTIVE
}

enum Transmission {
  MANUAL
  AUTOMATIC
  CVT
  DUAL_CLUTCH
}

enum FuelType {
  GASOLINE
  DIESEL
  ELECTRIC
  HYBRID
  PLUG_IN_HYBRID
}

enum BodyType {
  SEDAN
  SUV
  TRUCK
  COUPE
  CONVERTIBLE
  WAGON
  VAN
  HATCHBACK
}

enum InquiryStatus {
  NEW
  CONTACTED
  CLOSED
}
```

## API Endpoints (Current Implementation)

### ✅ Authentication (Implemented)

- `POST /api/auth/login` - User login with JWT response
- `GET /api/auth/profile` - Get current user profile (authenticated)

### ✅ User Management (Implemented)

- `POST /api/users` - Create user (admin only)
- `POST /api/users/register` - Public user registration
- `GET /api/users` - List all users (admin only)
- `GET /api/users/me` - Get current user profile
- `GET /api/users/:id` - Get user by ID (admin only)
- `PATCH /api/users/me` - Update own profile
- `PATCH /api/users/:id` - Update user by ID (admin only)
- `POST /api/users/change-password` - Change password (authenticated)
- `DELETE /api/users/:id` - Delete user (admin only)

### ✅ System (Implemented)

- `GET /api` - API health check
- `GET /api/health` - Detailed health status

### ⏳ Cars (Pending Implementation)

- `POST /api/cars` - Create car listing (admin only)
- `GET /api/cars` - List cars with pagination and filters
- `GET /api/cars/featured` - Get featured cars
- `GET /api/cars/:id` - Get car details with images
- `PATCH /api/cars/:id` - Update car listing (admin only)
- `DELETE /api/cars/:id` - Delete car listing (admin only)
- `POST /api/cars/:id/images` - Upload car images (admin only)
- `DELETE /api/cars/:id/images/:imageId` - Delete image (admin only)

### ⏳ Inquiries (Pending Implementation)

- `POST /api/inquiries` - Submit car inquiry (public)
- `GET /api/admin/inquiries` - List all inquiries (admin only)
- `PATCH /api/admin/inquiries/:id` - Update inquiry status (admin only)

### ⏳ Facebook Integration (Pending Implementation)

- `POST /api/admin/facebook/post/:carId` - Post car to Facebook
- `GET /api/admin/facebook/status/:carId` - Check post status
- `DELETE /api/admin/facebook/post/:postId` - Delete Facebook post

## Environment Variables (Current Configuration)

```bash
# Frontend (apps/web/.env.local) ✅
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000

# Backend (apps/api/.env) ✅
NODE_ENV=development
PORT=3001

# Database (Supabase) ✅
DATABASE_URL="postgresql://postgres.xxx:password@aws-0-us-east-1.pooler.supabase.com:6543/postgres"
DIRECT_URL="postgresql://postgres.xxx:password@aws-0-us-east-1.pooler.supabase.com:5432/postgres"

# Authentication ✅
JWT_SECRET="your-secure-jwt-secret-key"
JWT_EXPIRES_IN="7d"
SUPABASE_JWT_SECRET="your-supabase-jwt-secret"

# API Configuration ✅
CORS_ORIGINS="http://localhost:3000"
API_RATE_LIMIT=100

# Future: Facebook Integration (Pending)
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret
FACEBOOK_PAGE_ID=your_facebook_page_id
FACEBOOK_PAGE_ACCESS_TOKEN=your_page_access_token
```

## Key Implementation Guidelines

### 1. Authentication Flow (Current Implementation)

**Frontend Authentication**:
1. User submits login form → Server action calls Supabase
2. Supabase returns JWT token → Stored in secure cookies
3. API calls use Axios interceptor → Automatically adds Bearer token
4. Protected routes check session → Redirect to login if needed

**Backend Authentication**:
1. JWT token received in Authorization header
2. Passport JWT strategy validates token with Supabase secret
3. JwtAuthGuard protects all routes by default
4. @Public() decorator excludes specific routes
5. @Roles() decorator enforces role-based access

### 2. Image Handling

- Resize images before upload (max 1920px width)
- Generate thumbnails for list views
- Use Supabase Storage
- Implement progressive image loading
- Support multiple image formats (JPEG, PNG, WebP)

### 3. Facebook Integration

```typescript
// Basic Facebook posting flow
1. Admin creates/updates car listing
2. System prepares post content with template
3. Upload primary image to Facebook
4. Create post with image and content
5. Store Facebook post ID in database
6. Handle errors with retry mechanism
```

### 4. Search Implementation

- Use Prisma's full-text search for basic search
- Implement faceted search with filters
- Cache popular searches
- Consider Elasticsearch for advanced features

### 5. Performance Optimization

- Implement ISR for car listing pages
- Use React Query or SWR for data fetching
- Lazy load images and components
- Implement virtual scrolling for large lists
- Use database indexes effectively

### 6. Security Best Practices

- Validate all inputs with class-validator
- Implement rate limiting (10 req/min for API)
- Use Helmet.js for security headers
- Sanitize user-generated content
- Implement CORS properly
- Use environment variables for secrets

## Development Commands (Current Setup)

```bash
# Development (from root)
cd apps/web && npm run dev       # Start Next.js frontend (port 3000)
cd apps/api && npm run start:dev # Start NestJS backend (port 3001)

# Database (from apps/api)
npm run prisma:generate          # Generate Prisma client
npm run prisma:migrate           # Run database migrations
npm run prisma:seed              # Seed demo data
npm run prisma:studio            # Open Prisma Studio GUI

# Build (from each app)
cd apps/web && npm run build     # Build Next.js app
cd apps/api && npm run build     # Build NestJS app

# Testing (frameworks ready, tests pending)
npm run test                     # Unit tests
npm run test:e2e                 # E2E tests with Playwright

# Package Management
pnpm install                     # Install all dependencies
pnpm -F web add package-name     # Add to frontend
pnpm -F api add package-name     # Add to backend

# Documentation
# Frontend: http://localhost:3000
# Backend API Docs: http://localhost:3001/api/docs
# Health Check: http://localhost:3001/api/health
```

## Code Style Guidelines

### TypeScript

- Use strict mode
- Define interfaces for all data structures
- Use enums for constants
- Implement proper error handling
- Use async/await over promises

### React/Next.js

- Use functional components with hooks
- Implement proper loading and error states
- Use Next.js Image component for images
- Implement SEO with Next.js Head
- Use dynamic imports for code splitting

### NestJS

- Follow modular architecture
- Use DTOs for request/response validation
- Implement proper exception filters
- Use guards for authentication
- Implement interceptors for logging

### Prisma

- Use typed queries
- Implement transactions for complex operations
- Use select to minimize data transfer
- Handle Prisma errors properly

## Testing Strategy

### Unit Tests

- Test all service methods
- Test utility functions
- Test React components with React Testing Library
- Aim for 80% code coverage

### Integration Tests

- Test API endpoints
- Test database operations
- Test external service integrations

### E2E Tests

- Test critical user flows
- Test admin workflows
- Test Facebook posting flow

## Deployment Checklist

- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] SSL certificates configured
- [ ] CORS settings verified
- [ ] Rate limiting enabled
- [ ] Error monitoring setup (Sentry)
- [ ] Analytics configured
- [ ] Facebook app approved
- [ ] Performance testing completed
- [ ] Security audit completed
- [ ] Backup strategy implemented
- [ ] Documentation updated

## Troubleshooting Guide

### Common Issues

1. **Supabase Connection Issues**
   - Check DATABASE_URL format
   - Verify network connectivity
   - Check RLS policies

2. **Facebook API Errors**
   - Verify access token validity
   - Check app permissions
   - Review rate limits

3. **Image Upload Failures**
   - Check file size limits
   - Verify storage bucket permissions
   - Check CORS configuration

4. **Authentication Problems**
   - Verify JWT configuration
   - Check token expiration
   - Review Supabase Auth settings

## Important Implementation Notes

### **Current System Architecture**
1. **Frontend-Backend Integration**: Supabase JWT tokens flow seamlessly from Next.js to NestJS
2. **NestJS Patterns**: Follow established patterns in apps/api/src/auth and apps/api/src/users
3. **Entity Serialization**: Use constructor patterns for nested relations (see UserEntity example)
4. **Error Handling**: Global exception filters map database errors to HTTP responses
5. **Validation**: Use class-validator DTOs and global ValidationPipe
6. **Security**: All endpoints protected by default, use @Public() for exceptions

### **Development Workflow**
1. **Backend First**: Implement NestJS module following established patterns
2. **Frontend Integration**: Connect existing UI components to new API endpoints
3. **Testing**: Use Swagger UI for API testing, demo data for frontend testing
4. **Documentation**: Update app-specific CLAUDE.md files and this overview

### **Code Quality Standards**
- ✅ **TypeScript strict mode enabled** - Handle all type errors
- ✅ **Comprehensive validation** - Use class-validator for all DTOs
- ✅ **Proper error handling** - Follow exception filter patterns
- ✅ **Security first** - Authentication and authorization on all sensitive operations
- ✅ **Documentation** - Update Swagger docs for all new endpoints

## Current Project Status

### **✅ Completed Phases**
1. **Foundation & Infrastructure** - Monorepo, TypeScript, development environment
2. **Database Architecture** - Complete Prisma schema with Supabase
3. **Authentication System** - JWT backend + Supabase frontend integration
4. **User Management** - Complete CRUD with role-based access
5. **Production Readiness** - NestJS best practices and error handling
6. **Frontend UI Foundation** - Component library and authentication UI

### **🚧 In Progress**
7. **Car Management System** - UI components ready, backend module needed

### **⏳ Next Phases**
8. **Customer Inquiries** - Database schema ready, implementation pending
9. **Facebook Integration** - Planning complete, API integration needed
10. **Performance & SEO** - Infrastructure ready for optimization

## Development Resources

### **Live Development URLs** (When servers are running)
- **Frontend Application**: http://localhost:3000
- **Backend API Documentation**: http://localhost:3001/api/docs
- **API Health Check**: http://localhost:3001/api/health
- **Database Studio**: `cd apps/api && npm run prisma:studio`

### **Documentation**
- **Project Overview**: `/CLAUDE.md` (this file)
- **Backend Guide**: `/apps/api/CLAUDE.md` (NestJS patterns & best practices)
- **Frontend Guide**: `/apps/web/CLAUDE.md` (Next.js implementation details)
- **Task Tracking**: `/TASKS.md` (unified development progress)
- **Project Summary**: `/SUMMARY.md` (comprehensive progress report)

### **Demo Accounts** (Available after seeding)
- **Admin**: admin@stylenation.com / admin123
- **User**: john@example.com / user123

### **External Documentation**
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js 15 Documentation](https://nextjs.org/docs)
- [NestJS Documentation](https://docs.nestjs.com)
- [Prisma Documentation](https://www.prisma.io/docs)
- [shadcn/ui Components](https://ui.shadcn.com)
