'use server'
import { supabase } from '@/lib/supabaseClient'
import { cookies } from 'next/headers'

type SignInInput = {
  email: string
  password: string
}

export async function signIn({ email, password }: SignInInput) {
  console.log('signIn called with:', { email, password })

  if (!email || !password) {
    console.log('Missing email or password')
    return { error: 'Email and password are required' }
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  console.log('Supabase response:', { data, error })

  if (error) {
    console.log('Login error:', error.message)
    return { error: error.message }
  }

  if (!data.session || !data.user) {
    console.log('Login failed: No session or user returned')
    return { error: 'Login failed. Please try again.' }
  }

  // Get the session tokens and user ID
  const sessionToken = data.session.access_token
  const refreshToken = data.session.refresh_token
  const userId = data.user.id

  // Store tokens and user ID in cookies
  const cookieStore = await cookies() // Await the promise to get the cookies object
  const oneYear = 365 * 24 * 60 * 60 // 1 year in seconds

  // Store Supabase session tokens (httpOnly for security)
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

  // Store user ID separately for easier access
  cookieStore.set('user_id', userId, {
    httpOnly: false, // Set to true if only server should access
    secure: process.env.NODE_ENV === 'production',
    maxAge: oneYear,
    path: '/',
    sameSite: 'lax',
  })

  // Return tokens to be stored in localStorage (client-side)
  return {
    user: data.user,
    session: {
      access_token: sessionToken,
      refresh_token: refreshToken,
      expires_at: data.session.expires_at
    },
    message: 'Login successful',
  }
}