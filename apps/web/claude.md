# CLAUDE.md - Style Nation Public Website

## Project Overview

The Style Nation web application is a modern, public-facing car showroom built with Next.js 15.5. It provides visitors with a beautiful interface to browse car inventory, view detailed car information, and contact the dealership. This application is **completely public** with no authentication system - all content is accessible to everyone.

## Core Architecture

### Public-Only Design
- **No authentication required** - all features are publicly accessible
- **No user accounts** - no registration, login, or user management
- **No protected routes** - every page is open to all visitors
- **Public API integration** - only uses public endpoints from the backend
- **Contact-based inquiries** - users submit inquiries through contact forms

### Three-App Ecosystem
This web app is part of a larger ecosystem:
1. **Public Web App** (this app) - Car browsing and public information
2. **Admin Dashboard** - Separate app for dealership staff to manage inventory
3. **Backend API** - Shared NestJS API serving both applications

## Tech Stack

### Core Framework
- **Framework**: Next.js 15.5 with App Router
- **Language**: TypeScript (strict mode enabled)
- **Styling**: Tailwind CSS + shadcn/ui component library
- **State Management**: Server-side rendering + client-side API calls
- **API Client**: Native fetch API with custom wrapper functions
- **Font**: Inter (Google Fonts)
- **Theme**: Dark/light mode with system detection
- **Deployment**: Optimized for Vercel

### Key Features
- **Server-Side Rendering (SSR)** for SEO and performance
- **Incremental Static Regeneration (ISR)** for dynamic content
- **Responsive Design** with mobile/desktop optimized components
- **Progressive Web App** capabilities
- **SEO Optimization** with structured data and meta tags

## Project Structure

```
apps/web/
├── src/
│   ├── app/                              # Next.js App Router
│   │   ├── cars/                         # Car browsing pages ✅
│   │   │   ├── [id]/                     # Individual car details ✅
│   │   │   │   └── page.tsx              # Car detail page with SSG+ISR ✅
│   │   │   └── page.tsx                  # Car listings with search/filters ✅
│   │   ├── about/                        # Company information ✅
│   │   │   └── page.tsx                  # About us page ✅
│   │   ├── contact/                      # Contact information ✅
│   │   │   └── page.tsx                  # Contact forms and info ✅
│   │   ├── blog/                         # Optional blog/articles ✅
│   │   │   └── page.tsx                  # Blog listing page ✅
│   │   ├── layout.tsx                    # Root layout with providers ✅
│   │   ├── page.tsx                      # Homepage with SSG ✅
│   │   ├── loading.tsx                   # Global loading UI
│   │   ├── error.tsx                     # Global error boundaries
│   │   ├── not-found.tsx                 # 404 page
│   │   └── globals.css                   # Global styles and CSS variables ✅
│   │
│   ├── components/                       # React components
│   │   ├── ui/                          # shadcn/ui base components ✅
│   │   │   ├── button.tsx               # Button variants ✅
│   │   │   ├── card.tsx                 # Card layouts ✅
│   │   │   ├── input.tsx                # Form inputs ✅
│   │   │   ├── dialog.tsx               # Modal dialogs ✅
│   │   │   ├── skeleton.tsx             # Loading skeletons ✅
│   │   │   └── ...                      # Other UI primitives ✅
│   │   │
│   │   ├── adaptive/                    # Responsive wrapper components ✅
│   │   │   ├── adaptive-header.tsx      # Auto mobile/desktop header ✅
│   │   │   ├── adaptive-hero.tsx        # Hero section variants ✅
│   │   │   ├── adaptive-car-listing.tsx # Car grid variants ✅
│   │   │   ├── adaptive-layout.tsx      # Page layout wrapper ✅
│   │   │   └── device-provider.tsx      # Device detection context ✅
│   │   │
│   │   ├── mobile/                      # Mobile-specific components ✅
│   │   │   ├── layout/                  # Mobile layouts ✅
│   │   │   │   └── mobile-header.tsx    # Touch-optimized header ✅
│   │   │   ├── home/                    # Mobile homepage sections ✅
│   │   │   │   └── mobile-hero.tsx      # Full-screen mobile hero ✅
│   │   │   └── cars/                    # Mobile car components ✅
│   │   │       ├── mobile-car-card.tsx  # Touch-friendly car cards ✅
│   │   │       └── mobile-car-listing.tsx # Mobile grid layout ✅
│   │   │
│   │   ├── desktop/                     # Desktop-specific components ✅
│   │   │   ├── layout/                  # Desktop layouts ✅
│   │   │   │   └── desktop-header.tsx   # Desktop navigation ✅
│   │   │   ├── home/                    # Desktop homepage sections ✅
│   │   │   │   └── desktop-hero.tsx     # Wide desktop hero ✅
│   │   │   └── cars/                    # Desktop car components ✅
│   │   │       ├── desktop-car-card.tsx # Hover-optimized cards ✅
│   │   │       └── desktop-car-listing.tsx # Multi-column layout ✅
│   │   │
│   │   ├── cars/                        # Car-related components ✅
│   │   │   ├── car-detail-page.tsx      # Complete car detail view ✅
│   │   │   ├── car-detail-gallery.tsx   # Image gallery ✅
│   │   │   ├── car-detail-info.tsx      # Car specifications ✅
│   │   │   ├── car-detail-sidebar.tsx   # Contact/inquiry sidebar ✅
│   │   │   ├── car-listing.tsx          # Car grid component ✅
│   │   │   ├── enhanced-car-listing.tsx # Advanced car listing ✅
│   │   │   ├── filter-sidebar.tsx       # Search filters ✅
│   │   │   ├── advanced-filters.tsx     # Advanced filtering ✅
│   │   │   ├── quick-search.tsx         # Search input ✅
│   │   │   ├── search-results.tsx       # Search result display ✅
│   │   │   ├── featured-cars-section.tsx # Featured cars ✅
│   │   │   └── cars-page-client.tsx     # Client-side cars page ✅
│   │   │
│   │   ├── home/                        # Homepage sections ✅
│   │   │   ├── hero-section.tsx         # Main hero section ✅
│   │   │   ├── vehicle-showcase.tsx     # Featured vehicles ✅
│   │   │   ├── browse-by-type.tsx       # Category browsing ✅
│   │   │   ├── cta-sections.tsx         # Call-to-action blocks ✅
│   │   │   ├── online-everywhere.tsx    # Service highlights ✅
│   │   │   └── home-page-client.tsx     # Client component wrapper ✅
│   │   │
│   │   ├── forms/                       # Contact and inquiry forms ✅
│   │   │   ├── inquiry-form.tsx         # Car-specific inquiries ✅
│   │   │   ├── contact-form.tsx         # General contact form
│   │   │   └── newsletter-form.tsx      # Email subscription
│   │   │
│   │   ├── layout/                      # Layout components ✅
│   │   │   ├── main-header.tsx          # Main navigation ✅
│   │   │   ├── footer.tsx               # Site footer ✅
│   │   │   └── breadcrumbs.tsx          # Navigation breadcrumbs
│   │   │
│   │   ├── vehicles/                    # Vehicle display components ✅
│   │   │   └── vehicle-card.tsx         # Reusable vehicle card ✅
│   │   │
│   │   └── providers/                   # Context providers ✅
│   │       ├── theme-provider.tsx       # Dark/light theme ✅
│   │       └── query-provider.tsx       # React Query setup ✅
│   │
│   ├── lib/                             # Utility libraries and functions
│   │   ├── api/                         # API integration layer ✅
│   │   │   ├── cars.ts                  # Car data fetching ✅
│   │   │   ├── inquiries.ts             # Inquiry submissions ✅
│   │   │   ├── contact.ts               # Contact form handling ✅
│   │   │   ├── server-cars.ts           # Server-side car API ✅
│   │   │   └── index.ts                 # Consolidated exports ✅
│   │   │
│   │   ├── hooks/                       # Custom React hooks ✅
│   │   │   ├── use-cars.ts              # Car data management ✅
│   │   │   ├── use-search.ts            # Search functionality
│   │   │   └── use-filters.ts           # Filter state management
│   │   │
│   │   ├── types/                       # TypeScript type definitions ✅
│   │   │   ├── car.ts                   # Car and related interfaces ✅
│   │   │   ├── inquiry.ts               # Inquiry types
│   │   │   └── index.ts                 # Type exports
│   │   │
│   │   ├── utils/                       # Utility functions ✅
│   │   │   ├── placeholder.ts           # Placeholder helpers ✅
│   │   │   ├── device-detection.ts      # Device detection ✅
│   │   │   ├── formatters.ts            # Data formatting
│   │   │   └── constants.ts             # App constants
│   │   │
│   │   ├── axios.ts                     # HTTP client configuration ✅
│   │   └── utils.ts                     # Common utilities (cn, etc.) ✅
│   │
│   └── middleware.ts                    # Next.js middleware (minimal)
│
├── public/                              # Static assets
│   ├── images/                          # Image assets
│   ├── icons/                           # Icon files
│   └── favicon.ico                      # Site favicon
│
├── .env.local                           # Environment variables
├── next.config.ts                       # Next.js configuration
├── tailwind.config.ts                   # Tailwind CSS config
├── components.json                      # shadcn/ui configuration ✅
├── tsconfig.json                        # TypeScript configuration
├── package.json                         # Dependencies and scripts
└── claude.md                            # This documentation file
```

## API Integration Architecture

### Public API Endpoints
The web app exclusively uses public API endpoints that require no authentication:

```typescript
// Car browsing (public access)
GET /api/cars                    // List available cars with pagination/filters
GET /api/cars/featured          // Get featured cars for homepage
GET /api/cars/:id               // Get individual car details
GET /api/cars/:id/images        // Get car image gallery
GET /api/cars/popular-makes     // Get popular car makes with counts
POST /api/cars/:id/views        // Increment car view count

// Contact and inquiries (public submissions)
POST /api/inquiries             // Submit car-specific inquiry
POST /api/contact               // Submit general contact form

// System status (public)
GET /api/health                 // API health check
```

### API Client Implementation

```typescript
// lib/api/cars.ts - Car data fetching
import axios from '@/lib/axios';

export class CarsAPI {
  async getCars(params: SearchCarsParams = {}) {
    const response = await axios.get('/cars', { params });
    return response.data;
  }

  async getCar(id: string) {
    const response = await axios.get(`/cars/${id}`);
    return response.data;
  }

  async getFeaturedCars(limit = 10) {
    const response = await axios.get('/cars/featured', { 
      params: { limit } 
    });
    return response.data;
  }

  async getPopularMakes(limit = 20) {
    const response = await axios.get('/cars/popular-makes', { 
      params: { limit } 
    });
    return response.data;
  }

  async incrementViewCount(id: string) {
    await axios.post(`/cars/${id}/views`);
  }
}

export const carsAPI = new CarsAPI();
```

```typescript
// lib/api/inquiries.ts - Contact forms
export class InquiriesAPI {
  async submitInquiry(inquiry: CreateInquiryRequest) {
    const response = await axios.post('/inquiries', inquiry);
    return response.data;
  }

  async submitContact(contact: ContactRequest) {
    const response = await axios.post('/contact', contact);
    return response.data;
  }
}

export const inquiriesAPI = new InquiriesAPI();
```

### Server-Side Data Fetching

```typescript
// lib/api/server-cars.ts - For server components
export class ServerCarsAPI {
  async getCars(params = {}) {
    const url = new URL('/cars', API_BASE_URL);
    // Add search params...
    
    const response = await fetch(url.toString(), {
      cache: 'no-store', // Always fetch fresh data
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch cars: ${response.status}`);
    }
    
    return response.json();
  }

  async getFeaturedCars(limit = 10) {
    // Similar implementation for server-side fetching
  }
}

export const serverCarsAPI = new ServerCarsAPI();
```

## Component Architecture

### Adaptive Component System
The app uses a three-tier component system for optimal user experience across devices:

#### 1. Device-Specific Components
- **Mobile Components** (`components/mobile/`) - Touch-optimized, full-width layouts
- **Desktop Components** (`components/desktop/`) - Mouse-friendly, multi-column layouts
- **Adaptive Wrappers** (`components/adaptive/`) - Smart components that choose the right version

#### 2. Device Detection System

```typescript
// components/adaptive/device-provider.tsx
export function useDevice() {
  const [device, setDevice] = useState<'mobile' | 'desktop'>('desktop');
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      const isMobile = window.innerWidth < 768 || 
                      /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      setDevice(isMobile ? 'mobile' : 'desktop');
      setIsHydrated(true);
    };
    
    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  return { device, isMobile: device === 'mobile', isHydrated };
}
```

#### 3. Adaptive Component Pattern

```typescript
// components/adaptive/adaptive-header.tsx
export function AdaptiveHeader({ variant = 'default' }) {
  const { isMobile, isHydrated } = useDevice();

  // Prevent hydration mismatch
  if (!isHydrated) {
    return <div className="h-16" />; // Placeholder
  }

  return isMobile ? 
    <MobileHeader variant={variant} /> : 
    <DesktopHeader variant={variant} />;
}
```

### Data Fetching Patterns

#### 1. Server-Side Rendering (Homepage)

```typescript
// app/page.tsx
export default async function HomePage() {
  // Server-side data fetching for SEO and performance
  const [featuredCars, recentCars] = await Promise.all([
    serverCarsAPI.getFeaturedCars(8),
    serverCarsAPI.getCars({ limit: 8, sortBy: 'newest' })
  ]);

  return (
    <HomePageClient 
      initialData={{ featuredCars, recentCars }}
    />
  );
}

// Enable ISR for updated data
export const revalidate = 1800; // 30 minutes
```

#### 2. Static Generation with ISR (Car Details)

```typescript
// app/cars/[id]/page.tsx
export default async function CarDetailPage({ params }) {
  try {
    const car = await serverCarsAPI.getCar(params.id);
    return <CarDetailPage car={car} />;
  } catch (error) {
    notFound();
  }
}

// Generate static params for popular cars
export async function generateStaticParams() {
  const featuredCars = await serverCarsAPI.getFeaturedCars(20);
  return featuredCars.map(car => ({ id: car.id }));
}

// Enable ISR for car updates
export const revalidate = 600; // 10 minutes
```

#### 3. Client-Side Data Fetching (Search/Filters)

```typescript
// lib/hooks/use-cars.ts
export function useCars(params?: SearchCarsParams) {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCars = async () => {
    try {
      setLoading(true);
      const response = await carsAPI.getCars(params);
      setCars(response.cars);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load cars');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCars();
  }, [JSON.stringify(params)]);

  return { cars, loading, error, refetch: fetchCars };
}
```

## Form Handling

### Car Inquiry Form

```typescript
// components/forms/inquiry-form.tsx
export function InquiryForm({ carId, carName, onSuccess }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(inquirySchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      message: carName ? `I'm interested in the ${carName}. Please contact me.` : '',
    },
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await inquiriesAPI.submitInquiry({ ...data, carId });
      toast({
        title: 'Inquiry Sent!',
        description: 'We\'ll contact you soon with more information.',
      });
      form.reset();
      onSuccess?.();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send inquiry. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* Form fields */}
    </form>
  );
}
```

### Contact Form

```typescript
// components/forms/contact-form.tsx
export function ContactForm({ onSuccess }) {
  const onSubmit = async (data) => {
    try {
      await contactAPI.submitContact(data);
      // Handle success
    } catch (error) {
      // Handle error
    }
  };

  return <form>{/* Contact form fields */}</form>;
}
```

## SEO and Performance Optimization

### Meta Data Implementation

```typescript
// app/cars/[id]/page.tsx
export async function generateMetadata({ params }): Promise<Metadata> {
  const car = await serverCarsAPI.getCar(params.id);
  
  return {
    title: `${car.year} ${car.make} ${car.model} - Style Nation`,
    description: `${car.description.substring(0, 160)}...`,
    openGraph: {
      title: `${car.year} ${car.make} ${car.model}`,
      description: car.description,
      images: car.images?.map(img => img.url) || [],
      type: 'product',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${car.year} ${car.make} ${car.model}`,
      description: car.description,
      images: car.images?.[0]?.url,
    },
  };
}
```

### Structured Data

```typescript
// components/cars/car-structured-data.tsx
export function CarStructuredData({ car }) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Vehicle',
    name: `${car.year} ${car.make} ${car.model}`,
    brand: { '@type': 'Brand', name: car.make },
    model: car.model,
    vehicleModelDate: car.year.toString(),
    price: car.price.toString(),
    priceCurrency: 'USD',
    mileage: car.mileage,
    fuelType: car.fuelType,
    vehicleTransmission: car.transmissionType,
    bodyType: car.bodyType,
    vehicleCondition: car.condition,
    image: car.images?.map(img => img.url) || [],
    offers: {
      '@type': 'Offer',
      price: car.price.toString(),
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
```

## Environment Configuration

```bash
# apps/web/.env.local

# API Configuration (required)
NEXT_PUBLIC_API_URL=http://localhost:3001/api

# Site Configuration
NEXT_PUBLIC_SITE_NAME="Style Nation"
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Company Information
NEXT_PUBLIC_COMPANY_NAME="Style Nation Auto"
NEXT_PUBLIC_COMPANY_PHONE="+1-555-0123"
NEXT_PUBLIC_COMPANY_EMAIL="info@stylenation.com"
NEXT_PUBLIC_COMPANY_ADDRESS="123 Auto Lane, Car City, CC 12345"

# Analytics (optional)
NEXT_PUBLIC_GA_TRACKING_ID=your_ga_tracking_id

# Social Media Links (optional)
NEXT_PUBLIC_FACEBOOK_URL=https://facebook.com/stylenation
NEXT_PUBLIC_TWITTER_URL=https://twitter.com/stylenation
NEXT_PUBLIC_INSTAGRAM_URL=https://instagram.com/stylenation
```

## Development Workflow

### Getting Started

```bash
# Install dependencies
cd apps/web
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your API URL and other settings

# Start development server
npm run dev

# The app will be available at http://localhost:3000
```

### Available Scripts

```bash
# Development
npm run dev              # Start development server with hot reload
npm run build            # Build production bundle
npm run start            # Start production server
npm run lint             # Lint code with ESLint
npm run type-check       # Run TypeScript compiler checks

# Testing
npm run test             # Run unit tests with Jest
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Generate coverage report

# Utilities
npm run analyze          # Analyze bundle size
npm run clean            # Clean build artifacts and node_modules
```

### Code Quality Standards

```json
// tsconfig.json - Strict TypeScript configuration
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

### Performance Best Practices

1. **Image Optimization**
   - Use Next.js Image component with proper sizing
   - Implement lazy loading for car galleries
   - Provide appropriate placeholder images

2. **Code Splitting**
   - Automatic route-based splitting via App Router
   - Dynamic imports for large components
   - Separate bundles for mobile/desktop components

3. **Caching Strategy**
   - SSG for static content (homepage, about)
   - ISR for dynamic content (car listings, details)
   - Client-side caching with SWR or React Query

4. **Bundle Optimization**
   - Tree shaking for unused code elimination
   - Minimize bundle size with appropriate imports
   - Analyze bundle with webpack-bundle-analyzer

## Testing Strategy

### Component Testing

```typescript
// __tests__/components/cars/car-card.test.tsx
import { render, screen } from '@testing-library/react';
import { CarCard } from '@/components/cars/car-card';
import { mockCar } from '@/lib/test-utils/fixtures';

describe('CarCard', () => {
  it('renders car information correctly', () => {
    render(<CarCard car={mockCar} />);
    
    expect(screen.getByText(`${mockCar.year} ${mockCar.make} ${mockCar.model}`))
      .toBeInTheDocument();
    expect(screen.getByText('View Details')).toBeInTheDocument();
    expect(screen.getByText('Contact Us')).toBeInTheDocument();
  });
});
```

### API Integration Testing

```typescript
// __tests__/lib/api/cars.test.ts
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { carsAPI } from '@/lib/api/cars';

const server = setupServer(
  rest.get('/api/cars', (req, res, ctx) => {
    return res(ctx.json({ cars: [mockCar], total: 1 }));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('carsAPI', () => {
  it('fetches cars successfully', async () => {
    const result = await carsAPI.getCars();
    expect(result.cars).toHaveLength(1);
    expect(result.cars[0]).toMatchObject(mockCar);
  });
});
```

## Deployment

### Vercel Deployment (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard:
# NEXT_PUBLIC_API_URL=https://your-api.vercel.app/api
```

### Production Optimizations

```typescript
// next.config.ts
const nextConfig = {
  images: {
    domains: ['images.unsplash.com'],
    formats: ['image/webp', 'image/avif'],
  },
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
  httpAgentOptions: {
    keepAlive: true,
  },
};
```

## Troubleshooting

### Common Issues

1. **Hydration Mismatches**
   - Ensure device detection properly handles SSR/client differences
   - Use `useIsomorphicLayoutEffect` for window-dependent code
   - Provide loading states during hydration

2. **API Connection Issues**
   - Verify NEXT_PUBLIC_API_URL is correctly set
   - Check CORS settings on the backend
   - Ensure API endpoints are accessible from the frontend domain

3. **Image Loading Problems**
   - Add image domains to next.config.ts
   - Implement proper fallback images
   - Use appropriate image sizes for different viewports

4. **Performance Issues**
   - Implement proper loading states
   - Use React.memo for expensive components
   - Optimize database queries in the backend

### Development Tips

1. **Component Development**
   - Build mobile and desktop versions simultaneously
   - Test on actual devices, not just browser dev tools
   - Use adaptive components in pages, not device-specific ones directly

2. **API Integration**
   - Always handle loading and error states
   - Implement proper retry mechanisms for failed requests
   - Use TypeScript interfaces for all API responses

3. **SEO Optimization**
   - Generate structured data for all car listings
   - Implement proper meta tags for social sharing
   - Use meaningful URLs and breadcrumb navigation

This documentation provides a comprehensive guide to the Style Nation public website architecture, focusing on public access patterns, modern React development practices, and optimal user experience across all devices.