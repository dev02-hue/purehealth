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
  if (!email && !phone) return { error: 'Email or phone is required' }
  if (password.length < 8) return { error: 'Password must be at least 8 characters' }

  // Generate auth email (use actual email or create temporary one)
  const authEmail = email || `${uuidv4().split('-')[0]}_${phone}@temp.domain`


  // 1. Sign up user using email auth (even for phone registrations)
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
  const referralCode = uuidv4().split('-')[0] + userId.slice(0, 4)

  // Referral logic
  let referredByUserId = null
  let referralLevel = 0
  
  if (referredCode) {
    const { data: referrerProfile } = await supabase
      .from('profiles')
      .select('id, referral_level')
      .eq('referral_code', referredCode)
      .single()

    if (referrerProfile?.id) {
      referredByUserId = referrerProfile.id
      referralLevel = (referrerProfile.referral_level || 0) + 1
    }
  }

  // Create user profile
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
    auth_email: authEmail
  }])

  if (profileError) {
    
    await supabase.auth.admin.deleteUser(userId)
    return { error: 'Profile creation failed' }
  }

  // Create referral relationship if applicable
  if (referredByUserId) {
    await supabase.from('referrals').insert([{
      referrer_id: referredByUserId,
      referee_id: userId,
      level: referralLevel,
      created_at: new Date().toISOString()
    }])
  }

  return {
    user: data.user,
    session: data.session,
    message: 'Signup successful'
  }
}