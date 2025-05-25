'use server'

import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!

export async function processDailyPayouts() {
  const cookieStore = await cookies()
  
  // Get user_id from cookies (assuming you set this during authentication)
  const userId = cookieStore.get('user_id')?.value

  if (!userId) {
    throw new Error('Authentication required: No user_id found in cookies')
  }

  // Create authenticated Supabase client
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${cookieStore.get('sb-access-token')?.value}`
      }
    }
  })

  // Verify the user exists and has admin privileges
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', userId)
    .single()

  if (profileError || !profile?.is_admin) {
    throw new Error('Unauthorized: Admin privileges required')
  }

  // Now proceed with payout processing using service key for elevated privileges
  const adminSupabase = createClient(supabaseUrl, supabaseServiceKey)
  const now = new Date().toISOString()

  try {
    // Get all active investments due for payout
    const { data: investments, error } = await adminSupabase
      .from('investments')
      .select('*')
      .lte('next_payout_date', now)
      .eq('status', 'active')

    if (error) {
      console.error('Error fetching investments:', error)
      return { success: false, error: error.message }
    }

    if (!investments || investments.length === 0) {
      console.log('No investments to process')
      return { success: true, message: 'No investments to process' }
    }

    // Process each investment
    const results = await Promise.all(
      investments.map(async (investment) => {
        try {
          // Check if investment has ended
          if (new Date(investment.end_date) < new Date()) {
            const { error: completionError } = await adminSupabase
              .from('investments')
              .update({ status: 'completed' })
              .eq('id', investment.id)

            if (completionError) throw completionError
            return { investmentId: investment.id, status: 'completed' }
          }

          // Process payout
          const { error: payoutError } = await adminSupabase.rpc('process_investment_payout', {
            investment_id: investment.id,
            user_id: investment.user_id,
            payout_amount: investment.daily_income
          })

          if (payoutError) throw payoutError
          return { investmentId: investment.id, status: 'paid', amount: investment.daily_income }
        } catch (error: unknown) {
          if (error instanceof Error) {
            console.error(`Failed to process investment ${investment.id}:`, error)
            return { investmentId: investment.id, status: 'failed', error: error.message }
          } else {
            console.error(`Failed to process investment ${investment.id}: Unknown error`, error)
            return { investmentId: investment.id, status: 'failed', error: 'Unknown error' }
          }
        }
      })
    )

    return {
      success: true,
      processed: results.filter(r => r.status !== 'failed').length,
      failed: results.filter(r => r.status === 'failed').length,
      results
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Unexpected error in processDailyPayouts:', error.message)
      return { success: false, error: error.message }
    } else {
      console.error('Unexpected error in processDailyPayouts: Unknown error', error)
      return { success: false, error: 'Unknown error' }
    }
    
  }
}