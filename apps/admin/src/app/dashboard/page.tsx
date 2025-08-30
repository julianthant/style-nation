'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertCircle,
  Calendar,
  Car,
  DollarSign,
  Eye,
  MessageSquare,
  TrendingUp,
  Users,
} from 'lucide-react';

export default function DashboardPage() {
  // Mock data - replace with real API calls
  const stats = {
    totalCars: 42,
    availableCars: 38,
    soldThisMonth: 8,
    totalInquiries: 156,
    newInquiries: 12,
    totalViews: 2847,
    monthlyRevenue: 245000,
    conversionRate: 3.2,
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-bold text-3xl tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's an overview of your car showroom.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="gap-4 grid md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row justify-between items-center space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">Total Inventory</CardTitle>
            <Car className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">{stats.totalCars}</div>
            <p className="text-muted-foreground text-xs">
              {stats.availableCars} available for sale
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row justify-between items-center space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">Monthly Sales</CardTitle>
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">{stats.soldThisMonth}</div>
            <p className="text-muted-foreground text-xs">+20% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row justify-between items-center space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">New Inquiries</CardTitle>
            <MessageSquare className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">{stats.newInquiries}</div>
            <p className="text-muted-foreground text-xs">{stats.totalInquiries} total inquiries</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row justify-between items-center space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">Monthly Revenue</CardTitle>
            <DollarSign className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">${stats.monthlyRevenue.toLocaleString()}</div>
            <p className="text-muted-foreground text-xs">{stats.conversionRate}% conversion rate</p>
          </CardContent>
        </Card>
      </div>

      <div className="gap-4 grid md:grid-cols-2 lg:grid-cols-7">
        {/* Recent Activity */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates from your showroom</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex justify-center items-center bg-blue-100 rounded-full w-9 h-9">
                  <Car className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="font-medium text-sm leading-none">
                    New car added: 2024 Toyota Camry
                  </p>
                  <p className="text-muted-foreground text-sm">2 hours ago</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex justify-center items-center bg-green-100 rounded-full w-9 h-9">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="font-medium text-sm leading-none">Car sold: 2022 Honda Civic</p>
                  <p className="text-muted-foreground text-sm">5 hours ago</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex justify-center items-center bg-orange-100 rounded-full w-9 h-9">
                  <MessageSquare className="w-4 h-4 text-orange-600" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="font-medium text-sm leading-none">New inquiry for BMW X5</p>
                  <p className="text-muted-foreground text-sm">1 day ago</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex justify-center items-center bg-purple-100 rounded-full w-9 h-9">
                  <Eye className="w-4 h-4 text-purple-600" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="font-medium text-sm leading-none">
                    High interest in Mercedes E-Class
                  </p>
                  <p className="text-muted-foreground text-sm">2 days ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common admin tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="gap-2 grid">
              <button className="flex items-center gap-3 hover:bg-accent p-3 border rounded-lg text-sm text-left">
                <Car className="w-4 h-4" />
                Add New Car
              </button>
              <button className="flex items-center gap-3 hover:bg-accent p-3 border rounded-lg text-sm text-left">
                <MessageSquare className="w-4 h-4" />
                View Inquiries
              </button>
              <button className="flex items-center gap-3 hover:bg-accent p-3 border rounded-lg text-sm text-left">
                <Users className="w-4 h-4" />
                Manage Users
              </button>
              <button className="flex items-center gap-3 hover:bg-accent p-3 border rounded-lg text-sm text-left">
                <Calendar className="w-4 h-4" />
                Schedule Post
              </button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts & Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            System Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3 bg-yellow-50 p-3 rounded-lg">
              <AlertCircle className="w-4 h-4 text-yellow-600" />
              <div>
                <p className="font-medium text-sm">3 cars need updated photos</p>
                <p className="text-muted-foreground text-xs">
                  Some listings are missing primary images
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-blue-50 p-3 rounded-lg">
              <MessageSquare className="w-4 h-4 text-blue-600" />
              <div>
                <p className="font-medium text-sm">5 inquiries pending response</p>
                <p className="text-muted-foreground text-xs">Customer inquiries need attention</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
