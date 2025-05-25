'use client'

import { motion } from 'framer-motion'
import { FiTrendingUp } from 'react-icons/fi'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'react-hot-toast'
import { investInPlan } from '@/lib/investment-plan'

const investmentPlans = [
  { name: 'Starter Plan', price: 3000, dailyIncome: 900, totalIncome: 27000, duration: '30 Days' },
  { name: 'Basic Plan', price: 6000, dailyIncome: 1800, totalIncome: 54000, duration: '30 Days' },
  { name: 'Silver Plan', price: 20000, dailyIncome: 6000, totalIncome: 180000, duration: '30 Days' },
  { name: 'Gold Plan', price: 50000, dailyIncome: 15000, totalIncome: 450000, duration: '30 Days' },
  { name: 'Platinum Plan', price: 100000, dailyIncome: 30000, totalIncome: 900000, duration: '30 Days' },
  { name: 'Diamond Plan', price: 150000, dailyIncome: 45000, totalIncome: 1350000, duration: '30 Days' },
  { name: 'Premium Plan', price: 200000, dailyIncome: 60000, totalIncome: 1800000, duration: '30 Days' },
  { name: 'Executive Plan', price: 250000, dailyIncome: 75000, totalIncome: 2250000, duration: '30 Days' },
  { name: 'VIP Plan', price: 350000, dailyIncome: 95000, totalIncome: 2850000, duration: '30 Days' },
  { name: 'Elite Plan', price: 650000, dailyIncome: 180000, totalIncome: 5400000, duration: '30 Days' },
  { name: 'Royal Plan', price: 1000000, dailyIncome: 300000, totalIncome: 9000000, duration: '30 Days' },
  { name: 'Imperial Plan', price: 2000000, dailyIncome: 600000, totalIncome: 18000000, duration: '30 Days' },
]

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-NG', { 
    style: 'currency', 
    currency: 'NGN',
    minimumFractionDigits: 0
  }).format(amount)
}

export default function InvestmentPlans() {
  const router = useRouter()
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>(
    investmentPlans.reduce((acc, plan) => ({ ...acc, [plan.name]: false }), {})
  )

  const handleInvest = async (plan: typeof investmentPlans[0]) => {
    setLoadingStates(prev => ({ ...prev, [plan.name]: true }))
    
    try {
      const result = await investInPlan(plan)
      if (!result?.success) {
        throw new Error('Investment failed')
      }
      toast.success(`Successfully invested in ${plan.name}!`)
      router.push('/dashboard/investments')
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message || 'Investment failed')
      } else {
        toast.error('An unknown error occurred')
      }
    } finally {
      setLoadingStates(prev => ({ ...prev, [plan.name]: false }))
    }
  }

  return (
    <div className="py-12 mb-10 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <motion.h2 
            className="text-3xl font-bold text-gray-900 dark:text-gray-100 sm:text-4xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Investment Plans
          </motion.h2>
          <motion.p
            className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-300 sm:mt-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Choose a plan that fits your financial goals
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {investmentPlans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-100 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-400 transition-all"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{plan.name}</h3>
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400">
                    <FiTrendingUp className="w-5 h-5" />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 dark:text-gray-400">Investment</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{formatCurrency(plan.price)}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 dark:text-gray-400">Daily Income</span>
                    <span className="font-medium text-green-600 dark:text-green-400">+{formatCurrency(plan.dailyIncome)}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 dark:text-gray-400">Total Income</span>
                    <span className="font-medium text-blue-600 dark:text-blue-400">{formatCurrency(plan.totalIncome)}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 dark:text-gray-400">Duration</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{plan.duration}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleInvest(plan)}
                  disabled={loadingStates[plan.name]}
                  className="mt-6 w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loadingStates[plan.name] ? 'Processing...' : 'Invest Now'}
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div 
          className="mt-12 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Investment Terms</h3>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-300">
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="font-medium dark:text-gray-100">Minimum: ₦1,000</p>
                <p className="text-gray-500 dark:text-gray-400">Withdrawal</p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="font-medium dark:text-gray-100">Referral Bonus</p>
                <p className="text-gray-500 dark:text-gray-400">30% (Level 1), 3% (Level 2+)</p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="font-medium dark:text-gray-100">Welcome Bonus</p>
                <p className="text-gray-500 dark:text-gray-400">₦900</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}