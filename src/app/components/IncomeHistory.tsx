'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import { getIncomeHistory } from '@/lib/income'
import { 
  FiDollarSign, 
 
  FiCheckCircle,
  FiClock,
  FiX,
  FiTrendingUp,
  FiRefreshCw,
  FiPieChart
} from 'react-icons/fi'
import { format } from 'date-fns'

// Color palette
const COLORS = {
  primary: '#3B82F6', // Sheraton blue
  secondary: '#EC4899', // Sheraton pink
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  background: '#FFFFFF',
  cardBg: '#F5F7FA',
  textDark: '#1A1A1A',
  textLight: '#4A5568',
  border: '#E5E7EB'
}

interface Investment {
  id: string;
  plan_name: string;
  amount_invested: number;
  daily_income: number;
  total_income: number;
  earnings_to_date: number;
  start_date: string;
  end_date: string;
  status: 'active' | 'completed' | 'pending' | 'failed';
  roi_percentage?: number;
}

export default function IncomeHistory() {
  const [incomes, setIncomes] = useState<Investment[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchIncome = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true)
      const { incomes, error } = await getIncomeHistory()
      if (error) {
        setError(error)
      } else {
        setIncomes(incomes)
      }
    } catch {
      setError('Failed to load income records')
    } finally {
      setLoading(false)
      if (isRefresh) setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchIncome()
  }, [])

  const handleRefresh = () => {
    fetchIncome(true)
  }

  const StatusBadge = ({ status }: { status: string }) => {
    const config = {
      active: {
        icon: <FiTrendingUp className="text-blue-500" />,
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        border: 'border-blue-200'
      },
      completed: {
        icon: <FiCheckCircle className="text-green-500" />,
        bg: 'bg-green-50',
        text: 'text-green-700',
        border: 'border-green-200'
      },
      pending: {
        icon: <FiClock className="text-yellow-500" />,
        bg: 'bg-yellow-50',
        text: 'text-yellow-700',
        border: 'border-yellow-200'
      },
      failed: {
        icon: <FiX className="text-red-500" />,
        bg: 'bg-red-50',
        text: 'text-red-700',
        border: 'border-red-200'
      }
    }[status] || config.active;

    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${config.bg} ${config.text} ${config.border} border`}>
        {config.icon}
        <span className="capitalize font-medium">{status}</span>
      </div>
    )
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05, when: "beforeChildren" }
    }
  }

  const itemVariants = {
    hidden: { y: 10, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1, 
      transition: { 
        type: "spring", 
        stiffness: 120,
        damping: 10
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
        <div className="flex items-center gap-3">
          <FiRefreshCw className="animate-spin text-2xl" style={{ color: COLORS.primary }} />
          <span className="text-lg" style={{ color: COLORS.textDark }}>Loading Sheraton income records...</span>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div 
      className="rounded-xl shadow-sm p-6"
      style={{ backgroundColor: COLORS.background }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <motion.h2 
          className="text-2xl font-bold flex items-center gap-3"
          style={{ color: COLORS.primary }}
          initial={{ x: -10, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <FiDollarSign className="text-2xl" />
          <span>Sheraton Income Portfolio</span>
        </motion.h2>
        
        <motion.button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm"
          style={{ 
            backgroundColor: COLORS.primary,
            color: '#FFFFFF'
          }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <FiRefreshCw className={refreshing ? 'animate-spin' : ''} />
          {refreshing ? 'Refreshing...' : 'Refresh Data'}
        </motion.button>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div 
            className="mb-6 p-4 rounded-lg flex items-start gap-3"
            style={{ backgroundColor: COLORS.error + '20', color: COLORS.error }}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <FiX className="mt-0.5" />
            <div>
              <p className="font-medium">Transaction Error</p>
              <p className="text-sm">{error}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {incomes.length === 0 ? (
        <motion.div 
          className="py-12 text-center rounded-lg"
          style={{ backgroundColor: COLORS.cardBg }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-4"
            style={{ backgroundColor: COLORS.primary + '20' }}>
            <FiPieChart className="text-3xl" style={{ color: COLORS.primary }} />
          </div>
          <h3 className="text-lg font-medium mb-2" style={{ color: COLORS.textDark }}>
            No Income Records Found
          </h3>
          <p className="text-sm max-w-md mx-auto" style={{ color: COLORS.textLight }}>
            Your investment earnings will appear here once they start accumulating
          </p>
        </motion.div>
      ) : (
        <motion.div 
          className="overflow-hidden rounded-lg border"
          style={{ borderColor: COLORS.border }}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y" style={{ borderColor: COLORS.border }}>
              <thead className="text-left">
                <motion.tr 
                  variants={itemVariants}
                  style={{ backgroundColor: COLORS.cardBg }}
                >
                  <th className="px-6 py-4 text-xs font-medium tracking-wider" style={{ color: COLORS.textLight }}>
                    INVESTMENT PLAN
                  </th>
                  <th className="px-6 py-4 text-xs font-medium tracking-wider" style={{ color: COLORS.textLight }}>
                    INVESTED
                  </th>
                  <th className="px-6 py-4 text-xs font-medium tracking-wider" style={{ color: COLORS.textLight }}>
                    DAILY
                  </th>
                  <th className="px-6 py-4 text-xs font-medium tracking-wider" style={{ color: COLORS.textLight }}>
                    TOTAL EARNED
                  </th>
                  <th className="px-6 py-4 text-xs font-medium tracking-wider" style={{ color: COLORS.textLight }}>
                    ROI
                  </th>
                  <th className="px-6 py-4 text-xs font-medium tracking-wider" style={{ color: COLORS.textLight }}>
                    DURATION
                  </th>
                  <th className="px-6 py-4 text-xs font-medium tracking-wider" style={{ color: COLORS.textLight }}>
                    STATUS
                  </th>
                </motion.tr>
              </thead>
              <motion.tbody 
                className="divide-y"
                style={{ borderColor: COLORS.border }}
                variants={containerVariants}
              >
                {incomes.map((item) => (
                  <motion.tr 
                    key={item.id}
                    className="transition-colors hover:bg-blue-50/50"
                    variants={itemVariants}
                    whileHover={{ scale: 1.005 }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium" style={{ color: COLORS.textDark }}>
                        {item.plan_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: COLORS.textDark }}>
                      ₦{item.amount_invested.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: COLORS.success }}>
                      +₦{item.daily_income.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium" style={{ color: COLORS.textDark }}>
                      ₦{item.earnings_to_date.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: COLORS.success }}>
                      {item.roi_percentage ? `${item.roi_percentage.toFixed(1)}%` : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        <div className="text-xs" style={{ color: COLORS.textLight }}>
                          {format(new Date(item.start_date), 'MMM d, yyyy')}
                        </div>
                        <div className="text-xs" style={{ color: COLORS.textLight }}>
                          {format(new Date(item.end_date), 'MMM d, yyyy')}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={item.status} />
                    </td>
                  </motion.tr>
                ))}
              </motion.tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Sheraton Branding */}
      <motion.div 
        className="mt-8 pt-6 border-t text-center"
        style={{ borderColor: COLORS.border }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <p className="text-sm" style={{ color: COLORS.textLight }}>
          Sheraton Investment Platform • Secure Earnings Tracking
        </p>
      </motion.div>
    </motion.div>
  )
}