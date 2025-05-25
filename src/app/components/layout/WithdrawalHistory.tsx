'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabaseClient'
import { Withdrawal } from '@/types/withdrawal'
import { FaHistory, FaSpinner, FaMoneyBillWave, FaPercentage, FaBan, FaCreditCard, FaCircle } from 'react-icons/fa'
import { MdPendingActions, MdDone, MdError } from 'react-icons/md'

export default function WithdrawalHistory() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchWithdrawals = async () => {
      try {
        const { data, error } = await supabase
          .from('withdrawals')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) throw error

        setWithdrawals(data || [])
      } catch (error) {
        console.error('Error fetching withdrawals:', error)
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
        icon: <MdDone className="text-green-500" />,
        bg: 'bg-green-50',
        text: 'text-green-700',
        border: 'border-green-200'
      },
      pending: {
        icon: <MdPendingActions className="text-yellow-500" />,
        bg: 'bg-yellow-50',
        text: 'text-yellow-700',
        border: 'border-yellow-200'
      },
      failed: {
        icon: <MdError className="text-red-500" />,
        bg: 'bg-red-50',
        text: 'text-red-700',
        border: 'border-red-200'
      }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending

    return (
      <motion.span 
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm ${config.bg} ${config.text} ${config.border} border`}
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
        <FaSpinner className="animate-spin text-blue-500 text-2xl mr-3" />
        <span className="text-gray-600">Loading history...</span>
      </motion.div>
    )
  }

  return (
    <motion.div 
      className="mt-8 bg-white rounded-xl shadow-sm p-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.h2 
        className="text-2xl font-bold mb-6 text-blue-600 flex items-center gap-3"
        initial={{ x: -10, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <FaHistory className="text-blue-500" />
        Withdrawal History
      </motion.h2>
      
      <AnimatePresence>
        {withdrawals.length === 0 ? (
          <motion.div 
            className="py-8 text-center bg-gray-50 rounded-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <p className="text-gray-500">No withdrawal history found</p>
          </motion.div>
        ) : (
          <motion.div 
            className="overflow-hidden rounded-lg border border-gray-200"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <motion.tr variants={itemVariants}>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center gap-1">
                      <FaCircle className="text-blue-500 text-xs" /> Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center gap-1">
                      <FaMoneyBillWave className="text-blue-500" /> Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center gap-1">
                      <FaPercentage className="text-blue-500" /> Fee
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center gap-1">
                      <FaBan className="text-blue-500" /> Bank
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center gap-1">
                      <FaCreditCard className="text-blue-500" /> Account
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </motion.tr>
                </thead>
                <motion.tbody className="bg-white divide-y divide-gray-200" variants={containerVariants}>
                  {withdrawals.map((withdrawal) => (
                    <motion.tr 
                      key={withdrawal.id} 
                      className="hover:bg-blue-50 transition-colors"
                      variants={itemVariants}
                      whileHover={{ scale: 1.005 }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {new Date(withdrawal.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ₦{withdrawal.amount?.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ₦{withdrawal.fee?.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {withdrawal.bank_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
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