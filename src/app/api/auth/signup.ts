// app/api/auth/signup.ts (or wherever you're placing it)
'use server'

import { supabase } from '@/lib/supabaseClient'
import { v4 as uuidv4 } from 'uuid'

export async function signUp({
  email,
  phone,
  password,
  firstName,
  lastName,
  referredCode, // this comes from the referral link
}: {
  email?: string
  phone?: string
  password: string
  firstName: string
  lastName: string
  referredCode?: string // optional referral code
}) {
  if (!email && !phone) return { error: 'Email or phone is required' }

  let data
  let error

  // 1. Sign up user using Supabase auth
  if (email) {
    ({ data, error } = await supabase.auth.signUp({ email, password }))
  } else if (phone) {
    ({ data, error } = await supabase.auth.signUp({ phone, password }))
  }

  if (error || !data?.user) {
    return { error: error?.message || 'Signup failed' }
  }

  const userId = data.user.id

  // 2. Generate a unique referral code
  const referralCode = uuidv4().split('-')[0] + userId.slice(0, 4)

  // 3. Lookup referred_by user if a referral code was provided
  let referredByUserId: string | null = null
  let referralLevel = 0

  if (referredCode) {
    const { data: referrerProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('referral_code', referredCode)
      .single()

    if (referrerProfile?.id) {
      referredByUserId = referrerProfile.id

      // Get the level of the referrer (so we can assign the correct level)
      const { data: parentReferral } = await supabase
        .from('referrals')
        .select('level')
        .eq('referee_id', referredByUserId)
        .single()

      referralLevel = parentReferral ? parentReferral.level + 1 : 1
    }
  }

  // 4. Insert user profile with referral info
  const { error: profileError } = await supabase.from('profiles').insert([
    {
      id: userId,
      first_name: firstName,
      last_name: lastName,
      email,
      phone_number: phone,
      balance: 900,
      referral_code: referralCode,
      referred_by: referredByUserId,
      referral_level: referralLevel,
    },
  ])

  if (profileError) return { error: profileError.message }

  // 5. Add entry in referrals table (if referred)
  if (referredByUserId) {
    await supabase.from('referrals').insert([
      {
        referrer_id: referredByUserId,
        referee_id: userId,
        level: referralLevel,
      },
    ])
  }

  return {
    user: data.user,
    message: 'Signup successful',
  }
}
