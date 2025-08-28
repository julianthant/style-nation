# Product Requirements Document

## Car Showroom Web Application

### 1. Executive Summary

#### 1.1 Product Overview

A modern web application for car showrooms to showcase their vehicle inventory with dual interfaces for administrators and customers. The platform features real-time inventory management with automatic social media integration for marketing purposes.

#### 1.2 Business Objectives

- Digital transformation of traditional car showroom operations
- Automated marketing through Facebook integration
- Improved customer engagement through modern web interface
- Streamlined inventory management for administrators

#### 1.3 Success Metrics

- Time reduction in listing management (target: 50% reduction)
- Increase in customer inquiries through digital channels
- Facebook engagement rate on automated posts
- System uptime (target: 99.9%)

---

### 2. Technical Architecture

#### 2.1 Technology Stack

**Frontend:**

- Framework: Next.js 14+ (App Router)
- Language: TypeScript
- Styling: Tailwind CSS
- State Management: Zustand or Context API
- Image Optimization: Next.js Image component with Cloudinary

**Backend:**

- Framework: NestJS
- Language: TypeScript (Note: NestJS runs on Node.js, not Python)
- ORM: Prisma
- API: RESTful with potential GraphQL consideration

**Infrastructure:**

- Database: Supabase (PostgreSQL)
- Authentication: Supabase Auth
- File Storage: Supabase Storage
- Hosting: Vercel (Frontend), Vercel Functions
- CDN: Vercel Edge Network

**Third-party Integrations:**

- Facebook Graph API
- Analytics: Google Analytics 4 / Vercel Analytics
- Error Tracking: Sentry

#### 2.2 System Architecture Diagram

```
┌─────────────────┐     ┌─────────────────┐
│   Next.js App   │────▶│  NestJS API     │
│   (Vercel)      │     │  (Vercel/Railway)│
└─────────────────┘     └─────────────────┘
         │                       │
         │                       ▼
         │              ┌─────────────────┐
         │              │   Prisma ORM    │
         │              └─────────────────┘
         │                       │
         ▼                       ▼
┌─────────────────┐     ┌─────────────────┐
│  Supabase Auth  │     │ Supabase DB     │
└─────────────────┘     │  (PostgreSQL)   │
                        └─────────────────┘
                                 │
                        ┌────────▼────────┐
                        │  Facebook API   │
                        └─────────────────┘
```

---

### 3. User Roles & Permissions

#### 3.1 Admin Role

**Capabilities:**

- Full CRUD operations on car listings
- Manage media assets (images/videos)
- Configure Facebook integration settings
- View analytics dashboard
- Manage user inquiries
- Export data and reports
- System settings management

**Access Control:**

- Protected routes with role-based middleware
- Session timeout after 2 hours of inactivity
- Two-factor authentication (optional but recommended)

#### 3.2 User Role (Customer)

**Capabilities:**

- Browse car inventory
- Advanced search and filtering
- View detailed car information
- Save favorites/wishlist
- Submit inquiries
- Schedule test drives
- Compare vehicles
- Share listings on social media

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

### 7. API Endpoints

#### Core Endpoints

```
Authentication:
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/refresh
POST   /api/auth/forgot-password

Cars:
GET    /api/cars                 (public, paginated)
GET    /api/cars/:id            (public)
POST   /api/cars                (admin only)
PUT    /api/cars/:id            (admin only)
DELETE /api/cars/:id            (admin only)
POST   /api/cars/:id/images     (admin only)
DELETE /api/cars/:id/images/:imageId (admin only)

Search:
GET    /api/search               (public)
GET    /api/filters/options      (public)

Facebook:
POST   /api/facebook/post/:carId (admin only)
GET    /api/facebook/status/:carId (admin only)
DELETE /api/facebook/post/:postId (admin only)

Inquiries:
POST   /api/inquiries            (public)
GET    /api/inquiries            (admin only)
PUT    /api/inquiries/:id       (admin only)

Analytics:
GET    /api/analytics/dashboard  (admin only)
GET    /api/analytics/cars/:id  (admin only)
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
