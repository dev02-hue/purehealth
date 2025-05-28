'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { initiateDeposit, confirmDeposit } from '../api/transactions/deposit'

export default function DepositPage() {
  const [amount, setAmount] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [loading, setLoading] = useState(false)
  const [confirmLoading, setConfirmLoading] = useState(false)
  const [error, setError] = useState('')
  const [narrationCopied, setNarrationCopied] = useState(false)
  const [showCopySuccess, setShowCopySuccess] = useState(false)
  
  interface PaymentDetails {
    bankName: string
    accountNumber: string
    accountName: string
    amount: string
    narration: string
    expiresAt: Date
    transactionId: string
  }

  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null)
  const router = useRouter()

  // Quick deposit amounts
  const quickAmounts = [3000, 6000, 20000, 50000, 100000, 150000, 200000, 250000, 350000, 650000, 1000000, 2000000]

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '')
    const numValue = parseInt(value || '0')
    
    if (numValue > 2000000) {
      setError('Maximum deposit is ₦2,000,000')
      return
    }
    
    setError('')
    setAmount(value === '' ? '' : numValue.toLocaleString())
  }

  const handleQuickSelect = (selectedAmount: number) => {
    setAmount(selectedAmount.toLocaleString())
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    const numAmount = parseFloat(amount.replace(/,/g, ''))
    
    if (isNaN(numAmount)) {
      setError('Please enter a valid amount')
      setLoading(false)
      return
    }

    if (numAmount < 3000) {
      setError('Minimum deposit is ₦3,000')
      setLoading(false)
      return
    }

    if (numAmount > 2000000) {
      setError('Maximum deposit is ₦2,000,000')
      setLoading(false)
      return
    }

    if (!phoneNumber) {
      setError('Please enter your phone number')
      setLoading(false)
      return
    }

    try {
      const { success, error, paymentDetails } = await initiateDeposit(numAmount, phoneNumber)
      
      if (error) {
        setError(error)
      } else if (success && paymentDetails) {
        setPaymentDetails(paymentDetails)
        setNarrationCopied(false) // Reset copied state when new payment details are generated
      }
    } catch {
      setError('An unexpected error occurred.')
    }

    setLoading(false)
  }

  const handlePaymentConfirmation = async () => {
    if (!narrationCopied) {
      setError('Please copy the narration before confirming payment')
      return
    }

    setConfirmLoading(true)
    setError('')
    
    try {
      if (!paymentDetails) {
        setError('Payment details not available')
        return
      }
      
      const { success, error } = await confirmDeposit(paymentDetails.transactionId)
      
      if (error) {
        setError(error)
      } else if (success) {
        router.push('/')
      }
    } catch {
      setError('An unexpected error occurred while confirming payment.')
    } finally {
      setConfirmLoading(false)
    }
  }

  const copyToClipboard = (text: string, type: 'account' | 'narration') => {
    navigator.clipboard.writeText(text).then(() => {
      if (type === 'narration') {
        setNarrationCopied(true)
        setShowCopySuccess(true)
        setTimeout(() => setShowCopySuccess(false), 2000)
      }
    }).catch(() => {
      setError('Failed to copy to clipboard')
    })
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-50 dark:from-gray-900 dark:to-gray-800 py-8 px-4 mb-20">
      <AnimatePresence mode="wait">
        {paymentDetails ? (
          <motion.div
            key="payment-details"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg dark:shadow-gray-900/50 overflow-hidden p-6"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="text-center mb-6"
            >
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-500 dark:to-purple-500 bg-clip-text">
                Payment Instructions
              </h2>
              <p className="text-gray-600 dark:text-gray-300">Follow the instructions below to complete your deposit</p>
            </motion.div>

            <motion.div 
              className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-700 border-l-4 border-blue-500 dark:border-blue-400 p-4 mb-6 rounded-r-lg"
              initial={{ x: -50 }}
              animate={{ x: 0 }}
            >
              <p className="font-medium text-gray-800 dark:text-gray-100">
                Send <span className="font-bold text-blue-600 dark:text-blue-400">{paymentDetails.amount}</span> to the account below
              </p>
              <p className="text-sm text-red-500 dark:text-red-400 mt-1">
                Important: Send exactly {paymentDetails.amount}. Incorrect amounts may result in loss of funds.
              </p>
            </motion.div>

            <motion.div 
              className="space-y-4"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.div 
                className="bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-700 dark:to-gray-700 p-4 rounded-lg border border-gray-100 dark:border-gray-600"
                variants={itemVariants}
              >
                <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Bank Name</h3>
                <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{paymentDetails.bankName}</p>
              </motion.div>

              <motion.div 
                className="bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-700 dark:to-gray-700 p-4 rounded-lg border border-gray-100 dark:border-gray-600"
                variants={itemVariants}
              >
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold text-gray-700 dark:text-gray-300">Account Number</h3>
                  <button 
                    onClick={() => copyToClipboard(paymentDetails.accountNumber, 'account')}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm flex items-center"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                    Copy
                  </button>
                </div>
                <p className="text-lg font-mono text-gray-900 dark:text-gray-100">{paymentDetails.accountNumber}</p>
              </motion.div>

              <motion.div 
                className="bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-700 dark:to-gray-700 p-4 rounded-lg border border-gray-100 dark:border-gray-600"
                variants={itemVariants}
              >
                <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Account Name</h3>
                <p className="text-lg text-gray-900 dark:text-gray-100">{paymentDetails.accountName}</p>
              </motion.div>

              <motion.div 
                className="bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-700 dark:to-gray-700 p-4 rounded-lg border border-gray-100 dark:border-gray-600"
                variants={itemVariants}
              >
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold text-gray-700 dark:text-gray-300">Narration (Required)</h3>
                  <button 
                    onClick={() => copyToClipboard(paymentDetails.narration, 'narration')}
                    className={`text-sm flex items-center ${
                      narrationCopied 
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300'
                    }`}
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                    {narrationCopied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <p className="text-lg text-gray-900 dark:text-gray-100">{paymentDetails.narration}</p>
                {!narrationCopied && (
                  <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                    You must copy the narration before proceeding
                  </p>
                )}
              </motion.div>

              <motion.div 
                className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4"
                variants={itemVariants}
              >
                Payment expires on: {paymentDetails.expiresAt.toLocaleString()}
              </motion.div>
            </motion.div>

            <motion.div 
              className="mt-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <button 
                onClick={handlePaymentConfirmation}
                disabled={confirmLoading || !narrationCopied}
                className={`w-full bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-700 dark:to-purple-700 text-white px-6 py-3 rounded-lg transition-all font-medium shadow-md ${
                  narrationCopied 
                    ? 'hover:from-blue-700 hover:to-purple-700 dark:hover:from-blue-600 dark:hover:to-purple-600 hover:shadow-lg dark:hover:shadow-gray-900/50'
                    : 'opacity-70 cursor-not-allowed'
                }`}
              >
                {confirmLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  'I have made the payment'
                )}
              </button>
            </motion.div>

            <AnimatePresence>
              {showCopySuccess && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg"
                >
                  Narration copied successfully!
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.form
            key="deposit-form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            onSubmit={handleSubmit}
            className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg dark:shadow-gray-900/50 overflow-hidden p-6"
            variants={containerVariants}
          >
            <motion.div 
              className="text-center mb-8"
              variants={itemVariants}
            >
              <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-500 dark:to-purple-500 bg-clip-text">
                Deposit to PureHealth
              </h1>
              <p className="text-gray-600 dark:text-gray-300">Enter amount</p>
            </motion.div>

            <motion.div 
              className="mb-6"
              variants={itemVariants}
            >
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Amount (₦)
              </label>
              <div className="relative">
                <input
                  id="amount"
                  type="text"
                  value={amount}
                  onChange={handleAmountChange}
                  placeholder="e.g. 50,000"
                  className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 outline-none text-lg font-medium bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <span className="text-gray-500 dark:text-gray-400 font-medium">₦</span>
                </div>
              </div>
            </motion.div>

            {/* Quick Select Amounts */}
            <motion.div 
              className="mb-6"
              variants={itemVariants}
            >
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Quick Select</p>
              <div className="grid grid-cols-3 gap-2">
                {quickAmounts.map((quickAmount) => (
                  <motion.button
                    key={quickAmount}
                    type="button"
                    onClick={() => handleQuickSelect(quickAmount)}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    className={`p-2 rounded-lg text-sm font-medium transition-all ${
                      amount === quickAmount.toLocaleString()
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md'
                        : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100'
                    }`}
                  >
                    ₦{quickAmount.toLocaleString()}
                  </motion.button>
                ))}
              </div>
            </motion.div>

            <motion.div 
              className="mb-6"
              variants={itemVariants}
            >
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Phone Number
              </label>
              <input
                id="phone"
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
                className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="Enter your phone number"
              />
            </motion.div>

            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4 overflow-hidden"
                >
                  <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 dark:border-red-400 p-4 rounded-r-lg">
                    <p className="text-red-700 dark:text-red-300">{error}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div
              variants={itemVariants}
            >
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-all shadow-md ${
                  loading 
                    ? 'bg-gradient-to-r from-blue-400 to-purple-400 dark:from-blue-600 dark:to-purple-600 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-700 dark:to-purple-700 hover:from-blue-700 hover:to-purple-700 dark:hover:from-blue-600 dark:hover:to-purple-600 hover:shadow-lg dark:hover:shadow-gray-900/50'
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  'Proceed to Payment'
                )}
              </button>
            </motion.div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  )
}