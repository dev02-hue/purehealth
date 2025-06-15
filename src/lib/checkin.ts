'use server'

import { supabase } from '@/lib/supabaseClient'
import { cookies } from 'next/headers'

// Function to get Nigeria's current time
async function getNigeriaTime(): Promise<Date> {
  try {
    // Using WorldTimeAPI for Nigeria (Africa/Lagos timezone)
    const response = await fetch('http://worldtimeapi.org/api/timezone/Africa/Lagos')
    const data = await response.json()
    return new Date(data.datetime)
  } catch (error) {
    console.error('Failed to fetch Nigeria time, using local time as fallback:', error)
    return new Date() // Fallback to server time
  }
}

export async function checkIn(): Promise<{ 
    success: boolean; 
    error?: string; 
    message?: string; 
    newBalance?: number 
  }> {
    try {
      // Get user ID from cookies
      const cookieStore = await cookies()
      const userId = cookieStore.get('user_id')?.value
      if (!userId) return { success: false, error: 'User not authenticated' }
  
      // Get Nigeria's current time
      const now = await getNigeriaTime()
      const today = now.toISOString().split('T')[0] // YYYY-MM-DD format
  
      // Check if user has made at least one deposit
      const { data: deposits, error: depositError } = await supabase
        .from('transactions')
        .select('id')
        .eq('user_id', userId)
        .eq('type', 'deposit')
        .eq('status', 'pending') // Or whatever status indicates a successful deposit
        .limit(1)
  
      if (depositError) {
        console.error('Error checking deposits:', depositError)
        return { success: false, error: 'Error verifying deposit history' }
      }
  
      if (!deposits || deposits.length === 0) {
        return { success: false, error: 'You must make at least one deposit before earning check-in points' }
      }
  
      // Check if user already checked in today
      const { data: existingCheckIns, error: checkInError } = await supabase
        .from('check_ins')
        .select('id')
        .eq('user_id', userId)
        .gte('created_at', `${today}T00:00:00`) // After midnight today
        .lte('created_at', `${today}T23:59:59`) // Before midnight today
        .limit(1)
  
      if (checkInError) {
        console.error('Error checking existing check-ins:', checkInError)
        return { success: false, error: 'Error verifying check-in history' }
      }
  
      if (existingCheckIns && existingCheckIns.length > 0) {
        return { success: false, error: 'You have already checked in today' }
      }
  
      // Record the check-in
      const { error: insertError } = await supabase
        .from('check_ins')
        .insert([{
          user_id: userId,
          amount: 100,
          date: today
        }])
  
      if (insertError) {
        console.error('Error recording check-in:', insertError)
        return { success: false, error: 'Failed to record check-in' }
      }
  
      // Update user balance
      const { error: updateError } = await supabase.rpc('increment_balance_daily_checkin', {
        user_id: userId,
        amount: 100
      })
  
      if (updateError) {
        console.error('Error updating balance:', updateError)
        // Try to delete the check-in record since balance update failed
        await supabase
          .from('check_ins')
          .delete()
          .eq('user_id', userId)
          .gte('created_at', `${today}T00:00:00`)
          .lte('created_at', `${today}T23:59:59`)
        return { success: false, error: 'Failed to update balance' }
      }
  
      // Get the new balance
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('balance')
        .eq('id', userId)
        .single()
  
      if (userError) {
        console.error('Error fetching new balance:', userError)
        return { 
          success: true, 
          message: 'Check-in successful! Balance updated, but could not fetch new balance',
          newBalance: undefined
        }
      }
  
      return { 
        success: true, 
        message: 'Check-in successful! ₦100 has been added to your balance',
        newBalance: userData.balance
      }
    } catch (error) {
      console.error('Unexpected error in checkIn:', error)
      return { 
        success: false, 
        error: 'An unexpected error occurred during check-in' 
      }
    }
  }