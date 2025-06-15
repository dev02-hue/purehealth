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
  try {
    console.log('initiateWithdrawal called with:', { amount, bankName, accountNumber, accountName });

    // Get user ID from cookies
    const cookieStore =await cookies();
    const userId = cookieStore.get('user_id')?.value;

    // Validate inputs
    if (!userId) return { success: false, error: 'User not authenticated' };
    if (!bankName || !accountNumber || !accountName) {
      return { success: false, error: 'Please provide complete bank details' };
    }
    if (amount < 1000) {
      return { success: false, error: 'Minimum withdrawal is ₦1,000' };
    }

    // Calculate amounts
    const withdrawalFee = amount * 0.1;
    const netAmount = amount - withdrawalFee;

    // Verify user balance
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('balance')
      .eq('id', userId)
      .single();

    if (userError || !userData) {
      console.error('Failed to fetch user balance:', userError);
      return { success: false, error: 'Failed to verify your balance' };
    }

    const userBalance = userData.balance || 0;
    if (userBalance < amount) {
      return { success: false, error: 'Insufficient balance' };
    }

    // Create unique reference
    const reference = `WDR-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Insert withdrawal record
    const { data: withdrawalData, error: withdrawalError } = await supabase
      .from('withdrawals')
      .insert([{
        user_id: userId,
        amount: netAmount,
        fee: withdrawalFee,
        total_amount: amount,
        bank_name: bankName,
        account_number: accountNumber,
        account_name: accountName,
        status: 'pending',
        reference
      }])
      .select(); // This ensures we get the inserted data back

    if (withdrawalError || !withdrawalData || withdrawalData.length === 0) {
      console.error('Withdrawal insertion failed:', withdrawalError);
      return { success: false, error: 'Failed to save withdrawal to database' };
    }

    console.log('Withdrawal successfully inserted:', withdrawalData[0]);

    // Insert admin fee record
    const { error: adminFeeError } = await supabase
      .from('admin_withdrawals')
      .insert([{
        user_id: userId,
        fee: withdrawalFee,
        reference,
        status: 'pending',
        description: `10% withdrawal fee from withdrawal reference ${reference}`
      }]);

    if (adminFeeError) {
      console.error('Admin fee insertion failed (non-critical):', adminFeeError);
      // Continue even if this fails as it's secondary
    }

    // Send email notification
    try {
      await sendWithdrawalEmailToAdmin({
        userId,
        amount: netAmount,
        fee: withdrawalFee,
        total: amount,
        bankName,
        accountNumber,
        accountName,
        reference
      });
    } catch (emailError) {
      console.error('Failed to send email (non-critical):', emailError);
    }

    // Verify the withdrawal exists in database
    const { data: verifyData, error: verifyError } = await supabase
      .from('withdrawals')
      .select('*')
      .eq('reference', reference)
      .single();

    if (verifyError || !verifyData) {
      console.error('Verification failed - withdrawal not found:', verifyError);
      return { 
        success: false, 
        error: 'Withdrawal initiated but could not be verified in database' 
      };
    }

    console.log('Withdrawal verified in database:', verifyData);

    return {
      success: true,
      message: 'Withdrawal initiated successfully!',
      details: {
        message: 'Withdrawal initiated successfully! It will be processed shortly.',
        amountWithdrawn: netAmount,
        fee: withdrawalFee,
        totalDeducted: amount,
        bankName,
        accountNumber,
        reference
      }
    };
  } catch (error) {
    console.error('Unexpected error in initiateWithdrawal:', error);
    return { 
      success: false, 
      error: 'An unexpected error occurred during withdrawal initiation' 
    };
  }
}

export async function approveWithdrawal(withdrawalId: number): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('Attempting to approve withdrawal ID:', withdrawalId);

    // Verify the withdrawal exists and is pending
    const { data: withdrawalData, error: withdrawalError } = await supabase
    .from('withdrawals')
    .select('*')
    .order('created_at', { ascending: false });

    if (withdrawalError || !withdrawalData) {
      console.error('Withdrawal verification failed:', withdrawalError);
      throw new Error('Withdrawal not found or already processed');
    }

    // Call the stored procedure
    const { data, error } = await supabase.rpc('approve_withdrawal', {
      withdrawal_id: withdrawalId,
    });

    if (error) {
      console.error('RPC call failed:', error);
      throw error;
    }

    if (!data || data.length === 0) {
      throw new Error('No response from approval function');
    }

    const result = data[0];
    if (!result.success) {
      throw new Error(result.error || 'Unknown error during approval');
    }

    return { success: true };
  } catch (error) {
    console.error('Withdrawal approval failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}