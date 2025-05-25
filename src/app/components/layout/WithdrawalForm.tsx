'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { initiateWithdrawal } from '@/lib/withdrawal'
import { WithdrawalDetails } from '@/types/withdrawal'
import { FaBan, FaMoneyBillWave, FaUser, FaCreditCard, FaSpinner, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa'

export default function WithdrawalForm() {
  const [amount, setAmount] = useState('')
  const [bankName, setBankName] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [accountName, setAccountName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [withdrawalDetails, setWithdrawalDetails] = useState<WithdrawalDetails | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      const numericAmount = parseFloat(amount)
      if (isNaN(numericAmount)) {
        throw new Error('Invalid amount')
      }

      const result = await initiateWithdrawal(
        numericAmount,
        bankName,
        accountNumber,
        accountName
      )

      if (result.error) {
        throw new Error(result.error)
      }

      setSuccess(true)
      if (result.details) {
        setWithdrawalDetails(result.details)
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to process withdrawal')
    } finally {
      setLoading(false)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        when: "beforeChildren"
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  }

  const successVariants = {
    hidden: { scale: 0.9, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-md mx-auto p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg dark:shadow-gray-900/50 border dark:border-gray-700"
    >
      <motion.h2 
        className="text-2xl font-bold mb-6 text-blue-600 dark:text-blue-400 flex items-center gap-2"
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <FaMoneyBillWave className="dark:text-blue-400" /> Withdraw Funds
      </motion.h2>
      
      <AnimatePresence>
        {error && (
          <motion.div 
            className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg flex items-start gap-2"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <FaExclamationTriangle className="mt-0.5" />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>
      
      {success ? (
        <motion.div 
          className="p-5 bg-green-50 dark:bg-green-900/30 rounded-xl border border-green-200 dark:border-green-800"
          variants={successVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div 
            className="flex items-center gap-2 text-green-600 dark:text-green-400 mb-3"
            variants={itemVariants}
          >
            <FaCheckCircle className="text-2xl" />
            <h3 className="font-bold text-lg">Withdrawal Successful!</h3>
          </motion.div>
          
          <motion.p className="text-gray-700 dark:text-gray-300 mb-4" variants={itemVariants}>
            {withdrawalDetails?.message}
          </motion.p>
          
          <motion.div 
            className="mt-4 p-4 bg-white dark:bg-gray-700/30 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm"
            variants={itemVariants}
          >
            <h4 className="font-semibold text-blue-600 dark:text-blue-400 mb-3 flex items-center gap-2">
              <FaCreditCard className="dark:text-blue-400" /> Transaction Details
            </h4>
            
            <motion.div 
              className="space-y-2 text-gray-700 dark:text-gray-300"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.p variants={itemVariants} className="flex justify-between">
                <span className="font-medium">Amount:</span>
                <span>₦{withdrawalDetails?.amountWithdrawn?.toLocaleString()}</span>
              </motion.p>
              <motion.p variants={itemVariants} className="flex justify-between">
                <span className="font-medium">Fee:</span>
                <span>₦{withdrawalDetails?.fee?.toLocaleString()}</span>
              </motion.p>
              <motion.p variants={itemVariants} className="flex justify-between">
                <span className="font-medium">Total Deducted:</span>
                <span>₦{withdrawalDetails?.totalDeducted?.toLocaleString()}</span>
              </motion.p>
              <motion.p variants={itemVariants} className="flex justify-between">
                <span className="font-medium">Bank:</span>
                <span>{withdrawalDetails?.bankName}</span>
              </motion.p>
              <motion.p variants={itemVariants} className="flex justify-between">
                <span className="font-medium">Account:</span>
                <span>{withdrawalDetails?.accountNumber}</span>
              </motion.p>
              <motion.p variants={itemVariants} className="text-sm mt-3 pt-3 border-t border-gray-100 dark:border-gray-600">
                <span className="font-medium">Reference:</span> {withdrawalDetails?.reference}
              </motion.p>
            </motion.div>
          </motion.div>
        </motion.div>
      ) : (
        <motion.form 
          onSubmit={handleSubmit}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div className="mb-5" variants={itemVariants}>
            <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300">Amount (₦)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500">
                ₦
              </span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-8 p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400"
                min="1000"
                step="100"
                required
                placeholder="1000"
              />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Minimum: ₦1,000</p>
          </motion.div>
          
          <motion.div className="mb-5" variants={itemVariants}>
            <label className="mb-2 font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <FaBan className="dark:text-gray-400" /> Bank Name
            </label>
            <input
              type="text"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400"
              required
              placeholder="e.g. Access Bank"
            />
          </motion.div>
          
          <motion.div className="mb-5" variants={itemVariants}>
            <label className="mb-2 font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <FaCreditCard className="dark:text-gray-400" /> Account Number
            </label>
            <input
              type="text"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400"
              required
              placeholder="10-digit account number"
            />
          </motion.div>
          
          <motion.div className="mb-6" variants={itemVariants}>
            <label className="mb-2 font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <FaUser className="dark:text-gray-400" /> Account Name
            </label>
            <input
              type="text"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400"
              required
              placeholder="Account holder's name"
            />
          </motion.div>
          
          <motion.button
            type="submit"
            disabled={loading}
            className={`w-full p-3 rounded-lg text-white font-medium flex items-center justify-center gap-2 ${
              loading ? 'bg-blue-400 dark:bg-blue-800' : 'bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-600'
            }`}
            whileHover={!loading ? { scale: 1.02 } : {}}
            whileTap={!loading ? { scale: 0.98 } : {}}
            variants={itemVariants}
          >
            {loading ? (
              <>
                <FaSpinner className="animate-spin" /> Processing...
              </>
            ) : (
              <>
                <FaMoneyBillWave /> Withdraw
              </>
            )}
          </motion.button>
          
          <motion.p 
            className="mt-3 text-sm text-gray-500 dark:text-gray-400 text-center"
            variants={itemVariants}
          >
            Note: A 10% withdrawal fee will be applied
          </motion.p>
        </motion.form>
      )}
    </motion.div>
  )
}