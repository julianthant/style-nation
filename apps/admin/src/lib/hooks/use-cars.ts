import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { carsApi, type Car, type SearchCarsParams, type CreateCarData, type UpdateCarData, type CarStatistics } from '../api/cars';

// Query keys
export const carKeys = {
  all: ['cars'] as const,
  lists: () => [...carKeys.all, 'list'] as const,
  list: (params: SearchCarsParams) => [...carKeys.lists(), params] as const,
  details: () => [...carKeys.all, 'detail'] as const,
  detail: (id: string) => [...carKeys.details(), id] as const,
  statistics: () => [...carKeys.all, 'statistics'] as const,
  popularMakes: () => [...carKeys.all, 'popular-makes'] as const,
  featured: (limit: number) => [...carKeys.all, 'featured', limit] as const,
};

// Hook to get cars with pagination and filtering
export function useCars(params: SearchCarsParams = {}) {
  return useQuery({
    queryKey: carKeys.list(params),
    queryFn: () => carsApi.getCars(params),
    placeholderData: (previousData) => previousData,
  });
}

// Hook to get a single car
export function useCar(id: string) {
  return useQuery({
    queryKey: carKeys.detail(id),
    queryFn: () => carsApi.getCar(id),
    enabled: !!id,
  });
}

// Hook to get car statistics
export function useCarStatistics() {
  return useQuery({
    queryKey: carKeys.statistics(),
    queryFn: () => carsApi.getStatistics(),
  });
}

// Hook to get popular makes
export function usePopularMakes(limit = 20) {
  return useQuery({
    queryKey: carKeys.popularMakes(),
    queryFn: () => carsApi.getPopularMakes(limit),
    staleTime: 1000 * 60 * 10, // 10 minutes - this data doesn't change often
  });
}

// Hook to get featured cars
export function useFeaturedCars(limit = 10) {
  return useQuery({
    queryKey: carKeys.featured(limit),
    queryFn: () => carsApi.getFeaturedCars(limit),
  });
}

// Hook to create a new car
export function useCreateCar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (carData: CreateCarData) => carsApi.createCar(carData),
    onSuccess: (newCar) => {
      // Invalidate and refetch car lists
      queryClient.invalidateQueries({ queryKey: carKeys.lists() });
      queryClient.invalidateQueries({ queryKey: carKeys.statistics() });
      
      toast.success('Car created successfully!');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to create car';
      toast.error(message);
    },
  });
}

// Hook to update a car
export function useUpdateCar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCarData }) => 
      carsApi.updateCar(id, data),
    onSuccess: (updatedCar, { id }) => {
      // Update the specific car in cache
      queryClient.setQueryData(carKeys.detail(id), updatedCar);
      
      // Invalidate car lists to ensure they're up to date
      queryClient.invalidateQueries({ queryKey: carKeys.lists() });
      queryClient.invalidateQueries({ queryKey: carKeys.statistics() });
      
      toast.success('Car updated successfully!');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to update car';
      toast.error(message);
    },
  });
}

// Hook to delete a car
export function useDeleteCar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => carsApi.deleteCar(id),
    onSuccess: (_, id) => {
      // Remove car from cache
      queryClient.removeQueries({ queryKey: carKeys.detail(id) });
      
      // Invalidate lists to refetch
      queryClient.invalidateQueries({ queryKey: carKeys.lists() });
      queryClient.invalidateQueries({ queryKey: carKeys.statistics() });
      
      toast.success('Car deleted successfully!');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to delete car';
      toast.error(message);
    },
  });
}

// Hook to hard delete a car
export function useHardDeleteCar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => carsApi.hardDeleteCar(id),
    onSuccess: (_, id) => {
      // Remove car from cache
      queryClient.removeQueries({ queryKey: carKeys.detail(id) });
      
      // Invalidate lists to refetch
      queryClient.invalidateQueries({ queryKey: carKeys.lists() });
      queryClient.invalidateQueries({ queryKey: carKeys.statistics() });
      
      toast.success('Car permanently deleted!');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to permanently delete car';
      toast.error(message);
    },
  });
}

// Hook to toggle featured status
export function useToggleFeatured() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, featured }: { id: string; featured: boolean }) => 
      carsApi.toggleFeaturedStatus(id, featured),
    onSuccess: (updatedCar, { id, featured }) => {
      // Update the specific car in cache
      queryClient.setQueryData(carKeys.detail(id), updatedCar);
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: carKeys.lists() });
      queryClient.invalidateQueries({ queryKey: carKeys.featured(10) });
      queryClient.invalidateQueries({ queryKey: carKeys.statistics() });
      
      toast.success(featured ? 'Car featured successfully!' : 'Car unfeatured successfully!');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to update featured status';
      toast.error(message);
    },
  });
}

// Hook for bulk operations
export function useBulkOperations() {
  const queryClient = useQueryClient();

  const bulkUpdateStatus = useMutation({
    mutationFn: ({ carIds, status }: { carIds: string[]; status: Car['status'] }) =>
      carsApi.bulkUpdateStatus(carIds, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: carKeys.lists() });
      queryClient.invalidateQueries({ queryKey: carKeys.statistics() });
      toast.success('Cars updated successfully!');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to update cars';
      toast.error(message);
    },
  });

  const bulkDelete = useMutation({
    mutationFn: (carIds: string[]) => carsApi.bulkDelete(carIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: carKeys.lists() });
      queryClient.invalidateQueries({ queryKey: carKeys.statistics() });
      toast.success('Cars deleted successfully!');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to delete cars';
      toast.error(message);
    },
  });

  const bulkFeature = useMutation({
    mutationFn: ({ carIds, featured }: { carIds: string[]; featured: boolean }) =>
      carsApi.bulkFeature(carIds, featured),
    onSuccess: (_, { featured }) => {
      queryClient.invalidateQueries({ queryKey: carKeys.lists() });
      queryClient.invalidateQueries({ queryKey: carKeys.featured(10) });
      queryClient.invalidateQueries({ queryKey: carKeys.statistics() });
      toast.success(featured ? 'Cars featured successfully!' : 'Cars unfeatured successfully!');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to update featured status';
      toast.error(message);
    },
  });

  return {
    bulkUpdateStatus,
    bulkDelete,
    bulkFeature,
  };
}

// Hook for image operations
export function useCarImages() {
  const queryClient = useQueryClient();

  const uploadImages = useMutation({
    mutationFn: ({ carId, imageUrls }: { carId: string; imageUrls: string[] }) =>
      carsApi.uploadImages(carId, imageUrls),
    onSuccess: (_, { carId }) => {
      // Refetch the car to get updated images
      queryClient.invalidateQueries({ queryKey: carKeys.detail(carId) });
      toast.success('Images uploaded successfully!');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to upload images';
      toast.error(message);
    },
  });

  const updateImage = useMutation({
    mutationFn: ({ imageId, data }: { imageId: string; data: { isPrimary?: boolean; order?: number } }) =>
      carsApi.updateImage(imageId, data),
    onSuccess: () => {
      // We could be more specific about which car to invalidate if we tracked carId
      queryClient.invalidateQueries({ queryKey: carKeys.details() });
      toast.success('Image updated successfully!');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to update image';
      toast.error(message);
    },
  });

  const deleteImage = useMutation({
    mutationFn: (imageId: string) => carsApi.deleteImage(imageId),
    onSuccess: () => {
      // We could be more specific about which car to invalidate if we tracked carId
      queryClient.invalidateQueries({ queryKey: carKeys.details() });
      toast.success('Image deleted successfully!');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to delete image';
      toast.error(message);
    },
  });

  return {
    uploadImages,
    updateImage,
    deleteImage,
  };
}