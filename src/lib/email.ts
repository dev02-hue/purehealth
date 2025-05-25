export async function sendDepositEmailToAdmin(params: {
    userEmail: string
    amount: number
    reference: string
    userId: string
  }) {
    // Implement your email sending logic here
    // This should send to your admin email with approval link
    console.log('Admin notification sent:', params)
  }

  // lib/email.ts
export async function sendWithdrawalEmailToAdmin(params: {
  userId: string
  amount: number
  fee: number
  total: number
  bankName: string
  accountNumber: string
  accountName: string
  reference: string
}) {
  // Implement your email sending logic here
  // This should send to your admin email with approval link
  console.log('Admin withdrawal notification sent:', params)
}