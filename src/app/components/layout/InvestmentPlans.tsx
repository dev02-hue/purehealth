'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { FiTrendingUp } from 'react-icons/fi'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
 import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { getAllInvestmentPlans, InvestmentPlan } from '@/lib/investmentPlans'
import { investInPlan } from '@/lib/investment-plan'
 
const generateMarketData = (volatility: number) => {
  return Array.from({ length: 30 }, (_, i) => ({
    day: i + 1,
    value: 1000 + Math.sin(i * 0.3) * 500 * volatility + Math.random() * 200,
  }))
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0
  }).format(amount)
}

export default function InvestmentPlans() {
  const router = useRouter()

  const [investmentPlans, setInvestmentPlans] = useState<InvestmentPlan[]>([])
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPlans = async () => {
      const result = await getAllInvestmentPlans()

      if ('error' in result) {
        toast.error(result.error)
      } else {
        setInvestmentPlans(result)
        // Initialize loading states
        setLoadingStates(
          result.reduce((acc, plan) => ({ ...acc, [plan.name]: false }), {})
        )
      }
      setLoading(false)
    }

    fetchPlans()
  }, [])

  const handleInvest = async (plan: InvestmentPlan) => {
    const confirmed = window.confirm(`Are you sure you want to invest in ${plan.name} for ${formatCurrency(plan.price)}?`)
    if (!confirmed) return

    setLoadingStates(prev => ({ ...prev, [plan.name]: true }))

    try {
      const result = await investInPlan({
        name: plan.name,
        price: plan.price,
        dailyIncome: plan.daily_income,
        totalIncome: plan.total_income,
        duration: plan.duration,
      })

      if (!result?.success) {
        throw new Error('Investment failed')
      }

      toast.success(`Successfully invested ${formatCurrency(plan.price)} in ${plan.name}!`)
      router.push('/active-investment')
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

  interface CustomTooltipProps {
    active?: boolean
    payload?: { value: number }[]
    label?: number
  }

  const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="font-bold">{`Day ${label}`}</p>
          <p className="text-blue-600 dark:text-blue-400">
            {formatCurrency(payload[0].value)}
          </p>
        </div>
      )
    }
    return null
  }

  if (loading) {
    return <p className="text-center py-10">Loading investment plans...</p>
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
            Smart Investment Plans
          </motion.h2>
          <motion.p
            className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-300 sm:mt-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Data-driven investment strategies tailored for your goals
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {investmentPlans.map((plan, index) => {
            const marketData = generateMarketData(plan.volatility || 0.5)
            const roiPercentage = ((plan.total_income - plan.price) / plan.price * 100).toFixed(1)
            
            return (
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
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{plan.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{plan.description}</p>
                    </div>
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400">
                      <FiTrendingUp className="w-5 h-5" />
                    </div>
                  </div>

                  {/* Market Trend Visualization */}
                  <div className="h-40 mb-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={marketData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                        <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                        <YAxis domain={['auto', 'auto']} hide />
                        <Tooltip content={<CustomTooltip />} />
                        <Area 
                          type="monotone" 
                          dataKey="value" 
                          stroke="#3B82F6" 
                          fillOpacity={1} 
                          fill="url(#colorValue)" 
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 dark:text-gray-400">Investment</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">{formatCurrency(plan.price)}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 dark:text-gray-400">Daily Income</span>
                      <span className="font-medium text-green-600 dark:text-green-400">+{formatCurrency(plan.daily_income)}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 dark:text-gray-400">Total Return</span>
                      <span className="font-medium text-blue-600 dark:text-blue-400">{formatCurrency(plan.total_income)}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 dark:text-gray-400">ROI</span>
                      <span className="font-medium text-green-600 dark:text-green-400">{roiPercentage}%</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 dark:text-gray-400">Duration</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">{plan.duration}</span>
                    </div>

                    {/* <div className="flex justify-between items-center">
                      <span className="text-gray-500 dark:text-gray-400">Risk Level</span>
                      <span className={`font-medium ${
                        plan.risk === 'High' ? 'text-red-600 dark:text-red-400' : 
                        plan.risk === 'Medium' ? 'text-yellow-600 dark:text-yellow-400' : 
                        'text-green-600 dark:text-green-400'
                      }`}>
                        {plan.risk}
                      </span>
                    </div> */}
                  </div>

                  <button
                    onClick={() => handleInvest(plan)}
                    disabled={loadingStates[plan.name]}
                    className="mt-6 w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loadingStates[plan.name] ? 'Processing...' : 'Invest Now'}
                  </button>
                </div>
              </motion.div>
            )
          })}
        </div>

        <motion.div 
          className="mt-12 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Investment Performance Metrics</h3>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-300">
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="font-medium text-green-600 dark:text-green-400">98.7% Success Rate</p>
                <p className="text-gray-500 dark:text-gray-400">Completed Investments</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="font-medium text-blue-600 dark:text-blue-400">₦24.8M+</p>
                <p className="text-gray-500 dark:text-gray-400">Total Paid to Investors</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="font-medium text-purple-600 dark:text-purple-400">1,248</p>
                <p className="text-gray-500 dark:text-gray-400">Active Investors</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}