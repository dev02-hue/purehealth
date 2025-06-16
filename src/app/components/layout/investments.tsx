'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getInvestments } from '@/lib/investment-actions'
import { formatCurrency } from '@/lib/utils'
import { format, differenceInDays, addDays, isAfter, isBefore} from 'date-fns'
import { motion } from 'framer-motion'
import { 
  FiTrendingUp, 
  FiClock,
  FiCheckCircle,
  FiPieChart,
  FiRefreshCw,
  FiPlus
} from 'react-icons/fi'
import { toast } from 'react-hot-toast'
import { processDailyEarnings } from '@/lib/investment-plan'
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
}



// Generate mock performance data for charts
const generatePerformanceData = (investment: Investment) => {
  const data = []
  const startDate = new Date(investment.last_payout_date || investment.next_payout_date)
  const endDate = new Date(investment.end_date)
  
  let currentDate = new Date(startDate)
  let cumulativeEarnings = investment.earnings_to_date - investment.daily_income // Start from previous day
  
  while (isBefore(currentDate, endDate)) {
    cumulativeEarnings += investment.daily_income
    data.push({
      day: format(currentDate, 'MMM d'),
      value: cumulativeEarnings
    })
    currentDate = addDays(currentDate, 1)
  }
  
  return data.length > 0 ? data : [
    { day: 'Today', value: investment.earnings_to_date },
    { day: 'Tomorrow', value: investment.earnings_to_date + investment.daily_income }
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



interface NigeriaTime {
  time: string;
  date: string;
  timezone: string;
  isDaytime: boolean | null;
  source: string;
  error?: string;
}

function InvestmentCountdown({ nextPayoutDate }: { nextPayoutDate: string }) {
  const [timeLeft, setTimeLeft] = useState({
    hours: '00',
    minutes: '00',
    seconds: '00'
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const payoutDate = new Date(nextPayoutDate);
      const difference = payoutDate.getTime() - now.getTime();

      // Always show the time difference, even if negative
      const hours = Math.abs(Math.floor(difference / (1000 * 60 * 60)));
      const minutes = Math.abs(Math.floor((difference / (1000 * 60)) % 60));
      const seconds = Math.abs(Math.floor((difference / 1000) % 60));

      setTimeLeft({
        hours: hours.toString().padStart(2, '0'),
        minutes: minutes.toString().padStart(2, '0'),
        seconds: seconds.toString().padStart(2, '0')
      });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [nextPayoutDate]);

  return (
    <div className="font-mono text-sm font-medium text-gray-700">
      {timeLeft.hours}:{timeLeft.minutes}:{timeLeft.seconds}
    </div>
  );
}

function NextPayoutDisplay({ investment }: { investment: Investment }) {
  const [nigeriaTime, setNigeriaTime] = useState<NigeriaTime | null>(null)
  const [loading, setLoading] = useState(true)


  

  useEffect(() => {
    const fetchNigeriaTime = async () => {
      try {
        const response = await fetch('/api/nigeria-time')
        const data = await response.json()
        setNigeriaTime(data)
      } catch (error) {
        console.error('Error fetching Nigeria time:', error)
        // Fallback to client-side time with Nigeria timezone
        const fallbackTime = new Date().toLocaleTimeString('en-US', {
          timeZone: 'Africa/Lagos',
          hour12: true,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        })
        
        const fallbackDate = new Date().toLocaleDateString('en-US', {
          timeZone: 'Africa/Lagos',
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })

        setNigeriaTime({
          time: fallbackTime,
          date: fallbackDate,
          timezone: 'Africa/Lagos',
          isDaytime: null,
          source: 'client-fallback',
          error: 'Failed to fetch Nigeria time'
        })
      } finally {
        setLoading(false)
      }
    }

    fetchNigeriaTime()
  }, [])

  // Get current Nigerian time (WAT - West Africa Time)
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

  // Determine if payout is today or tomorrow in Nigerian time
  const isToday = payoutDate.getDate() === now.getDate() && 
                 payoutDate.getMonth() === now.getMonth() && 
                 payoutDate.getFullYear() === now.getFullYear()
  
  const isTomorrow = payoutDate.getDate() === now.getDate() + 1 &&
                     payoutDate.getMonth() === now.getMonth() &&
                     payoutDate.getFullYear() === now.getFullYear()

  const formattedTime = format(payoutDate, 'HH:mm')
  const formattedDate = format(payoutDate, 'EEEE, MMMM d, yyyy')

  if (loading) {
    return (
      <div className="text-sm font-medium" style={{ color: COLORS.textDark }}>
        Loading time data...
      </div>
    )
  }

  return (
    <div className="text-sm font-medium" style={{ color: COLORS.textDark }}>
      {isToday ? (
        <span>Today at {formattedTime}</span>
      ) : isTomorrow ? (
        <span>Tomorrow at {formattedTime}</span>
      ) : (
        <span>{format(payoutDate, 'MMMM d')} at {formattedTime}</span>
      )}
      <div className="text-xs opacity-75">
        {formattedDate}
        {nigeriaTime?.error && (
          <span className="text-red-500 ml-2">({nigeriaTime.error})</span>
        )}
      </div>
      <div className="text-xs opacity-50 mt-1">
        Current Nigeria time: {nigeriaTime?.time} ({nigeriaTime?.timezone})
      </div>
    </div>
  )
}

export default function InvestmentsPage() {
  const [investments, setInvestments] = useState<Investment[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const router = useRouter()

  const loadInvestments = useCallback(async () => {
    try {
      const data = await getInvestments()
      // Process the investments data to ensure proper calculations
      const processedData = data.map(investment => {
        const now = new Date()
        const endDate = new Date(investment.end_date)
        const isCompleted = investment.status === 'completed' || isAfter(now, endDate)
        
        // Calculate proper earnings if needed
        let earnings_to_date = investment.earnings_to_date
        if (!isCompleted && investment.last_payout_date) {
          const lastPayout = new Date(investment.last_payout_date)
          const daysSinceLastPayout = differenceInDays(now, lastPayout)
          if (daysSinceLastPayout > 0) {
            earnings_to_date = Math.min(
              investment.earnings_to_date + (daysSinceLastPayout * investment.daily_income),
              investment.total_income
            )
          }
        }

        return {
          ...investment,
          earnings_to_date,
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

  const handleProcessEarnings = useCallback(async () => {
    setProcessing(true)
    try {
      const result = await processDailyEarnings()
      if (result.success) {
        if ('updatedInvestments' in result && (result.updatedInvestments.length > 0 || result.completedInvestments.length > 0)) {
          await loadInvestments()
          toast.success(
            `Processed ${result.updatedInvestments.length} updates and ${result.completedInvestments.length} completions`
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
    }, 60 * 60 * 1000) // Check every hour
    return () => clearInterval(interval)
  }, [loadInvestments, handleProcessEarnings])

  const calculateProgress = (investment: Investment) => {
    const progress = (investment.earnings_to_date / investment.total_income) * 100
    return Math.min(100, Math.max(0, progress)) // Ensure between 0-100
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
              onClick={handleProcessEarnings}
              disabled={processing}
              className="flex items-center gap-2 px-4 py-2 rounded-lg shadow-sm"
              style={{ 
                backgroundColor: processing ? COLORS.textLight : COLORS.primaryAccent,
                color: '#FFFFFF'
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <FiRefreshCw className={processing ? 'animate-spin' : ''} />
              {processing ? 'Processing...' : 'Refresh Earnings'}
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

        {/* Countdown Timer */}
        {investments.filter(i => i.status !== 'completed').length > 0 && (
          <motion.div 
            className="mb-8 p-6 rounded-xl shadow-sm"
            style={{ backgroundColor: COLORS.primaryAccent }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <div className="flex flex-col items-center text-white">
              <p className="text-sm mb-2">Next Daily Payout In</p>
              <div className="text-3xl font-mono font-bold tracking-wider mb-2">
              <InvestmentCountdown 
    nextPayoutDate={
      investments.find(i => i.status !== 'completed')?.next_payout_date ?? 
      new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // Default to 24 hours in future
    } 
  />
              </div>
              <p className="text-xs opacity-90 text-center">
                All payouts will be processed automatically at reset time
              </p>
            </div>
          </motion.div>
        )}

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
  Days remaining  <span className="font-medium" style={{ color: COLORS.primaryAccent }}>
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