'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { initiateDeposit, confirmDeposit } from '../api/transactions/deposit'
import { rewardReferrers } from '@/lib/referral/referrals'
import { FiCopy, FiCheck, FiArrowRight, FiClock, FiInfo } from 'react-icons/fi'

export default function DepositPage() {
  const [amount, setAmount] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [senderBankDetails, setSenderBankDetails] = useState('')
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

  // Quick deposit amounts - adjusted for Sheraton's investment tiers
  const quickAmounts = [3000, 5000, 10000, 20000, 40000, 80000, 150000, 300000, 500000]

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '')
    const numValue = parseInt(value || '0')
    
    if (numValue > 500000) {
      setError('Maximum deposit is ₦500,000')
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

    if (numAmount > 500000) {
      setError('Maximum deposit is ₦500,000')
      setLoading(false)
      return
    }

    if (!phoneNumber) {
      setError('Please enter your phone number')
      setLoading(false)
      return
    }

    if (!senderBankDetails || senderBankDetails.trim().length < 5) {
      setError('Please provide the bank details you are sending from')
      setLoading(false)
      return
    }

    try {
      const { success, error, paymentDetails } = await initiateDeposit(numAmount, phoneNumber, senderBankDetails)
      
      if (error) {
        setError(error)
      } else if (success && paymentDetails) {
        setPaymentDetails(paymentDetails)
        setNarrationCopied(false)
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
        const paymentAmount = parseFloat(paymentDetails.amount.replace(/[^0-9.]/g, ''))
        const userIdWhoPaid = localStorage.getItem('user_id') || 
                             document.cookie.split('; ')
                               .find(row => row.startsWith('user_id='))
                               ?.split('=')[1];
        
        if (userIdWhoPaid) {
          try {
            await rewardReferrers(userIdWhoPaid, paymentAmount);
          } catch (referralError) {
            console.error('Referral reward error:', referralError)
          }
        }
  
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
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-gray-50 dark:from-gray-900 dark:to-amber-900/20 py-12 px-4">
      <AnimatePresence mode="wait">
        {paymentDetails ? (
          <motion.div
            key="payment-details"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-xl dark:shadow-amber-900/20 overflow-hidden p-8"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="text-center mb-8"
            >
              <h2 className="text-3xl font-bold text-amber-800 dark:text-amber-200 mb-3">
                Payment Instructions
              </h2>
              <p className="text-gray-600 dark:text-amber-300">Follow these steps to complete your Sheraton investment</p>
            </motion.div>

            <motion.div 
              className="bg-gradient-to-r from-amber-100 to-amber-50 dark:from-amber-900/30 dark:to-amber-900/20 border-l-4 border-amber-500 dark:border-amber-400 p-5 mb-8 rounded-r-lg"
              initial={{ x: -50 }}
              animate={{ x: 0 }}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-6 h-6 rounded-full bg-amber-500 dark:bg-amber-400 flex items-center justify-center">
                    <FiArrowRight className="text-white text-sm" />
                  </div>
                </div>
                <div>
                  <p className="font-medium text-gray-800 dark:text-amber-100">
                    Transfer <span className="font-bold text-amber-600 dark:text-amber-300">{paymentDetails.amount}</span> to the account below
                  </p>
                  <p className="text-sm text-red-500 dark:text-red-400 mt-1">
                    Important: Transfer exactly {paymentDetails.amount}
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div 
              className="space-y-5"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.div 
                className="bg-gradient-to-br from-amber-50 to-white dark:from-gray-700 dark:to-gray-800 p-5 rounded-xl border border-amber-100 dark:border-amber-900/50 shadow-sm"
                variants={itemVariants}
              >
                <h3 className="text-sm font-semibold text-amber-700 dark:text-amber-300 mb-2 uppercase tracking-wider">Bank Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-amber-400 mb-1">Bank Name</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-amber-100">{paymentDetails.bankName}</p>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-xs text-gray-500 dark:text-amber-400">Account Number</p>
                      <button 
                        onClick={() => copyToClipboard(paymentDetails.accountNumber, 'account')}
                        className="text-xs flex items-center text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300"
                      >
                        <FiCopy className="mr-1" size={12} />
                        Copy
                      </button>
                    </div>
                    <p className="text-lg font-mono text-gray-900 dark:text-amber-100">{paymentDetails.accountNumber}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-xs text-gray-500 dark:text-amber-400 mb-1">Account Name</p>
                    <p className="text-lg text-gray-900 dark:text-amber-100">{paymentDetails.accountName}</p>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                className="bg-gradient-to-br from-amber-50 to-white dark:from-gray-700 dark:to-gray-800 p-5 rounded-xl border border-amber-100 dark:border-amber-900/50 shadow-sm"
                variants={itemVariants}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-sm font-semibold text-amber-700 dark:text-amber-300 uppercase tracking-wider">Payment Reference</h3>
                    <p className="text-xs text-gray-500 dark:text-amber-400">Must include this narration</p>
                  </div>
                  <button 
                    onClick={() => copyToClipboard(paymentDetails.narration, 'narration')}
                    className={`text-xs flex items-center px-3 py-1 rounded-full ${
                      narrationCopied 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-800/50'
                    }`}
                  >
                    {narrationCopied ? (
                      <>
                        <FiCheck className="mr-1" size={12} />
                        Copied
                      </>
                    ) : (
                      <>
                        <FiCopy className="mr-1" size={12} />
                        Copy
                      </>
                    )}
                  </button>
                </div>
                <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-lg font-mono text-gray-900 dark:text-amber-100 break-all">{paymentDetails.narration}</p>
                </div>
                {!narrationCopied && (
                  <p className="text-xs text-red-500 dark:text-red-400 mt-2">
                    You must copy the narration before proceeding
                  </p>
                )}
              </motion.div>

              <motion.div 
                className="flex items-center justify-center gap-2 text-sm text-amber-700 dark:text-amber-400 mt-4"
                variants={itemVariants}
              >
                <FiClock />
                <span>Payment expires: {paymentDetails.expiresAt.toLocaleString()}</span>
              </motion.div>
            </motion.div>

            <motion.div 
              className="mt-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <button 
                onClick={handlePaymentConfirmation}
                disabled={confirmLoading || !narrationCopied}
                className={`w-full py-4 px-6 rounded-xl font-bold text-white transition-all shadow-lg ${
                  narrationCopied 
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 dark:from-amber-600 dark:to-amber-700 hover:from-amber-600 hover:to-amber-700 dark:hover:from-amber-500 dark:hover:to-amber-600'
                    : 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed'
                }`}
              >
                {confirmLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Verifying Payment...
                  </span>
                ) : (
                  'I Have Completed the Transfer'
                )}
              </button>
            </motion.div>

            <AnimatePresence>
              {showCopySuccess && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="fixed bottom-6 right-6 bg-amber-600 text-white px-4 py-3 rounded-lg shadow-xl flex items-center"
                >
                  <FiCheck className="mr-2" />
                  Narration copied to clipboard!
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
            className="max-w-xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-xl dark:shadow-amber-900/20 overflow-hidden p-8"
            variants={containerVariants}
          >
            <motion.div 
              className="text-center mb-10"
              variants={itemVariants}
            >
              <h1 className="text-3xl font-bold text-amber-800 dark:text-amber-200 mb-3">
                Fund Your Sheraton Account
              </h1>
              <p className="text-gray-600 dark:text-amber-300">Select your investment amount</p>
            </motion.div>

            <motion.div 
              className="mb-8"
              variants={itemVariants}
            >
              <label htmlFor="amount" className="block text-sm font-medium text-amber-700 dark:text-amber-300 mb-3">
                Investment Amount (₦)
              </label>
              <div className="relative">
                <input
                  id="amount"
                  type="text"
                  value={amount}
                  onChange={handleAmountChange}
                  placeholder="e.g. 50,000"
                  className="w-full p-5 text-lg border border-amber-200 dark:border-amber-900/50 rounded-xl focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-amber-500 dark:focus:border-amber-400 outline-none bg-white dark:bg-gray-700/50 text-gray-900 dark:text-amber-100 placeholder-amber-300 dark:placeholder-amber-700"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-5 pointer-events-none">
                  <span className="text-amber-500 dark:text-amber-400 font-medium text-lg">₦</span>
                </div>
              </div>
            </motion.div>

            {/* Quick Select Amounts */}
            <motion.div 
              className="mb-8"
              variants={itemVariants}
            >
              <p className="text-sm font-medium text-amber-700 dark:text-amber-300 mb-3">Quick Select</p>
              <div className="grid grid-cols-3 gap-3">
                {quickAmounts.map((quickAmount) => (
                  <motion.button
                    key={quickAmount}
                    type="button"
                    onClick={() => handleQuickSelect(quickAmount)}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    className={`p-3 rounded-lg text-sm font-medium transition-all ${
                      amount === quickAmount.toLocaleString()
                        ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-md'
                        : 'bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/30 text-amber-800 dark:text-amber-200 border border-amber-100 dark:border-amber-900/50'
                    }`}
                  >
                    ₦{quickAmount.toLocaleString()}
                  </motion.button>
                ))}
              </div>
            </motion.div>

            <motion.div 
              className="mb-8"
              variants={itemVariants}
            >
              <label htmlFor="phone" className="block text-sm font-medium text-amber-700 dark:text-amber-300 mb-3">
                Verification Phone Number
              </label>
              <input
                id="phone"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
                className="w-full p-5 border border-amber-200 dark:border-amber-900/50 rounded-xl focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-amber-500 dark:focus:border-amber-400 outline-none bg-white dark:bg-gray-700/50 text-gray-900 dark:text-amber-100 placeholder-amber-300 dark:placeholder-amber-700"
                placeholder="Your active phone number"
              />
            </motion.div>

            <motion.div 
              className="mb-8"
              variants={itemVariants}
            >
              <div className="flex items-center justify-between mb-3">
                <label htmlFor="senderBank" className="block text-sm font-medium text-amber-700 dark:text-amber-300">
                  Your Bank Details (Where you&apos;re sending from)
                </label>
                <div className="relative group">
                  <FiInfo className="text-amber-500 dark:text-amber-400 cursor-pointer" />
                  <div className="absolute z-10 right-0 w-64 p-3 text-xs bg-white dark:bg-gray-700 border border-amber-200 dark:border-amber-900/50 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    Include your bank name and account number (e.g., &apos;GTBank - 0123456789&apos;). This helps us verify your payment faster.
                  </div>
                </div>
              </div>
              <input
                id="senderBank"
                type="text"
                value={senderBankDetails}
                onChange={(e) => setSenderBankDetails(e.target.value)}
                required
                className="w-full p-5 border border-amber-200 dark:border-amber-900/50 rounded-xl focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-amber-500 dark:focus:border-amber-400 outline-none bg-white dark:bg-gray-700/50 text-gray-900 dark:text-amber-100 placeholder-amber-300 dark:placeholder-amber-700"
                placeholder="e.g., GTBank - 0123456789"
              />
              <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
                Please provide the bank details you&apos;ll be transferring from
              </p>
            </motion.div>

            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-6 overflow-hidden"
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
                className={`w-full py-4 px-6 rounded-xl font-bold text-white transition-all shadow-lg ${
                  loading 
                    ? 'bg-gradient-to-r from-amber-400 to-amber-500 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700'
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
                  'Generate Payment Details'
                )}
              </button>
            </motion.div>

            <motion.div 
              className="mt-6 text-center text-xs text-amber-600 dark:text-amber-400"
              variants={itemVariants}
            >
              <p>Minimum investment: ₦3,000 | Maximum: ₦500,000</p>
              <p className="mt-1">25% return over 35 days</p>
            </motion.div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  )
}