// lib/auth/signOut.ts
'use server'

import { cookies } from 'next/headers'
import { supabase } from '@/lib/supabaseClient'

export async function signOut() {
  try {
    // 1. Sign out from Supabase
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      console.error('Supabase sign out error:', error.message)
      throw new Error('Failed to sign out from Supabase')
    }

    // 2. Clear all auth-related cookies
    const cookieStore = await cookies()
    const cookieNames = [
      'sb-access-token',
      'sb-refresh-token',
      'user_id'
    ]

    cookieNames.forEach(name => {
      cookieStore.delete(name)
    })

    // 3. Return success response with instructions for client-side cleanup
    return { 
      success: true,
      message: 'Sign out successful',
      clientActions: {
        clearLocalStorage: true,
        redirectTo: '/login' // Optional redirect path
      }
    }
  } catch (error) {
    console.error('Sign out failed:', error)
    return { 
      success: false,
      error: error instanceof Error ? error.message : 'Sign out failed'
    }
  }
}