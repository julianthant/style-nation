# Analytics API Documentation

## Overview

The Analytics API provides comprehensive business intelligence and reporting capabilities for the Style Nation car dealership platform. This module offers real-time insights into car performance, customer inquiries, sales trends, and overall business metrics.

## Features

- **Dashboard Overview**: Key performance indicators and summary statistics
- **Car Performance Analytics**: Detailed metrics for individual cars and inventory
- **Inquiry Trends**: Customer inquiry patterns and conversion analytics
- **Chart Data**: Ready-to-use data for visualization libraries
- **Sales Analytics**: Revenue tracking and sales performance metrics
- **Time-based Analysis**: Flexible date ranges and period comparisons

## Authentication

All analytics endpoints require admin authentication with a valid JWT token:

```http
Authorization: Bearer <jwt-token>
```

## Base URL

```
/api/analytics
```

## Endpoints

### 1. Dashboard Overview

**GET** `/analytics/overview`

Returns comprehensive dashboard statistics for administrative overview.

#### Response Example

```json
{
  "totalCars": 150,
  "availableCars": 120,
  "soldCars": 25,
  "reservedCars": 5,
  "totalInquiries": 85,
  "newInquiries": 12,
  "contactedInquiries": 68,
  "closedInquiries": 5,
  "totalViews": 15420,
  "monthlyViews": 2840,
  "conversionRate": 5.5,
  "averagePrice": 32500.50,
  "featuredCars": 8,
  "averageDaysInInventory": 15
}
```

#### Usage Example

```typescript
// React/Next.js usage
const fetchDashboardOverview = async () => {
  const response = await fetch('/api/analytics/overview', {
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
  });
  const data = await response.json();
  return data;
};

// Node.js/Express usage
app.get('/dashboard', async (req, res) => {
  try {
    const overview = await analyticsService.getDashboardOverview();
    res.json(overview);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});
```

### 2. Car Performance Metrics

**GET** `/analytics/cars/performance`

Returns detailed performance analytics for cars in inventory.

#### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `period` | string | `30d` | Time period: `7d`, `30d`, `90d`, `1y`, `custom` |
| `startDate` | string | - | Start date for custom period (ISO format) |
| `endDate` | string | - | End date for custom period (ISO format) |
| `limit` | number | `20` | Maximum number of cars to return |
| `sortBy` | string | `views` | Sort field |
| `sortOrder` | string | `DESC` | Sort order: `ASC` or `DESC` |

#### Response Example

```json
{
  "cars": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "make": "Toyota",
      "model": "Camry",
      "year": 2023,
      "price": 28500,
      "viewCount": 245,
      "inquiryCount": 8,
      "daysListed": 15,
      "status": "AVAILABLE",
      "featured": true,
      "conversionRate": 3.27
    }
  ],
  "popularMakes": [
    {
      "make": "Toyota",
      "count": 25,
      "totalViews": 1520,
      "totalInquiries": 45,
      "averagePrice": 32500.75
    }
  ],
  "overallConversionRate": 2.5,
  "averageDaysInInventory": 18.5
}
```

#### Usage Example

```typescript
// Fetch top performing cars
const getTopCars = async (period = '30d', limit = 10) => {
  const params = new URLSearchParams({
    period,
    limit: limit.toString(),
    sortBy: 'views',
    sortOrder: 'DESC'
  });

  const response = await fetch(`/api/analytics/cars/performance?${params}`, {
    headers: { 'Authorization': `Bearer ${authToken}` }
  });
  
  return response.json();
};

// Get cars for specific date range
const getCarsInDateRange = async (startDate, endDate) => {
  const params = new URLSearchParams({
    period: 'custom',
    startDate,
    endDate,
    limit: '50'
  });

  const response = await fetch(`/api/analytics/cars/performance?${params}`, {
    headers: { 'Authorization': `Bearer ${authToken}` }
  });
  
  return response.json();
};
```

### 3. Popular Cars

**GET** `/analytics/cars/popular`

Returns the most viewed and highest performing cars.

#### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | number | `10` | Maximum number of cars to return |
| `period` | string | `30d` | Time period for analysis |

#### Response Example

```json
{
  "cars": [
    {
      "id": "car-id-1",
      "make": "Tesla",
      "model": "Model 3",
      "year": 2024,
      "price": 42000,
      "viewCount": 450,
      "inquiryCount": 12,
      "conversionRate": 2.67
    }
  ],
  "popularMakes": [
    {
      "make": "Tesla",
      "count": 8,
      "totalViews": 2100,
      "totalInquiries": 28,
      "averagePrice": 48500
    }
  ]
}
```

### 4. Inquiry Trends

**GET** `/analytics/inquiries/trends`

Returns detailed inquiry analytics and trend data.

#### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `period` | string | `30d` | Time period for analysis |
| `startDate` | string | - | Custom start date |
| `endDate` | string | - | Custom end date |
| `interval` | string | `day` | Grouping interval: `day`, `week`, `month` |

#### Response Example

```json
{
  "trends": [
    {
      "date": "2024-01-15",
      "count": 12,
      "newCount": 8,
      "contactedCount": 3,
      "closedCount": 1
    }
  ],
  "totalInquiries": 85,
  "averagePerDay": 2.3,
  "peakDay": 18,
  "peakDate": "2024-01-20",
  "averageResponseTime": 4.5,
  "conversionRate": 6.8
}
```

#### Usage Example

```typescript
// Fetch inquiry trends for dashboard chart
const getInquiryTrends = async (period = '30d') => {
  const response = await fetch(`/api/analytics/inquiries/trends?period=${period}`, {
    headers: { 'Authorization': `Bearer ${authToken}` }
  });
  
  const data = await response.json();
  
  // Format for Chart.js
  return {
    labels: data.trends.map(trend => trend.date),
    datasets: [{
      label: 'Daily Inquiries',
      data: data.trends.map(trend => trend.count),
      borderColor: '#3B82F6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
    }]
  };
};
```

### 5. Chart Data Endpoints

#### Views Chart

**GET** `/analytics/charts/views`

Returns chart-ready data for car view trends.

```json
{
  "labels": ["2024-01-01", "2024-01-02", "2024-01-03"],
  "datasets": [{
    "label": "Daily Views",
    "data": [120, 150, 98],
    "backgroundColor": "rgba(59, 130, 246, 0.1)",
    "borderColor": "#3B82F6",
    "borderWidth": 2
  }],
  "type": "line",
  "totalViews": 15420,
  "averagePerDay": 512,
  "peakViews": 850
}
```

#### Inquiries Chart

**GET** `/analytics/charts/inquiries`

Returns chart data for inquiry volumes over time.

#### Sales Chart

**GET** `/analytics/charts/sales`

Returns sales performance and revenue chart data.

```json
{
  "labels": ["2024-01-01", "2024-01-02"],
  "datasets": [{
    "label": "Daily Sales ($)",
    "data": [28500, 31200],
    "backgroundColor": "rgba(245, 158, 11, 0.1)",
    "borderColor": "#F59E0B"
  }],
  "type": "line",
  "totalSales": 125000,
  "averagePrice": 28500.50,
  "growthPercentage": 15.5
}
```

### 6. Analytics Summary

**GET** `/analytics/summary`

Returns a comprehensive summary combining key metrics from all analytics endpoints.

#### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `period` | string | `30d` | Time period for summary |

#### Response Example

```json
{
  "overview": {
    "totalCars": 150,
    "totalInquiries": 85,
    "conversionRate": 5.5
  },
  "topCars": [
    {
      "id": "car-1",
      "make": "Tesla",
      "model": "Model 3",
      "viewCount": 450
    }
  ],
  "recentTrends": {
    "viewsTrend": "increasing",
    "inquiriesTrend": "stable", 
    "salesTrend": "decreasing"
  }
}
```

## Frontend Integration Examples

### React Dashboard Component

```typescript
import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';

interface DashboardProps {
  authToken: string;
}

const AnalyticsDashboard: React.FC<DashboardProps> = ({ authToken }) => {
  const [overview, setOverview] = useState(null);
  const [viewsChart, setViewsChart] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [overviewRes, viewsRes] = await Promise.all([
          fetch('/api/analytics/overview', {
            headers: { 'Authorization': `Bearer ${authToken}` }
          }),
          fetch('/api/analytics/charts/views?period=30d', {
            headers: { 'Authorization': `Bearer ${authToken}` }
          })
        ]);

        setOverview(await overviewRes.json());
        setViewsChart(await viewsRes.json());
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [authToken]);

  if (loading) return <div>Loading analytics...</div>;

  return (
    <div className="analytics-dashboard">
      <div className="stats-grid">
        <StatCard 
          title="Total Cars" 
          value={overview?.totalCars} 
          trend="up" 
        />
        <StatCard 
          title="Total Inquiries" 
          value={overview?.totalInquiries} 
          trend="stable" 
        />
        <StatCard 
          title="Conversion Rate" 
          value={`${overview?.conversionRate}%`} 
          trend="up" 
        />
      </div>

      <div className="charts-section">
        <div className="chart-container">
          <h3>Car Views Trend</h3>
          {viewsChart && (
            <Line 
              data={{
                labels: viewsChart.labels,
                datasets: viewsChart.datasets
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: { position: 'top' }
                }
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};
```

### Vue.js Composition API

```typescript
// composables/useAnalytics.ts
import { ref, reactive } from 'vue';

export const useAnalytics = (authToken: string) => {
  const loading = ref(false);
  const error = ref(null);
  const data = reactive({
    overview: null,
    carMetrics: null,
    inquiryTrends: null,
  });

  const fetchOverview = async () => {
    loading.value = true;
    try {
      const response = await fetch('/api/analytics/overview', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      data.overview = await response.json();
    } catch (err) {
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  };

  const fetchCarMetrics = async (period = '30d', limit = 20) => {
    const params = new URLSearchParams({ period, limit: String(limit) });
    const response = await fetch(`/api/analytics/cars/performance?${params}`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    data.carMetrics = await response.json();
  };

  const fetchInquiryTrends = async (period = '30d') => {
    const response = await fetch(`/api/analytics/inquiries/trends?period=${period}`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    data.inquiryTrends = await response.json();
  };

  return {
    loading,
    error,
    data,
    fetchOverview,
    fetchCarMetrics,
    fetchInquiryTrends,
  };
};
```

## Error Handling

### Common HTTP Status Codes

- `200 OK` - Successful request
- `400 Bad Request` - Invalid query parameters or malformed request
- `401 Unauthorized` - Missing or invalid authentication token
- `403 Forbidden` - Insufficient permissions (non-admin user)
- `500 Internal Server Error` - Server-side error

### Error Response Format

```json
{
  "statusCode": 400,
  "message": [
    "period must be one of the following values: 7d, 30d, 90d, 1y, custom"
  ],
  "error": "Bad Request"
}
```

### Error Handling Example

```typescript
const fetchAnalyticsWithErrorHandling = async (endpoint: string) => {
  try {
    const response = await fetch(`/api/analytics/${endpoint}`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    if (error.message.includes('401')) {
      // Handle authentication error
      redirectToLogin();
    } else if (error.message.includes('400')) {
      // Handle validation error
      showValidationError(error.message);
    } else {
      // Handle general error
      showGenericError('Failed to load analytics data');
    }
    throw error;
  }
};
```

## Performance Considerations

### Caching Recommendations

- Cache dashboard overview data for 5-10 minutes
- Cache car performance metrics for 15-30 minutes
- Cache chart data for 1 hour for older date ranges
- Use ETags for conditional requests

### Query Optimization Tips

1. **Use appropriate time periods**: Shorter periods (7d, 30d) are faster than yearly queries
2. **Limit result sets**: Use reasonable limit values (10-50 items)
3. **Batch requests**: Combine related analytics calls when possible
4. **Implement pagination**: For large datasets, use pagination parameters

### Example Caching Implementation

```typescript
class AnalyticsCache {
  private cache = new Map();
  private readonly TTL = 10 * 60 * 1000; // 10 minutes

  async get(key: string, fetcher: () => Promise<any>) {
    const cached = this.cache.get(key);
    
    if (cached && Date.now() - cached.timestamp < this.TTL) {
      return cached.data;
    }

    const data = await fetcher();
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });

    return data;
  }
}

const cache = new AnalyticsCache();

const getCachedOverview = () => cache.get('overview', () => 
  fetch('/api/analytics/overview').then(r => r.json())
);
```

## Best Practices

1. **Authentication**: Always include valid JWT tokens in requests
2. **Error Handling**: Implement comprehensive error handling for all requests
3. **Loading States**: Show appropriate loading indicators during data fetching
4. **Data Refresh**: Implement reasonable refresh intervals (5-15 minutes)
5. **Responsive Design**: Ensure analytics dashboards work on all screen sizes
6. **Data Validation**: Validate and sanitize data before displaying
7. **Performance**: Use pagination and caching for optimal performance

## Rate Limiting

The Analytics API is subject to the same rate limiting as other admin endpoints:
- 100 requests per minute per IP address
- 1000 requests per minute for authenticated admin users

## Support

For technical support or questions about the Analytics API:
- Review this documentation
- Check the Swagger/OpenAPI documentation at `/api/docs`
- Examine the test files for usage examples
- Contact the development team for additional assistance

## Changelog

### Version 1.0.0
- Initial release with core analytics functionality
- Dashboard overview statistics
- Car performance metrics
- Inquiry trend analysis
- Chart data endpoints
- Comprehensive test coverage