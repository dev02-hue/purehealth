// lib/deposit.ts
'use server'

import { supabase } from '@/lib/supabaseClient'
import { cookies } from 'next/headers'

export async function getDepositHistory() {
  const cookieStore =await cookies()
  const userId = cookieStore.get('user_id')?.value

  console.log("User ID from cookies:", userId) // ✅ Add this

  if (!userId) {
    console.log("User not authenticated") // ✅
    return { error: 'User not authenticated', deposits: [] }
  }

  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .eq('type', 'deposit')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching deposit history:', error)
    return { error: 'Failed to fetch deposit history', deposits: [] }
  }

  console.log("Deposits fetched from DB:", data) // ✅

  return { deposits: data || [], error: null }
}
