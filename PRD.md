# Product Requirements Document

## Car Showroom Multi-App Platform

### 1. Executive Summary

#### 1.1 Product Overview

A comprehensive car dealership platform consisting of three distinct applications: a public-facing car showroom website for browsing inventory, an admin dashboard for dealership management, and a centralized API backend. The platform eliminates user registration complexity while providing powerful administrative tools and automated social media marketing.

#### 1.2 Business Objectives

- **Simplified Customer Experience**: Public car browsing without registration barriers
- **Streamlined Operations**: Dedicated admin tools for efficient inventory management
- **Automated Marketing**: Facebook integration for automated car listing promotion
- **Analytics-Driven Decisions**: Comprehensive analytics for business insights
- **Scalable Architecture**: Separate concerns with independent deployment capabilities

#### 1.3 Success Metrics

- **Operational Efficiency**: 50% reduction in car listing management time
- **Customer Engagement**: 3x increase in customer inquiries vs. traditional methods  
- **Marketing Reach**: 80% of new car listings automatically posted to Facebook
- **User Experience**: <3 second page load times for public car browsing
- **System Reliability**: 99.9% uptime across all three applications
- **Conversion Rate**: 15% inquiry-to-sale conversion rate tracking

---

### 2. Technical Architecture

#### 2.1 Three-Application Architecture

**1. Public Web App (Customer-Facing)**
- **Framework**: Next.js 15.5 (App Router)
- **Purpose**: Public car browsing, no authentication required
- **Features**: Car listings, detailed views, contact forms, company info
- **URL**: https://stylenation.com

**2. Admin Dashboard (Management Interface)**
- **Framework**: Next.js 15.5 (App Router) 
- **Purpose**: Dealership management and analytics
- **Features**: Car CRUD, analytics, inquiries, Facebook integration
- **Authentication**: JWT-based admin login only
- **URL**: https://admin.stylenation.com

**3. Backend API (Centralized Services)**
- **Framework**: NestJS with TypeScript
- **Purpose**: Shared backend for both applications
- **Authentication**: Mixed (public endpoints + JWT for admin)
- **URL**: https://api.stylenation.com

#### 2.2 Technology Stack

**Web App (Public Frontend)**
- Framework: Next.js 15.5 (App Router)
- Language: TypeScript (strict mode)
- Styling: Tailwind CSS + shadcn/ui
- Authentication: None (public access only)
- Data Fetching: Server-side rendering + client-side API calls
- Image Optimization: Next.js Image component

**Admin App (Management Dashboard)**
- Framework: Next.js 15.5 (App Router)
- Language: TypeScript (strict mode)
- Styling: Tailwind CSS + shadcn/ui + admin components
- Authentication: JWT with secure token storage
- State Management: React Query + Zustand
- Forms: React Hook Form with Zod validation
- Tables: TanStack Table for data management
- Charts: Recharts for analytics visualization

**Backend API**
- Framework: NestJS with TypeScript
- Authentication: JWT for admin endpoints, public endpoints for web
- ORM: Prisma with PostgreSQL
- API: RESTful with OpenAPI/Swagger documentation
- Security: JWT validation, CORS, helmet, rate limiting

**Infrastructure**
- Database: Supabase PostgreSQL
- File Storage: Supabase Storage for car images
- Hosting: Vercel (all three applications)
- CDN: Vercel Edge Network
- SSL: Automatic HTTPS via Vercel

**Third-party Integrations**
- Facebook Graph API for automated posting
- Google Analytics 4 for web analytics
- Email service for inquiry notifications (optional)

#### 2.3 System Architecture Diagram

```
┌─────────────────────┐    ┌─────────────────────┐
│   Public Web App    │    │   Admin Dashboard   │
│   (Next.js)         │    │   (Next.js)         │
│   stylenation.com   │    │   admin.stylenation │
└─────────────────────┘    └─────────────────────┘
           │                          │
           │ Public API Calls         │ Admin API Calls (JWT)
           │                          │
           └──────────┐      ┌─────────┘
                      │      │
                      ▼      ▼
            ┌─────────────────────────┐
            │    NestJS Backend API   │
            │   api.stylenation.com   │
            │  ┌─────────────────────┐│
            │  │  Public Endpoints   ││  ← No Auth Required
            │  │  • GET /cars        ││
            │  │  • POST /inquiries  ││
            │  │  • GET /health      ││
            │  └─────────────────────┘│
            │  ┌─────────────────────┐│
            │  │  Admin Endpoints    ││  ← JWT Required
            │  │  • POST /admin/cars ││
            │  │  • GET /analytics   ││
            │  │  • Facebook APIs    ││
            │  └─────────────────────┘│
            └─────────────────────────┘
                      │
                      ▼
            ┌─────────────────────────┐
            │     Supabase DB         │
            │     (PostgreSQL)        │
            │   + File Storage        │
            └─────────────────────────┘
                      │
                      ▼
            ┌─────────────────────────┐
            │    Facebook Graph API   │
            │  (Auto-posting Cars)    │
            └─────────────────────────┘
```

---

### 3. User Roles & Permissions

#### 3.1 Public Users (Web App)

**Access Level:** No authentication required

**Capabilities:**
- Browse all available car inventory
- Advanced search and filtering
- View detailed car information with image galleries
- Submit car inquiries via contact forms
- Access company information and contact details
- Share car listings on social media
- Responsive browsing on all devices

**Restrictions:**
- No account creation or login
- No saved favorites or personal data storage
- No administrative capabilities
- Cannot access sold or inactive car listings

#### 3.2 Admin Users (Admin Dashboard)

**Access Level:** JWT-based authentication required

**Core Capabilities:**
- Full CRUD operations on car listings
- Advanced car management with bulk operations
- Upload and manage car images with drag-and-drop
- View comprehensive analytics dashboard
- Manage customer inquiries and responses
- Export data and generate reports

**Facebook Integration:**
- Configure Facebook page integration
- Automated car posting to Facebook
- Manage Facebook post templates
- View Facebook post performance analytics
- Manual posting and scheduling

**System Management:**
- Create and manage other admin accounts
- Configure system settings and preferences
- View system logs and audit trails
- Manage Facebook integration settings
- Export/import data

**Security Features:**
- JWT token-based authentication
- Secure session management
- Activity logging for audit purposes
- Role-based permission enforcement

**Access Control:**
- Session timeout after 4 hours of inactivity
- Secure token storage with automatic refresh
- Protected routes with authentication middleware
- Admin-only API endpoint access

---

### 4. Feature Specifications

#### 4.1 Authentication System

**Implementation with Supabase Auth:**

- Email/Password authentication
- OAuth providers (Google, Facebook)
- Magic link authentication
- Password reset functionality
- Email verification
- Role-based access control using Supabase RLS

**User Profile Management:**

- Profile information editing
- Preference settings
- Inquiry history
- Saved searches

#### 4.2 Car Listing Management

**Data Model:**

```prisma
model Car {
  id                String   @id @default(uuid())
  make              String
  model             String
  year              Int
  price             Decimal  @db.Decimal(10, 2)
  mileage           Int?
  vin               String   @unique
  condition         Condition
  transmissionType  Transmission
  fuelType          FuelType
  bodyType          BodyType
  exteriorColor     String
  interiorColor     String
  engineSize        String?
  features          String[] // Array of features
  description       String   @db.Text
  images            CarImage[]
  status            ListingStatus @default(AVAILABLE)
  featuredUntil     DateTime?
  facebookPostId    String?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  createdBy         String
  inquiries         Inquiry[]
  viewCount         Int      @default(0)
}

model CarImage {
  id        String   @id @default(uuid())
  carId     String
  car       Car      @relation(fields: [carId], references: [id], onDelete: Cascade)
  url       String
  isPrimary Boolean  @default(false)
  order     Int
  createdAt DateTime @default(now())
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
```

**Admin Features:**

- Multi-step form for adding listings
- Bulk image upload with drag-and-drop
- Image reordering and primary image selection
- Rich text editor for descriptions
- SEO metadata configuration
- Scheduling listings (publish date/time)
- Duplicate listing functionality
- Soft delete with restoration capability

#### 4.3 Facebook Integration

**Setup Requirements:**

- Facebook Developer App creation
- Page Access Token generation
- Webhook configuration for post management

**Posting Workflow:**

1. Admin creates/updates listing
2. System generates Facebook post content
3. Post preview shown to admin
4. Admin approves or customizes post
5. Post published to Facebook Page
6. Post ID stored for tracking

**Post Template:**

```
🚗 New Arrival Alert! 🚗

[Year] [Make] [Model]
💰 Price: $[Price]
📍 Mileage: [Mileage] miles
⛽ Fuel Type: [FuelType]
🎨 Color: [ExteriorColor]

[Description - first 200 chars]...

✨ Key Features:
• [Feature 1]
• [Feature 2]
• [Feature 3]

📸 See more photos and details: [Link]
📞 Contact us for a test drive!

#CarShowroom #[Make] #[Model] #CarsForSale
```

**Error Handling:**

- Retry mechanism for failed posts
- Manual retry option
- Error logging and admin notifications
- Fallback queue for offline posting

#### 4.4 Search & Filter System

**Search Capabilities:**

- Full-text search across make, model, description
- Elasticsearch integration (optional for advanced search)

**Filter Options:**

- Price range (slider)
- Year range
- Make/Model (cascading dropdowns)
- Mileage range
- Transmission type
- Fuel type
- Body type
- Color
- Features (multi-select)
- Condition

**Sort Options:**

- Price (low to high/high to low)
- Year (newest/oldest)
- Mileage (lowest/highest)
- Recently added
- Most viewed

#### 4.5 User Interface Specifications

**Responsive Design Breakpoints:**

- Mobile: 320px - 768px
- Tablet: 768px - 1024px
- Desktop: 1024px+

**Key Pages:**

1. **Home Page**
   - Hero section with featured cars carousel
   - Quick search bar
   - Featured inventory grid
   - Why choose us section
   - Testimonials
   - Contact information

2. **Inventory Page**
   - Filter sidebar (collapsible on mobile)
   - Grid/List view toggle
   - Pagination or infinite scroll
   - Quick view modal
   - Compare checkbox

3. **Car Detail Page**
   - Image gallery with zoom
   - Comprehensive specifications
   - Features list
   - Finance calculator
   - Inquiry form
   - Similar cars section
   - Share buttons

4. **Admin Dashboard**
   - Statistics overview (listings, inquiries, views)
   - Recent activities
   - Quick actions
   - Performance charts

5. **Admin Listing Management**
   - DataTable with search/filter
   - Bulk actions
   - Status indicators
   - Quick edit options

#### 4.6 Performance Requirements

**Page Load Times:**

- First Contentful Paint: < 1.5s
- Time to Interactive: < 3.5s
- Largest Contentful Paint: < 2.5s

**Optimization Strategies:**

- Image lazy loading
- Next.js ISR for car listings
- Database indexing on frequent queries
- Redis caching for popular listings
- CDN for static assets

---

### 5. Security Considerations

#### 5.1 Authentication & Authorization

- JWT token validation
- Rate limiting on API endpoints
- CORS configuration
- Input sanitization
- SQL injection prevention (Prisma parameterized queries)

#### 5.2 Data Protection

- HTTPS enforcement
- Encryption at rest (Supabase)
- PII data handling compliance
- Regular security audits
- Backup and disaster recovery plan

#### 5.3 Facebook Integration Security

- Secure token storage (environment variables)
- Token refresh mechanism
- Webhook signature verification
- Rate limit compliance

---

### 6. Development Phases

#### Phase 1: Foundation (Weeks 1-3)

- Project setup and configuration
- Database schema implementation
- Authentication system
- Basic admin and user roles

#### Phase 2: Core Features (Weeks 4-6)

- Car listing CRUD operations
- Image upload and management
- Search and filter functionality
- User-facing inventory pages

#### Phase 3: Facebook Integration (Weeks 7-8)

- Facebook API setup
- Automated posting functionality
- Post management interface
- Error handling and retry logic

#### Phase 4: Enhanced Features (Weeks 9-10)

- Analytics dashboard
- Inquiry management system
- Advanced search features
- Performance optimization

#### Phase 5: Testing & Deployment (Weeks 11-12)

- Unit and integration testing
- User acceptance testing
- Performance testing
- Production deployment
- Documentation

---

### 7. API Endpoints Architecture

#### 7.1 Public Endpoints (No Authentication Required)

**Car Browsing (For Web App)**
```
GET    /api/cars                    # List available cars with pagination/filters
GET    /api/cars/featured           # Get featured cars for homepage
GET    /api/cars/:id                # Get individual car details
GET    /api/cars/:id/images         # Get car image gallery
```

**Contact & Inquiries (For Web App)**
```
POST   /api/inquiries               # Submit car inquiry from web
POST   /api/contact                 # General contact form submission
```

**System Health**
```
GET    /api/health                  # API health check
```

#### 7.2 Admin Endpoints (JWT Authentication Required)

**Authentication**
```
POST   /api/auth/login              # Admin login only (no registration)
POST   /api/auth/refresh            # Refresh JWT token
GET    /api/auth/profile            # Get current admin profile
POST   /api/auth/logout             # Logout admin
```

**Car Management (Admin Dashboard)**
```
GET    /api/admin/cars              # List all cars (including sold/inactive)
POST   /api/admin/cars              # Create new car listing
GET    /api/admin/cars/:id          # Get car details for editing
PATCH  /api/admin/cars/:id          # Update car listing
DELETE /api/admin/cars/:id          # Delete car listing
POST   /api/admin/cars/:id/images   # Upload car images
DELETE /api/admin/cars/:id/images/:imageId  # Delete specific image
PATCH  /api/admin/cars/bulk          # Bulk update cars
DELETE /api/admin/cars/bulk          # Bulk delete cars
```

**Inquiry Management (Admin Dashboard)**
```
GET    /api/admin/inquiries         # List all customer inquiries
GET    /api/admin/inquiries/:id     # Get inquiry details
PATCH  /api/admin/inquiries/:id     # Update inquiry status/response
DELETE /api/admin/inquiries/:id     # Delete inquiry
```

**Analytics & Reporting (Admin Dashboard)**
```
GET    /api/admin/analytics/overview       # Dashboard KPI metrics
GET    /api/admin/analytics/cars/views     # Car view analytics
GET    /api/admin/analytics/inquiries      # Inquiry trends
GET    /api/admin/analytics/popular-cars   # Most viewed cars
GET    /api/admin/analytics/sales          # Sales performance
```

**Admin User Management**
```
GET    /api/admin/users             # List admin users
POST   /api/admin/users             # Create new admin user
GET    /api/admin/users/:id         # Get admin user details
PATCH  /api/admin/users/:id         # Update admin user
DELETE /api/admin/users/:id         # Delete admin user
POST   /api/admin/change-password   # Change admin password
```

**Facebook Integration (Admin Dashboard)**
```
POST   /api/admin/facebook/post/:carId        # Post car to Facebook
GET    /api/admin/facebook/posts              # List Facebook post history
DELETE /api/admin/facebook/post/:postId       # Delete Facebook post
GET    /api/admin/facebook/settings           # Get Facebook settings
PATCH  /api/admin/facebook/settings           # Update Facebook settings
POST   /api/admin/facebook/test-connection    # Test Facebook connection
```

---

### 8. Database Schema Considerations

#### Indexes

```sql
CREATE INDEX idx_cars_status ON cars(status);
CREATE INDEX idx_cars_price ON cars(price);
CREATE INDEX idx_cars_make_model ON cars(make, model);
CREATE INDEX idx_cars_year ON cars(year);
CREATE INDEX idx_cars_created_at ON cars(created_at DESC);
```

#### Row Level Security (Supabase RLS)

```sql
-- Public read access for available cars
CREATE POLICY "Public can view available cars" ON cars
FOR SELECT USING (status = 'AVAILABLE');

-- Admin full access
CREATE POLICY "Admins have full access" ON cars
FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
```

---

### 9. Monitoring & Analytics

#### Application Monitoring

- Vercel Analytics for performance metrics
- Sentry for error tracking
- Custom analytics for business metrics

#### Key Metrics to Track

- Page views per listing
- Conversion rate (views to inquiries)
- Most viewed cars
- Search terms analytics
- Facebook post engagement
- API response times
- Error rates

---

### 10. Future Enhancements

#### Version 2.0 Considerations

- WhatsApp Business API integration
- Virtual car tours (360° views)
- AI-powered chatbot for inquiries
- Finance application integration
- Multi-language support
- Appointment scheduling system
- Email marketing automation
- Mobile applications (React Native)
- Inventory prediction analytics
- Trade-in value calculator

---

### 11. Compliance & Legal

- GDPR compliance for EU users
- Cookie consent management
- Privacy policy and terms of service
- Data retention policies
- Accessibility standards (WCAG 2.1 AA)
- SEO best practices
- Facebook platform policies compliance

---

### 12. Success Criteria

#### Launch Readiness Checklist

- [ ] All core features implemented and tested
- [ ] Security audit completed
- [ ] Performance benchmarks met
- [ ] Facebook integration verified
- [ ] Admin training completed
- [ ] Documentation finalized
- [ ] Backup and recovery tested
- [ ] SSL certificates configured
- [ ] Domain and DNS setup
- [ ] Analytics tracking verified
