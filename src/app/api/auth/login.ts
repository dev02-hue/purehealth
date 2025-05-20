'use server'

import { supabase } from '@/lib/supabaseClient'
import { cookies } from 'next/headers'

type SignInInput = {
  email?: string
  phone?: string
  password: string
}

export async function signIn({ email, phone, password }: SignInInput) {
  // Structured logging with clear labels
  console.log('[Auth] Login attempt:', { 
    method: phone ? 'phone' : 'email',
    identifier: phone || email,
    hasPassword: !!password 
  })

  if (!email && !phone) {
    console.error('[Auth] Validation failed: Missing email or phone')
    return { error: 'Email or phone is required' }
  }

  if (!password) {
    console.error('[Auth] Validation failed: Missing password')
    return { error: 'Password is required' }
  }

  let data
  let error

  try {
    if (phone) {
      console.log('[Auth] Starting phone login flow for:', phone)
      
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('email, phone_number')
        .eq('phone_number', phone)
        .single()

      if (profileError || !profileData?.email) {
        console.error('[Auth] Phone lookup failed:', profileError?.message || 'No profile found')
        return { error: 'No account found with this phone number' }
      }

      if (profileData.phone_number !== phone) {
        console.error('[Auth] Phone number mismatch:', {
          provided: phone,
          stored: profileData.phone_number
        })
        return { error: 'Phone number not found' }
      }

      console.log('[Auth] Attempting auth with associated email:', profileData.email)
      ;({ data, error } = await supabase.auth.signInWithPassword({
        email: profileData.email,
        password,
      }))

      if (error) {
        console.error('[Auth] Phone login failed:', error.message)
        return { error: 'Invalid phone number or password' }
      }
    } else if (email) {
      console.log('[Auth] Starting email login flow for:', email)
      ;({ data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      }))

      if (error) {
        console.error('[Auth] Email login failed:', error.message)
        return { error: 'Invalid email or password' }
      }
    }

    console.log('[Auth] Login successful for user:', data?.user?.id)

    // Session handling
    const sessionToken = data?.session?.access_token
    const refreshToken = data?.session?.refresh_token
    const userId = data?.user?.id

    if (!sessionToken || !refreshToken || !userId) {
      console.error('[Auth] Session data is incomplete or missing')
      return { error: 'Failed to retrieve session data. Please try again.' }
    }

    // Secure cookie setup
    const cookieStore = await cookies()
    const oneYear = 365 * 24 * 60 * 60

    cookieStore.set('sb-access-token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: oneYear,
      path: '/',
      sameSite: 'lax',
    })

    cookieStore.set('sb-refresh-token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: oneYear,
      path: '/',
      sameSite: 'lax',
    })

    cookieStore.set('user_id', userId, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      maxAge: oneYear,
      path: '/',
      sameSite: 'lax',
    })

    return {
      user: data?.user ?? null,
      session: {
        access_token: sessionToken,
        refresh_token: refreshToken,
        expires_at: data?.session?.expires_at
      },
      message: 'Login successful',
    }

  } catch (err) {
    console.error('[Auth] Unexpected error during login:', err)
    return { error: 'An unexpected error occurred. Please try again.' }
  }
}