// lib/details.ts
'use server'

import { supabase } from '@/lib/supabaseClient'
import { cookies } from 'next/headers'

export async function createUserDetails({
  bank_account,
  account_name,
  account_number,
}: {
  bank_account: string
  account_name: string
  account_number: string
}) {
  const cookieStore = await cookies()
  const userId = (cookieStore.get('user_id')?.value) // 👈 Convert to BIGINT

  if (!userId) {
    return { error: 'User not authenticated', success: false }
  }

  const { data, error } = await supabase
    .from('details')
    .insert([
      {
        user_id: userId,
        bank_account,
        account_name,
        account_number,
      },
    ])

  if (error) {
    console.error('Error saving user details:', error)
    return { error: 'Failed to save details', success: false }
  }

  return { success: true, data }
}

export async function getUserDetails() {
    const cookieStore = await cookies()
    const userId = cookieStore.get('user_id')?.value
  
    if (!userId) {
      return { error: 'User not authenticated', details: null }
    }
  
    const { data, error } = await supabase
      .from('details')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .single() // if you're expecting only one record
  
    if (error) {
      console.error('Error fetching user details:', error)
      return { error: 'Failed to fetch details', details: null }
    }
  
    return { details: data, error: null }
  }

  export async function updateUserDetails({
    bank_account,
    account_name,
    account_number,
  }: {
    bank_account: string
    account_name: string
    account_number: string
  }) {
    const cookieStore = await cookies()
    const userId = cookieStore.get('user_id')?.value
  
    if (!userId) {
      return { error: 'User not authenticated', success: false }
    }
  
    const { error } = await supabase
      .from('details')
      .update({
        bank_account,
        account_name,
        account_number,
      })
      .eq('user_id', userId)
  
    if (error) {
      console.error('Error updating user details:', error)
      return { error: 'Failed to update details', success: false }
    }
  
    return { success: true }
  }
  