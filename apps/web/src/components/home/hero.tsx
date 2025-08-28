'use client'

import Link from 'next/link'
import { Car, Users, Shield, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import useAuthStore from '@/lib/auth-store'
import { UserNav } from '@/components/auth/user-nav'

export function Hero() {
  const { user, loading, initialized } = useAuthStore()

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Navigation */}
      <header className="bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Car className="h-8 w-8 text-primary mr-2" />
              <h1 className="text-xl font-bold text-foreground">Style Nation</h1>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              {initialized && !loading && (
                <>
                  {user ? (
                    <UserNav />
                  ) : (
                    <>
                      <Button variant="ghost" asChild>
                        <Link href="/login">Sign In</Link>
                      </Button>
                      <Button asChild>
                        <Link href="/register">Get Started</Link>
                      </Button>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-4xl sm:text-6xl font-bold text-foreground mb-6">
            Your Premier
            <span className="text-primary"> Car Showroom</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Discover exceptional vehicles, experience outstanding service, and find your perfect car at Style Nation.
          </p>
          
          {user ? (
            <div className="space-x-4">
              <Button size="lg" asChild>
                <Link href="/inventory">Browse Inventory</Link>
              </Button>
              {user && (
                <Button variant="outline" size="lg" asChild>
                  <Link href="/profile">My Profile</Link>
                </Button>
              )}
            </div>
          ) : (
            <div className="space-x-4">
              <Button size="lg" asChild>
                <Link href="/register">Get Started</Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/login">Sign In</Link>
              </Button>
            </div>
          )}
        </div>

        {/* Features */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card>
            <CardHeader className="text-center">
              <Star className="h-12 w-12 text-chart-4 mx-auto mb-4" />
              <CardTitle>Premium Selection</CardTitle>
              <CardDescription>
                Curated collection of the finest vehicles from top brands
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <Users className="h-12 w-12 text-chart-5 mx-auto mb-4" />
              <CardTitle>Expert Service</CardTitle>
              <CardDescription>
                Dedicated team of professionals to help you find your perfect match
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle>Trusted Experience</CardTitle>
              <CardDescription>
                Years of excellence in automotive sales and customer satisfaction
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Status Message */}
        {user && (
          <div className="mt-16 text-center">
            <Card className="max-w-md mx-auto">
              <CardContent className="pt-6">
                <p className="text-muted-foreground">
                  Welcome back, <span className="font-semibold text-foreground">{user.email}</span>!
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Ready to explore our latest inventory?
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}