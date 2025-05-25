'use server'

import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function investInPlan(plan: {
  name: string;
  price: number;
  dailyIncome: number;
  totalIncome: number;
  duration: string;
}) {
  const cookieStore = await cookies()
  const userId = cookieStore.get('user_id')?.value

  if (!userId) {
    throw new Error('User not authenticated')
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey)

  // First check if user has enough balance
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('balance')
    .eq('id', userId)
    .single()

  if (profileError || !profile) {
    throw new Error('Failed to fetch user profile')
  }

  if (profile.balance < plan.price) {
    throw new Error('Insufficient balance for this investment')
  }

  // Deduct the investment amount from balance
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ balance: profile.balance - plan.price })
    .eq('id', userId)

  if (updateError) {
    throw new Error('Failed to update balance')
  }

  // Create the investment record
  const durationInDays = parseInt(plan.duration.split(' ')[0])
  const endDate = new Date()
  endDate.setDate(endDate.getDate() + durationInDays)

  const { data: investment, error: investmentError } = await supabase
    .from('investments')
    .insert([{
      user_id: userId,
      plan_name: plan.name,
      amount_invested: plan.price,
      daily_income: plan.dailyIncome,
      total_income: plan.totalIncome,
      duration_days: durationInDays,
      start_date: new Date().toISOString(),
      end_date: endDate.toISOString(),
      last_payout_date: new Date().toISOString(),
      next_payout_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Next day
      status: 'active',
      earnings_to_date: 0
    }])
    .select()
    .single()

  if (investmentError || !investment) {
    // Rollback balance update if investment creation fails
    await supabase
      .from('profiles')
      .update({ balance: profile.balance })
      .eq('id', userId)
    throw new Error('Failed to create investment')
  }

  revalidatePath('/dashboard/investments')
  return { success: true }
}