'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye, 
  Car,
  TrendingUp,
  DollarSign,
  Users,
  AlertCircle,
  Loader2,
  Star,
  StarOff
} from 'lucide-react'
import { carsAPI, type SearchCarsParams, type CarStatistics } from '@/lib/api/cars'
import { Car } from '@/lib/types/car'
import { formatPrice, formatMileage } from '@/lib/utils/placeholder'

interface CarManagementDashboardProps {
  onCreateCar: () => void
  onEditCar: (car: Car) => void
  onViewCar: (car: Car) => void
}

export function CarManagementDashboard({ 
  onCreateCar, 
  onEditCar, 
  onViewCar 
}: CarManagementDashboardProps) {
  const [cars, setCars] = useState<Car[]>([])
  const [statistics, setStatistics] = useState<CarStatistics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)

  // Fetch statistics
  const fetchStatistics = async () => {
    try {
      const stats = await carsAPI.getStatistics()
      setStatistics(stats)
    } catch (err) {
      console.error('Failed to fetch statistics:', err)
    }
  }

  // Fetch cars
  const fetchCars = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const params: SearchCarsParams = {
        search: searchTerm || undefined,
        status: statusFilter === 'ALL' ? undefined : [statusFilter],
        page: currentPage,
        limit: 10,
        sortBy: 'newest',
      }
      
      const response = await carsAPI.getCars(params)
      setCars(response.cars)
      setTotalPages(response.totalPages)
    } catch (err) {
      console.error('Error fetching cars:', err)
      setError('Failed to load cars')
      setCars([])
    } finally {
      setIsLoading(false)
    }
  }

  // Initial load
  useEffect(() => {
    Promise.all([fetchStatistics(), fetchCars()])
  }, [])

  // Refetch when filters change
  useEffect(() => {
    fetchCars()
  }, [searchTerm, statusFilter, currentPage])

  const handleDeleteCar = async (car: Car) => {
    if (window.confirm(`Are you sure you want to delete ${car.year} ${car.make} ${car.model}?`)) {
      try {
        await carsAPI.deleteCar(car.id)
        fetchCars()
        fetchStatistics()
      } catch (err) {
        console.error('Failed to delete car:', err)
        alert('Failed to delete car. Please try again.')
      }
    }
  }

  const handleFeatureCar = async (car: Car) => {
    try {
      // Feature car for 30 days by default
      const featuredUntil = new Date()
      featuredUntil.setDate(featuredUntil.getDate() + 30)
      
      await carsAPI.featureCar(car.id, featuredUntil)
      fetchCars()
      fetchStatistics()
    } catch (err) {
      console.error('Failed to feature car:', err)
      alert('Failed to feature car. Please try again.')
    }
  }

  const handleUnfeatureCar = async (car: Car) => {
    try {
      await carsAPI.unfeatureCar(car.id)
      fetchCars()
      fetchStatistics()
    } catch (err) {
      console.error('Failed to unfeature car:', err)
      alert('Failed to unfeature car. Please try again.')
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      AVAILABLE: 'default' as const,
      SOLD: 'secondary' as const,
      RESERVED: 'outline' as const,
      INACTIVE: 'destructive' as const,
    }
    return variants[status as keyof typeof variants] || 'default'
  }

  const getConditionBadge = (condition: string) => {
    const variants = {
      NEW: 'default' as const,
      USED: 'secondary' as const,
      CERTIFIED_PREOWNED: 'outline' as const,
    }
    return variants[condition as keyof typeof variants] || 'secondary'
  }

  if (error && !cars.length) {
    return (
      <div className="p-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => { fetchCars(); fetchStatistics(); }}
              className="ml-4"
            >
              Try Again
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Car Management</h1>
          <p className="text-muted-foreground">Manage your car inventory and listings</p>
        </div>
        <Button onClick={onCreateCar} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add New Car
        </Button>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Cars</CardTitle>
              <Car className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.totalCars}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{statistics.availableCars}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sold</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{statistics.soldCars}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.totalViews.toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search cars..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Status</SelectItem>
            <SelectItem value="AVAILABLE">Available</SelectItem>
            <SelectItem value="SOLD">Sold</SelectItem>
            <SelectItem value="RESERVED">Reserved</SelectItem>
            <SelectItem value="INACTIVE">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Cars Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vehicle</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Mileage</TableHead>
                <TableHead>Condition</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Views</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="w-16 h-12 bg-muted rounded animate-pulse" />
                        <div className="space-y-1">
                          <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                          <div className="h-3 w-24 bg-muted rounded animate-pulse" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell><div className="h-4 w-16 bg-muted rounded animate-pulse" /></TableCell>
                    <TableCell><div className="h-4 w-16 bg-muted rounded animate-pulse" /></TableCell>
                    <TableCell><div className="h-4 w-16 bg-muted rounded animate-pulse" /></TableCell>
                    <TableCell><div className="h-4 w-16 bg-muted rounded animate-pulse" /></TableCell>
                    <TableCell><div className="h-4 w-8 bg-muted rounded animate-pulse" /></TableCell>
                    <TableCell><div className="h-4 w-8 bg-muted rounded animate-pulse" /></TableCell>
                  </TableRow>
                ))
              ) : cars.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No cars found. {searchTerm && "Try adjusting your search terms."}
                  </TableCell>
                </TableRow>
              ) : (
                cars.map((car) => {
                  const primaryImage = car.images?.find(img => img.isPrimary) || car.images?.[0]
                  
                  return (
                    <TableRow key={car.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="relative w-16 h-12 bg-muted rounded overflow-hidden">
                            {primaryImage && (
                              <img 
                                src={primaryImage.url} 
                                alt={`${car.make} ${car.model}`}
                                className="w-full h-full object-cover"
                              />
                            )}
                            {car.featuredUntil && new Date(car.featuredUntil) > new Date() && (
                              <div className="absolute top-0 right-0 bg-yellow-500 text-white text-xs rounded-bl p-0.5">
                                <Star className="w-3 h-3" />
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{car.year} {car.make} {car.model}</span>
                              {car.featuredUntil && new Date(car.featuredUntil) > new Date() && (
                                <Badge variant="secondary" className="text-xs">
                                  <Star className="w-3 h-3 mr-1" />
                                  Featured
                                </Badge>
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground">{car.vin}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{formatPrice(Number(car.price))}</TableCell>
                      <TableCell>{formatMileage(car.mileage)}</TableCell>
                      <TableCell>
                        <Badge variant={getConditionBadge(car.condition)}>
                          {car.condition.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadge(car.status)}>
                          {car.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{car.viewCount}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onViewCar(car)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onEditCar(car)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            {car.featuredUntil && new Date(car.featuredUntil) > new Date() ? (
                              <DropdownMenuItem onClick={() => handleUnfeatureCar(car)}>
                                <StarOff className="h-4 w-4 mr-2" />
                                Unfeature
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onClick={() => handleFeatureCar(car)}>
                                <Star className="h-4 w-4 mr-2" />
                                Feature
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem 
                              onClick={() => handleDeleteCar(car)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {!isLoading && totalPages > 1 && (
        <div className="flex justify-center items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          >
            Previous
          </Button>
          
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const pageNum = currentPage <= 3 ? i + 1 : 
                            currentPage >= totalPages - 2 ? totalPages - 4 + i :
                            currentPage - 2 + i
            
            if (pageNum < 1 || pageNum > totalPages) return null
            
            return (
              <Button
                key={pageNum}
                variant={currentPage === pageNum ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(pageNum)}
              >
                {pageNum}
              </Button>
            )
          })}
          
          <Button 
            variant="outline" 
            size="sm" 
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}