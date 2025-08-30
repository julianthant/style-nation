import { BrowseByType } from '@/components/home/browse-by-type';
import { CTASections } from '@/components/home/cta-sections';
import { OnlineEverywhereSection } from '@/components/home/online-everywhere';
import { VehicleShowcase } from '@/components/home/vehicle-showcase';
import { Footer } from '@/components/layout/footer';
import { AdaptiveHeader } from '@/components/adaptive/adaptive-header';
import { AdaptiveHero } from '@/components/adaptive/adaptive-hero';
import { HomePageClient } from '@/components/home/home-page-client';
import { carsAPI, SortBy } from '@/lib/api/cars';
import type { Car } from '@/lib/types/car';

// Server-side data fetching
async function getHomePageData() {
  try {
    // Fetch data in parallel for better performance
    const [featuredCars, recentCars, popularCars, popularMakes] = await Promise.all([
      carsAPI.getFeaturedCars(8),
      carsAPI.getCars({ limit: 8, sortBy: SortBy.NEWEST }),
      carsAPI.getCars({ limit: 8, sortBy: SortBy.PRICE_DESC }),
      carsAPI.getPopularMakes(10),
    ]);

    return {
      featuredCars: featuredCars || [],
      recentCars: recentCars?.cars || [],
      popularCars: popularCars?.cars || [],
      popularMakes: popularMakes || [],
      success: true,
    };
  } catch (error) {
    console.error('Failed to fetch homepage data:', error);
    // Return empty data but don't throw - let client components handle the API calls
    return {
      featuredCars: [],
      recentCars: [],
      popularCars: [],
      popularMakes: [],
      success: false,
    };
  }
}

export default async function Home() {
  // Fetch data server-side
  const homePageData = await getHomePageData();

  return <HomePageClient initialData={homePageData} />;
}
