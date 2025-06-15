'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { FiTrendingUp, FiDollarSign, FiClock, FiBarChart2,  FiPieChart } from 'react-icons/fi'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts'
import { getAllInvestmentPlans, InvestmentPlan } from '@/lib/investmentPlans'
import { investInPlan } from '@/lib/investment-plan'
import { FaNairaSign } from 'react-icons/fa6'

// Generate mock historical data for each plan
const generateHistoricalData = (volatility: number) => {
  const data = []
  let value = 100
  for (let i = 0; i < 12; i++) {
    data.push({
      month: `${i + 1}`,
      value: Math.round(value)
    })
    value = value * (1 + (Math.random() * 0.2 * volatility - 0.1))
  }
  return data
}

const generatePerformanceData = (volatility: number) => {
  const performanceScore = Math.round(100 - (volatility * 20))
  // const riskScore = Math.round(volatility * 100)
  const stabilityScore = Math.round(100 - (volatility * 50))
  const liquidityScore = Math.round(80 - (volatility * 30))
  
  return [
    { name: 'Performance', value: performanceScore, fill: '#3B82F6', icon: <FiTrendingUp /> },
    // { name: 'Risk', value: riskScore, fill: '#EF4444', icon: <FiShield /> },
    { name: 'Stability', value: stabilityScore, fill: '#10B981', icon: <FiBarChart2 /> },
    { name: 'Liquidity', value: liquidityScore, fill: '#8B5CF6', icon: <FiPieChart /> },
  ]
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0
  }).format(amount)
}

interface CryptoData {
  id: string
  symbol: string
  name: string
  current_price: number
  price_change_percentage_24h: number
}

export default function InvestmentPlans() {
  const router = useRouter()
  const [investmentPlans, setInvestmentPlans] = useState<InvestmentPlan[]>([])
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(true)
  const [cryptoData, setCryptoData] = useState<CryptoData[]>([])
  const [activeHover, setActiveHover] = useState<string | null>(null)

  // Fetch investment plans
  useEffect(() => {
    const fetchPlans = async () => {
      const result = await getAllInvestmentPlans()
      if ('error' in result) {
        toast.error(result.error)
      } else {
        setInvestmentPlans(result)
        setLoadingStates(
          result.reduce((acc, plan) => ({ ...acc, [plan.name]: false }), {})
        )
      }
      setLoading(false)
    }
    fetchPlans()
  }, [])

  // Fetch crypto data from CoinGecko
  useEffect(() => {
    const fetchCryptoData = async () => {
      try {
        const response = await fetch(
          'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=4&page=1&sparkline=false'
        )
        const data = await response.json()
        setCryptoData(data)
      } catch (error) {
        console.error('Failed to fetch crypto data:', error)
      }
    }

    fetchCryptoData()
    const interval = setInterval(fetchCryptoData, 8000) // Update every 30 seconds

    return () => clearInterval(interval)
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
    payload?: { payload: { name: string, value: number } }[]
  }

  const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="font-bold">{payload[0].payload.name}</p>
          <p className="text-blue-600 dark:text-blue-400">
            {payload[0].payload.value}%
          </p>
        </div>
      )
    }
    return null
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 bg-blue-500 rounded-full mb-4"></div>
          <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
            Loading Sheraton Investment Plans...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="py-12 mb-10 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto">
        {/* Sheraton Branded Header */}
        <div className="text-center mb-12">
          <motion.div 
            className="inline-block mb-6"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center justify-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-400 rounded-full"></div>
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-400">
                Sheraton
              </span>
            </div>
          </motion.div>
          
          <motion.h2 
            className="text-3xl font-bold text-gray-900 dark:text-gray-100 sm:text-4xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Premium Investment Opportunities
          </motion.h2>
          <motion.p
            className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-300 sm:mt-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Sheraton&apos;s data-driven investment strategies for financial growth
          </motion.p>
        </div>

        {/* Real-time Crypto Data Ticker */}
        {cryptoData.length > 0 && (
          <motion.div 
            className="mb-12 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center">
              <FiDollarSign className="mr-2 text-blue-500" />
              Market Watch
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {cryptoData.map((crypto) => (
                <div key={crypto.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {crypto.symbol.toUpperCase()}
                    </span>
                    <span className={`text-sm ${
                      crypto.price_change_percentage_24h >= 0 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {crypto.price_change_percentage_24h >= 0 ? '+' : ''}
                      {crypto.price_change_percentage_24h.toFixed(2)}%
                    </span>
                  </div>
                  <div className="text-lg font-bold mt-1">
                    ${crypto.current_price.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Rectangular Investment Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {investmentPlans.map((plan, index) => {
            const performanceData = generatePerformanceData(plan.volatility || 0.5)
            const historicalData = generateHistoricalData(plan.volatility || 0.5)
            
            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.03 }}
                className="relative"
                onMouseEnter={() => setActiveHover(plan.name)}
                onMouseLeave={() => setActiveHover(null)}
              >
                {/* Rectangular card */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-lg">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                          {plan.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {plan.description}
                        </p>
                      </div>
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-400 text-white">
                        <FiTrendingUp className="w-5 h-5" />
                      </div>
                    </div>

                    {/* Radial Bar Chart Visualization */}
                    <div className="h-40 mb-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadialBarChart 
                          cx="50%" 
                          cy="50%" 
                          innerRadius="30%" 
                          outerRadius="90%" 
                          barSize={10}
                          data={performanceData}
                          startAngle={90}
                          endAngle={-270}
                        >
                          <PolarAngleAxis 
                            type="number" 
                            domain={[0, 100]} 
                            angleAxisId={0} 
                            tick={false}
                          />
                          <RadialBar
                            background
                            dataKey="value"
                            cornerRadius={10}
                            animationBegin={index * 150}
                          />
                          <Tooltip content={<CustomTooltip />} />
                        </RadialBarChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Performance Indicators */}
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      {performanceData.map((entry) => (
                        <div 
                          key={entry.name} 
                          className={`p-2 rounded-lg flex items-center ${
                            activeHover === plan.name 
                              ? 'bg-gray-100 dark:bg-gray-700' 
                              : 'bg-gray-50 dark:bg-gray-700/50'
                          }`}
                        >
                          <div 
                            className="w-3 h-3 rounded-full mr-2" 
                            style={{ backgroundColor: entry.fill }}
                          />
                          <div>
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                              {entry.name}
                            </p>
                            <p className="text-sm font-bold" style={{ color: entry.fill }}>
                              {entry.value}%
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Historical Performance Chart */}
                    <div className="h-32 mb-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={historicalData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                          <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                          <YAxis domain={['auto', 'auto']} hide />
                          <Line
                            type="monotone"
                            dataKey="value"
                            stroke="#3B82F6"
                            strokeWidth={2}
                            dot={false}
                            animationDuration={2000}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Investment Details */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                        <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                          <FaNairaSign className="mr-1" /> Investment
                        </span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {formatCurrency(plan.price)}
                        </span>
                      </div>

                      <div className="flex justify-between items-center p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                        <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                          <FiTrendingUp className="mr-1" /> Daily Income
                        </span>
                        <span className="font-medium text-green-600 dark:text-green-400">
                          +{formatCurrency(plan.daily_income)}
                        </span>
                      </div>

                      <div className="flex justify-between items-center p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                        <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                          <FiClock className="mr-1" /> Duration
                        </span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {plan.duration}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleInvest(plan)}
                      disabled={loadingStates[plan.name]}
                      className="mt-6 w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loadingStates[plan.name] ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing...
                        </span>
                      ) : (
                        'Invest with Sheraton'
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Sheraton Investment Stats */}
        <motion.div 
          className="mt-16 bg-gradient-to-r from-blue-600 to-blue-500 p-8 rounded-2xl shadow-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <div className="text-center text-white">
            <h3 className="text-2xl font-bold mb-6">Why Choose Sheraton Investments?</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              <div className="p-4 bg-white/10 rounded-xl backdrop-blur-sm">
                <div className="text-4xl font-bold mb-2">98.7%</div>
                <p className="text-sm opacity-90">Investment Success Rate</p>
              </div>
              <div className="p-4 bg-white/10 rounded-xl backdrop-blur-sm">
                <div className="text-4xl font-bold mb-2">₦24.8M+</div>
                <p className="text-sm opacity-90">Paid to Investors</p>
              </div>
              <div className="p-4 bg-white/10 rounded-xl backdrop-blur-sm">
                <div className="text-4xl font-bold mb-2">1,248</div>
                <p className="text-sm opacity-90">Active Investors</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Testimonial Section */}
        <motion.div 
          className="mt-16 bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <div className="text-center">
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">
              What Our Investors Say
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-6 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold mr-3">
                    A
                  </div>
                  <div>
                    <h4 className="font-medium">Adebayo O.</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Sheraton Investor</p>
                  </div>
                </div>
                <p className="text-gray-700 dark:text-gray-300 italic">
                &apos;Sheraton&apos;s investment plans helped me grow my portfolio by 35% in just 6 months. Their transparent process and regular updates give me peace of mind.&apos;
                </p>
              </div>
              <div className="p-6 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-bold mr-3">
                    C
                  </div>
                  <div>
                    <h4 className="font-medium">Chioma K.</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Sheraton Investor</p>
                  </div>
                </div>
                <p className="text-gray-700 dark:text-gray-300 italic">
                &apos;I was skeptical at first, but the consistent returns from my Sheraton investments have exceeded my expectations. The customer support is exceptional too.&apos;
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}