'use server'

import { supabase } from '@/lib/supabaseClient'
import { cookies } from 'next/headers'

type ChangePasswordInput = {
  newPassword: string
  confirmPassword: string
}

export async function easyChangePassword({
  newPassword,
  confirmPassword,
}: ChangePasswordInput) {
  console.log('[Auth] Easy password change attempt initiated')

  try {
    // 1. Basic validation
    if (!newPassword || !confirmPassword) {
      return { error: 'Both password fields are required' }
    }

    if (newPassword !== confirmPassword) {
      return { error: 'Passwords do not match' }
    }

    if (newPassword.length < 6) {
      return { error: 'Password must be at least 6 characters' }
    }

    // 2. Get session from cookies
    const cookieStore =await cookies()
    const accessToken = cookieStore.get('sb-access-token')?.value
    const refreshToken = cookieStore.get('sb-refresh-token')?.value

    if (!accessToken || !refreshToken) {
      return { error: 'Not authenticated. Please log in again.' }
    }

    // 3. Set the session on the Supabase client
    const { data: { session }, error: sessionError } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    })

    if (sessionError || !session) {
      console.error('Session error:', sessionError)
      return { error: 'Session expired. Please log in again.' }
    }

    // 4. Update password
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (updateError) {
      return { error: updateError.message }
    }

    return { success: true, message: 'Password updated successfully' }

  } catch (err) {
    console.error('Unexpected error:', err)
    return { error: 'An unexpected error occurred. Please try again.' }
  }
}