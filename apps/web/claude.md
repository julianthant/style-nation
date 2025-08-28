# CLAUDE.md - Style Nation Frontend (Next.js) with Supabase Auth

## Project Overview

Style Nation's frontend is built with Next.js 15.5, using Supabase for authentication and following the simplified authentication pattern as described in the documentation.

## Supabase Authentication Implementation

### Authentication Setup

The authentication system follows the simplified pattern with these key components:

### 1. Supabase Client Setup

#### Frontend Client (`/utils/supabase/client.ts`)
```typescript
import { createBrowserClient } from "@supabase/ssr";

export const getSupabaseFrontendClient = () => {
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )
}
```

#### Server Client (`/utils/supabase/server.ts`)
```typescript
"use server";

import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export default async function createSupabaseServerClient() {
  const cookieStore = await cookies()
  // ... cookie handling implementation
}
```

### 2. Server Actions (`/app/auth/actions/index.ts`)

Server actions handle authentication operations:

```typescript
export async function signInWithEmailAndPassword(data: {
    email: string;
    password: string;
}) {
    const supabase = await createSupabaseServerClient();
    return await supabase.auth.signInWithPassword({ 
        email: data.email, 
        password: data.password 
    });
}

export async function signUpWithEmailAndPassword(data: {
    email: string;
    password: string;
}) {
    const supabase = await createSupabaseServerClient();
    return await supabase.auth.signUp({ 
        email: data.email, 
        password: data.password,
        options: {
            emailRedirectTo: `${process.env.NEXT_PUBLIC_FRONTEND_URL}/login`
        }
    });
}
```

### 3. Login Page (`/app/login/page.tsx`)

Simplified login implementation:

```typescript
'use client';

import { useState } from 'react';
import { signInWithEmailAndPassword } from '../auth/actions';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data, error } = await signInWithEmailAndPassword({ email, password });

    if (error) {
      console.error('Error logging in:', error);
    } else {
      console.log('Logged in successfully:', data);
      router.push('/dashboard');
    }
  };

  // Simple form JSX...
}
```

### 4. Protected Routes (`/app/dashboard/page.tsx`)

Dashboard with session checking and API calls:

```typescript
"use client"

import useAxiosAuth from "@/lib/hooks/useAxiosAuth";
import { getSupabaseFrontendClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react"

export default function DashboardPage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const supabase = getSupabaseFrontendClient();
    const axiosAuth = useAxiosAuth();

    const getProtectedData = async () => {
        const response = await axiosAuth.get('/protected');
        console.log('Protected data:', response.data);
    }

    useEffect(() => {
        const checkSession = async () => {
            const { data } = await supabase.auth.getSession();
            
            if (!data.session) {
                router.push('/login');
            } else {
                setUser(data.session.user);
                getProtectedData();
            }
        }
        checkSession();
    }, []);

    const logout = async () => {
        await supabase.auth.signOut();
        router.push('/login');
    }
    
    return (
        <div>
            <h1>Dashboard</h1>  
            <p>Welcome to the dashboard {user?.email}</p>
            <button onClick={logout}>Logout</button>
        </div>
    )
}
```

## API Integration with Axios

### 1. Axios Setup (`/lib/axios.ts`)

```typescript
import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export default axios.create({
    baseURL: BASE_URL,
    headers: { "Content-Type": "application/json" },
})

export const axiosAuth = axios.create({
    baseURL: BASE_URL,
    headers: { "Content-Type": "application/json" },
})
```

### 2. Authentication Hook (`/lib/hooks/useAxiosAuth.ts`)

```typescript
'use client';

import { useEffect } from "react";
import { axiosAuth } from "../axios";
import { getSupabaseFrontendClient } from "@/utils/supabase/client";

const useAxiosAuth = () => {
    const supabase = getSupabaseFrontendClient();

    useEffect(() => {
        const requestIntercept = axiosAuth.interceptors.request.use(async (config) => {
            const { data: session} = await supabase.auth.getSession();
            let accessToken = session?.session?.access_token;
            
            if (!config.headers['Authorization']) {
                config.headers['Authorization'] = `bearer ${accessToken}`
            }
            return config;
        },
        (error) => Promise.reject(error)
        );
        return () => {
            axiosAuth.interceptors.request.eject(requestIntercept);
        }
    }, [])

    return axiosAuth;
}

export default useAxiosAuth;
```

## Environment Variables

### Required Environment Variables

```bash
# Frontend (.env.local)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000
```

## Project Structure

```
apps/web/src/
├── app/
│   ├── auth/
│   │   └── actions/
│   │       └── index.ts          # Server actions for auth
│   ├── login/
│   │   └── page.tsx              # Simplified login page
│   ├── dashboard/
│   │   └── page.tsx              # Protected dashboard
│   └── layout.tsx
├── lib/
│   ├── axios.ts                  # Axios setup
│   └── hooks/
│       └── useAxiosAuth.ts       # Auth axios hook
├── utils/
│   └── supabase/
│       ├── client.ts             # Browser client
│       └── server.ts             # Server client
└── components/                   # Remove complex auth components
```

## Authentication Flow

### 1. Login Flow
1. User enters email/password in simple form
2. Form calls `signInWithEmailAndPassword` server action
3. Server action uses Supabase to authenticate
4. On success, redirect to `/dashboard`
5. On error, show error message

### 2. Session Management
1. Dashboard checks for session using `supabase.auth.getSession()`
2. If no session, redirect to `/login`
3. If session exists, store user data and make authenticated API calls

### 3. API Calls
1. `useAxiosAuth` hook automatically injects Supabase JWT token
2. Backend validates JWT using Supabase strategy
3. Protected routes return data or 401/403 errors

## Key Changes from Previous Implementation

### Removed Complex Components
- Removed complex Zustand auth store
- Removed OAuth buttons and complex forms
- Removed validation schemas and form libraries for auth
- Simplified to basic HTML forms

### Simplified Architecture
- Server actions for authentication operations
- Direct Supabase client usage instead of custom store
- Simple session checking in components
- Axios interceptor for automatic token injection

### Aligned with Documentation
- Matches the provided Supabase + NestJS documentation pattern
- Uses the exact function names and structure from the docs
- Follows the simplified client-server interaction model

## Usage Examples

### Making Authenticated API Calls

```typescript
// In any component
const axiosAuth = useAxiosAuth();

const fetchData = async () => {
    try {
        const response = await axiosAuth.get('/protected');
        console.log('Data:', response.data);
    } catch (error) {
        console.error('Error:', error);
    }
};
```

### Session Check in Components

```typescript
const supabase = getSupabaseFrontendClient();

useEffect(() => {
    const checkAuth = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            router.push('/login');
        }
    };
    checkAuth();
}, []);
```

## Dependencies

### Key Packages
- `@supabase/ssr`: Server-side rendering support
- `@supabase/supabase-js`: Supabase client
- `axios`: HTTP client for API calls
- Next.js 15.5+ with App Router

### Removed Dependencies
- Complex form libraries (for auth)
- Zustand (auth store)
- Complex validation schemas (for auth)

This simplified implementation aligns with the documentation provided and removes the complexity of the previous authentication system while maintaining full functionality.

## Landing Page Implementation & Best Practices

### Modern Landing Page Architecture

The landing page has been completely redesigned with modern components following React/Next.js best practices:

#### New Component Structure
```
src/components/
├── home/
│   ├── hero-section.tsx          # Hero with search functionality
│   ├── vehicle-showcase.tsx      # "Explore All Vehicles" section  
│   ├── browse-by-type.tsx        # Vehicle type browsing
│   ├── cta-sections.tsx          # "Looking for Car" / "Sell Car" CTAs
│   └── online-everywhere.tsx     # Feature showcase section
├── vehicles/
│   └── vehicle-card.tsx          # Redesigned vehicle cards
├── layout/
│   └── main-header.tsx           # Hero/regular header component
└── ui/ (existing shadcn components)
```

### Theme Implementation

#### New OKLCH Color System
Updated `globals.css` with modern color palette:

```css
:root {
  --background: oklch(1.0000 0 0);
  --foreground: oklch(0.1884 0.0128 248.5103);
  --primary: oklch(0.5699 0.1981 268.5093);  /* Purple accent */
  --font-sans: Open Sans, sans-serif;
  --radius: 1.3rem;                          /* Larger border radius */
  /* ... complete theme variables */
}
```

#### Key Theme Changes
- **Font**: Changed from Geist to Open Sans
- **Colors**: Modern purple-based OKLCH color system
- **Radius**: Increased to 1.3rem for modern design
- **Shadows**: Transparent shadows for clean aesthetics

### State Management Best Practices Implementation

Following the guidelines provided, state management is implemented with these patterns:

#### 1. State Colocation
```typescript
// BAD: State too high in component tree
function App() {
  const [searchFilters, setSearchFilters] = useState({}) // ❌ Too high
  return <HeroSection /> // Only HeroSection needs these
}

// GOOD: State close to component that uses it  
function HeroSection({ onSearch }: HeroSectionProps) {
  const [activeTab, setActiveTab] = useState('All')  // ✅ Local state
  const [filters, setFilters] = useState<SearchFilters>({}) // ✅ Used here
  
  const handleSearch = () => {
    onSearch?.(filters) // Pass up only when needed
  }
}
```

#### 2. Granular State Management
```typescript
// BAD: One large state object
const [vehicleData, setVehicleData] = useState({
  vehicles: [],
  loading: false,
  activeTab: 'Recent Cars',
  bookmarks: []
}) // ❌ Everything re-renders when any part changes

// GOOD: Separate specific states
const [vehicles, setVehicles] = useState([])     // ✅ Only affects vehicle list
const [activeTab, setActiveTab] = useState('Recent Cars') // ✅ Only affects tabs
const [bookmarks, setBookmarks] = useState([])   // ✅ Only affects bookmarked items
```

#### 3. Handler Functions
```typescript
export default function Home() {
  // Handler functions following best practices - keeping state close to components
  const handleSearch = (filters: SearchFilters) => {
    console.log('Search filters:', filters)
    // TODO: Implement search functionality
  }

  const handleVehicleClick = (id: string) => {
    console.log('Vehicle clicked:', id)  
    // TODO: Navigate to vehicle detail page
  }

  // Each section has specific, focused handlers
  return (
    <div>
      <HeroSection onSearch={handleSearch} />
      <VehicleShowcase onVehicleClick={handleVehicleClick} />
    </div>
  )
}
```

### Performance Optimization Implementation

#### 1. Image Optimization
```typescript
// Using Next.js Image component with proper optimization
<Image 
  src={image} 
  alt={title} 
  fill
  className="object-cover"
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 328px"
  loading="lazy"        // ✅ Lazy loading for performance
/>
```

#### 2. Component Optimization
```typescript
// Hover effects with CSS transitions instead of JS
.hover-lift {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.hover-lift:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}
```

#### 3. Event Handler Best Practices
```typescript
// Proper event handling with stopPropagation
const handleBookmark = (e: React.MouseEvent) => {
  e.stopPropagation() // ✅ Prevents parent click events
  onBookmark?.(id)
}
```

### Accessibility Implementation

#### 1. Semantic HTML Structure
```typescript
<section className="py-16 bg-white">
  <div className="container mx-auto px-4">
    <h2 className="text-[40px] font-bold">Browse by Type</h2>
    <nav className="border-b border-[#E9E9E9]">
      <div className="flex gap-8">
        {tabs.map((tab) => (
          <button
            key={tab}
            role="tab"
            aria-selected={activeTab === tab}
            className={/* styling */}
          >
            {tab}
          </button>
        ))}
      </div>
    </nav>
  </div>
</section>
```

#### 2. ARIA Labels and Descriptions
```typescript
<button 
  onClick={handleBookmark}
  className="absolute top-5 right-5"
  aria-label="Bookmark vehicle"  // ✅ Screen reader friendly
>
  <Bookmark className="w-3 h-3" />
</button>
```

#### 3. Keyboard Navigation
```typescript
// Tab focus management with proper focus indicators
const handleKeyDown = (e: React.KeyboardEvent) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault()
    handleClick()
  }
}
```

### Component Design Patterns

#### 1. Prop Interface Design
```typescript
interface VehicleCardProps {
  id: string              // ✅ Required identifiers
  title: string
  description: string
  image: string
  price: string
  // Specification data grouped logically
  mileage: string
  fuelType: string  
  transmission: string
  year: string
  // Optional enhancements
  badge?: {
    text: string
    color: 'green' | 'blue'  // ✅ Strict typing
  }
  // Event handlers with clear naming
  onViewDetails?: (id: string) => void
  onBookmark?: (id: string) => void
}
```

#### 2. Component Composition
```typescript
// Components are composable and focused on single responsibility
function VehicleShowcase({ onViewAll, onVehicleClick, onBookmark }: VehicleShowcaseProps) {
  return (
    <section>
      <SectionHeader onViewAll={onViewAll} />
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      <VehicleGrid>
        {vehicles.map((vehicle) => (
          <VehicleCard
            key={vehicle.id}
            {...vehicle}
            onViewDetails={onVehicleClick}
            onBookmark={onBookmark}
          />
        ))}
      </VehicleGrid>
    </section>
  )
}
```

#### 3. Loading States and Error Handling
```typescript
// Future enhancement pattern for loading states
function VehicleCard({ image, loading = false }: VehicleCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
      <div className="relative h-[219px] w-full">
        {loading ? (
          <div className="animate-pulse bg-muted w-full h-full rounded-t-2xl" />
        ) : (
          <Image src={image} alt={title} fill className="object-cover" />
        )}
      </div>
      {/* ... rest of component */}
    </div>
  )
}
```

### Data Fetching Patterns (Ready for Implementation)

#### 1. SWR Integration Pattern
```typescript
// Future data fetching with SWR (stale-while-revalidate)
import useSWR from 'swr'

function VehicleShowcase() {
  const { data: vehicles, error, isLoading } = useSWR('/api/vehicles', fetcher, {
    revalidateOnFocus: true,
    dedupingInterval: 60000, // Cache for 1 minute
  })

  if (error) return <ErrorState />
  if (isLoading) return <VehicleGridSkeleton />

  return <VehicleGrid vehicles={vehicles} />
}
```

#### 2. Infinite Scrolling Pattern
```typescript
// Pattern ready for infinite scroll implementation
import useSWRInfinite from 'swr/infinite'

const getKey = (pageIndex: number, previousPageData: any) => {
  if (previousPageData && !previousPageData.length) return null
  return `/api/vehicles?page=${pageIndex}&limit=20`
}

const { data, error, size, setSize } = useSWRInfinite(getKey, fetcher)
```

### Hybrid Rendering Strategy Implementation

The landing page is architected for hybrid rendering:

#### SSG for Static Content
```typescript
// Vehicle type data is static - perfect for SSG
export async function getStaticProps() {
  return {
    props: {
      vehicleTypes: VEHICLE_TYPES, // Static data
    },
    revalidate: 86400, // Revalidate once per day
  }
}
```

#### SSR for Dynamic Content  
```typescript
// Vehicle listings need fresh data - use SSR
export async function getServerSideProps() {
  const vehicles = await fetchVehicles()
  return {
    props: { vehicles },
  }
}
```

#### CSR for Interactive Elements
```typescript
// Search functionality uses client-side rendering
'use client'

function HeroSection() {
  const [filters, setFilters] = useState<SearchFilters>({})
  
  // Client-side interaction
  const handleSearch = () => {
    // Filter and search logic
  }
}
```

### Utility Classes and Custom Styles

#### Custom Utility Classes Added
```css
.hover-lift {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.hover-lift:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.line-clamp-1, .line-clamp-2, .line-clamp-3 {
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: var(--lines);
}
```

### TypeScript Best Practices

#### Strict Interface Definitions
```typescript
interface SearchFilters {
  make?: string
  model?: string
  minPrice?: number
  maxPrice?: number
  condition?: string
}

interface VehicleType {
  type: string
  image: string
  icon: React.ReactNode
  gridClass?: string
  onTypeClick?: (type: string) => void
}
```

#### Event Handler Typing
```typescript
// Proper event typing for accessibility
const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault()
    handleClick()
  }
}
```

### Maintenance and Scalability

#### Component Organization
- **Single Responsibility**: Each component has one clear purpose
- **Composition over Inheritance**: Components compose together cleanly  
- **Props Interface Design**: Clear, typed interfaces for all components
- **Event Handler Patterns**: Consistent naming and implementation

#### Future Enhancement Patterns
- **Data Fetching**: Ready for SWR/TanStack Query integration
- **State Management**: Easily upgradeable to Zustand if needed
- **Search Implementation**: Architecture supports advanced filtering
- **Animation**: CSS transitions ready for enhancement with Framer Motion

This implementation showcases modern React/Next.js development patterns while maintaining performance, accessibility, and maintainability standards.