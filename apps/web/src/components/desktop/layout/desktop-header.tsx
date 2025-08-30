'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { Car } from 'lucide-react'

interface DesktopHeaderProps {
  variant?: 'hero' | 'default'
  className?: string
}

export function DesktopHeader({ variant = 'default', className = '' }: DesktopHeaderProps) {
  const [isSticky, setIsSticky] = useState(false)

  const isHero = variant === 'hero'

  // Handle scroll for sticky navbar effect
  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 100)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Style classes based on variant and scroll state
  const headerClasses = isHero
    ? `absolute top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isSticky
          ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200'
          : 'bg-transparent'
      }`
    : 'sticky top-0 bg-background/95 backdrop-blur-md border-b border-border z-50 shadow-sm'

  const textClasses = isHero && !isSticky ? 'text-white' : 'text-foreground'
  const logoClasses = isHero && !isSticky ? 'text-white' : 'text-primary'

  const navigationItems = [
    { href: '/', label: 'Home' },
    { href: '/cars', label: 'Inventory' },
    { href: '/finance', label: 'Finance' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' }
  ]

  return (
    <header className={`${headerClasses} ${className}`}>
      <div className="max-w-[1400px] mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo - Left */}
          <Link 
            href="/" 
            className="flex items-center group transition-transform duration-200 hover:scale-105"
          >
            <Car className={`h-8 w-8 ${logoClasses} mr-3 transition-colors`} />
            <span className={`text-xl font-bold ${logoClasses} transition-colors`}>
              Style Nation
            </span>
          </Link>

          {/* Navigation - Center */}
          <nav className="flex items-center space-x-8">
            {navigationItems.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`${textClasses} text-[15px] font-medium relative group transition-colors duration-200 hover:text-primary`}
              >
                {label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-200 group-hover:w-full" />
              </Link>
            ))}
          </nav>

          {/* Actions - Right */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            {!isHero && <ThemeToggle />}
            
            {/* Contact/CTA Buttons */}
            <div className="flex items-center space-x-3">
              <Button 
                variant="ghost" 
                size="sm" 
                asChild
                className={`font-medium transition-colors duration-200 ${
                  isHero && !isSticky 
                    ? 'text-white hover:text-white/80 hover:bg-white/10' 
                    : 'hover:text-primary'
                }`}
              >
                <Link href="/contact">Contact Us</Link>
              </Button>
              
              <Button 
                size="sm" 
                asChild
                className={`font-medium transition-all duration-200 hover:scale-105 ${
                  isHero && !isSticky
                    ? 'bg-white text-[#050B20] hover:bg-white/90 shadow-lg' 
                    : 'bg-primary hover:bg-primary/90'
                }`}
              >
                <Link href="/cars">Shop Now</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}