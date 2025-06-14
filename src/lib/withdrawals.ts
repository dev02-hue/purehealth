// lib/withdrawals.ts
'use server'

import { cookies } from 'next/headers'
 import { Withdrawal } from '@/types/withdrawal'
import { supabase } from './supabaseClient'
 
export async function getUserWithdrawals(): Promise<Withdrawal[]> {
  try {
    // Get the cookie store
    const cookieStore =await cookies()
    const userId = cookieStore.get('user_id')?.value

    if (!userId) {
      throw new Error('User not authenticated')
    }

    

    // Fetch withdrawals for the current user
    const { data, error } = await supabase
      .from('withdrawals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error

    return data || []
  } catch (error) {
    console.error('Error fetching user withdrawals:', error)
    return []
  }
}