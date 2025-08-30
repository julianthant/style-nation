'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  Home, 
  Car, 
  Phone, 
  Info, 
  Menu, 
  Search,
  Heart,
  User,
  X
} from 'lucide-react'

interface MobileHeaderProps {
  variant?: 'hero' | 'default'
  className?: string
}

export function MobileHeader({ variant = 'default', className = '' }: MobileHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSticky, setIsSticky] = useState(false)
  const pathname = usePathname()

  const isHero = variant === 'hero'

  // Handle scroll for sticky navbar effect
  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 100)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Top header styles
  const topHeaderClasses = isHero
    ? `fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isSticky
          ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200'
          : 'bg-transparent'
      }`
    : 'sticky top-0 bg-background/95 backdrop-blur-md border-b border-border z-50 shadow-sm'

  const textClasses = isHero && !isSticky ? 'text-white' : 'text-foreground'
  const logoClasses = isHero && !isSticky ? 'text-white' : 'text-primary'

  // Navigation items for bottom nav
  const navItems = [
    { href: '/', icon: Home, label: 'Home', isActive: pathname === '/' },
    { href: '/cars', icon: Car, label: 'Cars', isActive: pathname === '/cars' || pathname.startsWith('/cars/') },
    { href: '/search', icon: Search, label: 'Search', isActive: pathname === '/search' },
    { href: '/favorites', icon: Heart, label: 'Saved', isActive: pathname === '/favorites' },
    { href: '/contact', icon: Phone, label: 'Contact', isActive: pathname === '/contact' }
  ]

  const menuItems = [
    { href: '/', label: 'Home' },
    { href: '/cars', label: 'Browse Cars' },
    { href: '/finance', label: 'Financing' },
    { href: '/about', label: 'About Us' },
    { href: '/contact', label: 'Contact' },
    { href: '/blog', label: 'Blog' }
  ]

  return (
    <>
      {/* Top Header - Minimal for mobile */}
      <header className={`${topHeaderClasses} ${className}`}>
        <div className="flex items-center justify-between px-4 py-3">
          {/* Logo */}
          <Link 
            href="/" 
            className="flex items-center space-x-2"
          >
            <Car className={`h-6 w-6 ${logoClasses} transition-colors`} />
            <span className={`font-bold text-lg ${logoClasses} transition-colors`}>
              Style Nation
            </span>
          </Link>

          {/* Right Actions */}
          <div className="flex items-center space-x-2">
            {/* Menu Trigger */}
            <Dialog open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`${textClasses} hover:bg-transparent transition-colors`}
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </DialogTrigger>
              
              <DialogContent className="max-w-sm w-full p-0 gap-0">
                <div className="flex flex-col max-h-[80vh]">
                  {/* Header */}
                  <DialogHeader className="px-6 py-4 border-b border-border">
                    <div className="flex items-center space-x-2">
                      <Car className="h-5 w-5 text-primary" />
                      <DialogTitle className="text-lg">Menu</DialogTitle>
                    </div>
                  </DialogHeader>

                  {/* Navigation Links */}
                  <div className="flex-1 py-4 overflow-y-auto">
                    <nav className="space-y-1 px-6">
                      {menuItems.map(({ href, label }) => (
                        <Link
                          key={href}
                          href={href}
                          className="flex items-center px-3 py-3 text-base font-medium text-foreground hover:text-primary hover:bg-muted/50 rounded-lg transition-all duration-200"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          {label}
                        </Link>
                      ))}
                    </nav>
                  </div>

                  {/* CTA Buttons */}
                  <div className="p-6 border-t border-border space-y-3">
                    <Button 
                      asChild
                      className="w-full"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Link href="/cars">Browse Inventory</Link>
                    </Button>
                    <Button 
                      variant="outline"
                      asChild
                      className="w-full"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Link href="/contact">Contact Dealer</Link>
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      {/* Bottom Navigation - Mobile Tab Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border shadow-lg">
        <div className="flex items-center justify-around py-2 px-1 max-w-md mx-auto">
          {navItems.map(({ href, icon: Icon, label, isActive }) => (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center justify-center py-2 px-3 min-w-0 flex-1 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'text-primary bg-primary/10'
                  : 'text-muted-foreground hover:text-primary hover:bg-muted/50'
              }`}
            >
              <Icon className={`h-5 w-5 mb-1 ${isActive ? 'scale-110' : ''} transition-transform`} />
              <span className="text-xs font-medium truncate">{label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Bottom spacing to account for fixed bottom nav */}
      <div className="h-16" />
    </>
  )
}