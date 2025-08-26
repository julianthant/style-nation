# CLAUDE.md - Style Nation Web Application

## Project Overview

This is Style Nation - a full-stack web application for a car showroom that enables administrators to manage vehicle inventory and automatically post listings to Facebook. The application features role-based access control, advanced search capabilities, and social media integration.

## Tech Stack

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand or Context API
- **Deployment**: Vercel

### Backend
- **Framework**: NestJS
- **Language**: TypeScript
- **ORM**: Prisma
- **API**: RESTful
- **Deployment**: Vercel Functions or Railway

### Infrastructure
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **File Storage**: Supabase Storage
- **CDN**: Vercel Edge Network

## Project Structure

```
style-nation/
├── apps/
│   ├── web/                    # Next.js frontend
│   │   ├── app/
│   │   │   ├── (auth)/         # Auth routes (login, register)
│   │   │   ├── (public)/       # Public routes
│   │   │   │   ├── inventory/
│   │   │   │   ├── car/[id]/
│   │   │   │   └── page.tsx
│   │   │   ├── admin/          # Admin routes (protected)
│   │   │   │   ├── dashboard/
│   │   │   │   ├── listings/
│   │   │   │   └── settings/
│   │   │   └── layout.tsx
│   │   ├── components/
│   │   │   ├── ui/            # Reusable UI components
│   │   │   ├── features/      # Feature-specific components
│   │   │   └── layouts/       # Layout components
│   │   ├── lib/
│   │   │   ├── supabase/      # Supabase client
│   │   │   ├── api/           # API client functions
│   │   │   └── utils/         # Utility functions
│   │   └── public/
│   │
│   └── api/                    # NestJS backend
│       ├── src/
│       │   ├── auth/           # Authentication module
│       │   ├── cars/           # Cars module
│       │   ├── facebook/       # Facebook integration
│       │   ├── inquiries/      # Inquiries module
│       │   ├── common/         # Shared resources
│       │   └── main.ts
│       └── prisma/
│           ├── schema.prisma
│           └── migrations/
│
├── packages/
│   ├── database/              # Shared Prisma schema
│   ├── types/                 # Shared TypeScript types
│   └── config/                # Shared configuration
│
└── docs/
    ├── CLAUDE.md             # This file
    ├── PRD.md                # Product Requirements
    └── API.md                # API Documentation
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

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh token
- `GET /api/auth/profile` - Get user profile

### Cars (Public)
- `GET /api/cars` - List all available cars (paginated)
- `GET /api/cars/:id` - Get single car details
- `GET /api/cars/featured` - Get featured cars
- `GET /api/search` - Search cars with filters

### Cars (Admin)
- `POST /api/admin/cars` - Create new listing
- `PUT /api/admin/cars/:id` - Update listing
- `DELETE /api/admin/cars/:id` - Delete listing
- `POST /api/admin/cars/:id/images` - Upload images
- `DELETE /api/admin/cars/:id/images/:imageId` - Delete image
- `PUT /api/admin/cars/:id/feature` - Feature a car

### Facebook Integration (Admin)
- `POST /api/admin/facebook/post/:carId` - Post to Facebook
- `GET /api/admin/facebook/status/:carId` - Check post status
- `DELETE /api/admin/facebook/post/:postId` - Delete Facebook post
- `GET /api/admin/facebook/settings` - Get FB settings
- `PUT /api/admin/facebook/settings` - Update FB settings

### Inquiries
- `POST /api/inquiries` - Submit inquiry (public)
- `GET /api/admin/inquiries` - List inquiries (admin)
- `PUT /api/admin/inquiries/:id` - Update inquiry status (admin)

### Analytics (Admin)
- `GET /api/admin/analytics/dashboard` - Dashboard stats
- `GET /api/admin/analytics/cars/:id` - Car-specific analytics

## Environment Variables

```bash
# Frontend (.env.local)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Backend (.env)
DATABASE_URL=your_supabase_database_url
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_key
JWT_SECRET=your_jwt_secret
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret
FACEBOOK_PAGE_ID=your_facebook_page_id
FACEBOOK_PAGE_ACCESS_TOKEN=your_page_access_token
```

## Key Implementation Guidelines

### 1. Authentication Flow
- Use Supabase Auth for all authentication
- Implement role-based middleware in NestJS
- Store user roles in database with RLS policies
- Use JWT tokens for API authentication

### 2. Image Handling
- Resize images before upload (max 1920px width)
- Generate thumbnails for list views
- Use Supabase Storage or AWS S3
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

## Common Commands

```bash
# Development
npm run dev:web          # Start Next.js dev server
npm run dev:api          # Start NestJS dev server
npm run dev              # Start both concurrently

# Database
npx prisma generate      # Generate Prisma client
npx prisma migrate dev   # Run migrations in dev
npx prisma studio        # Open Prisma Studio

# Build
npm run build:web        # Build Next.js app
npm run build:api        # Build NestJS app
npm run build            # Build both

# Testing
npm run test             # Run all tests
npm run test:e2e         # Run E2E tests
npm run test:unit        # Run unit tests

# Deployment
vercel --prod            # Deploy to Vercel
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

## Important Notes for Claude Code

1. **Always check existing code structure before making changes**
2. **Follow the established patterns in the codebase**
3. **Update tests when modifying functionality**
4. **Use TypeScript strict mode and handle all edge cases**
5. **Implement proper error handling and user feedback**
6. **Consider mobile-first responsive design**
7. **Optimize for performance and SEO**
8. **Document complex logic with comments**
9. **Use semantic HTML and ARIA attributes for accessibility**
10. **Follow security best practices for all user inputs**

## Project Phases

1. **Phase 1**: Setup and Authentication (Current)
2. **Phase 2**: Core CRUD Operations
3. **Phase 3**: Facebook Integration
4. **Phase 4**: Search and Filters
5. **Phase 5**: Analytics and Optimization

## Contact & Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [NestJS Documentation](https://docs.nestjs.com)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Facebook Graph API](https://developers.facebook.com/docs/graph-api)