'use client';

import { useState, useEffect } from 'react';
import { carsAPI, type SearchCarsParams } from '@/lib/api/cars';
import type { Car } from '@/lib/types/car';

interface UseCarsResult {
  cars: Car[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useCars(params?: SearchCarsParams): UseCarsResult {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCars = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await carsAPI.getCars(params);
      setCars(response.cars);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load cars');
      setCars([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCars();
  }, [JSON.stringify(params)]); // Re-fetch when params change

  return {
    cars,
    loading,
    error,
    refetch: fetchCars,
  };
}

interface UseFeaturedCarsResult {
  featuredCars: Car[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useFeaturedCars(limit = 10): UseFeaturedCarsResult {
  const [featuredCars, setFeaturedCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFeaturedCars = async () => {
    try {
      setLoading(true);
      setError(null);
      const cars = await carsAPI.getFeaturedCars(limit);
      setFeaturedCars(cars);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load featured cars');
      setFeaturedCars([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeaturedCars();
  }, [limit]);

  return {
    featuredCars,
    loading,
    error,
    refetch: fetchFeaturedCars,
  };
}

interface UsePopularMakesResult {
  makes: Array<{ make: string; count: number }>;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function usePopularMakes(limit = 20): UsePopularMakesResult {
  const [makes, setMakes] = useState<Array<{ make: string; count: number }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPopularMakes = async () => {
    try {
      setLoading(true);
      setError(null);
      const makesData = await carsAPI.getPopularMakes(limit);
      setMakes(makesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load popular makes');
      setMakes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPopularMakes();
  }, [limit]);

  return {
    makes,
    loading,
    error,
    refetch: fetchPopularMakes,
  };
}