'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getInvestments } from '@/lib/investment-actions'
import { formatCurrency } from '@/lib/utils'
import { format, differenceInDays, addDays, isAfter, isBefore } from 'date-fns'
import { motion } from 'framer-motion'
import { 
  FiTrendingUp, 
  FiClock,
  FiCheckCircle,
  FiPieChart,
  FiRefreshCw,
  FiPlus
} from 'react-icons/fi'
// import { toast } from 'react-hot-toast'
import { processEarnings } from '@/lib/investment-plan'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import Link from 'next/link'
import { FaNairaSign } from 'react-icons/fa6'

// Color palette
const COLORS = {
  primaryBg: '#FFFFFF',
  secondaryBg: '#F5F7FA',
  textDark: '#1A1A1A',
  textLight: '#4A5568',
  primaryAccent: '#3B82F6',
  secondaryAccent: '#EC4899',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  shiny: '#FFD700'
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
  start_date: string;
}

// Countdown component for the 20-hour interval
const InvestmentCountdown = ({ nextPayoutDate }: { nextPayoutDate: string }) => {
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0
  })

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date()
      const payoutDate = new Date(nextPayoutDate)
      const diffInSeconds = Math.max(0, Math.floor((payoutDate.getTime() - now.getTime()) / 1000))

      const hours = Math.floor(diffInSeconds / 3600)
      const minutes = Math.floor((diffInSeconds % 3600) / 60)
      const seconds = diffInSeconds % 60

      setTimeLeft({ hours, minutes, seconds })
    }

    calculateTimeLeft()
    const interval = setInterval(calculateTimeLeft, 1000)

    return () => clearInterval(interval)
  }, [nextPayoutDate])

  return (
    <div className="flex items-center justify-center gap-1">
      <div className="bg-white bg-opacity-20 rounded-md px-2 py-1 min-w-[2.5rem] text-center">
        <span className="font-bold">{timeLeft.hours.toString().padStart(2, '0')}</span>
        <span className="text-xs opacity-80 block">hrs</span>
      </div>
      <span>:</span>
      <div className="bg-white bg-opacity-20 rounded-md px-2 py-1 min-w-[2.5rem] text-center">
        <span className="font-bold">{timeLeft.minutes.toString().padStart(2, '0')}</span>
        <span className="text-xs opacity-80 block">min</span>
      </div>
      <span>:</span>
      <div className="bg-white bg-opacity-20 rounded-md px-2 py-1 min-w-[2.5rem] text-center">
        <span className="font-bold">{timeLeft.seconds.toString().padStart(2, '0')}</span>
        <span className="text-xs opacity-80 block">sec</span>
      </div>
    </div>
  )
}

// Generate mock performance data for charts
const generatePerformanceData = (investment: Investment) => {
  const data = []
  const startDate = new Date(investment.start_date)
  const endDate = new Date(investment.end_date)
  
  let currentDate = new Date(startDate)
  let cumulativeEarnings = 0

  while (isBefore(currentDate, endDate)) {
    if (isAfter(currentDate, new Date(investment.last_payout_date))) {
      cumulativeEarnings += investment.daily_income * (20 / 24) // Adjust for 20-hour payouts
    }
    data.push({
      day: format(currentDate, 'MMM d'),
      value: Math.min(cumulativeEarnings, investment.total_income)
    })
    currentDate = addDays(currentDate, 1)
  }
  
  return data.length > 0 ? data : [
    { day: 'Today', value: investment.earnings_to_date },
    { day: 'Tomorrow', value: investment.earnings_to_date + (investment.daily_income * (20 / 24)) }
  ]
}

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

function NextPayoutDisplay({ investment }: { investment: Investment }) {
  const now = new Date()
  const payoutDate = new Date(investment.next_payout_date)
  const endDate = new Date(investment.end_date)
  
  // Determine if investment is completed
  const isCompleted = investment.status === 'completed' || isAfter(now, endDate)

  if (isCompleted) {
    return (
      <div className="text-sm font-medium" style={{ color: COLORS.success }}>
        <div className="flex items-center">
          <FiCheckCircle className="mr-2" />
          <span>Completed on {format(endDate, 'MMM d, yyyy')}</span>
        </div>
        <div className="text-xs opacity-75 mt-1">
          Final payout: {format(new Date(investment.last_payout_date), 'MMM d, yyyy')}
        </div>
      </div>
    )
  }

  // Format the payout time
  const formattedTime = format(payoutDate, 'HH:mm')
  const formattedDate = format(payoutDate, 'EEEE, MMMM d, yyyy')

  return (
    <div className="text-sm font-medium" style={{ color: COLORS.textDark }}>
      <div className="flex items-center gap-2">
        <FiClock />
        <span>Next payout in:</span>
      </div>
      <div className="mt-2">
        <InvestmentCountdown nextPayoutDate={investment.next_payout_date} />
      </div>
      <div className="text-xs opacity-75 mt-2">
        Scheduled for {formattedTime} on {formattedDate}
      </div>
    </div>
  )
}

export default function InvestmentsPage() {
  const [investments, setInvestments] = useState<Investment[]>([])
  const [loading, setLoading] = useState(true)
  // const [processing, setProcessing] = useState(false)
  const router = useRouter()

  const loadInvestments = useCallback(async () => {
    try {
      const data = await getInvestments()
      // Process the investments data to ensure proper calculations
      const processedData = data.map(investment => {
        const now = new Date()
        const endDate = new Date(investment.end_date)
        const isCompleted = investment.status === 'completed' || isAfter(now, endDate)
        
        return {
          ...investment,
          status: isCompleted ? 'completed' : investment.status
        }
      })
      setInvestments(processedData)
    } catch (error) {
      console.error('Error loading investments:', error)
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }, [router])

  const handleTrigger = async () => {
    setLoading(true); // Assuming this is the same as setting 'processing' state
    try {
      await processEarnings(); // Just await the process without storing or setting the result
      // Remove the setResult(data) line
    } catch (error) {
      console.error('[Manual Trigger Error]:', error);
      // You can keep error handling if needed, just remove any result setting
    } finally {
      setLoading(false);
    }
  };

  // const handleProcessEarnings = useCallback(async () => {
  //   setProcessing(true)
  //   try {
  //     const result = await processEarnings()
  //     if (result.success) {
  //       if ('updatedInvestments' in result && (result.updatedInvestments.length > 0 || result.completedInvestments.length > 0)) {
  //         await loadInvestments()
  //         toast.success(
  //           `Processed ${result.updatedInvestments.length} updates and ${result.completedInvestments.length} completions`
  //         )
  //       } else {
  //         toast.success('No earnings to process at this time')
  //       }
  //     } else {
  //       toast.error('Error processing earnings')
  //     }
  //   } catch (error) {
  //     console.error('Error processing earnings:', error)
  //     toast.error('Failed to process earnings')
  //   } finally {
  //     setProcessing(false)
  //   }
  // }, [loadInvestments])

  useEffect(() => {
    loadInvestments()
    const interval = setInterval(() => {
      loadInvestments() // Refresh data every hour
    }, 60 * 60 * 1000)
    return () => clearInterval(interval)
  }, [loadInvestments])

  const calculateProgress = (investment: Investment) => {
    const progress = (investment.earnings_to_date / investment.total_income) * 100
    return Math.min(100, Math.max(0, progress))
  }

  const getDaysRemaining = (endDate: string) => {
    const days = differenceInDays(new Date(endDate), new Date())
    return days > 0 ? days : 0
  }

  if (loading) {
    return (
      <div className="p-6 min-h-screen" style={{ backgroundColor: COLORS.primaryBg }}>
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" 
              style={{ borderColor: COLORS.primaryAccent }}></div>
          </div>
        </div>
      </div>
    )
  }

  // Find the next upcoming payout across all investments
  // const upcomingPayout = investments
  //   .filter(inv => inv.status !== 'completed')
  //   .sort((a, b) => new Date(a.next_payout_date).getTime() - new Date(b.next_payout_date).getTime())[0]

  return (
    <div className="p-6 min-h-screen mb-20" style={{ backgroundColor: COLORS.primaryBg }}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-6xl mx-auto"
      >
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <motion.h1 
              className="text-3xl font-bold mb-2"
              style={{ color: COLORS.textDark }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Investment Portfolio
            </motion.h1>
            <motion.p
              className="text-lg"
              style={{ color: COLORS.textLight }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Track and manage your active investments
            </motion.p>
          </div>
          
          <div className="flex gap-3">
          <motion.button
  whileHover={{ scale: 1.03 }}
  whileTap={{ scale: 0.98 }}
  onClick={handleTrigger} // Use the modified handler here
  disabled={loading} // Use your loading state (or processing if they're the same)
  className="flex items-center gap-2 px-4 py-2 rounded-lg shadow-sm"
  style={{ 
    backgroundColor: loading ? COLORS.textLight : COLORS.primaryAccent,
    color: '#FFFFFF'
  }}
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ delay: 0.4 }}
>
  <FiRefreshCw className={loading ? 'animate-spin' : ''} />
  {loading ? 'Processing...' : 'Refresh Earnings'}
</motion.button>
            
            <Link href="/plans" passHref>
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg shadow-sm cursor-pointer"
                style={{ 
                  backgroundColor: COLORS.secondaryAccent,
                  color: '#FFFFFF'
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <FiPlus />
                New Investment
              </motion.div>
            </Link>
          </div>
        </div>
        
        {/* Stats Overview */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <div className="p-6 rounded-xl shadow-sm" style={{ backgroundColor: COLORS.secondaryBg }}>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full" style={{ backgroundColor: COLORS.primaryAccent + '20' }}>
                <FaNairaSign style={{ color: COLORS.primaryAccent }} />
              </div>
              <div>
                <p className="text-sm" style={{ color: COLORS.textLight }}>Total Invested</p>
                <p className="text-xl font-bold" style={{ color: COLORS.textDark }}>
                  {formatCurrency(investments.reduce((sum, inv) => sum + inv.amount_invested, 0))}
                </p>
              </div>
            </div>
          </div>
          
          <div className="p-6 rounded-xl shadow-sm" style={{ backgroundColor: COLORS.secondaryBg }}>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full" style={{ backgroundColor: COLORS.success + '20' }}>
                <FiTrendingUp style={{ color: COLORS.success }} />
              </div>
              <div>
                <p className="text-sm" style={{ color: COLORS.textLight }}>Total Earnings</p>
                <p className="text-xl font-bold" style={{ color: COLORS.textDark }}>
                  {formatCurrency(investments.reduce((sum, inv) => sum + inv.earnings_to_date, 0))}
                </p>
              </div>
            </div>
          </div>
          
          <div className="p-6 rounded-xl shadow-sm" style={{ backgroundColor: COLORS.secondaryBg }}>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full" style={{ backgroundColor: COLORS.warning + '20' }}>
                <FiPieChart style={{ color: COLORS.warning }} />
              </div>
              <div>
                <p className="text-sm" style={{ color: COLORS.textLight }}>Active Plans</p>
                <p className="text-xl font-bold" style={{ color: COLORS.textDark }}>
                  {investments.filter(i => i.status !== 'completed').length}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Countdown Timer for next payout */}
        {/* {upcomingPayout && (
          <motion.div 
            className="mb-8 p-6 rounded-xl shadow-sm"
            style={{ backgroundColor: COLORS.primaryAccent }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <div className="flex flex-col items-center text-white">
              <p className="text-sm mb-2">Next Payout In</p>
              <div className="text-3xl font-mono font-bold tracking-wider mb-2">
                <InvestmentCountdown nextPayoutDate={upcomingPayout.next_payout_date} />
              </div>
              <p className="text-xs opacity-90 text-center">
                Payouts occur every 20 hours automatically
              </p>
            </div>
          </motion.div>
        )} */}

        {/* Investments Grid */}
        {investments.length === 0 ? (
          <motion.div
            className="text-center py-16 rounded-xl shadow-sm"
            style={{ backgroundColor: COLORS.secondaryBg }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <div className="mx-auto w-32 h-32 rounded-full flex items-center justify-center mb-6 shadow-sm"
              style={{ backgroundColor: COLORS.primaryAccent + '20' }}>
              <FiTrendingUp className="h-16 w-16" style={{ color: COLORS.primaryAccent }} />
            </div>
            <h3 className="text-2xl font-medium mb-2" style={{ color: COLORS.textDark }}>
              No Active Investments
            </h3>
            <p className="max-w-md mx-auto text-lg mb-6" style={{ color: COLORS.textLight }}>
              Start growing your wealth by creating your first investment
            </p>
            <Link href="/plans" passHref>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="px-6 py-2 rounded-lg shadow-sm"
                style={{ 
                  backgroundColor: COLORS.primaryAccent,
                  color: '#FFFFFF'
                }}
              >
                Explore Investment Plans
              </motion.button>
            </Link>
          </motion.div>
        ) : (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            {investments.map((investment) => (
              <motion.div
                key={investment.id}
                variants={item}
                whileHover={{ y: -5 }}
                className="rounded-xl shadow-md overflow-hidden"
                style={{ backgroundColor: COLORS.primaryBg }}
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="font-bold text-xl mb-1" style={{ color: COLORS.textDark }}>
                        {investment.plan_name}
                      </h2>
                      <div className="flex items-center gap-2">
                        <span className="text-sm px-3 py-1 rounded-full" 
                          style={{ 
                            backgroundColor: investment.status === 'completed' 
                              ? COLORS.success + '20' 
                              : COLORS.primaryAccent + '20',
                            color: investment.status === 'completed' 
                              ? COLORS.success 
                              : COLORS.primaryAccent
                          }}>
                          {investment.status}
                        </span>
                        <div className="flex items-center text-sm" style={{ color: COLORS.textLight }}>
                          <FiClock className="mr-1" />
                          <span>{investment.duration}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Performance Chart */}
                  <div className="h-40 mb-6">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={generatePerformanceData(investment)}>
                        <defs>
                          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={COLORS.primaryAccent} stopOpacity={0.8}/>
                            <stop offset="95%" stopColor={COLORS.primaryAccent} stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip 
                          formatter={(value) => [formatCurrency(Number(value)), 'Earnings']}
                          labelFormatter={(label) => `Day: ${label}`}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="value" 
                          stroke={COLORS.primaryAccent}
                          fillOpacity={1} 
                          fill="url(#colorValue)" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div>
                      <p className="text-xs mb-1" style={{ color: COLORS.textLight }}>Invested</p>
                      <p className="font-medium" style={{ color: COLORS.textDark }}>
                        {formatCurrency(investment.amount_invested)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs mb-1" style={{ color: COLORS.textLight }}>Daily</p>
                      <p className="font-medium" style={{ color: COLORS.success }}>
                        +{formatCurrency(investment.daily_income)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs mb-1" style={{ color: COLORS.textLight }}>Earned</p>
                      <p className="font-medium" style={{ color: COLORS.textDark }}>
                        {formatCurrency(investment.earnings_to_date)}
                        <span className="text-xs ml-1" style={{ color: COLORS.textLight }}>
                          / {formatCurrency(investment.total_income)}
                        </span>
                      </p>
                    </div>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="mb-6">
                    <div className="flex justify-between text-xs mb-1" style={{ color: COLORS.textLight }}>
                      <span>Progress</span>
                      <span>{calculateProgress(investment).toFixed(1)}%</span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: COLORS.secondaryBg }}>
                      <div 
                        className="h-full rounded-full" 
                        style={{ 
                          backgroundColor: investment.status === 'completed' 
                            ? COLORS.success 
                            : COLORS.primaryAccent,
                          width: `${calculateProgress(investment)}%`
                        }}
                      ></div>
                    </div>
                    <p className="text-xs mb-2" style={{ color: COLORS.textLight }}>
                      Days remaining: <span className="font-medium" style={{ color: COLORS.primaryAccent }}>
                        {getDaysRemaining(investment.end_date)} days
                      </span>
                    </p>
                  </div>
                  
                  {/* Status section */}
                  <div className="pt-4 border-t" style={{ borderColor: COLORS.secondaryBg }}>
                    <NextPayoutDisplay investment={investment} />
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