import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function AdminPage() {
  return (
    <div className="px-4 sm:px-0">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600">Manage your car inventory and business settings</p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Car Listings</CardTitle>
            <CardDescription>Manage vehicle inventory</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">Coming Soon</p>
            <p className="text-sm text-muted-foreground">Car management will be available in the next milestone</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Inquiries</CardTitle>
            <CardDescription>Customer inquiries</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">Coming Soon</p>
            <p className="text-sm text-muted-foreground">Inquiry management will be available in the next milestone</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
            <CardDescription>Business configuration</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">Coming Soon</p>
            <p className="text-sm text-muted-foreground">Settings panel will be available in the next milestone</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}