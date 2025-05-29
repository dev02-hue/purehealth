'use server'

import { supabase } from '@/lib/supabaseClient'
import { v4 as uuidv4 } from 'uuid'

export async function signUp({
  email,
  phone,
  password,
  firstName,
  lastName,
  referredCode, // user enters this code if referred by someone
}: {
  email?: string
  phone?: string
  password: string
  firstName: string
  lastName: string
  referredCode?: string
}) {
  // 1. Validate input
  if (!email && !phone) return { error: 'Email or phone is required' }
  if (password.length < 8) return { error: 'Password must be at least 8 characters long' }

  // 2. Generate auth email (required by Supabase)
  const authEmail = email || `${uuidv4().split('-')[0]}_${phone}@temp.domain`

  // 3. Create user in Supabase Auth
  const { data, error } = await supabase.auth.signUp({
    email: authEmail,
    password,
    options: {
      data: {
        first_name: firstName,
        last_name: lastName
      }
    }
  })

  if (error || !data?.user) {
    return { error: error?.message || 'Signup failed' }
  }

  const userId = data.user.id
  const referralCode = uuidv4().split('-')[0] + userId.slice(0, 4) // Generate referral code like: abcde1234

  // 4. Initialize referral tracking variables
  let referredByUserId: string | null = null
  let referralLevel = 0

  // 5. Process referral code if provided
  if (referredCode) {
    const { data: referrerProfile, error: referralError } = await supabase
      .from('profiles')
      .select('id, referral_level')
      .eq('referral_code', referredCode)
      .single()

    if (!referralError && referrerProfile?.id) {
      referredByUserId = referrerProfile.id

      // Prevent self-referral
      if (referredByUserId === userId) {
        await supabase.auth.admin.deleteUser(userId)
        return { error: 'Cannot refer yourself' }
      }

      referralLevel = (referrerProfile.referral_level || 0) + 1
    }
  }

  // 6. Insert profile data into 'profiles' table
  const { error: profileError } = await supabase.from('profiles').insert([{
    id: userId,
    first_name: firstName,
    last_name: lastName,
    email: email || null,
    phone_number: phone || null,
    balance: 900,
    referral_code: referralCode,
    referred_by: referredByUserId,
    referral_level: referralLevel,
    is_phone_user: !email,
    auth_email: authEmail,
    created_at: new Date().toISOString()
  }])

  if (profileError) {
    // Cleanup auth user if profile creation fails
    await supabase.auth.admin.deleteUser(userId)
    return { error: 'Failed to create profile: ' + profileError.message }
  }

  // 7. Create a referral record in 'referrals' table if referred
  // 7. Create referral records in 'referrals' table
if (referredByUserId) {
  // Add direct referral (level 1)
  const { error: level1Error } = await supabase.from('referrals').insert([{
    referrer_id: referredByUserId,
    referee_id: userId,
    level: 1,
    created_at: new Date().toISOString()
  }])

  if (level1Error) {
    console.error('Level 1 referral creation failed:', level1Error)
  }

  // Now check if the direct referrer was also referred (for level 2)
  const { data: indirectReferrer, error: indirectError } = await supabase
    .from('referrals')
    .select('referrer_id')
    .eq('referee_id', referredByUserId)
    .single()

  if (!indirectError && indirectReferrer?.referrer_id) {
    // Add level 2 referral
    const { error: level2Error } = await supabase.from('referrals').insert([{
      referrer_id: indirectReferrer.referrer_id,
      referee_id: userId,
      level: 2,
      created_at: new Date().toISOString()
    }])

    if (level2Error) {
      console.error('Level 2 referral creation failed:', level2Error)
    }
  }
}


  // 8. Return response
  return {
    user: data.user,
    session: data.session,
    referralCode,       // the new user's own referral code
    referredBy: referredByUserId,  // ID of referrer (if any)
    message: 'Signup successful'
  }
}
