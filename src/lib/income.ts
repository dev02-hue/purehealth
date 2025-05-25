// lib/income.ts
'use server'

import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function getIncomeHistory() {
  const cookieStore = await cookies()
  const userId = cookieStore.get('user_id')?.value

  if (!userId) {
    return { error: 'User not authenticated', incomes: [] }
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey)

  const { data, error } = await supabase
    .from('investments')
    .select('plan_name, amount_invested, daily_income, total_income, earnings_to_date, start_date, end_date, status')
    .eq('user_id', userId)
    .order('start_date', { ascending: false })

  if (error) {
    console.error('Error fetching income history:', error)
    return { error: 'Failed to fetch income history', incomes: [] }
  }

  return { incomes: data || [], error: null }
}
