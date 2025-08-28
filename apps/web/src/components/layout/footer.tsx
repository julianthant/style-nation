'use client'

import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react"

export function Footer() {
  const handleNewsletterSignup = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement newsletter signup
    console.log('Newsletter signup clicked')
  }

  return (
    <footer className="bg-white dark:bg-gray-900 text-[#050B20] dark:text-white">
      {/* Newsletter Section */}
      <div className="border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-[1400px] mx-auto px-6 py-12 md:py-16">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="text-left">
              <h2 className="text-2xl md:text-3xl font-medium mb-2">Join Style Nation</h2>
              <p className="text-[#050B20] dark:text-gray-300 text-sm md:text-base">
                Receive pricing updates, shopping tips & more!
              </p>
            </div>
            <div className="max-w-lg flex-shrink-0">
              <form onSubmit={handleNewsletterSignup} className="flex flex-col sm:flex-row gap-2 p-3 border border-gray-200 dark:border-gray-700 rounded-2xl bg-white dark:bg-gray-800">
                <Input
                  type="email"
                  placeholder="Your email address"
                  className="flex-1 border-0 bg-transparent text-[#050B20] dark:text-white placeholder:text-[#050B20]/70 dark:placeholder:text-gray-400 focus-visible:ring-0 h-12 text-sm md:text-base"
                  required
                />
                <Button
                  type="submit"
                  className="bg-[#050B20] hover:bg-[#050B20]/90 dark:bg-white dark:text-[#050B20] dark:hover:bg-gray-100 text-white px-6 md:px-8 h-12 rounded-xl text-sm md:text-base font-medium"
                >
                  Sign Up
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-[1400px] mx-auto px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Company */}
          <div className="lg:col-span-1">
            <h3 className="text-lg md:text-xl font-medium mb-6 capitalize">Company</h3>
            <ul className="space-y-3">
              {[
                { label: "About Us", href: "/about" },
                { label: "Blog", href: "/blog" },
                { label: "Services", href: "/services" },
                { label: "FAQs", href: "/faq" },
                { label: "Terms", href: "/terms" },
                { label: "Contact Us", href: "/contact" }
              ].map((link) => (
                <li key={link.label}>
                  <Link 
                    href={link.href} 
                    className="text-[#050B20] dark:text-gray-300 hover:text-[#050B20]/80 dark:hover:text-white transition-colors text-sm md:text-base"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-1">
            <h3 className="text-lg md:text-xl font-medium mb-6 capitalize">Quick Links</h3>
            <ul className="space-y-3">
              {[
                { label: "Get in Touch", href: "/contact" },
                { label: "Help center", href: "/help" },
                { label: "Live chat", href: "/chat" },
                { label: "How it works", href: "/how-it-works" }
              ].map((link) => (
                <li key={link.label}>
                  <Link 
                    href={link.href} 
                    className="text-[#050B20] dark:text-gray-300 hover:text-[#050B20]/80 dark:hover:text-white transition-colors text-sm md:text-base"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Our Brands */}
          <div className="lg:col-span-1">
            <h3 className="text-lg md:text-xl font-medium mb-6 capitalize">Our Brands</h3>
            <ul className="space-y-3">
              {[
                "Toyota", "Porsche", "Audi", "BMW", "Ford", "Nissan", "Peugeot", "Volkswagen"
              ].map((brand) => (
                <li key={brand}>
                  <Link 
                    href={`/cars?brand=${brand.toLowerCase()}`} 
                    className="text-[#050B20] dark:text-gray-300 hover:text-[#050B20]/80 dark:hover:text-white transition-colors text-sm md:text-base"
                  >
                    {brand}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Vehicles Type */}
          <div className="lg:col-span-1">
            <h3 className="text-lg md:text-xl font-medium mb-6 capitalize">Vehicles Type</h3>
            <ul className="space-y-3">
              {[
                "Sedan", "Hatchback", "SUV", "Hybrid", "Electric", "Coupe", "Truck", "Convertible"
              ].map((type) => (
                <li key={type}>
                  <Link 
                    href={`/cars?type=${type.toLowerCase()}`} 
                    className="text-[#050B20] dark:text-gray-300 hover:text-[#050B20]/80 dark:hover:text-white transition-colors text-sm md:text-base"
                  >
                    {type}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Sale Hours & Social */}
          <div className="lg:col-span-1">
            <h3 className="text-lg md:text-xl font-medium mb-6">Sale Hours</h3>
            <div className="text-[#050B20] dark:text-gray-300 text-sm md:text-base leading-relaxed mb-8">
              <p>Monday – Friday: 09:00AM – 09:00 PM</p>
              <p>Saturday: 09:00AM – 07:00PM</p>
              <p>Sunday: Closed</p>
            </div>

            <h3 className="text-lg md:text-xl font-medium mb-6">Connect With Us</h3>
            <div className="flex gap-2">
              {[
                { icon: Facebook, label: "Facebook", href: "#" },
                { icon: Twitter, label: "Twitter", href: "#" },
                { icon: Instagram, label: "Instagram", href: "#" },
                { icon: Linkedin, label: "LinkedIn", href: "#" }
              ].map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  className="w-10 h-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center transition-colors group"
                  aria-label={label}
                >
                  <Icon className="w-4 h-4 text-[#050B20] dark:text-gray-300" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Copyright Section */}
      <div className="border-t border-gray-100 dark:border-gray-800">
        <div className="max-w-[1400px] mx-auto px-6 py-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-black dark:text-gray-300 text-sm md:text-base">
              © 2025 Style Nation. All rights reserved.
            </p>
            <div className="flex items-center gap-1 text-sm md:text-base">
              <Link 
                href="/terms" 
                className="text-[#050B20] dark:text-gray-300 hover:text-[#050B20]/80 dark:hover:text-white transition-colors"
              >
                Terms & Conditions
              </Link>
              <div className="w-1 h-1 bg-[#050B20] dark:bg-gray-300 rounded-full mx-2"></div>
              <Link 
                href="/privacy" 
                className="text-[#050B20] dark:text-gray-300 hover:text-[#050B20]/80 dark:hover:text-white transition-colors"
              >
                Privacy Notice
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}