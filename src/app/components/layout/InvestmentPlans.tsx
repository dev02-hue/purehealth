'use client'

import { motion } from 'framer-motion'
import { FiTrendingUp } from 'react-icons/fi'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'react-hot-toast'
import { investInPlan } from '@/lib/investment-plan'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

// Mock data for market trends (would be replaced with real API data in production)
const generateMarketData = (volatility: number) => {
  return Array.from({ length: 30 }, (_, i) => ({
    day: i + 1,
    value: 1000 + Math.sin(i * 0.3) * 500 * volatility + Math.random() * 200,
  }))
}

const investmentPlans = [
  { 
    name: 'Starter Plan', 
    price: 3000, 
    dailyIncome: 900, 
    totalIncome: 27000, 
    duration: '30 Days',
    volatility: 0.2,
    risk: 'Low',
    description: 'Ideal for beginners with steady returns'
  },
  { 
    name: 'Basic Plan', 
    price: 6000, 
    dailyIncome: 1800, 
    totalIncome: 54000, 
    duration: '30 Days',
    volatility: 0.3,
    risk: 'Low',
    description: 'Balanced growth with moderate returns'
  },
  { 
    name: 'Silver Plan', 
    price: 20000, 
    dailyIncome: 6000, 
    totalIncome: 180000, 
    duration: '30 Days',
    volatility: 0.4,
    risk: 'Medium',
    description: 'Higher returns with managed risk'
  },
  { 
    name: 'Gold Plan', 
    price: 50000, 
    dailyIncome: 15000, 
    totalIncome: 450000, 
    duration: '30 Days',
    volatility: 0.5,
    risk: 'Medium',
    description: 'Premium growth with diverse assets'
  },
  { 
    name: 'Platinum Plan', 
    price: 100000, 
    dailyIncome: 30000, 
    totalIncome: 900000, 
    duration: '30 Days',
    volatility: 0.6,
    risk: 'High',
    description: 'Aggressive growth for experienced investors'
  },
  { 
    name: 'Diamond Plan', 
    price: 150000, 
    dailyIncome: 45000, 
    totalIncome: 1350000, 
    duration: '30 Days',
    volatility: 0.7,
    risk: 'High',
    description: 'High-yield opportunities with premium support'
  },
  { 
    name: 'Premium Plan', 
    price: 200000, 
    dailyIncome: 60000, 
    totalIncome: 1800000, 
    duration: '30 Days',
    volatility: 0.75,
    risk: 'High',
    description: 'Premium-tier plan with increased risk and returns'
  },
  { 
    name: 'Executive Plan', 
    price: 250000, 
    dailyIncome: 75000, 
    totalIncome: 2250000, 
    duration: '30 Days',
    volatility: 0.8,
    risk: 'High',
    description: 'Executive-level plan for serious investors'
  },
  { 
    name: 'VIP Plan', 
    price: 350000, 
    dailyIncome: 95000, 
    totalIncome: 2850000, 
    duration: '30 Days',
    volatility: 0.85,
    risk: 'High',
    description: 'VIP benefits and higher returns with top-tier support'
  },
  { 
    name: 'Elite Plan', 
    price: 650000, 
    dailyIncome: 180000, 
    totalIncome: 5400000, 
    duration: '30 Days',
    volatility: 0.9,
    risk: 'Very High',
    description: 'Elite-level investment for large capital growth'
  },
  { 
    name: 'Royal Plan', 
    price: 1000000, 
    dailyIncome: 300000, 
    totalIncome: 9000000, 
    duration: '30 Days',
    volatility: 0.95,
    risk: 'Very High',
    description: 'Royal-grade plan with unmatched earning potential'
  },
  { 
    name: 'Imperial Plan', 
    price: 2000000, 
    dailyIncome: 600000, 
    totalIncome: 18000000, 
    duration: '30 Days',
    volatility: 1.0,
    risk: 'Extreme',
    description: 'Imperial-level investment with maximum risk and reward'
  },
];


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
    // Show confirmation dialog
    const confirmed = window.confirm(`Are you sure you want to invest in ${plan.name} for ${formatCurrency(plan.price)}?`)
    
    if (!confirmed) return
    
    setLoadingStates(prev => ({ ...prev, [plan.name]: true }))
    
    try {
      const result = await investInPlan(plan)
      
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
    active?: boolean;
    payload?: { value: number }[];
    label?: number;
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
            const marketData = generateMarketData(plan.volatility)
            const roiPercentage = ((plan.totalIncome - plan.price) / plan.price * 100).toFixed(1)
            
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
                      <span className="font-medium text-green-600 dark:text-green-400">+{formatCurrency(plan.dailyIncome)}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 dark:text-gray-400">Total Return</span>
                      <span className="font-medium text-blue-600 dark:text-blue-400">{formatCurrency(plan.totalIncome)}</span>
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