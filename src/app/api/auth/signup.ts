'use server'

import { supabase } from '@/lib/supabaseClient'
import { v4 as uuidv4 } from 'uuid'

export async function signUp({
  email,
  phone,
  password,
  firstName,
  lastName,
  referredCode,
}: {
  email?: string
  phone?: string
  password: string
  firstName: string
  lastName: string
  referredCode?: string
}) {
  // Input validation
  if (!email && !phone) return { error: 'Email or phone is required' }
  if (password.length < 8) return { error: 'Password must be at least 8 characters' }

  // Generate auth email (use actual email or create temporary one for phone users)
  const authEmail = email || `${uuidv4().split('-')[0]}_${phone}@temp.domain`

  // 1. Create auth user in Supabase
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
  const referralCode = uuidv4().split('-')[0] + userId.slice(0, 4) // Generate unique referral code

  // 2. Handle referral logic
  let referredByUserId = null
  let referralLevel = 0
  
  if (referredCode) {
    try {
      // Find the user who owns this referral code
      const { data: referrerProfile, error: referralError } = await supabase
        .from('profiles')
        .select('id, referral_level, first_name, last_name')
        .eq('referral_code', referredCode)
        .single()

      if (referralError) throw referralError

      if (referrerProfile?.id) {
        referredByUserId = referrerProfile.id
        // Set the new user's level to be one higher than their referrer
        referralLevel = (referrerProfile.referral_level || 0) + 1
        
        // Optional: You could add validation here to prevent self-referral
        if (referredByUserId === userId) {
          throw new Error('Cannot refer yourself')
        }
      }
    } catch (err) {
      console.error('Referral processing error:', err)
      // Continue with signup even if referral fails
    }
  }

  // 3. Create user profile
  try {
    const { error: profileError } = await supabase.from('profiles').insert([{
      id: userId,
      first_name: firstName,
      last_name: lastName,
      email: email || null,
      phone_number: phone || null,
      balance: 900, // Starting balance
      referral_code: referralCode,
      referred_by: referredByUserId,
      referral_level: referralLevel,
      is_phone_user: !email,
      auth_email: authEmail,
      created_at: new Date().toISOString()
    }])

    if (profileError) throw profileError

    // 4. Create referral relationship if applicable
    if (referredByUserId) {
      const { error: referralInsertError } = await supabase.from('referrals').insert([{
        referrer_id: referredByUserId,
        referee_id: userId,
        level: referralLevel,
        created_at: new Date().toISOString()
      }])

      if (referralInsertError) throw referralInsertError
    }

    return {
      user: data.user,
      session: data.session,
      referralCode, // Return the new user's referral code
      referredBy: referredByUserId, // Return referrer info if needed
      message: 'Signup successful'
    }

  } catch (error) {
    // Cleanup auth user if profile creation fails
    await supabase.auth.admin.deleteUser(userId)
    return { error: 'Profile creation failed: ' + (error as Error).message }
  }
}