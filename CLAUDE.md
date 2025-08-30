# CLAUDE.md - Style Nation Multi-App Architecture

## Project Overview

Style Nation is a modern car showroom platform consisting of three distinct applications that work together to provide a complete automotive dealership solution. The architecture separates concerns between public car browsing, admin management, and backend services.

## Three-App Architecture

### 1. **Web App** (Public Car Showroom)
- **Purpose**: Public-facing website for car browsing and company information
- **Target Users**: General public, potential car buyers
- **Authentication**: None - completely public access
- **Features**: Car listings, detailed views, contact forms, company info

### 2. **Admin App** (Management Dashboard)  
- **Purpose**: Administrative interface for inventory and business management
- **Target Users**: Dealership staff and administrators only
- **Authentication**: Admin-only JWT login (no user registration)
- **Features**: Car CRUD, analytics, customer inquiries, Facebook integration

### 3. **API** (Backend Services)
- **Purpose**: Centralized backend serving both web and admin applications
- **Authentication**: Mixed - public endpoints for web, JWT-protected for admin
- **Features**: Database operations, business logic, file management

## Tech Stack Implementation

### Web App (Public Frontend)
- **Framework**: Next.js 15.5 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS + shadcn/ui
- **Authentication**: None (public access only)
- **State Management**: Server state via public API calls
- **Font**: Inter (Google Fonts)
- **Theme**: Dark/light mode with system detection
- **Deployment**: Vercel

### Admin App (Management Dashboard)
- **Framework**: Next.js 15.5 (App Router) 
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS + shadcn/ui + admin components
- **Authentication**: JWT with admin-only login
- **Features**: Dashboard, analytics, car management, Facebook posting
- **Deployment**: Vercel

### API (Backend Services)
- **Framework**: NestJS with TypeScript
- **Authentication**: JWT for admin endpoints, public endpoints for web
- **ORM**: Prisma with PostgreSQL
- **API**: RESTful with Swagger documentation
- **Security**: JWT validation, CORS, helmet, validation pipes
- **Deployment**: Railway or Vercel Functions

### Infrastructure
- **Database**: Supabase PostgreSQL with RLS
- **File Storage**: Supabase Storage for car images
- **API Documentation**: Swagger UI
- **Development**: Hot reload, Prisma Studio

## Project Structure (Three-App Architecture)

```
style-nation/
├── apps/
│   ├── web/                           # Public Car Showroom (Next.js) ✅
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── cars/              # Car browsing pages ✅
│   │   │   │   │   ├── [id]/          # Car detail pages ✅
│   │   │   │   │   └── page.tsx       # Car listings ✅
│   │   │   │   ├── about/             # Company information ✅
│   │   │   │   ├── contact/           # Contact forms ✅
│   │   │   │   ├── blog/              # Blog/articles ✅
│   │   │   │   ├── layout.tsx         # Public layout ✅
│   │   │   │   └── page.tsx           # Homepage ✅
│   │   │   ├── components/
│   │   │   │   ├── ui/                # shadcn/ui components ✅
│   │   │   │   ├── cars/              # Car display components ✅
│   │   │   │   ├── home/              # Homepage sections ✅
│   │   │   │   └── layout/            # Headers, footers ✅
│   │   │   ├── lib/
│   │   │   │   ├── api/               # Public API calls ✅
│   │   │   │   ├── types/             # TypeScript interfaces ✅
│   │   │   │   └── utils.ts           # Utility functions ✅
│   │   │   └── middleware.ts          # Public route handling ✅
│   │   └── CLAUDE.md                  # Web app documentation
│   │
│   ├── admin/                         # Admin Management Dashboard ✅
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── login/             # Admin login only ✅
│   │   │   │   ├── dashboard/         # Analytics overview ✅
│   │   │   │   ├── cars/              # Car CRUD management
│   │   │   │   ├── inquiries/         # Customer inquiries
│   │   │   │   ├── settings/          # Facebook integration
│   │   │   │   ├── layout.tsx         # Admin layout ✅
│   │   │   │   └── page.tsx           # Dashboard home ✅
│   │   │   ├── components/
│   │   │   │   ├── ui/                # Admin UI components
│   │   │   │   ├── dashboard/         # Dashboard widgets
│   │   │   │   └── forms/             # Admin forms
│   │   │   ├── lib/
│   │   │   │   ├── auth/              # Admin authentication ✅
│   │   │   │   └── api/               # Admin API calls
│   │   │   └── middleware.ts          # Admin route protection ✅
│   │   └── CLAUDE.md                  # Admin app documentation
│   │
│   └── api/                           # NestJS Backend API ✅
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

## API Endpoints Architecture

### 🌐 Public Endpoints (No Authentication - for Web App)

**Cars (Public Browsing)**
- `GET /api/cars` - List available cars with pagination and filters
- `GET /api/cars/featured` - Get featured cars for homepage
- `GET /api/cars/:id` - Get car details with images for public view
- `GET /api/cars/:id/images` - Get car image gallery

**Inquiries (Public Contact)**
- `POST /api/inquiries` - Submit car inquiry from web app
- `POST /api/contact` - General contact form submissions

**System (Public)**
- `GET /api/health` - API health status

### 🔐 Admin Endpoints (JWT Authentication Required - for Admin App)

**✅ Authentication (Implemented)**
- `POST /api/auth/login` - Admin login with JWT response
- `POST /api/auth/refresh` - Refresh JWT token
- `GET /api/auth/profile` - Get current admin profile

**✅ Admin User Management (Implemented)**
- `GET /api/admin/users` - List all admin users
- `POST /api/admin/users` - Create new admin user
- `PATCH /api/admin/users/:id` - Update admin user
- `POST /api/admin/change-password` - Change admin password
- `DELETE /api/admin/users/:id` - Delete admin user

**⏳ Car Management (Admin CRUD)**
- `POST /api/admin/cars` - Create new car listing
- `GET /api/admin/cars` - List all cars (including sold/inactive)
- `PATCH /api/admin/cars/:id` - Update car listing
- `DELETE /api/admin/cars/:id` - Delete car listing
- `POST /api/admin/cars/:id/images` - Upload car images
- `DELETE /api/admin/cars/:id/images/:imageId` - Delete car image
- `PATCH /api/admin/cars/:id/featured` - Toggle featured status

**⏳ Inquiry Management (Admin Only)**
- `GET /api/admin/inquiries` - List all customer inquiries
- `PATCH /api/admin/inquiries/:id` - Update inquiry status
- `DELETE /api/admin/inquiries/:id` - Delete inquiry

**⏳ Analytics (Admin Only)**
- `GET /api/admin/analytics/overview` - Dashboard statistics
- `GET /api/admin/analytics/cars/views` - Car view analytics
- `GET /api/admin/analytics/inquiries` - Inquiry trends
- `GET /api/admin/analytics/popular-cars` - Most viewed cars

**⏳ Facebook Integration (Admin Only)**
- `POST /api/admin/facebook/post/:carId` - Post car to Facebook
- `GET /api/admin/facebook/posts` - List Facebook post history
- `DELETE /api/admin/facebook/post/:postId` - Delete Facebook post
- `GET /api/admin/facebook/settings` - Get Facebook integration settings
- `PATCH /api/admin/facebook/settings` - Update Facebook settings

## Environment Variables Configuration

### Web App (Public Frontend) - apps/web/.env.local
```bash
# No authentication - public API only
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_WEB_URL=http://localhost:3000

# Optional: Analytics (public)
NEXT_PUBLIC_GA_TRACKING_ID=your_google_analytics_id
```

### Admin App (Management Dashboard) - apps/admin/.env.local  
```bash
# Admin authentication required
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_ADMIN_URL=http://localhost:3002

# Admin app specific
NEXT_PUBLIC_APP_NAME="Style Nation Admin"
NEXT_PUBLIC_COMPANY_NAME="Style Nation"
```

### API Backend - apps/api/.env
```bash
# Core Configuration
NODE_ENV=development
PORT=3001

# Database (Supabase)
DATABASE_URL="postgresql://postgres.xxx:password@aws-0-us-east-1.pooler.supabase.com:6543/postgres"
DIRECT_URL="postgresql://postgres.xxx:password@aws-0-us-east-1.pooler.supabase.com:5432/postgres"

# Admin Authentication (JWT)
JWT_SECRET="your-secure-jwt-secret-key"
JWT_EXPIRES_IN="7d"

# API Security
CORS_ORIGINS="http://localhost:3000,http://localhost:3002"
API_RATE_LIMIT=100
ADMIN_RATE_LIMIT=1000

# File Storage (Supabase)
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_SERVICE_KEY="your_supabase_service_key"

# Facebook Integration (Admin Features)
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret
FACEBOOK_PAGE_ID=your_facebook_page_id
FACEBOOK_PAGE_ACCESS_TOKEN=your_page_access_token
## Key Implementation Guidelines

### 1. Authentication Strategy (Three-App Architecture)

**Web App (Public - No Authentication)**:
1. Direct API calls to public endpoints
2. No login/registration functionality
3. Contact forms submit to public inquiry endpoints
4. All car browsing is public access

**Admin App (JWT Authentication)**:
1. Admin submits login form → JWT token response
2. Token stored in secure cookies/localStorage
3. API calls include Authorization header
4. Protected routes check JWT validity
5. Redirect to login if token invalid/expired

**API Backend (Mixed Authentication)**:
1. Public endpoints: No authentication required
2. Admin endpoints: JWT validation required
3. @Public() decorator for open endpoints
4. JwtAuthGuard for admin-only operations
5. Role-based access control for admin users

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

## Development Commands (Three-App Setup)

```bash
# Development - Start All Apps
cd apps/web && npm run dev       # Public website (port 3000)
cd apps/admin && npm run dev     # Admin dashboard (port 3002)
cd apps/api && npm run start:dev # Backend API (port 3001)

# Quick Start All Services (from root)
# Option 1: Use separate terminals for each service
# Option 2: Use concurrently (if configured)
npm run dev:all                  # Start all three apps simultaneously

# Database Management (from apps/api)
npm run prisma:generate          # Generate Prisma client
npm run prisma:migrate           # Run database migrations
npm run prisma:seed              # Seed demo data (admin user + sample cars)
npm run prisma:studio            # Open Prisma Studio GUI

# Build Commands (from each app directory)
cd apps/web && npm run build     # Build public website
cd apps/admin && npm run build   # Build admin dashboard  
cd apps/api && npm run build     # Build backend API

# Testing
cd apps/web && npm run test      # Public website tests
cd apps/admin && npm run test    # Admin dashboard tests
cd apps/api && npm run test      # API unit tests
cd apps/api && npm run test:e2e  # API E2E tests

# Package Management
pnpm install                     # Install all dependencies (root)
pnpm -F web add package-name     # Add to public website
pnpm -F admin add package-name   # Add to admin dashboard
pnpm -F api add package-name     # Add to backend API

# Development URLs
# Public Website: http://localhost:3000
# Admin Dashboard: http://localhost:3002
# Backend API Docs: http://localhost:3001/api/docs
# API Health Check: http://localhost:3001/api/health
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

1. **Foundation & Infrastructure** (100%) - Monorepo, TypeScript, development environment
2. **Database Architecture** (100%) - Complete Prisma schema with Supabase
3. **Authentication System** (100%) - JWT backend with comprehensive security features
4. **User Management** (100%) - Complete CRUD with role-based access
5. **Production Readiness** (100%) - NestJS best practices and error handling
6. **Frontend UI Foundation** (100%) - Component library and modern UI system
7. **Car Management System** (100%) - Full CRUD, search, filtering, image management

### **🚧 In Progress**

8. **Customer Inquiries** (0%) - Next priority, database schema ready

### **⏳ Next Phases**

9. **Facebook Integration** (0%) - Auto-posting system for car listings
10. **Admin Panel Enhancement** (30%) - Better Auth admin interface
11. **Performance & SEO** (30%) - Optimization and production readiness

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
- **Task Tracking**:
  - `/apps/api/TASKS.md` (Backend API development progress)
  - `/apps/web/TASKS.md` (Frontend development progress)
  - `/apps/admin/TASKS.md` (Admin panel development progress)
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
