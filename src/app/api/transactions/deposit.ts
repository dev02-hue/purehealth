'use server'

import { supabase } from '@/lib/supabaseClient'
import { cookies } from 'next/headers'
import { sendDepositEmailToAdmin } from '@/lib/email'

export async function initiateDeposit(amount: number, userEmail: string, senderBankDetails: string) {
  console.log('initiateDeposit called with:', { amount, userEmail, senderBankDetails })

  const cookieStore = await cookies()
  const userId = cookieStore.get('user_id')?.value
  console.log('Retrieved user ID from cookie:', userId)

  if (!userId) {
    console.log('User not authenticated')
    return { error: 'User not authenticated' }
  }

  if (amount < 1000) {
    console.log('Amount too low:', amount)
    return { error: 'Minimum deposit is ₦1,000' }
  }

  if (!senderBankDetails || senderBankDetails.trim().length < 5) {
    console.log('Invalid sender bank details')
    return { error: 'Please provide valid bank details where you are sending from' }
  }

  // Fetch active bank account details
  const { data: bankAccount, error: bankError } = await supabase
    .from('bank_accounts')
    .select('bank_name, account_number, account_name')
    .eq('is_active', true)
    .single()

  if (bankError || !bankAccount) {
    console.error('Error fetching bank account:', bankError)
    return { error: 'Unable to fetch payment details. Please try again later.' }
  }

  const reference = `Sheraton-${Date.now()}-${Math.floor(Math.random() * 1000)}`
  console.log('Generated reference:', reference)

  // Insert transaction with 'initiated' status and sender's bank details
  const { data: transaction, error } = await supabase
    .from('transactions')
    .insert([{
      user_id: userId,
      type: 'deposit',
      amount,
      status: 'initiated',
      reference,
      user_email: userEmail,
      account_details: senderBankDetails // Store the sender's bank details
    }])
    .select()
    .single()

  if (error) {
    console.error('Deposit initiation failed:', error)
    return { error: 'Failed to initiate deposit' }
  }

  console.log('Transaction record inserted successfully')

  return {
    success: true,
    paymentDetails: {
      bankName: bankAccount.bank_name,
      accountNumber: bankAccount.account_number,
      accountName: bankAccount.account_name,
      amount: `₦${amount.toLocaleString()}`,
      narration: reference,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      transactionId: transaction.id
    }
  }
}

export async function confirmDeposit(transactionId: string) {
  console.log('confirmDeposit called for transaction:', transactionId)

  // First get the transaction details including the account_details
  const { data: transaction, error: fetchError } = await supabase
    .from('transactions')
    .select('*')
    .eq('id', transactionId)
    .single()

  if (fetchError || !transaction) {
    console.error('Failed to fetch transaction:', fetchError)
    return { error: 'Failed to confirm deposit - transaction not found' }
  }

  // Update transaction status to 'pending'
  const { error: updateError } = await supabase
    .from('transactions')
    .update({ status: 'pending' })
    .eq('id', transactionId)

  if (updateError) {
    console.error('Failed to confirm deposit:', updateError)
    return { error: 'Failed to confirm deposit' }
  }

  console.log('Transaction status updated to pending')

  // Send email to admin with all details including sender's bank info
  await sendDepositEmailToAdmin({
    userEmail: transaction.user_email,
    amount: transaction.amount,
    reference: transaction.reference,
    userId: transaction.user_id,
    senderBankDetails: transaction.account_details // Include sender's bank details
  })

  console.log('Admin email sent for deposit confirmation')

  return { success: true }
}