'use server'

console.log('use server')

import { supabase } from '@/lib/supabaseClient'
import { cookies } from 'next/headers'
import { sendDepositEmailToAdmin } from '@/lib/email'

export async function initiateDeposit(amount: number, userEmail: string) {
  console.log('initiateDeposit called with:', { amount, userEmail })

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

  const reference = `DEP-${Date.now()}-${Math.floor(Math.random() * 1000)}`
  console.log('Generated reference:', reference)

  const { error } = await supabase
    .from('transactions')
    .insert([{
      user_id: userId,
      type: 'deposit',
      amount,
      status: 'pending',
      reference,
      user_email: userEmail
    }])
    .select()
    .single()

  if (error) {
    console.error('Deposit initiation failed:', error)
    return { error: 'Failed to initiate deposit' }
  }

  console.log('Transaction record inserted successfully')

  await sendDepositEmailToAdmin({
    userEmail,
    amount,
    reference,
    userId
  })

  console.log('Admin email sent for deposit')

  return {
    success: true,
    paymentDetails: {
      bankName: 'Moniepoint Microfinance Bank',
      accountNumber: '6851747698',
      accountName: 'Monnify Checkout',
      amount: `₦${amount.toLocaleString()}`,
      narration: reference,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
    }
  }
}
