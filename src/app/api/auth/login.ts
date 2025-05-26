'use server'

import { supabase } from '@/lib/supabaseClient'
import { cookies } from 'next/headers'

type SignInInput = {
  email?: string
  phone?: string
  password: string
}

export async function signIn({ email, phone, password }: SignInInput) {
  // Validate input
  if (!email && !phone) return { error: 'Email or phone is required' }
  if (!password) return { error: 'Password is required' }

  try {
    let authEmail = email;
    
    // Handle phone login
    if (phone) {
      console.log('Attempting phone login for:', phone)
      
      // 1. Find the user's profile to get their UUID
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, phone_number, auth_email')
        .eq('phone_number', phone)
        .single()

      if (profileError || !profile) {
        console.error('Phone lookup failed:', profileError?.message || 'No profile found')
        return { error: 'Invalid phone number or password' }
      }

      // 2. Reconstruct the EXACT temp email used during signup
      // Matches your signup format: `${uuidv4().split('-')[0]}_${phone}@temp.domain`
      authEmail = profile.auth_email
      if (!authEmail) {
        return { error: 'Phone-based login not supported for this user' }
      }
      console.log('Reconstructed email for phone login:', authEmail)
    }

    // 3. Attempt authentication
    console.log('Attempting auth with email:', authEmail)
    const { data, error } = await supabase.auth.signInWithPassword({
      email: authEmail!,
      password
    })

    if (error) {
      console.error('Authentication failed:', error.message)
      return { error: 'Invalid credentials' }
    }

    // 4. Handle session
    const sessionToken = data.session?.access_token
    const refreshToken = data.session?.refresh_token
    const userId = data.user?.id

    if (!sessionToken || !refreshToken || !userId) {
      console.error('Incomplete session data')
      return { error: 'Failed to create session' }
    }

    // 5. Set cookies
    const cookieStore =await cookies()
    const oneYear = 31536000 // 1 year in seconds

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

    console.log('Login successful for user:', userId)
    return {
      user: data.user,
      session: data.session,
      message: 'Login successful'
    }

  } catch (err) {
    console.error('Unexpected login error:', err)
    return { error: 'An unexpected error occurred' }
  }
}