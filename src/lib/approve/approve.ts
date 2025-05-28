import { supabase } from '@/lib/supabaseClient'

export async function approveTransaction(transactionId: number) {
  try {
    const { data, error } = await supabase.rpc('approve_transaction', {
      transaction_id: transactionId
    });

    if (error) throw error;
    if (data?.error) throw new Error(data.error);

    return { success: true };
  } catch (error) {
    console.error('Approval failed:', error);
    throw error;
  }
}

export async function rejectTransaction(
  transactionId: number,
  adminNotes: string
) {
  try {
    const { data, error } = await supabase.rpc('reject_transaction', {
      transaction_id: transactionId,
      admin_notes: adminNotes,
    });

    if (error) throw error;
    if (data?.error) throw new Error(data.error);

    return { success: true };
  } catch (error) {
    console.error('Rejection failed:', error);
    throw error;
  }
}