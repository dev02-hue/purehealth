'use server'

import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Constants for payout interval - CHANGED TO 24 HOURS
const PAYOUT_INTERVAL_HOURS = 24;
const MS_IN_HOUR = 1000 * 60 * 60;
const PAYOUT_INTERVAL_MS = PAYOUT_INTERVAL_HOURS * MS_IN_HOUR;

// Background processing state
let isProcessing = false;
let processingInterval: NodeJS.Timeout | null = null;
let isInitialized = false;

// Initialize the earnings processor
function initializeEarningsProcessor() {
  if (isInitialized) return
  isInitialized = true

  const runProcessor = async () => {
    if (isProcessing) return
    
    try {
      isProcessing = true
      console.log('[Earnings Processor] Starting scheduled earnings processing...')
      
      const result = await processEarnings()
      console.log('[Earnings Processor] Processing results:', {
        updated: 'updatedInvestments' in result ? result.updatedInvestments.length : 0,
        completed: 'completedInvestments' in result ? result.completedInvestments.length : 0,
        failed: 'failedUpdates' in result ? result.failedUpdates.length : 0
      })
      
    } catch (error) {
      console.error('[Earnings Processor] Processing error:', error)
    } finally {
      isProcessing = false
      
      // Schedule next run in exactly 24 hours - CHANGED FROM 20
      processingInterval = setTimeout(runProcessor, PAYOUT_INTERVAL_MS)
      const nextRun = new Date(Date.now() + PAYOUT_INTERVAL_MS)
      console.log('[Earnings Processor] Next automatic processing at:', nextRun.toISOString())
    }
  }

  // Calculate time until next 20:00 (8 PM) payout
  const now = new Date()
  const nextTarget = new Date(now)
  nextTarget.setHours(20, 0, 0, 0) // Keep target hour at 20:00 (8 PM)
  
  if (nextTarget < now) {
    nextTarget.setDate(nextTarget.getDate() + 1)
  }
  
  const initialDelay = nextTarget.getTime() - now.getTime()
  
  console.log('[Earnings Processor] Initializing... First run in:', 
    `${(initialDelay / MS_IN_HOUR).toFixed(2)} hours (at ${nextTarget.toISOString()})`)
    
  processingInterval = setTimeout(runProcessor, initialDelay)
}

initializeEarningsProcessor()

export async function investInPlan(plan: {
  name: string;
  price: number;
  dailyIncome: number;
  totalIncome: number;
  duration: string;
}) {
  const cookieStore = await cookies();
  const userId = cookieStore.get('user_id')?.value;
 
  if (!userId) {
    console.error('[investInPlan] Error: No user ID found in cookies');
    throw new Error('User not authenticated');
  }

  // Validate plan calculations
  const durationInDays = parseInt(plan.duration.split(' ')[0]);
  const expectedTotalIncome = plan.dailyIncome * durationInDays;
 
  if (Math.abs(plan.totalIncome - expectedTotalIncome) > 0.01) {
     throw new Error(`Invalid plan: totalIncome should be ${expectedTotalIncome} (dailyIncome * duration)`);
  }

  // CHANGED TO DIRECT DAILY PAYOUT - NO HOURLY CALCULATION NEEDED
  const payoutPerInterval = plan.dailyIncome; // Direct daily payout
  console.log('[investInPlan] Payout per interval:', payoutPerInterval);

  // Check user balance
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('balance')
    .eq('id', userId)
    .single();

  if (profileError || !profile) {
     throw new Error('Failed to fetch user profile');
  }
 
  if (profile.balance < plan.price) {
    console.error('[investInPlan] Insufficient balance:', {
      balance: profile.balance,
      required: plan.price
    });
    throw new Error('Insufficient balance for this investment');
  }

  // Deduct investment amount
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ balance: profile.balance - plan.price })
    .eq('id', userId);

  if (updateError) {
     throw new Error('Failed to update balance');
  }

  // Calculate dates
  const now = new Date();
  const endDate = new Date(now.getTime() + durationInDays * 24 * MS_IN_HOUR);
  const nextPayoutDate = new Date(now.getTime() + PAYOUT_INTERVAL_MS);

  // Prepare investment data
  const investmentData = {
    user_id: userId,
    plan_name: plan.name,
    amount_invested: plan.price,
    daily_income: plan.dailyIncome,
    payout_per_interval: payoutPerInterval, // Now equals dailyIncome
    total_income: plan.totalIncome,
    duration_days: durationInDays,
    start_date: now.toISOString(),
    end_date: endDate.toISOString(),
    last_payout_date: now.toISOString(),
    next_payout_date: nextPayoutDate.toISOString(),
    status: 'active',
    earnings_to_date: 0
  };

  // Create investment record
  const { data: investment, error: investmentError } = await supabase
    .from('investments')
    .insert([investmentData])
    .select()
    .single();

  if (investmentError || !investment) {
    // Rollback balance update
    await supabase
      .from('profiles')
      .update({ balance: profile.balance })
      .eq('id', userId);
    
    throw new Error(`Failed to create investment: ${investmentError?.message}`);
  }

  revalidatePath('/');
  return { success: true };
}

export async function processEarnings() {
  const now = new Date();
  const nowISO = now.toISOString();

  const { data: investments, error } = await supabase
    .from('investments')
    .select('*')
    .eq('status', 'active')
    .lte('next_payout_date', nowISO);

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
      const lastPayoutDate = new Date(inv.last_payout_date);
      
      const intervalsPassed = Math.floor(
        (now.getTime() - lastPayoutDate.getTime()) / PAYOUT_INTERVAL_MS
      );

      if (intervalsPassed < 1) continue;

      const payoutAmount = Math.min(
        inv.payout_per_interval * intervalsPassed,
        inv.total_income - inv.earnings_to_date
      );

      const newEarnings = inv.earnings_to_date + payoutAmount;
      const isCompleted = newEarnings >= inv.total_income;

      const nextPayout = isCompleted 
        ? null 
        : new Date(lastPayoutDate.getTime() + (intervalsPassed + 1) * PAYOUT_INTERVAL_MS);

      // Update investment
      const updateResult = await supabase
        .from('investments')
        .update({
          earnings_to_date: newEarnings,
          last_payout_date: new Date(lastPayoutDate.getTime() + intervalsPassed * PAYOUT_INTERVAL_MS).toISOString(),
          next_payout_date: nextPayout?.toISOString() || null,
          status: isCompleted ? 'completed' : 'active'
        })
        .eq('id', inv.id);

      if (updateResult.error) throw updateResult.error;

      // Update user balance
      if (payoutAmount > 0) {
        const { data: userProfile, error: profileError } = await supabase
          .from('profiles')
          .select('balance')
          .eq('id', inv.user_id)
          .single();

        if (profileError) throw profileError;

        const balanceUpdate = await supabase
          .from('profiles')
          .update({ balance: userProfile.balance + payoutAmount })
          .eq('id', inv.user_id);

        if (balanceUpdate.error) throw balanceUpdate.error;
      }

      if (isCompleted) {
        results.completedInvestments.push(inv.id);
      } else {
        results.updatedInvestments.push(inv.id);
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

// Cleanup handlers
process.on('SIGTERM', () => processingInterval && clearTimeout(processingInterval))
process.on('SIGINT', () => processingInterval && clearTimeout(processingInterval))

export async function manualTriggerEarningsProcessing() {
  console.log('Manually triggering earnings processing...')
  return await processEarnings()
}