'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { initiateWithdrawal } from '@/lib/withdrawal'
import { WithdrawalDetails } from '@/types/withdrawal'
import { FaMoneyBillWave, FaCreditCard, FaSpinner, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa'

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
      const numericAmount = parseFloat(amount);
      if (isNaN(numericAmount)) {
        throw new Error('Invalid amount');
      }
    
      const result = await initiateWithdrawal(
        numericAmount,
        bankName,
        accountNumber,
        accountName
      );
    
      if (result.error) {
        throw new Error(result.error);
      }
    
      setSuccess(true);
      if (result.details) {
        setWithdrawalDetails(result.details);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to process withdrawal');
    } finally {
      setLoading(false);
    }
  } // This was the missing closing brace

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { 
      y: 0, 
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 200
      }
    }
  }

  const successCard = {
    hidden: { scale: 0.95, opacity: 0 },
    show: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 150
      }
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-md mx-auto p-6 rounded-2xl"
      style={{
        background: 'linear-gradient(145deg, #F5F7FA, #FFFFFF)',
        boxShadow: '0 8px 32px rgba(59, 130, 246, 0.1)'
      }}
    >
      {/* Header with shiny effect */}
      <motion.div 
        className="flex items-center gap-3 mb-6"
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <div className="relative">
          <FaMoneyBillWave className="text-3xl text-[#3B82F6]" />
          <motion.div 
            className="absolute inset-0 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(255,215,0,0.4) 0%, transparent 70%)',
              filter: 'blur(2px)'
            }}
            animate={{
              opacity: [0.6, 0.3, 0.6]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-[#3B82F6] to-[#EC4899] bg-clip-text text-transparent">
          Withdraw Funds
        </h2>
      </motion.div>

      <AnimatePresence>
        {error && (
          <motion.div 
            className="mb-5 p-3 rounded-xl flex items-start gap-3"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{
              background: 'linear-gradient(90deg, rgba(239,68,68,0.1), rgba(239,68,68,0.05))',
              border: '1px solid rgba(239,68,68,0.2)'
            }}
          >
            <FaExclamationTriangle className="mt-0.5 text-[#EF4444] flex-shrink-0" />
            <span className="text-[#EF4444]">{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {success ? (
        <motion.div 
          className="p-5 rounded-xl"
          variants={successCard}
          initial="hidden"
          animate="show"
          style={{
            background: 'linear-gradient(145deg, rgba(16,185,129,0.1), rgba(16,185,129,0.05))',
            border: '1px solid rgba(16,185,129,0.2)'
          }}
        >
          <motion.div 
            className="flex items-center gap-3 mb-4"
            variants={item}
          >
            <div className="relative">
              <FaCheckCircle className="text-2xl text-[#10B981]" />
              <motion.div 
                className="absolute inset-0 rounded-full"
                style={{
                  background: 'radial-gradient(circle, rgba(16,185,129,0.3) 0%, transparent 70%)'
                }}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.6, 0.3, 0.6]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </div>
            <h3 className="font-bold text-lg text-[#1A1A1A]">Withdrawal Successful!</h3>
          </motion.div>
          
          <motion.p className="text-[#4A5568] mb-5" variants={item}>
            {withdrawalDetails?.message}
          </motion.p>
          
          <motion.div 
            className="p-4 rounded-lg"
            variants={container}
            initial="hidden"
            animate="show"
            style={{
              background: 'linear-gradient(145deg, #FFFFFF, #F5F7FA)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.05)'
            }}
          >
            <h4 className="font-semibold text-[#3B82F6] mb-4 flex items-center gap-2">
              <FaCreditCard /> Transaction Details
            </h4>
            
            <motion.div className="space-y-3" variants={container}>
              {[
                { label: 'Amount:', value: `₦${withdrawalDetails?.amountWithdrawn?.toLocaleString()}` },
                { label: 'Fee:', value: `₦${withdrawalDetails?.fee?.toLocaleString()}` },
                { label: 'Total Deducted:', value: `₦${withdrawalDetails?.totalDeducted?.toLocaleString()}` },
                { label: 'Bank:', value: withdrawalDetails?.bankName },
                { label: 'Account:', value: withdrawalDetails?.accountNumber },
                { label: 'Reference:', value: withdrawalDetails?.reference, fullWidth: true }
              ].map((detail, index) => (
                <motion.div 
                  key={index} 
                  className={`flex ${detail.fullWidth ? 'flex-col' : 'justify-between'} text-[#4A5568]`}
                  variants={item}
                >
                  <span className="font-medium">{detail.label}</span>
                  <span className={detail.fullWidth ? 'mt-1 text-sm' : ''}>{detail.value}</span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </motion.div>
      ) : (
        <motion.form 
          onSubmit={handleSubmit}
          variants={container}
          initial="hidden"
          animate="show"
        >
          <motion.div className="mb-5" variants={item}>
            <label className="block mb-2 font-medium text-[#1A1A1A]">Amount (₦)</label>
            <div className="relative">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-4 pr-4 p-3 rounded-xl focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
                style={{
                  background: 'linear-gradient(145deg, #FFFFFF, #F5F7FA)',
                  border: '1px solid rgba(0,0,0,0.1)',
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)'
                }}
                min="1000"
                step="100"
                required
                placeholder="1000"
              />
              <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#4A5568]">
                NGN
              </span>
            </div>
            <p className="text-sm text-[#4A5568] mt-2">Minimum: ₦1,000 • 10% fee applies</p>
          </motion.div>
          
          <motion.div className="grid grid-cols-2 gap-4 mb-5" variants={container}>
            <motion.div variants={item}>
              <label className="block mb-2 font-medium text-[#1A1A1A]">Bank Name</label>
              <input
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full p-3 rounded-xl focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
                style={{
                  background: 'linear-gradient(145deg, #FFFFFF, #F5F7FA)',
                  border: '1px solid rgba(0,0,0,0.1)',
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)'
                }}
                required
                placeholder="e.g. Access Bank"
              />
            </motion.div>
            
            <motion.div variants={item}>
              <label className="block mb-2 font-medium text-[#1A1A1A]">Account Number</label>
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                className="w-full p-3 rounded-xl focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
                style={{
                  background: 'linear-gradient(145deg, #FFFFFF, #F5F7FA)',
                  border: '1px solid rgba(0,0,0,0.1)',
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)'
                }}
                required
                placeholder="10 digits"
              />
            </motion.div>
          </motion.div>
          
          <motion.div className="mb-6" variants={item}>
            <label className="block mb-2 font-medium text-[#1A1A1A]">Account Name</label>
            <input
              type="text"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              className="w-full p-3 rounded-xl focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
              style={{
                background: 'linear-gradient(145deg, #FFFFFF, #F5F7FA)',
                border: '1px solid rgba(0,0,0,0.1)',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)'
              }}
              required
              placeholder="As it appears on bank statement"
            />
          </motion.div>
          
          <motion.button
            type="submit"
            disabled={loading}
            className={`w-full p-3 rounded-xl font-medium flex items-center justify-center gap-2 relative overflow-hidden`}
            whileHover={!loading ? { scale: 1.02 } : {}}
            whileTap={!loading ? { scale: 0.98 } : {}}
            variants={item}
            style={{
              background: loading 
                ? 'linear-gradient(90deg, #3B82F6, #3B82F6)'
                : 'linear-gradient(90deg, #3B82F6, #EC4899)'
            }}
          >
            {loading && (
              <motion.div 
                className="absolute inset-0 bg-[#3B82F6]"
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                style={{
                  opacity: 0.3
                }}
              />
            )}
            <span className="relative z-10 text-white">
              {loading ? (
                <>
                  <FaSpinner className="animate-spin inline mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  <FaMoneyBillWave className="inline mr-2" />
                  Withdraw Now
                </>
              )}
            </span>
          </motion.button>
        </motion.form>
      )}
    </motion.div>
  )
}