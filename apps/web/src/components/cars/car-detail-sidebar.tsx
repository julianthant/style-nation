'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { 
  Phone, 
  Mail, 
  MessageCircle, 
  Share2, 
  Heart,
  Calendar,
  CheckCircle,
  User
} from 'lucide-react'
import { Car } from '@/lib/types/car'
import { formatPrice } from '@/lib/utils/placeholder'

interface CarDetailSidebarProps {
  car: Car
}

export function CarDetailSidebar({ car }: CarDetailSidebarProps) {
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [inquiryForm, setInquiryForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: `Hi, I'm interested in the ${car.year} ${car.make} ${car.model}. Please contact me with more information.`
  })

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked)
    // TODO: Implement bookmark functionality
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${car.year} ${car.make} ${car.model}`,
        text: car.description,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      // TODO: Show toast notification
    }
  }

  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Submit inquiry
    console.log('Inquiry submitted:', inquiryForm)
  }

  const handleScheduleViewing = () => {
    // TODO: Implement schedule viewing functionality
    console.log('Schedule viewing for car:', car.id)
  }

  const handleCallDealer = () => {
    window.location.href = 'tel:+1-555-0123'
  }

  return (
    <div className="space-y-6 sticky top-24">
      {/* Price and Actions Card */}
      <Card className="p-6">
        <div className="space-y-6">
          {/* Price */}
          <div className="text-center">
            <p className="text-3xl font-bold text-foreground">
              {formatPrice(car.price)}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {car.condition === 'NEW' ? 'MSRP' : 'Asking Price'}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button 
              className="w-full bg-[#405FF2] hover:bg-[#405FF2]/90 text-white"
              onClick={handleCallDealer}
            >
              <Phone className="h-4 w-4 mr-2" />
              Call Dealer
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full"
              onClick={handleScheduleViewing}
            >
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Viewing
            </Button>

            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={handleBookmark}
              >
                <Heart 
                  className={`h-4 w-4 mr-2 ${isBookmarked ? 'fill-current text-red-500' : ''}`} 
                />
                {isBookmarked ? 'Saved' : 'Save'}
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={handleShare}
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Contact Form */}
      <Card className="p-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Send Inquiry
          </h3>
          
          <form onSubmit={handleInquirySubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Your full name"
                value={inquiryForm.name}
                onChange={(e) => setInquiryForm(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={inquiryForm.email}
                onChange={(e) => setInquiryForm(prev => ({ ...prev, email: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number (Optional)</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={inquiryForm.phone}
                onChange={(e) => setInquiryForm(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                placeholder="Tell us about your interest in this vehicle..."
                value={inquiryForm.message}
                onChange={(e) => setInquiryForm(prev => ({ ...prev, message: e.target.value }))}
                rows={4}
                required
              />
            </div>

            <Button type="submit" className="w-full">
              <Mail className="h-4 w-4 mr-2" />
              Send Inquiry
            </Button>
          </form>

          <p className="text-xs text-muted-foreground">
            By submitting this form, you agree to be contacted by our sales team regarding this vehicle.
          </p>
        </div>
      </Card>

      {/* Dealer Information */}
      <Card className="p-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <User className="h-5 w-5" />
            Dealer Information
          </h3>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <h4 className="font-medium text-foreground">Style Nation Showroom</h4>
                <p className="text-sm text-muted-foreground">Premium Auto Dealer</p>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-muted-foreground">Verified Dealer</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-muted-foreground">5-Star Rating</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-muted-foreground">100+ Happy Customers</span>
              </div>
            </div>

            <div className="pt-3 border-t border-border">
              <div className="space-y-2 text-sm text-muted-foreground">
                <div>
                  <strong className="text-foreground">Phone:</strong> (555) 123-4567
                </div>
                <div>
                  <strong className="text-foreground">Email:</strong> sales@stylenation.com
                </div>
                <div>
                  <strong className="text-foreground">Hours:</strong> Mon-Sat 9AM-9PM, Sun Closed
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Financing Information */}
      <Card className="p-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Financing Available</h3>
          
          <div className="space-y-3">
            <div className="bg-muted/30 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-foreground">Est. Monthly Payment</span>
                <span className="font-bold text-foreground">$389/mo</span>
              </div>
              <div className="text-xs text-muted-foreground">
                Based on $5,000 down, 60 months at 5.9% APR
              </div>
            </div>

            <Button variant="outline" className="w-full">
              Get Pre-Approved
            </Button>

            <p className="text-xs text-muted-foreground">
              * Financing available with approved credit. Terms and conditions apply.
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}