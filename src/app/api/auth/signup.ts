'use server'

import { recordReferral } from '@/lib/referral/referrals'
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
  const referralCode = uuidv4().split('-')[0] + userId.slice(0, 4)

  // 4. Process referral code if provided
  if (referredCode) {
    try {
      await recordReferral(userId, referredCode)
    } catch (err) {
      console.error('Referral recording failed:', err)
      // Don't fail signup if referral fails, just continue
    }
  }

  // 5. Insert profile data
  const { error: profileError } = await supabase.from('profiles').insert([{
    id: userId,
    first_name: firstName,
    last_name: lastName,
    email: email || null,
    phone_number: phone || null,
    balance: 500,
    referral_code: referralCode,
    is_phone_user: !email,
    auth_email: authEmail,
    created_at: new Date().toISOString()
  }])

  if (profileError) {
    await supabase.auth.admin.deleteUser(userId)
    return { error: 'Failed to create profile: ' + profileError.message }
  }

  return {
    user: data.user,
    session: data.session,
    referralCode,
    message: 'Signup successful'
  }
}