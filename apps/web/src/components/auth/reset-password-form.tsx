'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Loader2, CheckCircle, ArrowLeft, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

export function ResetPasswordForm() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email) {
      toast.error('Please enter your email address')
      return
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      toast.error('Please enter a valid email address')
      return
    }

    setLoading(true)
    
    try {
      // Simulate API call - replace with actual reset password logic
      await new Promise(resolve => setTimeout(resolve, 2000))
      setSuccess(true)
      toast.success('Password reset link sent!')
    } catch (error) {
      toast.error('Failed to send reset link. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="text-center space-y-6">
        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto">
          <Mail className="h-8 w-8 text-green-600 dark:text-green-400" />
        </div>
        
        <div className="space-y-2">
          <h3 className="text-xl font-semibold">Check your email</h3>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>We&apos;ve sent a password reset link to:</p>
            <p className="font-medium text-foreground">{email}</p>
          </div>
        </div>
        
        <div className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-4">
          <p>
            Click the link in your email to reset your password. 
            If you don&apos;t see the email, check your spam folder.
          </p>
        </div>

        <div className="space-y-3">
          <Button variant="outline" className="w-full" asChild>
            <Link href="/login">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to sign in
            </Link>
          </Button>
          
          <button
            onClick={() => {
              setSuccess(false)
              setEmail('')
            }}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Try a different email address
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">
            Email address
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-11"
            required
          />
          <p className="text-xs text-muted-foreground">
            We&apos;ll send a password reset link to this email address.
          </p>
        </div>

        <Button 
          type="submit" 
          className="w-full h-11 text-base font-medium" 
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending link...
            </>
          ) : (
            'Send reset link'
          )}
        </Button>
      </form>

      <div className="text-center">
        <span className="text-sm text-muted-foreground">
          Remember your password?{' '}
        </span>
        <Link 
          href="/login" 
          className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
        >
          Sign in
        </Link>
      </div>
    </div>
  )
}