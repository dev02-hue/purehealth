// lib/auth.ts
"use server";
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function getUserProfile() {
  const cookieStore = await cookies()
  const userId = cookieStore.get('user_id')?.value
  console.log('[getUserProfile] Retrieved user_id from cookies:', userId)

  if (!userId) {
    console.error('[getUserProfile] Error: User not authenticated')
    throw { message: 'User not authenticated', status: 401 }
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey)

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('first_name, last_name, balance')
    .eq('id', userId)
    .single()

  if (profileError || !profile) {
    throw { message: 'Profile not found', status: 404 }
  }

  return {
    first_name: profile.first_name,
    last_name: profile.last_name,
    balance: profile.balance,
  }
}
