'use client';

import { useRouter } from 'next/navigation';
import { BrowseByType } from '@/components/home/browse-by-type';
import { CTASections } from '@/components/home/cta-sections';
import { OnlineEverywhereSection } from '@/components/home/online-everywhere';
import { VehicleShowcase } from '@/components/home/vehicle-showcase';
import { Footer } from '@/components/layout/footer';
import { AdaptiveHeader } from '@/components/adaptive/adaptive-header';
import { AdaptiveHero } from '@/components/adaptive/adaptive-hero';
import type { Car } from '@/lib/types/car';

interface HomePageClientProps {
  initialData: {
    featuredCars: Car[];
    recentCars: Car[];
    popularCars: Car[];
    popularMakes: Array<{ make: string; count: number }>;
    success: boolean;
  };
}

export function HomePageClient({ initialData }: HomePageClientProps) {
  const router = useRouter();

  // Handler functions with proper Next.js navigation
  const handleSearch = (filters: any) => {
    console.log('Search filters:', filters);
    // Navigate to cars page with search filters
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        if (key === 'condition') {
          params.set('condition', filters[key]);
        } else {
          params.set(key, filters[key]);
        }
      }
    });
    router.push(`/cars?${params.toString()}`);
  };

  const handleViewAllVehicles = () => {
    router.push('/cars');
  };

  const handleVehicleClick = (id: string) => {
    router.push(`/cars/${id}`);
  };

  const handleBookmark = (id: string) => {
    console.log('Bookmark vehicle:', id);
    // TODO: Implement bookmark functionality with state management
  };

  const handleViewAllTypes = () => {
    router.push('/cars');
  };

  const handleTypeClick = (type: string) => {
    router.push(`/cars?bodyType=${type.toLowerCase()}`);
  };

  const handleBuyCarClick = () => {
    router.push('/cars');
  };

  const handleSellCarClick = () => {
    router.push('/contact');
  };

  const handleGetStarted = () => {
    router.push('/cars');
  };

  return (
    <div className="bg-background min-h-screen">
      {/* Hero Section with integrated header */}
      <div className="relative">
        <AdaptiveHeader variant="hero" />
        <AdaptiveHero onSearch={handleSearch} />
      </div>

      {/* Vehicle Showcase Section - Pass initial data if available */}
      <VehicleShowcase
        onViewAll={handleViewAllVehicles}
        onVehicleClick={handleVehicleClick}
        onBookmark={handleBookmark}
        initialData={initialData.success ? {
          featuredCars: initialData.featuredCars,
          recentCars: initialData.recentCars,
          popularCars: initialData.popularCars,
        } : undefined}
      />

      {/* Browse by Type Section */}
      <BrowseByType onViewAll={handleViewAllTypes} onTypeClick={handleTypeClick} />

      {/* Call-to-Action Sections */}
      <CTASections onBuyCarClick={handleBuyCarClick} onSellCarClick={handleSellCarClick} />

      {/* Online Everywhere Section */}
      <OnlineEverywhereSection onGetStarted={handleGetStarted} />

      {/* Footer */}
      <Footer />
    </div>
  );
}