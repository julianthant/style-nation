'use client';

import * as React from 'react';
import { StatsCards } from '@/components/common/stats-cards';
import { ChartAreaInteractive } from '@/components/common/chart-area-interactive';

// Sample analytics data
const analyticsData = {
  totalRevenue: 385000,
  newCustomers: 1234,
  activeAccounts: 45678,
  growthRate: 4.5
};

// Sample chart data for different metrics
const carViewsData = [
  { date: "2024-04-01", cars: 222, inquiries: 150 },
  { date: "2024-04-02", cars: 97, inquiries: 180 },
  { date: "2024-04-03", cars: 167, inquiries: 120 },
  { date: "2024-04-04", cars: 242, inquiries: 260 },
  { date: "2024-04-05", cars: 373, inquiries: 290 },
  { date: "2024-04-06", cars: 301, inquiries: 340 },
  { date: "2024-04-07", cars: 245, inquiries: 180 },
  { date: "2024-04-08", cars: 409, inquiries: 320 },
  { date: "2024-04-09", cars: 59, inquiries: 110 },
  { date: "2024-04-10", cars: 261, inquiries: 190 },
  { date: "2024-04-11", cars: 327, inquiries: 350 },
  { date: "2024-04-12", cars: 292, inquiries: 210 },
  { date: "2024-04-13", cars: 342, inquiries: 380 },
  { date: "2024-04-14", cars: 137, inquiries: 220 },
  { date: "2024-04-15", cars: 120, inquiries: 170 },
];

const salesData = [
  { date: "2024-04-01", sales: 12, revenue: 450000 },
  { date: "2024-04-02", sales: 8, revenue: 320000 },
  { date: "2024-04-03", sales: 15, revenue: 580000 },
  { date: "2024-04-04", sales: 10, revenue: 420000 },
  { date: "2024-04-05", sales: 18, revenue: 690000 },
  { date: "2024-04-06", sales: 14, revenue: 530000 },
  { date: "2024-04-07", sales: 9, revenue: 380000 },
  { date: "2024-04-08", sales: 20, revenue: 750000 },
  { date: "2024-04-09", sales: 7, revenue: 290000 },
  { date: "2024-04-10", sales: 13, revenue: 480000 },
  { date: "2024-04-11", sales: 16, revenue: 610000 },
  { date: "2024-04-12", sales: 11, revenue: 440000 },
  { date: "2024-04-13", sales: 19, revenue: 720000 },
  { date: "2024-04-14", sales: 6, revenue: 270000 },
  { date: "2024-04-15", sales: 12, revenue: 460000 },
];

export default function AnalyticsPage() {
  return (
    <div className="@container/main space-y-6">
      {/* Stats Cards */}
      <StatsCards stats={analyticsData} />

      {/* Main Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 px-4 lg:px-6">
        <ChartAreaInteractive 
          title="Car Views & Inquiries"
          description="Daily car views and customer inquiries"
          data={carViewsData}
        />
        
        <ChartAreaInteractive 
          title="Sales Performance"
          description="Daily sales count and revenue generated"
          data={salesData.map(item => ({
            date: item.date,
            cars: item.sales,
            inquiries: item.revenue / 10000 // Scale down revenue for visualization
          }))}
          config={{
            visitors: {
              label: "Sales Activity",
            },
            cars: {
              label: "Cars Sold",
              color: "var(--primary)",
            },
            inquiries: {
              label: "Revenue (10k)",
              color: "hsl(var(--primary) / 0.7)",
            },
          }}
        />
      </div>

      {/* Additional Analytics Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4 lg:px-6">
        <div className="bg-gradient-to-t from-primary/5 to-card rounded-lg border p-6 shadow-xs">
          <h3 className="font-semibold mb-2 text-lg">Top Performing Cars</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Cars with highest views and conversion rates
          </p>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">2023 Toyota Camry</span>
              <span className="text-sm font-mono text-primary">1,245 views</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">2022 Honda Accord</span>
              <span className="text-sm font-mono text-primary">1,108 views</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">2024 BMW 3 Series</span>
              <span className="text-sm font-mono text-primary">987 views</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-t from-primary/5 to-card rounded-lg border p-6 shadow-xs">
          <h3 className="font-semibold mb-2 text-lg">Conversion Metrics</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Views to inquiry and sales conversion rates
          </p>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">View to Inquiry</span>
              <span className="text-sm font-mono text-green-600">12.4%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Inquiry to Sale</span>
              <span className="text-sm font-mono text-green-600">24.8%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Overall Conversion</span>
              <span className="text-sm font-mono text-green-600">3.1%</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-t from-primary/5 to-card rounded-lg border p-6 shadow-xs">
          <h3 className="font-semibold mb-2 text-lg">Popular Makes & Models</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Most viewed and sold car categories
          </p>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Toyota</span>
              <span className="text-sm font-mono text-primary">28%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Honda</span>
              <span className="text-sm font-mono text-primary">22%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">BMW</span>
              <span className="text-sm font-mono text-primary">18%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Analytics Table */}
      <div className="px-4 lg:px-6">
        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold mb-4 text-lg">Monthly Performance Overview</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">This Month</span>
              <div className="font-semibold text-2xl">127 cars sold</div>
              <div className="text-green-600 text-xs">+15% vs last month</div>
            </div>
            <div>
              <span className="text-muted-foreground">Revenue</span>
              <div className="font-semibold text-2xl">$4.8M</div>
              <div className="text-green-600 text-xs">+12% vs last month</div>
            </div>
            <div>
              <span className="text-muted-foreground">Avg. Sale Price</span>
              <div className="font-semibold text-2xl">$37.8K</div>
              <div className="text-red-600 text-xs">-3% vs last month</div>
            </div>
            <div>
              <span className="text-muted-foreground">Days to Sale</span>
              <div className="font-semibold text-2xl">28 days</div>
              <div className="text-green-600 text-xs">-2 days vs last month</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}