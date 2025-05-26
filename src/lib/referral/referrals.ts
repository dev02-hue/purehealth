// lib/services/referral.ts
'use server'

import { cookies } from 'next/headers'
import { supabase } from '@/lib/supabaseClient'

export type ReferralData = {
  referralCode: string
  levels: {
    level: number
    count: number
  }[]
}

export async function getReferralData(): Promise<ReferralData> {
  console.log('[ReferralService] Starting to fetch referral data...')
  
  const cookieStore = await cookies()
  const userId = cookieStore.get('user_id')?.value
  console.log('[ReferralService] Retrieved user_id from cookies:', userId)

  if (!userId) {
    console.error('[ReferralService] Error: User not authenticated')
    throw new Error('User not authenticated')
  }

  // Get referral code from the user's profile
  console.log('[ReferralService] Fetching profile data for user:', userId)
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('referral_code')
    .eq('id', userId)
    .single()

  console.log('[ReferralService] Profile data response:', {
    profile,
    profileError,
    hasProfile: !!profile
  })

  if (profileError || !profile) {
    console.error('[ReferralService] Error fetching profile:', profileError?.message || 'No profile data')
    throw new Error('Referral code not found')
  }

  // Get referral levels from the referrals table
  console.log('[ReferralService] Fetching referral data for referrer_id:', userId)
  const { data: referralData, error: referralError } = await supabase
    .from('referrals')
    .select('level')
    .eq('referrer_id', userId)

  console.log('[ReferralService] Referral data response:', {
    referralData,
    referralError,
    count: referralData?.length || 0
  })

  if (referralError) {
    console.error('[ReferralService] Error fetching referrals:', referralError.message)
    throw new Error('Could not fetch referral stats')
  }

  // Count by level
  console.log('[ReferralService] Calculating level counts...')
  const levelsCount = referralData.reduce((acc: Record<number, number>, item) => {
    acc[item.level] = (acc[item.level] || 0) + 1
    return acc
  }, {})

  console.log('[ReferralService] Raw level counts:', levelsCount)

  const levels = [1, 2, 3].map((level) => ({
    level,
    count: levelsCount[level] || 0,
  }))

  console.log('[ReferralService] Processed levels:', levels)

  const result = {
    referralCode: profile.referral_code,
    levels,
  }

  console.log('[ReferralService] Final referral data:', result)
  return result
}

/**
 * Rewards referrers of a given user based on level.
 * Call this when a referred user performs a rewardable action (like payment).
 * 
 * @param refereeId - ID of the user who performed the action (the referred user)
 * @param amount - Total transaction amount to calculate rewards from
 */
export async function rewardReferrers(refereeId: string, amount: number) {
  console.log('[ReferralService] Rewarding referrers of user:', refereeId)

  // Get all referrals for this user (may include multiple levels)
  const { data: referrals, error } = await supabase
    .from('referrals')
    .select('referrer_id, level')
    .eq('referee_id', refereeId)

  if (error || !referrals || referrals.length === 0) {
    console.warn('[ReferralService] No referrers found or error occurred:', error?.message)
    return
  }

  for (const referral of referrals) {
    const { referrer_id, level } = referral

    let rewardPercentage = 0
    if (level === 1) rewardPercentage = 30
    else if (level >= 2) rewardPercentage = 3

    const rewardAmount = (rewardPercentage / 100) * amount

    console.log(`[ReferralService] Referrer ${referrer_id} (Level ${level}) gets ₦${rewardAmount}`)

    // Update balance in the profiles table
    const { error: updateError } = await supabase.rpc('increment_balance', {
      user_id_input: referrer_id,
      amount_input: rewardAmount,
    })

    if (updateError) {
      console.error(`[ReferralService] Failed to update balance for ${referrer_id}:`, updateError.message)
    } else {
      console.log(`[ReferralService] Balance updated successfully for ${referrer_id}`)
    }
  }
}
