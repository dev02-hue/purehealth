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
    icon: <FaChartLine className="text-[#3B82F6]" />,
    bg: 'bg-[#3B82F6]/10',
    text: 'text-[#3B82F6]',
    border: 'border-[#3B82F6]/20'
  },
  completed: {
    icon: <FaCheckCircle className="text-[#10B981]" />,
    bg: 'bg-[#10B981]/10',
    text: 'text-[#10B981]',
    border: 'border-[#10B981]/20'
  },
  pending: {
    icon: <FaClock className="text-[#F59E0B]" />,
    bg: 'bg-[#F59E0B]/10',
    text: 'text-[#F59E0B]',
    border: 'border-[#F59E0B]/20'
  },
  failed: {
    icon: <FaTimesCircle className="text-[#EF4444]" />,
    bg: 'bg-[#EF4444]/10',
    text: 'text-[#EF4444]',
    border: 'border-[#EF4444]/20'
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
        <FaSpinner className="animate-spin text-[#3B82F6] text-2xl mr-3" />
        <span className="text-[#4A5568]">Loading income history...</span>
      </motion.div>
    )
  }

  return (
    <motion.div 
      className="bg-[#FFFFFF] rounded-xl shadow-sm p-6 border border-[#F5F7FA] mb-20"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.h2 
        className="text-2xl font-bold mb-6 text-[#3B82F6] flex items-center gap-3"
        initial={{ x: -10, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <FaWallet className="text-[#3B82F6]" />
        Income History
      </motion.h2>
      
      <AnimatePresence>
        {error && (
          <motion.div 
            className="mb-4 p-3 bg-[#EF4444]/10 text-[#EF4444] rounded-lg flex items-start gap-2"
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
          className="py-8 text-center bg-[#F5F7FA] rounded-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <p className="text-[#4A5568]">No income history found</p>
        </motion.div>
      ) : (
        <motion.div 
          className="overflow-hidden rounded-lg border border-[#F5F7FA]"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[#F5F7FA]">
              <thead className="bg-[#F5F7FA]">
                <motion.tr variants={itemVariants}>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#4A5568] uppercase tracking-wider">
                    Plan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#4A5568] uppercase tracking-wider flex items-center gap-1">
                    <FaMoneyBillWave className="text-[#3B82F6]" /> Invested
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#4A5568] uppercase tracking-wider">
                    Daily
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#4A5568] uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#4A5568] uppercase tracking-wider">
                    Earned
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#4A5568] uppercase tracking-wider flex items-center gap-1">
                    <FaCalendarAlt className="text-[#3B82F6]" /> Start
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#4A5568] uppercase tracking-wider flex items-center gap-1">
                    <FaCalendarAlt className="text-[#3B82F6]" /> End
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#4A5568] uppercase tracking-wider">
                    Status
                  </th>
                </motion.tr>
              </thead>
              <motion.tbody className="bg-[#FFFFFF] divide-y divide-[#F5F7FA]" variants={containerVariants}>
                {incomes.map((item, index) => {
                  const status = item.status.toLowerCase()
                  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
                  
                  return (
                    <motion.tr 
                      key={index}
                      className="hover:bg-[#3B82F6]/5 transition-colors"
                      variants={itemVariants}
                      whileHover={{ scale: 1.005 }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#1A1A1A]">
                        {item.plan_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#1A1A1A]">
                        ₦{item.amount_invested.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#1A1A1A]">
                        ₦{item.daily_income.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#1A1A1A]">
                        ₦{item.total_income.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#1A1A1A]">
                        ₦{item.earnings_to_date.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#1A1A1A]">
                        {new Date(item.start_date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#1A1A1A]">
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