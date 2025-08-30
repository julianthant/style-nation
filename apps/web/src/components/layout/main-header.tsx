'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { Menu, Car, X } from 'lucide-react'

interface MainHeaderProps {
  variant?: 'hero' | 'default'
  className?: string
}

export function MainHeader({ variant = 'default', className = '' }: MainHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
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

  // Close mobile menu when clicking outside or pressing escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMenuOpen(false)
    }

    if (isMenuOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isMenuOpen])

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

  return (
    <>
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
            <nav className="hidden lg:flex items-center space-x-8">
              {[
                { href: '/', label: 'Home' },
                { href: '/cars', label: 'Inventory' },
                { href: '/finance', label: 'Finance' },
                { href: '/about', label: 'About' },
                { href: '/contact', label: 'Contact' }
              ].map(({ href, label }) => (
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
            <div className="flex items-center space-x-3">
              {!isHero && <ThemeToggle />}
              
              {/* Contact/CTA Buttons - No Authentication */}
              <div className="hidden sm:flex items-center space-x-2">
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

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="sm"
                className={`lg:hidden ${textClasses} hover:bg-transparent transition-colors duration-200`}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Toggle menu"
              >
                {isMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 z-[60] lg:hidden"
          onClick={() => setIsMenuOpen(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          
          {/* Menu Panel */}
          <div 
            className="absolute top-0 right-0 w-80 max-w-[90vw] h-full bg-background border-l border-border shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-border">
                <div className="flex items-center">
                  <Car className="h-6 w-6 text-primary mr-2" />
                  <span className="font-bold text-lg">Menu</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMenuOpen(false)}
                  className="hover:bg-muted"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Navigation Links */}
              <div className="flex-1 py-6">
                <nav className="space-y-1 px-6">
                  {[
                    { href: '/', label: 'Home' },
                    { href: '/cars', label: 'Inventory' },
                    { href: '/finance', label: 'Finance' },
                    { href: '/about', label: 'About' },
                    { href: '/contact', label: 'Contact' }
                  ].map(({ href, label }) => (
                    <Link
                      key={href}
                      href={href}
                      className="flex items-center px-4 py-3 text-[16px] font-medium text-foreground hover:text-primary hover:bg-muted/50 rounded-xl transition-all duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {label}
                    </Link>
                  ))}
                </nav>
              </div>

              {/* Mobile CTA Buttons */}
              <div className="p-6 border-t border-border space-y-3">
                <Button 
                  variant="outline"
                  size="lg"
                  asChild
                  className="w-full font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Link href="/contact">Contact Us</Link>
                </Button>
                <Button 
                  size="lg"
                  asChild
                  className="w-full font-medium bg-primary hover:bg-primary/90"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Link href="/cars">Shop Now</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}