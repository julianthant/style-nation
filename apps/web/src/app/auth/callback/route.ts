import { NextRequest, NextResponse } from 'next/server'
import createSupabaseServerClient from '@/utils/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')

  // Handle OAuth provider errors
  if (error) {
    console.error('OAuth callback error:', error, errorDescription)
    const errorMsg = errorDescription || error
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(errorMsg)}`)
  }

  if (code) {
    const supabase = await createSupabaseServerClient()
    
    try {
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
      
      if (exchangeError) {
        console.error('Error exchanging code for session:', exchangeError)
        return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(exchangeError.message)}`)
      }

      if (data.session && data.user) {
        // Check if user profile exists, create if not (for OAuth users)
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', data.user.id)
          .single()

        if (!existingProfile) {
          // Extract user data from OAuth provider
          const metadata = data.user.user_metadata || {}
          const firstName = metadata.full_name?.split(' ')[0] || 
                           metadata.name?.split(' ')[0] || 
                           metadata.given_name ||
                           'User'
          const lastName = metadata.full_name?.split(' ').slice(1).join(' ') || 
                          metadata.name?.split(' ').slice(1).join(' ') || 
                          metadata.family_name ||
                          ''

          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              email: data.user.email!,
              firstName,
              lastName,
              role: 'USER',
            })

          if (profileError) {
            console.error('Profile creation error:', profileError)
            // Don't fail authentication if profile creation fails
          }
        }

        // Determine redirect URL
        const forwardedHost = request.headers.get('x-forwarded-host')
        const isLocalEnv = process.env.NODE_ENV === 'development'
        
        if (isLocalEnv) {
          return NextResponse.redirect(`${origin}${next}`)
        } else if (forwardedHost) {
          return NextResponse.redirect(`https://${forwardedHost}${next}`)
        } else {
          return NextResponse.redirect(`${origin}${next}`)
        }
      } else {
        console.error('No session or user data received from OAuth')
        return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent('Authentication incomplete')}`)
      }
    } catch (error) {
      console.error('Auth callback exception:', error)
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent('Authentication failed')}`)
    }
  }

  // No code provided - invalid callback
  console.warn('Auth callback called without code parameter')
  return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent('Invalid authentication callback')}`)
}