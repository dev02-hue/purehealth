'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getInvestments } from '@/lib/investment-actions'
import { formatCurrency } from '@/lib/utils'
import { format } from 'date-fns'
import { motion } from 'framer-motion'
import { FiTrendingUp, FiClock, FiDollarSign, FiCalendar } from 'react-icons/fi'
 

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
}

export default function InvestmentsPage() {
  const [investments, setInvestments] = useState<Investment[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const loadInvestments = async () => {
      try {
        const data = await getInvestments()
        setInvestments(data)
      } catch (error) {
        console.log('Error loading investments:', error)
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }

    loadInvestments()
  }, [router])

  if (loading) {
    return (
      <div className="p-6 min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-900">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-6xl mx-auto"
      >
        <div className="flex justify-between items-center mb-8">
          <motion.h1 
            className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent dark:from-blue-400 dark:to-blue-300"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Your Investments
          </motion.h1>
          <motion.p
            className="text-sm text-gray-500 dark:text-gray-400 bg-white/50 dark:bg-gray-800/50 px-3 py-1 rounded-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {investments.length} active investment{investments.length !== 1 ? 's' : ''}
          </motion.p>
        </div>
        
        {investments.length === 0 ? (
          <motion.div
            className="text-center py-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <div className="mx-auto w-32 h-32 bg-gradient-to-br from-blue-100 to-blue-50 dark:from-gray-800 dark:to-gray-700 rounded-full flex items-center justify-center mb-6 shadow-lg">
              <FiTrendingUp className="h-16 w-16 text-blue-400 dark:text-blue-300" />
            </div>
            <h3 className="text-2xl font-medium text-gray-800 dark:text-gray-100 mb-2">
              No Active Investments
            </h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
              You haven&#39;t started any investments yet. Begin your journey to grow your wealth today.
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="mt-6 px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-full shadow-lg hover:shadow-blue-200/50 dark:hover:shadow-blue-900/30 transition-all"
            >
              Explore Plans
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {investments.map((investment) => (
              <motion.div
                key={investment.id}
                variants={item}
                whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)' }}
                className="bg-white/80 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-md overflow-hidden border border-gray-200/50 dark:border-gray-700 transition-all"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="font-bold text-xl text-gray-800 dark:text-gray-100">
                        {investment.plan_name}
                      </h2>
                      <div className="flex items-center mt-1 text-sm text-blue-500 dark:text-blue-400">
                        <FiClock className="mr-1" />
                        <span>{investment.duration}</span>
                      </div>
                    </div>
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                      investment.status === 'active' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                      {investment.status}
                    </span>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-gray-700 dark:to-gray-800 p-4 rounded-lg">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <FiDollarSign className="text-blue-500 dark:text-blue-400 mr-2" />
                          <span className="text-sm text-gray-500 dark:text-gray-400">Invested</span>
                        </div>
                        <span className="font-medium text-gray-800 dark:text-gray-100">
                          {formatCurrency(investment.amount_invested)}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Daily Income</p>
                        <p className="font-medium text-green-600 dark:text-green-400">
                          +{formatCurrency(investment.daily_income)}
                        </p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Earned</p>
                        <p className="font-medium">
                          {formatCurrency(investment.earnings_to_date)}
                        </p>
                      </div>
                    </div>

                    <div className="relative pt-2">
                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-500 to-blue-400 dark:from-blue-400 dark:to-blue-300"
                          style={{ width: `${Math.min(100, (investment.earnings_to_date / investment.total_income) * 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400 absolute right-0 top-0">
                        {((investment.earnings_to_date / investment.total_income) * 100 || 0).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-2">
                      <FiCalendar className="mr-2" />
                      <span>Next Payout</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-800 dark:text-gray-100">
                        {format(new Date(investment.next_payout_date), 'MMM d, yyyy HH:mm')}
                      </span>
                      {/* <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        className="text-xs bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 px-3 py-1 rounded-full"
                      >
                        View Details
                      </motion.button> */}
                    </div>
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