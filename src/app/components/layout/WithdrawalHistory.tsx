'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Withdrawal } from '@/types/withdrawal'
import { FaHistory, FaSpinner, FaMoneyBillWave, FaPercentage, FaBan, FaCreditCard } from 'react-icons/fa'
import { MdPendingActions, MdDone, MdError } from 'react-icons/md'
import { getUserWithdrawals } from '@/lib/withdrawals'

export default function WithdrawalHistory() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchWithdrawals = async () => {
      try {
        const data = await getUserWithdrawals(['pending', 'approved'])
        setWithdrawals(data)
      } catch (err) {
        console.error('Error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchWithdrawals()
  }, [])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        when: "beforeChildren"
      }
    }
  }

  const itemVariants = {
    hidden: { y: 10, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 120
      }
    }
  }

  const StatusBadge = ({ status }: { status: string }) => {
    const statusConfig = {
      paid: {
        icon: <MdDone className="text-green-600" />,
        bg: 'bg-green-100/80',
        text: 'text-green-800',
        border: 'border-green-200'
      },
      pending: {
        icon: <MdPendingActions className="text-amber-600" />,
        bg: 'bg-amber-100/80',
        text: 'text-amber-800',
        border: 'border-amber-200'
      },
      failed: {
        icon: <MdError className="text-red-600" />,
        bg: 'bg-red-100/80',
        text: 'text-red-800',
        border: 'border-red-200'
      }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending

    return (
      <motion.span 
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text} ${config.border} border`}
        whileHover={{ scale: 1.03 }}
      >
        {config.icon}
        <span className="capitalize">{status}</span>
      </motion.span>
    )
  }

  if (loading) {
    return (
      <motion.div 
        className="flex justify-center items-center h-32"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <FaSpinner className="animate-spin text-amber-600 text-2xl mr-3" />
        <span className="text-amber-800">Loading withdrawal history...</span>
      </motion.div>
    )
  }

  return (
    <motion.div 
      className="mt-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-amber-100 dark:border-amber-900/30"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.h2 
        className="text-2xl font-bold mb-6 text-amber-700 dark:text-amber-300 flex items-center gap-3"
        initial={{ x: -10, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <FaHistory className="text-amber-600 dark:text-amber-400" />
        Sheraton Withdrawal History
      </motion.h2>
      
      <AnimatePresence>
        {withdrawals.length === 0 ? (
          <motion.div 
            className="py-12 text-center bg-amber-50/50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <p className="text-amber-700 dark:text-amber-300">No withdrawal history found</p>
            <p className="text-sm text-amber-600/80 dark:text-amber-400/80 mt-1">
              Your completed withdrawals will appear here
            </p>
          </motion.div>
        ) : (
          <motion.div 
            className="overflow-hidden rounded-xl border border-amber-100 dark:border-amber-900/30"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-amber-100 dark:divide-amber-900/20">
                <thead className="bg-amber-50 dark:bg-amber-900/10">
                  <motion.tr variants={itemVariants}>
                    <th className="px-6 py-3 text-left text-xs font-medium text-amber-800 dark:text-amber-300 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-amber-600" />
                        Date
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-amber-800 dark:text-amber-300 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <FaMoneyBillWave className="text-amber-600" />
                        Amount
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-amber-800 dark:text-amber-300 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <FaPercentage className="text-amber-600" />
                        Fee
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-amber-800 dark:text-amber-300 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <FaBan className="text-amber-600" />
                        Bank
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-amber-800 dark:text-amber-300 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <FaCreditCard className="text-amber-600" />
                        Account
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-amber-800 dark:text-amber-300 uppercase tracking-wider">
                      Status
                    </th>
                  </motion.tr>
                </thead>
                <motion.tbody className="bg-white dark:bg-gray-800 divide-y divide-amber-100 dark:divide-amber-900/20" variants={containerVariants}>
                  {withdrawals.map((withdrawal) => (
                    <motion.tr 
                      key={withdrawal.id} 
                      className="hover:bg-amber-50/50 dark:hover:bg-amber-900/10 transition-colors"
                      variants={itemVariants}
                      whileHover={{ scale: 1.005 }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-amber-900 dark:text-amber-200">
                        {new Date(withdrawal.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-amber-900 dark:text-amber-100">
                        ₦{withdrawal.amount?.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-amber-700 dark:text-amber-300">
                        ₦{withdrawal.fee?.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-amber-800 dark:text-amber-200">
                        {withdrawal.bank_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-amber-800 dark:text-amber-200">
                        {withdrawal.account_number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <StatusBadge status={withdrawal.status} />
                      </td>
                    </motion.tr>
                  ))}
                </motion.tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}