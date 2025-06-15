// lib/withdrawals.ts
'use server'

import { cookies } from 'next/headers'
import { Withdrawal } from '@/types/withdrawal'
import { supabase } from './supabaseClient'

/**
 * Get user withdrawals optionally filtered by one or more statuses.
 * @param statuses - Optional array of statuses (e.g. ['pending', 'approved'])
 */
export async function getUserWithdrawals(statuses?: ('pending' | 'approved')[]): Promise<Withdrawal[]> {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('user_id')?.value

    if (!userId) {
      throw new Error('User not authenticated')
    }

    let query = supabase
      .from('withdrawals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    // If multiple statuses are provided, use `.in` to filter
    if (statuses && statuses.length > 0) {
      query = query.in('status', statuses)
    }

    const { data, error } = await query

    if (error) throw error

    return data || []
  } catch (error) {
    console.error('Error fetching user withdrawals:', error)
    return []
  }
}
