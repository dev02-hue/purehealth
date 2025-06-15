export async function sendDepositEmailToAdmin(params: {
  userEmail: string
  amount: number
  reference: string
  userId: string
  senderBankDetails: string
}) {
  // Implement your email sending logic here
  // This should send to your admin email with all deposit details including sender's bank info
  console.log('Admin notification sent:', {
    ...params,
    message: `New deposit request received:
    - User ID: ${params.userId}
    - User Email: ${params.userEmail}
    - Amount: ₦${params.amount.toLocaleString()}
    - Reference: ${params.reference}
    - Sender's Bank Details: ${params.senderBankDetails}
    
    Please verify the payment and update the transaction status accordingly.`
  })
  
  // In a real implementation, you would use your email service here
  // await emailService.send({
  //   to: 'admin@yourdomain.com',
  //   subject: `New Deposit Request - ${params.reference}`,
  //   text: `...` // Similar to the console.log above
  // })
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