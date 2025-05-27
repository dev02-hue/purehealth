'use server'

import { supabase } from '@/lib/supabaseClient'
import { cookies } from 'next/headers'

export async function checkAuth() {
  const cookieStore = await cookies()
  const userId = cookieStore.get('user_id')?.value

  if (!userId) {
    throw new Error('User not authenticated')
  }

  return userId
}

export interface InvestmentPlan {
  id: number
  name: string
  price: number
  daily_income: number
  total_income: number
  duration: string
  volatility?: number
  risk: string
  description: string
  created_at?: string
  updated_at?: string
}

export async function getAllInvestmentPlans(): Promise<InvestmentPlan[] | { error: string }> {
  try {
    await checkAuth()

    const { data, error } = await supabase
      .from('investment_plans')
      .select('*')
      .order('price', { ascending: true }) // or 'id' if you prefer

    if (error) {
      console.error('Error fetching investment plans:', error)
      return { error: error.message }
    }

    return data
  } catch (error) {
    console.error('Authentication error:', error)
    return { error: error instanceof Error ? error.message : 'Authentication failed' }
  }
}


export async function updateInvestmentPlan(plan: Partial<InvestmentPlan> & { id: number }) {
    try {
      await checkAuth()
  
      const { data, error } = await supabase
        .from('investment_plans')
        .update({
          name: plan.name,
          price: plan.price,
          daily_income: plan.daily_income,
          total_income: plan.total_income,
          duration: plan.duration,
          description: plan.description,
          volatility: plan.volatility,
        })
        .eq('id', plan.id)
        .select()
  
      if (error) {
        console.error('Error updating investment plan:', error)
        return { error: error.message }
      }
  
      return { success: true, data }
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Authentication failed',
      }
    }
  }