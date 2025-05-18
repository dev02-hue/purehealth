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