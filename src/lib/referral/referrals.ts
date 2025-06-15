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
  const cookieStore = await cookies()
  const userId = cookieStore.get('user_id')?.value

  if (!userId) {
    throw new Error('User not authenticated')
  }

  // Get referral code from user's profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('referral_code')
    .eq('id', userId)
    .single()

  if (profileError || !profile) {
    throw new Error('Referral code not found')
  }

  // Get referral counts by level
  const { data: referralData, error: referralError } = await supabase
    .from('referrals')
    .select('level')
    .eq('referrer_id', userId)

  if (referralError) {
    throw new Error('Could not fetch referral stats')
  }

  // Count referrals by level
  const levelsCount = referralData.reduce((acc: Record<number, number>, item) => {
    acc[item.level] = (acc[item.level] || 0) + 1
    return acc
  }, {})

  const levels = [1, 2, 3].map((level) => ({
    level,
    count: levelsCount[level] || 0,
  }))

  return {
    referralCode: profile.referral_code,
    levels,
  }
}

/**
 * Rewards referrers in a multi-level structure
 * @param refereeId - ID of the user who performed the action
 * @param amount - Transaction amount to calculate rewards from
 */
export async function rewardReferrers(refereeId: string, amount: number) {
  const { data: referralChain, error } = await supabase
    .from('referrals')
    .select('referrer_id, level')
    .eq('referee_id', refereeId)
    .order('level', { ascending: true }) // Ensure level 1 comes first

  if (error || !referralChain || referralChain.length === 0) {
    console.warn('No referrers found for user:', refereeId)
    return
  }

  for (const { referrer_id, level } of referralChain) {
    // Skip if not level 1 or 2
    if (level > 2) continue;

    // Calculate reward based on level
    let rewardAmount = 0;
    if (level === 1) {
      rewardAmount = amount * 0.30; // 30% for level 1
    } else if (level === 2) {
      rewardAmount = amount * 0.03; // 3% for level 2
    }

    // Round to 2 decimal places to avoid floating point issues
    rewardAmount = Math.round(rewardAmount * 100) / 100;

    // 1. Increment balance via function
    const { error: updateError } = await supabase.rpc('increment_balance', {
      user_id_input: referrer_id,
      amount_input: rewardAmount,
    })

    if (updateError) {
      console.error(`Failed to increment balance for ${referrer_id}:`, updateError)
      continue
    }

    // 2. Log reward transaction
    const { error: insertError } = await supabase
      .from('referral_rewards')
      .insert({
        referrer_id,
        referee_id: refereeId,
        level,
        reward_amount: rewardAmount,
        transaction_amount: amount,
        reward_percentage: level === 1 ? 30 : 3,
      })

    if (insertError) {
      console.error(`Failed to record reward for ${referrer_id}:`, insertError)
    }

    console.log(`Rewarded ${referrer_id} at level ${level}: $${rewardAmount.toFixed(2)}`)
  }
}

/**
 * Records a new referral when a user signs up with a referral code
 * @param refereeId - ID of the new user
 * @param referralCode - The referral code used
 */
export async function recordReferral(refereeId: string, referralCode: string) {
  // 1. Get direct referrer
  const { data: referrer, error: referrerError } = await supabase
    .from('profiles')
    .select('id')
    .eq('referral_code', referralCode)
    .single()

  if (referrerError || !referrer) {
    throw new Error('Invalid referral code')
  }

  // 2. Add level 1 referral (direct)
  const { error: directError } = await supabase
    .from('referrals')
    .insert({
      referrer_id: referrer.id,
      referee_id: refereeId,
      level: 1,
    })

  if (directError) {
    throw new Error('Failed to record direct referral')
  }

  // 3. Find indirect referrer (who referred the direct referrer)
  const { data: grandReferrerData, error: grandReferrerError } = await supabase
    .from('referrals')
    .select('referrer_id')
    .eq('referee_id', referrer.id)
    .order('level', { ascending: true }) // Get the closest referrer
    .limit(1)

  if (!grandReferrerError && grandReferrerData && grandReferrerData.length > 0) {
    // 4. Add level 2 referral (indirect)
    const { error: indirectError } = await supabase
      .from('referrals')
      .insert({
        referrer_id: grandReferrerData[0].referrer_id,
        referee_id: refereeId,
        level: 2,
      })

    if (indirectError) {
      console.error('Failed to record indirect referral:', indirectError)
    }
  }
}