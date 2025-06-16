'use server'

import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function investInPlan(plan: {
  name: string;
  price: number;
  dailyIncome: number;
  totalIncome: number;
  duration: string;
}) {
  const cookieStore = await cookies()
  const userId = cookieStore.get('user_id')?.value

  if (!userId) {
    throw new Error('User not authenticated')
  }

  // First check if user has enough balance
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('balance')
    .eq('id', userId)
    .single()

  if (profileError || !profile) {
    throw new Error('Failed to fetch user profile')
  }

  if (profile.balance < plan.price) {
    throw new Error('Insufficient balance for this investment')
  }

  // Deduct the investment amount from balance
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ balance: profile.balance - plan.price })
    .eq('id', userId)

  if (updateError) {
    throw new Error('Failed to update balance')
  }

  // Create the investment record
  const durationInDays = parseInt(plan.duration.split(' ')[0])
  const endDate = new Date()
  endDate.setDate(endDate.getDate() + durationInDays)

  const now = new Date();
const nextPayoutDate = new Date(now);
nextPayoutDate.setDate(nextPayoutDate.getDate() + 1);
nextPayoutDate.setHours(0, 0, 0, 0); // Set to midnight

  const { data: investment, error: investmentError } = await supabase
    .from('investments')
    .insert([{
      user_id: userId,
      plan_name: plan.name,
      amount_invested: plan.price,
      daily_income: plan.dailyIncome,
      total_income: plan.totalIncome,
      duration_days: durationInDays,
      start_date: now.toISOString(),
      end_date: endDate.toISOString(),
      last_payout_date: now.toISOString(),
      next_payout_date: nextPayoutDate.toISOString(),
      status: 'active',
      earnings_to_date: 0
    }])
    .select()
    .single()

  if (investmentError || !investment) {
    // Rollback balance update if investment creation fails
    await supabase
      .from('profiles')
      .update({ balance: profile.balance })
      .eq('id', userId)
    throw new Error('Failed to create investment')
  }

  revalidatePath('/')
  return { success: true }
}

export async function processDailyEarnings() {
  const now = new Date();
  const nowISO = now.toISOString();

  // Get all active investments due for payout
  const { data: investments, error } = await supabase
    .from('investments')
    .select('*')
    .eq('status', 'active');

  if (error) {
    console.error('Error fetching investments:', error.message);
    return { success: false, message: 'Failed to fetch investments' };
  }

  const results = {
    success: true,
    updatedInvestments: [] as string[],
    completedInvestments: [] as string[],
    failedUpdates: [] as string[]
  };

  for (const inv of investments) {
    try {
      const nextPayoutDate = new Date(inv.next_payout_date);
      
      // Check if payout is due (now is after next payout date)
      if (now >= nextPayoutDate && inv.earnings_to_date < inv.total_income) {
        // Calculate how many days have passed since last payout
        const lastPayoutDate = new Date(inv.last_payout_date);
        const daysPassed = Math.floor((now.getTime() - lastPayoutDate.getTime()) / (1000 * 60 * 60 * 24));
        
        // Calculate new earnings for all missed days
        const potentialEarnings = inv.earnings_to_date + (inv.daily_income * daysPassed);
        const newEarnings = Math.min(potentialEarnings, inv.total_income);
        const payoutAmount = newEarnings - inv.earnings_to_date;

        // Check if investment will be completed after this payout
        const isCompleted = newEarnings >= inv.total_income;

        // Calculate next payout date (midnight of the next day)
        const nextPayout = new Date(now);
        nextPayout.setDate(nextPayout.getDate() + 1);
        nextPayout.setHours(0, 0, 0, 0);

        // Update investment record
        const updateResult = await supabase
          .from('investments')
          .update({
            earnings_to_date: newEarnings,
            last_payout_date: nowISO,
            next_payout_date: isCompleted ? null : nextPayout.toISOString(),
            status: isCompleted ? 'completed' : 'active'
          })
          .eq('id', inv.id);

        if (updateResult.error) {
          throw new Error(`Investment update failed: ${updateResult.error.message}`);
        }

        // Update user's balance only if there's actually earnings to add
        if (payoutAmount > 0) {
          const { data: userProfile, error: profileError } = await supabase
            .from('profiles')
            .select('balance')
            .eq('id', inv.user_id)
            .single();

          if (profileError || !userProfile) {
            throw new Error('Failed to fetch user balance');
          }

          const newBalance = userProfile.balance + payoutAmount;
          const balanceUpdate = await supabase
            .from('profiles')
            .update({ balance: newBalance })
            .eq('id', inv.user_id);

          if (balanceUpdate.error) {
            throw new Error('Failed to update user balance');
          }
        }

        // Record results
        if (isCompleted) {
          results.completedInvestments.push(inv.id);
        } else {
          results.updatedInvestments.push(inv.id);
        }
      }
    } catch (error) {
      console.error(`Error processing investment ${inv.id}:`, error);
      results.failedUpdates.push(inv.id);
      results.success = false;
    }
  }

  if (results.updatedInvestments.length > 0 || results.completedInvestments.length > 0) {
    revalidatePath('/');
  }

  return results;
}