import { ReactNode } from 'react'
import Image from 'next/image'
import { Card } from '@/components/ui/card'

interface AuthLayoutProps {
  children: ReactNode
  title: string
  subtitle: string
  showHero?: boolean
}

export function AuthLayout({ 
  children, 
  title, 
  subtitle, 
  showHero = true 
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex">
      {/* Hero Section - Hidden on mobile, shown on desktop */}
      {showHero && (
        <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-700">
            <div className="absolute inset-0 bg-black/20" />
            <div className="relative h-full flex flex-col justify-between p-12 text-white">
              {/* Brand Logo */}
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                  <span className="text-2xl font-bold">SN</span>
                </div>
                <div className="text-2xl font-bold">Style Nation</div>
              </div>

              {/* Hero Content */}
              <div className="space-y-6">
                <h1 className="text-5xl font-bold leading-tight">
                  Your Premier
                  <br />
                  Car Showroom
                </h1>
                <p className="text-xl text-white/80 max-w-md">
                  Discover exceptional vehicles with unmatched quality and service. 
                  Join thousands of satisfied customers.
                </p>
                
                {/* Features */}
                <div className="space-y-4 pt-8">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                    <span className="text-white/90">Curated vehicle collection</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                    <span className="text-white/90">Expert consultation</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                    <span className="text-white/90">Seamless buying experience</span>
                  </div>
                </div>
              </div>

              {/* Bottom Quote */}
              <div className="border-l-4 border-white/30 pl-6">
                <p className="text-white/90 italic">
                  &ldquo;Style Nation made finding my dream car effortless. 
                  Exceptional service from start to finish.&rdquo;
                </p>
                <p className="text-white/70 text-sm mt-2">— Sarah M., Happy Customer</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Form Section */}
      <div className={`flex-1 flex items-center justify-center p-8 ${showHero ? 'lg:w-1/2 xl:w-2/5' : 'w-full'}`}>
        <div className="w-full max-w-md space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            {/* Mobile Brand (only shown when hero is hidden) */}
            <div className="lg:hidden flex items-center justify-center space-x-3 mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-700 rounded-xl flex items-center justify-center">
                <span className="text-2xl font-bold text-white">SN</span>
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Style Nation
              </div>
            </div>

            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {title}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-base max-w-sm mx-auto">
              {subtitle}
            </p>
          </div>

          {/* Form Card */}
          <Card className="p-8 shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            {children}
          </Card>

          {/* Footer */}
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            By continuing, you agree to our{' '}
            <a href="/terms" className="text-blue-600 hover:text-blue-500 transition-colors">
              Terms of Service
            </a>
            {' '}and{' '}
            <a href="/privacy" className="text-blue-600 hover:text-blue-500 transition-colors">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}