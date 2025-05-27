// app/actions/bankAccounts.ts
'use server'

import { supabase } from '@/lib/supabaseClient'
import { cookies } from 'next/headers'

export interface BankAccount {
  id?: string
  bank_name: string
  account_number: string
  account_name: string
  is_active: boolean
  created_at?: string
  updated_at?: string
}

export async function checkAuth() {
    const cookieStore = await cookies()
    const userId = cookieStore.get('user_id')?.value
  
    if (!userId) {
      throw new Error('User not authenticated')
    }
  
    return userId
  }

export async function getActiveBankAccount() {
  try {
    await checkAuth()
    
    const { data, error } = await supabase
      .from('bank_accounts')
      .select('*')
      .eq('is_active', true)
      .single()

    if (error) {
      console.error('Error fetching bank account:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Authentication error:', error)
    return null
  }
}

export async function updateBankAccount(id: string, updates: Partial<BankAccount>) {
  try {
    await checkAuth()

    const { data, error } = await supabase
      .from('bank_accounts')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating bank account:', error)
      return { error: error.message }
    }

    return { data }
  } catch (error) {
    console.error('Authentication error:', error)
    return { error: error instanceof Error ? error.message : 'Authentication failed' }
  }
}

export async function createBankAccount(accountDetails: Omit<BankAccount, 'id' | 'created_at' | 'updated_at'>) {
  try {
    await checkAuth()

    const { data, error } = await supabase
      .from('bank_accounts')
      .insert(accountDetails)
      .select()
      .single()

    if (error) {
      console.error('Error creating bank account:', error)
      return { error: error.message }
    }

    return { data }
  } catch (error) {
    console.error('Authentication error:', error)
    return { error: error instanceof Error ? error.message : 'Authentication failed' }
  }
}

export async function getBankAccounts(): Promise<BankAccount[] | { error: string }> {
    try {
      await checkAuth()
      
      const { data, error } = await supabase
        .from('bank_accounts')
        .select('*')
        .order('created_at', { ascending: false })
  
      if (error) {
        console.error('Error fetching bank accounts:', error)
        return { error: error.message }
      }
  
      return data
    } catch (error) {
      console.error('Authentication error:', error)
      return { error: error instanceof Error ? error.message : 'Authentication failed' }
    }
  }

  export async function deleteBankAccount(id: string): Promise<{ error?: string }> {
    try {
      await checkAuth()
  
      const { error } = await supabase
        .from('bank_accounts')
        .delete()
        .eq('id', id)
  
      if (error) {
        console.error('Error deleting bank account:', error)
        return { error: error.message }
      }
  
      return {}
    } catch (error) {
      console.error('Authentication error:', error)
      return { error: error instanceof Error ? error.message : 'Authentication failed' }
    }
  }
  