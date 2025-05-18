// api/auth/signup.ts
'use server'

import { supabase } from '@/lib/supabaseClient'

export async function signUp({
  email,
  phone,
  password,
  firstName,
  lastName,
}: {
  email?: string
  phone?: string
  password: string
  firstName: string
  lastName: string
}) {
  if (!email && !phone) return { error: 'Email or phone is required' }

  let data
  let error

  if (email) {
    ({ data, error } = await supabase.auth.signUp({ email, password }))
  } else if (phone) {
    ({ data, error } = await supabase.auth.signUp({ phone, password }))
  }

  if (error || !data?.user) {
    return { error: error?.message || 'Signup failed' }
  }

  const userId = data.user.id

  const { error: profileError } = await supabase.from('profiles').insert([
    {
      id: userId,
      first_name: firstName,
      last_name: lastName,
      email,
      phone_number: phone,
      balance: 900,
    },
  ])

  if (profileError) return { error: profileError.message }

  return { user: data.user }
}
