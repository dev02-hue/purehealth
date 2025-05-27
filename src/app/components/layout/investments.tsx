'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getInvestments } from '@/lib/investment-actions'
import { formatCurrency } from '@/lib/utils'
import { format, differenceInDays } from 'date-fns'
import { motion } from 'framer-motion'
import { FiTrendingUp, FiClock, FiCalendar, FiCheckCircle } from 'react-icons/fi'
import { toast } from 'react-hot-toast'
import { processDailyEarnings } from '@/lib/investment-plan'
import { TbCurrencyNaira } from 'react-icons/tb'

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
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
}

interface Investment {
  id: string;
  plan_name: string;
  duration: string;
  status: string;
  amount_invested: number;
  daily_income: number;
  earnings_to_date: number;
  total_income: number;
  next_payout_date: string;
  last_payout_date: string;
  end_date: string;
}

export default function InvestmentsPage() {
  const [investments, setInvestments] = useState<Investment[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [countdown, setCountdown] = useState("24:00:00")
  const router = useRouter()

  // Countdown timer effect
  useEffect(() => {
    const calculateCountdown = () => {
      const now = new Date()
      const endOfDay = new Date()
      endOfDay.setHours(24, 0, 0, 0)

      const diff = endOfDay.getTime() - now.getTime()

      if (diff <= 0) {
        setCountdown("00:00:00")
        return
      }

      const hours = Math.floor(diff / (1000 * 60 * 60)).toString().padStart(2, '0')
      const minutes = Math.floor((diff / (1000 * 60)) % 60).toString().padStart(2, '0')
      const seconds = Math.floor((diff / 1000) % 60).toString().padStart(2, '0')

      setCountdown(`${hours}:${minutes}:${seconds}`)
    }

    calculateCountdown()
    const timer = setInterval(calculateCountdown, 1000)
    return () => clearInterval(timer)
  }, [])

  const loadInvestments = useCallback(async () => {
    try {
      const data = await getInvestments()
      setInvestments(data)
    } catch (error) {
      console.error('Error loading investments:', error)
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }, [router])

  const handleProcessEarnings = useCallback(async () => {
    setProcessing(true)
    try {
      const result = await processDailyEarnings()
      if (result.success) {
        if ('updatedInvestments' in result && (result.updatedInvestments.length > 0 || result.completedInvestments.length > 0)) {
          await loadInvestments()
          toast.success(
            `Processed ${'updatedInvestments' in result ? result.updatedInvestments.length : 0} updates and ${'completedInvestments' in result ? result.completedInvestments.length : 0} completions`
          )
        } else {
          toast.success('No earnings to process at this time')
        }
      } else {
        toast.error('Error processing earnings')
      }
    } catch (error) {
      console.error('Error processing earnings:', error)
      toast.error('Failed to process earnings')
    } finally {
      setProcessing(false)
    }
  }, [loadInvestments])

  useEffect(() => {
    loadInvestments()
    const interval = setInterval(() => {
      handleProcessEarnings()
    }, 60 * 60 * 1000)
    return () => clearInterval(interval)
  }, [loadInvestments, handleProcessEarnings])

  const calculateProgress = (investment: Investment) => {
    const progress = (investment.earnings_to_date / investment.total_income) * 100
    return Math.min(100, progress)
  }

  const getDaysRemaining = (endDate: string) => {
    const days = differenceInDays(new Date(endDate), new Date())
    return days > 0 ? days : 0
  }

  if (loading) {
    return (
      <div className="p-4 sm:p-6 min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-900 mb-20">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-6xl mx-auto"
      >
        {/* Responsive Countdown Timer */}
        <motion.div 
          className="mb-4 sm:mb-6 md:mb-8 p-3 sm:p-4 bg-gradient-to-r from-blue-600 to-blue-500 dark:from-blue-800 dark:to-blue-700 rounded-lg sm:rounded-xl shadow-lg"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex flex-col items-center justify-center space-y-1 sm:space-y-2">
            <p className="text-xs sm:text-sm text-blue-100 dark:text-blue-200">Next Daily Reset</p>
            <div className="text-xl sm:text-2xl md:text-3xl font-mono font-bold text-white tracking-wider">
              {countdown}
            </div>
            <p className="text-[0.65rem] xs:text-xs text-blue-100 dark:text-blue-200 opacity-90 text-center px-2">
              All payouts will be processed at reset time
            </p>
          </div>
        </motion.div>

        {/* Responsive Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
          <motion.h1 
            className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent dark:from-blue-400 dark:to-blue-300"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Your Investments
          </motion.h1>
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <motion.p
              className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 bg-white/50 dark:bg-gray-800/50 px-3 py-1 rounded-full whitespace-nowrap"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {investments.filter(i => i.status === 'active').length} active investment{investments.filter(i => i.status === 'active').length !== 1 ? 's' : ''}
            </motion.p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleProcessEarnings}
              disabled={processing}
              className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 whitespace-nowrap"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {processing ? 'Processing...' : 'Check Earnings'}
            </motion.button>
          </div>
        </div>
        
        {investments.length === 0 ? (
          <motion.div
            className="text-center py-12 sm:py-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <div className="mx-auto w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-blue-100 to-blue-50 dark:from-gray-800 dark:to-gray-700 rounded-full flex items-center justify-center mb-4 sm:mb-6 shadow-lg">
              <FiTrendingUp className="h-12 w-12 sm:h-16 sm:w-16 text-blue-400 dark:text-blue-300" />
            </div>
            <h3 className="text-xl sm:text-2xl font-medium text-gray-800 dark:text-gray-100 mb-2">
              No Active Investments
            </h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto text-sm sm:text-base px-4">
              You haven&apos;t started any investments yet. Begin your journey to grow your wealth today.
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="mt-4 sm:mt-6 px-4 sm:px-6 py-1.5 sm:py-2 text-sm sm:text-base bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-full shadow-lg hover:shadow-blue-200/50 dark:hover:shadow-blue-900/30 transition-all"
            >
              Explore Plans
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
          >
            {investments.map((investment) => (
              <motion.div
                key={investment.id}
                variants={item}
                whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)' }}
                className={`bg-white/80 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-md overflow-hidden border transition-all ${
                  investment.status === 'completed'
                    ? 'border-purple-200/50 dark:border-purple-900/50'
                    : 'border-gray-200/50 dark:border-gray-700'
                }`}
              >
                <div className="p-4 sm:p-6">
                  <div className="flex justify-between items-start mb-3 sm:mb-4">
                    <div>
                      <h2 className="font-bold text-lg sm:text-xl text-gray-800 dark:text-gray-100">
                        {investment.plan_name}
                      </h2>
                      <div className="flex items-center mt-1 text-xs sm:text-sm text-blue-500 dark:text-blue-400">
                        <FiClock className="mr-1 w-3 h-3 sm:w-4 sm:h-4" />
                        <span>{investment.duration}</span>
                      </div>
                    </div>
                    <span className={`px-2 sm:px-3 py-1 text-xs font-medium rounded-full ${
                      investment.status === 'completed'
                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300'
                        : investment.status === 'active'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                      {investment.status}
                    </span>
                  </div>
                  
                  <div className="space-y-3 sm:space-y-4">
                    <div className={`p-3 sm:p-4 rounded-lg ${
                      investment.status === 'completed'
                        ? 'bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30'
                        : 'bg-gradient-to-r from-blue-50 to-blue-100 dark:from-gray-700 dark:to-gray-800'
                    }`}>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <TbCurrencyNaira className={`mr-2 w-3 h-3 sm:w-4 smAppearance
￼
Sign Out
Sign Out
More options coming soon
Home
Invite
:h-4 ${
                            investment.status === 'completed'
                              ? 'text-purple-500 dark:text-purple-400'
                              : 'text-blue-500 dark:text-blue-400'
                          }`} />
                          <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Invested</span>
                        </div>
                        <span className="font-medium text-sm sm:text-base text-gray-800 dark:text-gray-100">
                          {formatCurrency(investment.amount_invested)}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 sm:gap-3">
                      <div className="bg-gray-50 dark:bg-gray-700/50 p-2 sm:p-3 rounded-lg">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Daily Income</p>
                        <p className="font-medium text-sm sm:text-base text-green-600 dark:text-green-400">
                          +{formatCurrency(investment.daily_income)}
                        </p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-700/50 p-2 sm:p-3 rounded-lg">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Earned</p>
                        <p className="font-medium text-sm sm:text-base">
                          {formatCurrency(investment.earnings_to_date)}
                        </p>
                      </div>
                    </div>

                    <div className="relative pt-1 sm:pt-2">
                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${
                            investment.status === 'completed'
                              ? 'bg-gradient-to-r from-purple-500 to-purple-400 dark:from-purple-400 dark:to-purple-300'
                              : 'bg-gradient-to-r from-blue-500 to-blue-400 dark:from-blue-400 dark:to-blue-300'
                          }`}
                          style={{ width: `${calculateProgress(investment)}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400 absolute right-0 top-0">
                        {calculateProgress(investment).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-200 dark:border-gray-700">
                    {investment.status === 'completed' ? (
                      <div className="flex items-center text-xs sm:text-sm text-green-500 dark:text-green-400">
                        <FiCheckCircle className="mr-2 w-3 h-3 sm:w-4 sm:h-4" />
                        <span>Completed on {format(new Date(investment.end_date), 'MMM d, yyyy')}</span>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-1 sm:mb-2">
                          <FiCalendar className="mr-2 w-3 h-3 sm:w-4 sm:h-4" />
                          <span>Next Payout</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium text-xs sm:text-sm text-gray-800 dark:text-gray-100">
                            {format(new Date(investment.next_payout_date), 'MMM d, yyyy HH:mm')}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {getDaysRemaining(investment.end_date)} days left
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}