'use server'

import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Constants for payout interval
const PAYOUT_INTERVAL_HOURS = 20;
const MS_IN_HOUR = 1000 * 60 * 60;
const PAYOUT_INTERVAL_MS = PAYOUT_INTERVAL_HOURS * MS_IN_HOUR;

// Background processing state
let isProcessing = false;
let processingInterval: NodeJS.Timeout | null = null;
let isInitialized = false;

// Initialize the earnings processor
function initializeEarningsProcessor() {
  if (isInitialized) return;
  isInitialized = true;

  console.log('Initializing earnings processor...');
  
  const processWithRetry = async (attempt = 1) => {
    if (isProcessing) return;
    
    try {
      isProcessing = true;
      console.log('Running earnings processing...');
      const result = await processEarnings();
      console.log('Earnings processing complete:', result);
      
      // Reset attempt counter on success
      attempt = 1;
    } catch (error) {
      console.error(`Error processing earnings (attempt ${attempt}):`, error);
      
      // Exponential backoff for retries
      const retryDelay = Math.min(1000 * Math.pow(2, attempt), PAYOUT_INTERVAL_MS);
      console.log(`Retrying in ${retryDelay / 1000} seconds...`);
      
      setTimeout(() => processWithRetry(attempt + 1), retryDelay);
      return;
    } finally {
      isProcessing = false;
    }
    
    // Schedule next processing
    processingInterval = setTimeout(() => processWithRetry(), PAYOUT_INTERVAL_MS);
  };

  // Start the initial processing
  processWithRetry();
}

// Initialize when module loads (only in production)
if (process.env.NODE_ENV === 'production') {
  initializeEarningsProcessor();
}

export async function investInPlan(plan: {
  name: string;
  price: number;
  dailyIncome: number;
  totalIncome: number;
  duration: string;
}) {
  console.log('[investInPlan] Starting investment process');
  console.log('[investInPlan] Plan details:', JSON.stringify(plan, null, 2));

  const cookieStore = await cookies();
  const userId = cookieStore.get('user_id')?.value;
  console.log('[investInPlan] User ID from cookies:', userId);

  if (!userId) {
    console.error('[investInPlan] Error: No user ID found in cookies');
    throw new Error('User not authenticated');
  }

  // Validate plan calculations
  const durationInDays = parseInt(plan.duration.split(' ')[0]);
  const expectedTotalIncome = plan.dailyIncome * durationInDays;
  console.log('[investInPlan] Calculated duration (days):', durationInDays);
  console.log('[investInPlan] Expected total income:', expectedTotalIncome);
  
  if (Math.abs(plan.totalIncome - expectedTotalIncome) > 0.01) {
    console.error('[investInPlan] Plan validation failed: totalIncome mismatch');
    throw new Error(`Invalid plan: totalIncome should be ${expectedTotalIncome} (dailyIncome * duration)`);
  }

  // Calculate hourly rate and payout amount
  const hourlyRate = plan.dailyIncome / 24;
  const payoutPerInterval = hourlyRate * PAYOUT_INTERVAL_HOURS;
  console.log('[investInPlan] Hourly rate:', hourlyRate);
  console.log('[investInPlan] Payout per interval:', payoutPerInterval);

  // First check if user has enough balance
  console.log('[investInPlan] Fetching user profile for ID:', userId);
  const { data: profile, error: profileError } = await supabase
    .from('profiles')  // <-- NOTE: Typo here? Should it be 'profiles' or 'profiles'?
    .select('balance')
    .eq('id', userId)
    .single();

  if (profileError || !profile) {
    console.error('[investInPlan] Error fetching profile:', profileError);
    throw new Error('Failed to fetch user profile');
  }
  console.log('[investInPlan] Current user balance:', profile.balance);

  if (profile.balance < plan.price) {
    console.error('[investInPlan] Insufficient balance:', {
      balance: profile.balance,
      required: plan.price
    });
    throw new Error('Insufficient balance for this investment');
  }

  // Deduct investment amount
  console.log('[investInPlan] Deducting investment amount from balance');
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ balance: profile.balance - plan.price })
    .eq('id', userId);

  if (updateError) {
    console.error('[investInPlan] Error updating balance:', updateError);
    throw new Error('Failed to update balance');
  }

  // Calculate dates
  const now = new Date();
  const endDate = new Date(now.getTime() + durationInDays * 24 * MS_IN_HOUR);
  const nextPayoutDate = new Date(now.getTime() + PAYOUT_INTERVAL_MS);
  console.log('[investInPlan] Date calculations:', {
    now: now.toISOString(),
    endDate: endDate.toISOString(),
    nextPayoutDate: nextPayoutDate.toISOString()
  });

  // Prepare investment data
  const investmentData = {
    user_id: userId,
    plan_name: plan.name,
    amount_invested: plan.price,
    daily_income: plan.dailyIncome,
    // payout_per_interval: payoutPerInterval,
    total_income: plan.totalIncome,
    duration_days: durationInDays,
    start_date: now.toISOString(),
    end_date: endDate.toISOString(),
    last_payout_date: now.toISOString(),
    next_payout_date: nextPayoutDate.toISOString(),
    status: 'active',
    earnings_to_date: 0
  };
  console.log('[investInPlan] Investment data to insert:', JSON.stringify(investmentData, null, 2));

  // Create investment record
  console.log('[investInPlan] Attempting to create investment record');
  const { data: investment, error: investmentError } = await supabase
    .from('investments')
    .insert([investmentData])
    .select()
    .single();

  if (investmentError || !investment) {
    console.error('[investInPlan] Investment creation failed:', {
      error: investmentError,
      data: investment
    });
    
    // Rollback balance update
    console.log('[investInPlan] Attempting balance rollback');
    const rollbackResult = await supabase
      .from('profiles')
      .update({ balance: profile.balance })
      .eq('id', userId);
    
    console.log('[investInPlan] Rollback result:', rollbackResult);
    throw new Error(`Failed to create investment: ${investmentError?.message}`);
  }

  console.log('[investInPlan] Investment created successfully:', investment);
  revalidatePath('/');
  return { success: true };
}

export async function processEarnings() {
  const now = new Date();
  const nowISO = now.toISOString();

  // Get all active investments due for payout
  const { data: investments, error } = await supabase
    .from('investments')
    .select('*')
    .eq('status', 'active')
    .lt('next_payout_date', nowISO);

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
      
      // Calculate how many intervals have passed
      const intervalsPassed = Math.floor(
        (now.getTime() - lastPayoutDate.getTime()) / PAYOUT_INTERVAL_MS
      );

      if (intervalsPassed < 1) continue;

      // Calculate payout amount
      const payoutAmount = Math.min(
        inv.payout_per_interval * intervalsPassed,
        inv.total_income - inv.earnings_to_date
      );

      // Calculate new earnings
      const newEarnings = inv.earnings_to_date + payoutAmount;
      const isCompleted = newEarnings >= inv.total_income;

      // Calculate next payout date (skip if completed)
      const nextPayout = isCompleted 
        ? null 
        : new Date(lastPayoutDate.getTime() + (intervalsPassed + 1) * PAYOUT_INTERVAL_MS);

      // Update investment record
      const updateResult = await supabase
        .from('investments')
        .update({
          earnings_to_date: newEarnings,
          last_payout_date: new Date(lastPayoutDate.getTime() + intervalsPassed * PAYOUT_INTERVAL_MS).toISOString(),
          next_payout_date: nextPayout?.toISOString() || null,
          status: isCompleted ? 'completed' : 'active'
        })
        .eq('id', inv.id);

      if (updateResult.error) {
        throw new Error(`Investment update failed: ${updateResult.error.message}`);
      }

      // Update user balance
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

// Cleanup on process exit
process.on('SIGTERM', () => {
  if (processingInterval) {
    clearTimeout(processingInterval);
  }
});

process.on('SIGINT', () => {
  if (processingInterval) {
    clearTimeout(processingInterval);
  }
});