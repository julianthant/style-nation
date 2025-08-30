'use client';

import * as React from 'react'
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  IconCircleCheckFilled, 
  IconDotsVertical, 
  IconLoader,
  IconPlus,
  IconTrendingUp,
  IconDownload,
  IconFilter,
  IconSearch
} from '@tabler/icons-react';
import { Edit, Eye, Star, StarOff, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { z } from 'zod';

import type { Car, SearchCarsParams } from '@/lib/api/cars';
import { formatMileage, formatPrice, getStatusLabel } from '@/lib/api/cars';
import { useBulkOperations, useCars, useDeleteCar, useToggleFeatured } from '@/lib/hooks/use-cars';
import { DataTable } from '@/components/common/data-table';
import { StatsCards } from '@/components/common/stats-cards';
import { ChartAreaInteractive } from '@/components/common/chart-area-interactive';

import { ColumnDef } from '@tanstack/react-table';

// Schema for table data
export const schema = z.object({
  id: z.string(),
  make: z.string(),
  model: z.string(),
  year: z.number(),
  price: z.number(),
  status: z.string(),
  mileage: z.number().optional(),
  viewCount: z.number(),
  featured: z.boolean(),
  createdAt: z.string(),
  images: z.array(z.object({
    id: z.string(),
    url: z.string(),
    isPrimary: z.boolean(),
    order: z.number()
  })),
  vin: z.string()
})

type CarTableData = z.infer<typeof schema>

export default function CarsPage() {
  const [searchParams, setSearchParams] = React.useState<SearchCarsParams>({
    page: 1,
    limit: 20,
    sortBy: 'newest',
  });

  const [selectedCars, setSelectedCars] = React.useState<string[]>([]);
  const [searchQuery, setSearchQuery] = React.useState('');

  // Hooks
  const { data: carsData, isLoading, error } = useCars(searchParams);
  const deleteCar = useDeleteCar();
  const toggleFeatured = useToggleFeatured();
  const { bulkUpdateStatus, bulkDelete, bulkFeature } = useBulkOperations();

  // Sample stats data - replace with real data from API
  const statsData = {
    totalRevenue: 385000,
    newCustomers: carsData?.total || 0,
    activeAccounts: carsData?.cars?.filter(c => c.status === 'SOLD').length || 0,
    growthRate: 3.2
  };

  const handleDeleteCar = async (carId: string) => {
    if (confirm('Are you sure you want to delete this car? This will mark it as inactive.')) {
      await deleteCar.mutateAsync(carId);
    }
  };

  const handleToggleFeatured = async (carId: string, currentStatus: boolean) => {
    await toggleFeatured.mutateAsync({ id: carId, featured: !currentStatus });
  };

  // Car table columns definition
  const columns: ColumnDef<CarTableData>[] = [
    {
      accessorKey: "car",
      header: "Car",
      cell: ({ row }) => {
        return (
          <Button 
            variant="link" 
            className="text-foreground w-fit px-0 text-left h-auto flex-col items-start"
            asChild
          >
            <Link href={`/dashboard/cars/${row.original.id}`}>
              <div className="flex items-center gap-3">
                <div className="bg-muted rounded w-16 h-12 overflow-hidden">
                  {row.original.images[0] ? (
                    <img
                      src={row.original.images[0].url}
                      alt={`${row.original.year} ${row.original.make} ${row.original.model}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex justify-center items-center w-full h-full text-muted-foreground">
                      <span className="text-xs">No Image</span>
                    </div>
                  )}
                </div>
                <div>
                  <div className="font-medium text-sm">
                    {row.original.year} {row.original.make} {row.original.model}
                  </div>
                  <div className="text-muted-foreground text-xs">
                    VIN: {row.original.vin.slice(-8)}
                  </div>
                </div>
              </div>
            </Link>
          </Button>
        )
      },
      enableHiding: false,
    },
    {
      accessorKey: "price",
      header: "Price",
      cell: ({ row }) => (
        <div className="w-32">
          <Badge variant="outline" className="text-muted-foreground px-1.5">
            {formatPrice(row.original.price)}
          </Badge>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <Badge variant="outline" className="text-muted-foreground px-1.5">
            {status === "AVAILABLE" ? (
              <IconCircleCheckFilled className="fill-green-500 dark:fill-green-400 w-3 h-3 mr-1" />
            ) : status === "SOLD" ? (
              <IconCircleCheckFilled className="fill-blue-500 dark:fill-blue-400 w-3 h-3 mr-1" />
            ) : (
              <IconLoader className="w-3 h-3 mr-1" />
            )}
            {getStatusLabel(status)}
          </Badge>
        )
      },
    },
    {
      accessorKey: "mileage",
      header: () => <div className="w-full text-right">Mileage</div>,
      cell: ({ row }) => (
        <div className="text-right">
          {row.original.mileage ? formatMileage(row.original.mileage) : 'N/A'}
        </div>
      ),
    },
    {
      accessorKey: "views",
      header: () => <div className="w-full text-right">Views</div>,
      cell: ({ row }) => (
        <div className="text-right font-mono">
          {row.original.viewCount.toLocaleString()}
        </div>
      ),
    },
    {
      accessorKey: "featured",
      header: "Featured",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleToggleFeatured(row.original.id, row.original.featured)}
          disabled={toggleFeatured.isPending}
        >
          {row.original.featured ? (
            <Star className="fill-yellow-400 w-4 h-4 text-yellow-400" />
          ) : (
            <StarOff className="w-4 h-4" />
          )}
        </Button>
      ),
    },
    {
      accessorKey: "created",
      header: "Added",
      cell: ({ row }) => (
        <div className="text-sm">
          {new Date(row.original.createdAt).toLocaleDateString()}
        </div>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
              size="icon"
            >
              <IconDotsVertical />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-32">
            <Link href={`/dashboard/cars/${row.original.id}`}>
              <DropdownMenuItem>
                <Eye className="mr-2 w-4 h-4" />
                View Details
              </DropdownMenuItem>
            </Link>
            <Link href={`/dashboard/cars/${row.original.id}/edit`}>
              <DropdownMenuItem>
                <Edit className="mr-2 w-4 h-4" />
                Edit Car
              </DropdownMenuItem>
            </Link>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-destructive"
              onClick={() => handleDeleteCar(row.original.id)}
              disabled={deleteCar.isPending}
            >
              <Trash2 className="mr-2 w-4 h-4" />
              Delete Car
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  // Transform cars data for the table
  const tableData: CarTableData[] = React.useMemo(() => {
    if (!carsData?.cars) return [];
    return carsData.cars.map(car => ({
      id: car.id,
      make: car.make,
      model: car.model,
      year: car.year,
      price: car.price,
      status: car.status,
      mileage: car.mileage,
      viewCount: car.viewCount,
      featured: car.featured,
      createdAt: car.createdAt,
      images: car.images,
      vin: car.vin
    }));
  }, [carsData?.cars]);

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setSearchParams(prev => ({ ...prev, search: query, page: 1 }));
  };

  // Bulk actions
  const handleBulkAction = async (action: 'delete' | 'feature' | 'unfeature') => {
    if (selectedCars.length === 0) return;

    const confirmMessage = `Are you sure you want to ${action} ${selectedCars.length} selected cars?`;
    if (!confirm(confirmMessage)) return;

    switch (action) {
      case 'delete':
        await bulkDelete.mutateAsync(selectedCars);
        break;
      case 'feature':
        await bulkFeature.mutateAsync({ carIds: selectedCars, featured: true });
        break;
      case 'unfeature':
        await bulkFeature.mutateAsync({ carIds: selectedCars, featured: false });
        break;
    }

    setSelectedCars([]);
  };

  // Toolbar component
  const toolbar = (
    <div className="flex sm:flex-row flex-col justify-between gap-4">
      <div className="flex flex-1 gap-2 max-w-md">
        <div className="relative flex-1">
          <IconSearch className="top-1/2 left-3 absolute w-4 h-4 text-muted-foreground -translate-y-1/2 transform" />
          <Input
            placeholder="Search cars by make, model, VIN..."
            value={searchQuery}
            onChange={e => handleSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button variant="outline" size="icon">
          <IconFilter className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex gap-2">
        {selectedCars.length > 0 && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkAction('feature')}
              disabled={bulkFeature.isPending}
            >
              Feature Selected
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkAction('unfeature')}
              disabled={bulkFeature.isPending}
            >
              Unfeature Selected
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleBulkAction('delete')}
              disabled={bulkDelete.isPending}
            >
              Delete Selected
            </Button>
          </>
        )}
        <Button variant="outline" size="sm">
          <IconDownload className="mr-2 w-4 h-4" />
          Export
        </Button>
      </div>
    </div>
  );

  if (error) {
    return (
      <div className="mx-auto p-6 container">
        <div className="text-red-600 text-center">
          <p>Failed to load cars. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="@container/main space-y-6">
      {/* Stats Cards */}
      <StatsCards stats={statsData} />

      {/* Analytics Chart */}
      <div className="px-4 lg:px-6">
        <ChartAreaInteractive 
          title="Car Activity Overview"
          description="Car views and customer inquiries over time"
        />
      </div>

      {/* Cars Table */}
      <DataTable
        columns={columns}
        data={tableData}
        getRowId={(row) => row.id}
        onAdd={() => window.location.href = '/dashboard/cars/create'}
        addButtonText="Add Car"
        toolbar={toolbar}
        tabs={[
          {
            value: "cars",
            label: "All Cars",
            badge: carsData?.total,
          },
          {
            value: "available",
            label: "Available", 
            badge: carsData?.cars?.filter(c => c.status === 'AVAILABLE').length,
          },
          {
            value: "sold",
            label: "Sold",
            badge: carsData?.cars?.filter(c => c.status === 'SOLD').length,
          },
          {
            value: "analytics",
            label: "Analytics",
            content: (
              <div className="space-y-6">
                <ChartAreaInteractive 
                  title="Detailed Analytics"
                  description="Advanced metrics for car performance"
                />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="bg-muted rounded-lg p-6">
                    <h3 className="font-semibold mb-2">Top Performing Cars</h3>
                    <p className="text-sm text-muted-foreground">Cars with highest views and inquiries</p>
                  </div>
                  <div className="bg-muted rounded-lg p-6">
                    <h3 className="font-semibold mb-2">Conversion Metrics</h3>
                    <p className="text-sm text-muted-foreground">Views to inquiry conversion rates</p>
                  </div>
                  <div className="bg-muted rounded-lg p-6">
                    <h3 className="font-semibold mb-2">Popular Makes & Models</h3>
                    <p className="text-sm text-muted-foreground">Most viewed car categories</p>
                  </div>
                </div>
              </div>
            )
          },
        ]}
      />
    </div>
  );
}