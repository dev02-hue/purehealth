// lib/withdrawal.ts
'use server'

import { supabase } from '@/lib/supabaseClient'
import { cookies } from 'next/headers'
import { sendWithdrawalEmailToAdmin } from '@/lib/email'
import { WithdrawalResponse } from '@/types/withdrawal'

export async function initiateWithdrawal(
  amount: number,
  bankName: string,
  accountNumber: string,
  accountName: string
): Promise<WithdrawalResponse> {
  console.log('initiateWithdrawal called with:', { 
    amount, 
    bankName, 
    accountNumber, 
    accountName 
  })

  // Authentication check
  const cookieStore = await cookies()
  const userId = cookieStore.get('user_id')?.value
  console.log('Retrieved user ID from cookie:', userId)

  if (!userId) {
    console.log('User not authenticated')
    return { success: false, error: 'User not authenticated' }
  }

  // Validate withdrawal details
  if (!bankName || !accountNumber || !accountName) {
    console.log('Missing bank details')
    return { success: false, error: 'Please provide complete bank details' }
  }

  if (amount < 1000) {
    console.log('Amount too low:', amount)
    return { success: false, error: 'Minimum withdrawal is ₦1,000' }
  }

  // Calculate withdrawal fee (10%)
  const withdrawalFee = amount * 0.1
  const totalDeduction = amount + withdrawalFee

  // Get user balance
  const { data: userData, error: userError } = await supabase
    .from('profiles')
    .select('balance')
    .eq('id', userId)
    .single()

  if (userError || !userData) {
    console.error('Failed to fetch user balance:', userError)
    return { success: false, error: 'Failed to verify your balance' }
  }

  const userBalance = userData.balance || 0

  // Check sufficient balance
  if (userBalance < totalDeduction) {
    console.log('Insufficient balance:', { userBalance, totalDeduction })
    return { success: false, error: 'Insufficient balance (includes 10% withdrawal fee)' }
  }

  // Create withdrawal record
  const reference = `WDR-${Date.now()}-${Math.floor(Math.random() * 1000)}`
  console.log('Generated withdrawal reference:', reference)

  const { error: withdrawalError } = await supabase
    .from('withdrawals')
    .insert([{
      user_id: userId,
      amount,
      fee: withdrawalFee,
      total_amount: totalDeduction,
      bank_name: bankName,
      account_number: accountNumber,
      account_name: accountName,
      status: 'pending',
      reference
    }])
    .select()
    .single()

  if (withdrawalError) {
    console.error('Withdrawal initiation failed:', withdrawalError)
    return { success: false, error: 'Failed to initiate withdrawal' }
  }

  console.log('Withdrawal record inserted successfully')

  // Send notification to admin
  await sendWithdrawalEmailToAdmin({
    userId,
    amount,
    fee: withdrawalFee,
    total: totalDeduction,
    bankName,
    accountNumber,
    accountName,
    reference
  })

  console.log('Admin email sent for withdrawal')

  return {
    success: true,
    message: 'Withdrawal successful! Check your bank in 10-20 minutes.',
    details: {
      message: 'Withdrawal successful! Check your bank in 10-20 minutes.',
      amountWithdrawn: amount,
      fee: withdrawalFee,
      totalDeducted: totalDeduction,
      bankName,
      accountNumber,
      reference
    }
  }
}

// lib/withdrawal.ts
export async function approveWithdrawal(withdrawalId: number): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('🔍 Attempting to approve withdrawal with ID:', withdrawalId);
  
      // Verify the withdrawal exists and is pending
      const { data: withdrawalData, error: withdrawalError } = await supabase
        .from('withdrawals')
        .select('*')
        .eq('id', withdrawalId)
        .eq('status', 'pending')
        .single();
  
      console.log('📄 Withdrawal data:', withdrawalData);
      console.log('⚠️ Withdrawal fetch error:', withdrawalError);
  
      if (withdrawalError || !withdrawalData) {
        throw new Error('Withdrawal not found or already processed');
      }
  
      // Call the approve_withdrawal RPC, which returns an array of rows with { success, error }
      console.log('🚀 Calling approve_withdrawal RPC...');
      const { data, error } = await supabase.rpc('approve_withdrawal', {
        withdrawal_id: withdrawalId,
      });
  
      console.log('📦 RPC Response Data:', data);
      console.log('⚠️ RPC Error:', error);
  
      if (error) throw error;
  
      // The data will be an array with one element: [{ success: boolean, error: string | null }]
      if (!data || data.length === 0) {
        throw new Error('No response from approval function');
      }
  
      const result = data[0];
  
      if (!result.success) {
        throw new Error(result.error || 'Unknown error during withdrawal approval');
      }
  
      return { success: true };
    } catch (error: unknown) {
      console.error('❌ Withdrawal approval failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }
  