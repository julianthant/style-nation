'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

// Enhanced SVG icons for social providers with better styling
const GoogleIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className}>
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
)

const FacebookIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className}>
    <path
      fill="#1877F2"
      d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
    />
  </svg>
)

export function OAuthButtons() {
  const [loading, setLoading] = useState(false)
  const [activeProvider, setActiveProvider] = useState<string | null>(null)

  const handleOAuth = async (provider: 'google' | 'facebook') => {
    setLoading(true)
    setActiveProvider(provider)
    
    try {
      // Import the server action dynamically to avoid build issues
      const { signInWithOAuth } = await import('@/app/auth/actions')
      const { data, error } = await signInWithOAuth(provider)
      
      if (error) {
        toast.error(error.message || `Failed to sign in with ${provider}`)
        setLoading(false)
        setActiveProvider(null)
      } else if (data.url) {
        toast.success(`Redirecting to ${provider}...`)
        // The OAuth flow will redirect the user, so we don't reset loading state
        window.location.href = data.url
      } else {
        toast.error(`Failed to initiate ${provider} authentication`)
        setLoading(false)
        setActiveProvider(null)
      }
    } catch (error) {
      console.error(`OAuth ${provider} error:`, error)
      toast.error(`Failed to sign in with ${provider}`)
      setLoading(false)
      setActiveProvider(null)
    }
  }

  const providerConfig = {
    google: {
      name: 'Google',
      icon: GoogleIcon,
      bgColor: 'hover:bg-gray-50 dark:hover:bg-gray-800',
      textColor: 'text-gray-700 dark:text-gray-300',
    },
    facebook: {
      name: 'Facebook', 
      icon: FacebookIcon,
      bgColor: 'hover:bg-blue-50 dark:hover:bg-blue-900/20',
      textColor: 'text-gray-700 dark:text-gray-300',
    }
  }

  return (
    <div className="grid grid-cols-1 gap-3">
      {(Object.keys(providerConfig) as Array<keyof typeof providerConfig>).map((provider) => {
        const config = providerConfig[provider]
        const Icon = config.icon
        const isLoading = loading && activeProvider === provider
        
        return (
          <Button
            key={provider}
            type="button"
            variant="outline"
            className={`
              h-11 transition-all duration-200 border-gray-300 dark:border-gray-600
              ${config.bgColor} ${config.textColor}
              hover:border-gray-400 dark:hover:border-gray-500
              focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
            onClick={() => handleOAuth(provider)}
            disabled={loading}
          >
            <div className="flex items-center justify-center w-full">
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-3" />
              ) : (
                <Icon className="mr-3" />
              )}
              <span className="text-sm font-medium">
                {isLoading ? `Connecting to ${config.name}...` : `Continue with ${config.name}`}
              </span>
            </div>
          </Button>
        )
      })}
    </div>
  )
}