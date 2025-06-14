'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import { getIncomeHistory } from '@/lib/income'
import { 
  FaChartLine, 
  FaWallet, 
  FaCalendarAlt, 
  FaSpinner,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaMoneyBillWave
} from 'react-icons/fa'

interface Investment {
  plan_name: string
  amount_invested: number
  daily_income: number
  total_income: number
  earnings_to_date: number
  start_date: string
  end_date: string
  status: string
}

const statusConfig = {
  active: {
    icon: <FaChartLine className="text-blue-500 dark:text-blue-400" />,
    bg: 'bg-blue-50 dark:bg-blue-900/30',
    text: 'text-blue-700 dark:text-blue-300',
    border: 'border-blue-200 dark:border-blue-800'
  },
  completed: {
    icon: <FaCheckCircle className="text-green-500 dark:text-green-400" />,
    bg: 'bg-green-50 dark:bg-green-900/30',
    text: 'text-green-700 dark:text-green-300',
    border: 'border-green-200 dark:border-green-800'
  },
  pending: {
    icon: <FaClock className="text-yellow-500 dark:text-yellow-400" />,
    bg: 'bg-yellow-50 dark:bg-yellow-900/30',
    text: 'text-yellow-700 dark:text-yellow-300',
    border: 'border-yellow-200 dark:border-yellow-800'
  },
  failed: {
    icon: <FaTimesCircle className="text-red-500 dark:text-red-400" />,
    bg: 'bg-red-50 dark:bg-red-900/30',
    text: 'text-red-700 dark:text-red-300',
    border: 'border-red-200 dark:border-red-800'
  }
}

export default function IncomeHistory() {
  const [incomes, setIncomes] = useState<Investment[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchIncome() {
      try {
        const { incomes, error } = await getIncomeHistory()
        if (error) {
          setError(error)
        } else {
          setIncomes(incomes)
        }
      } catch {
        setError('Failed to load income history')
      } finally {
        setLoading(false)
      }
    }

    fetchIncome()
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

  if (loading) {
    return (
      <motion.div 
        className="flex justify-center items-center h-64"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <FaSpinner className="animate-spin text-blue-500 dark:text-blue-400 text-2xl mr-3" />
        <span className="text-gray-600 dark:text-gray-300">Loading income history...</span>
      </motion.div>
    )
  }

  return (
    <motion.div 
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/50 p-6 border dark:border-gray-700"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.h2 
        className="text-2xl font-bold mb-6 text-blue-600 dark:text-blue-400 flex items-center gap-3"
        initial={{ x: -10, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <FaWallet className="text-blue-500 dark:text-blue-400" />
        Income History
      </motion.h2>
      
      <AnimatePresence>
        {error && (
          <motion.div 
            className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg flex items-start gap-2"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <FaTimesCircle className="mt-0.5" />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {incomes.length === 0 ? (
        <motion.div 
          className="py-8 text-center bg-gray-50 dark:bg-gray-700/30 rounded-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <p className="text-gray-500 dark:text-gray-400">No income history found</p>
        </motion.div>
      ) : (
        <motion.div 
          className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700/30">
                <motion.tr variants={itemVariants}>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Plan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1">
                    <FaMoneyBillWave className="text-blue-500 dark:text-blue-400" /> Invested
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Daily
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Earned
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1">
                    <FaCalendarAlt className="text-blue-500 dark:text-blue-400" /> Start
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1">
                    <FaCalendarAlt className="text-blue-500 dark:text-blue-400" /> End
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                </motion.tr>
              </thead>
              <motion.tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700" variants={containerVariants}>
                {incomes.map((item, index) => {
                  const status = item.status.toLowerCase()
                  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
                  
                  return (
                    <motion.tr 
                      key={index}
                      className="hover:bg-blue-50 dark:hover:bg-gray-700/50 transition-colors"
                      variants={itemVariants}
                      whileHover={{ scale: 1.005 }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                        {item.plan_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                        ₦{item.amount_invested.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                        ₦{item.daily_income.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                        ₦{item.total_income.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                        ₦{item.earnings_to_date.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                        {new Date(item.start_date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                        {new Date(item.end_date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <motion.span 
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs ${config.bg} ${config.text} ${config.border} border`}
                          whileHover={{ scale: 1.03 }}
                        >
                          {config.icon}
                          <span className="capitalize">{status}</span>
                        </motion.span>
                      </td>
                    </motion.tr>
                  )
                })}
              </motion.tbody>
            </table>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}