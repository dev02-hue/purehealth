'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabaseClient'
import { nigerianBanks } from '@/lib/nigerianBanks'

interface Bank {
  name: string
  code: string
}
 

interface WithdrawalData {
  bankName: string
  accountNumber: string
  accountName: string
  amount: number
}

export default function WithdrawalForm() {
  const [formData, setFormData] = useState<WithdrawalData>({
    bankName: '',
    accountNumber: '',
    accountName: '',
    amount: 0
  })
  const [loading, setLoading] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Fetch user balance (you'll need to implement this)
  const [balance, setBalance] = useState(0)

  useEffect(() => {
    const fetchBalance = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase
          .from('balances')
          .select('amount')
          .eq('user_id', user.id)
          .single()
        
        if (data) setBalance(data.amount)
      }
    }
    fetchBalance()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const verifyAccount = async () => {
    if (!formData.bankName || !formData.accountNumber) {
      setError('Please select bank and enter account number')
      return
    }

    setVerifying(true)
    setError('')

    try {
      // In a real app, you would call your backend API to verify with Paystack/Flutterwave
      // This is a mock implementation
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Mock account name - replace with actual API call
      const mockNames: Record<string, string> = {
        '044': 'First Bank',
        '058': 'GTBank',
        '033': 'UBA',
        // Add more bank codes and mock names as needed
      }
      
      const bankCode = nigerianBanks.find((b: Bank) => b.name === formData.bankName)?.code || ''
      const accountName = mockNames[bankCode] || 'Verified Account Holder'
      
      setFormData(prev => ({ ...prev, accountName }))
      setSuccess('Account verified successfully')
      setTimeout(() => setSuccess(''), 3000)
    } catch  {
      setError('Account verification failed')
    } finally {
      setVerifying(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Validate form
      if (formData.amount <= 0) {
        throw new Error('Amount must be greater than 0')
      }
      if (formData.amount > balance) {
        throw new Error('Insufficient balance')
      }
      if (!formData.accountName) {
        throw new Error('Please verify account details')
      }

      // Save withdrawal request to Supabase
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { error } = await supabase
        .from('withdrawals')
        .insert([{
          user_id: user.id,
          bank_name: formData.bankName,
          account_number: formData.accountNumber,
          account_name: formData.accountName,
          amount: formData.amount,
          status: 'pending'
        }])

      if (error) throw error

      // Update balance
      await supabase
        .from('balances')
        .update({ amount: balance - formData.amount })
        .eq('user_id', user.id)

      setSuccess('Withdrawal request submitted successfully')
      setFormData({
        bankName: '',
        accountNumber: '',
        accountName: '',
        amount: 0
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Withdrawal failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg border border-gray-100"
    >
      <h2 className="text-2xl font-bold text-blue-800 mb-6">Withdraw Funds</h2>
      
      <div className="mb-4 p-4 bg-blue-50 rounded-lg">
        <p className="text-gray-600">Available Balance</p>
        <p className="text-3xl font-bold text-blue-800">
          ₦{balance.toLocaleString('en-NG')}
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          {/* Bank Selection */}
          <div>
            <label className="block text-gray-700 mb-1">Bank Name</label>
            <select
              name="bankName"
              value={formData.bankName}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Select your bank</option>
              {nigerianBanks.map(bank => (
                <option key={bank.code} value={bank.name}>
                  {bank.name}
                </option>
              ))}
            </select>
          </div>

          {/* Account Number */}
          <div>
            <label className="block text-gray-700 mb-1">Account Number</label>
            <div className="flex space-x-2">
              <input
                type="text"
                name="accountNumber"
                value={formData.accountNumber}
                onChange={handleInputChange}
                className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="10-digit account number"
                required
              />
              <button
                type="button"
                onClick={verifyAccount}
                disabled={verifying || !formData.bankName || !formData.accountNumber}
                className="px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
              >
                {verifying ? 'Verifying...' : 'Verify'}
              </button>
            </div>
          </div>

          {/* Account Name (Auto-filled after verification) */}
          {formData.accountName && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="p-3 bg-blue-50 rounded-lg"
            >
              <p className="text-gray-600">Account Name</p>
              <p className="font-medium">{formData.accountName}</p>
            </motion.div>
          )}

          {/* Amount */}
          <div>
            <label className="block text-gray-700 mb-1">Amount (₦)</label>
            <input
              type="number"
              name="amount"
              value={formData.amount || ''}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter amount"
              min="100"
              required
            />
            <p className="text-sm text-gray-500 mt-1">Minimum withdrawal: ₦100</p>
          </div>

          {/* Status Messages */}
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-3 bg-red-50 text-red-600 rounded-lg"
            >
              {error}
            </motion.div>
          )}
          {success && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-3 bg-green-50 text-green-600 rounded-lg"
            >
              {success}
            </motion.div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !formData.accountName}
            className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors font-medium"
          >
            {loading ? 'Processing...' : 'Withdraw Funds'}
          </button>
        </div>
      </form>
    </motion.div>
  )
}