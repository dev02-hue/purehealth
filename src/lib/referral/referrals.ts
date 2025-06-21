// lib/services/referral.ts
'use server'

import { cookies } from 'next/headers'
import { supabase } from '@/lib/supabaseClient'


const SIGNUP_REWARD_AMOUNT = 500;


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
 * Records a new referral when a user signs up with a referral code
 * and automatically rewards referrers with ₦500 base amount
 * @param refereeId - ID of the new user
 * @param referralCode - The referral code used
 */
export async function recordReferral(refereeId: string, referralCode: string) {
  try {
    // 0. First check if this referral already exists
    const { data: existingReferral, error: existingError } = await supabase
      .from('referrals')
      .select('id')
      .eq('referee_id', refereeId)
      .maybeSingle();

    if (existingError) {
      console.error('Error checking existing referral:', existingError);
      throw new Error('Error checking referral status');
    }

    if (existingReferral) {
      console.warn('Referral already exists for user:', refereeId);
      return;
    }

    // 1. Get direct referrer
    const { data: referrer, error: referrerError } = await supabase
      .from('profiles')
      .select('id')
      .eq('referral_code', referralCode)
      .single();

    if (referrerError || !referrer) {
      throw new Error('Invalid referral code');
    }

    // 2. Add level 1 referral (direct)
    const { error: directError } = await supabase
      .from('referrals')
      .insert({
        referrer_id: referrer.id,
        referee_id: refereeId,
        level: 1,
      });

    if (directError) {
      console.error('Detailed referral error:', directError);
      throw new Error(`Failed to record direct referral: ${directError.message}`);
    }

    // 3. Find indirect referrer (who referred the direct referrer)
    const { data: grandReferrerData, error: grandReferrerError } = await supabase
      .from('referrals')
      .select('referrer_id')
      .eq('referee_id', referrer.id)
      .order('level', { ascending: true })
      .limit(1);

    if (!grandReferrerError && grandReferrerData && grandReferrerData.length > 0) {
      // 4. Add level 2 referral (indirect)
      const { error: indirectError } = await supabase
        .from('referrals')
        .insert({
          referrer_id: grandReferrerData[0].referrer_id,
          referee_id: refereeId,
          level: 2,
        });

      if (indirectError) {
        console.error('Failed to record indirect referral:', indirectError);
      }
    }

    // 5. Automatically reward referrers with fixed ₦500 base amount
    await rewardReferrers(refereeId, SIGNUP_REWARD_AMOUNT);

  } catch (error) {
    console.error('Referral processing failed:', error);
    throw error;
  }
}

/**
 * Rewards referrers in a multi-level structure with fixed percentages
 * @param refereeId - ID of the user who signed up
 * @param baseAmount - Fixed base amount (₦500) to calculate rewards from
 */
export async function rewardReferrers(refereeId: string, baseAmount: number) {
  try {
    // Get referral chain with transaction for consistency
    const { data: referralChain, error } = await supabase
      .from('referrals')
      .select('referrer_id, level')
      .eq('referee_id', refereeId)
      .order('level', { ascending: true });

    if (error || !referralChain || referralChain.length === 0) {
      console.warn('No referrers found for user:', refereeId);
      return;
    }

    // Process each valid referral level
    for (const { referrer_id, level } of referralChain) {
      // Only process levels 1 and 2
      if (level > 2) continue;

      // Calculate reward based on level
      const rewardPercentage = level === 1 ? 0.30 : 0.03;
      const rewardAmount = Math.round(baseAmount * rewardPercentage * 100) / 100;

      // Execute operations in a transaction
      const { error: transactionError } = await supabase.rpc('process_single_referral_reward', {
        referrer_id_input: referrer_id,
        referee_id_input: refereeId,
        level_input: level,
        reward_amount_input: rewardAmount,
        base_amount_input: baseAmount,
        reward_percentage_input: level === 1 ? 30 : 3,
      });

      if (transactionError) {
        console.error(`Failed to process reward for ${referrer_id}:`, transactionError);
        continue;
      }

      console.log(`Successfully rewarded ${referrer_id} at level ${level}: ₦${rewardAmount}`);
    }
  } catch (error) {
    console.error('Failed to process referral rewards:', error);
    throw new Error('Failed to process referral rewards');
  }
}