// lib/auth.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function getUserProfile(token: string) {
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  })

  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    throw { message: userError?.message || 'User not found', status: 401 }
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('first_name, last_name, balance')
    .eq('id', user.id)
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