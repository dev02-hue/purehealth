// types/withdrawal.ts
export interface Withdrawal {
    id: number;
    user_id: string;
    amount: number;
    fee: number;
    total_amount: number;
    bank_name: string;
    account_number: string;
    account_name: string;
    status: 'pending' | 'paid' | 'failed';
    reference: string;
    created_at: string;
    processed_at?: string;
  }
  
  export interface WithdrawalDetails {
    message: string;
    amountWithdrawn: number;
    fee: number;
    totalDeducted: number;
    bankName: string;
    accountNumber: string;
    reference: string;
  }
  
  export interface WithdrawalResponse {
    success: boolean;
    message?: string;
    details?: WithdrawalDetails;
    error?: string;
  }