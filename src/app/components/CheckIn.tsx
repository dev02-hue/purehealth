'use client'

import { useState, useEffect } from 'react'
import { checkIn } from '@/lib/checkin'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FaCheckCircle, 
  FaClock, 
  FaCalendarAlt,
  FaSpinner,
  FaTimesCircle,
  FaMoneyBillWave
} from 'react-icons/fa'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

// Mock data for the chart (replace with your actual data)
const checkInData = [
  { day: 'Mon', amount: 100 },
  { day: 'Tue', amount: 100 },
  { day: 'Wed', amount: 100 },
  { day: 'Thu', amount: 100 },
  { day: 'Fri', amount: 100 },
  { day: 'Sat', amount: 150 },
  { day: 'Sun', amount: 200 },
]

export default function CheckIn() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [nigeriaTime, setNigeriaTime] = useState('')
  const router = useRouter()

  const fetchNigeriaTime = async () => {
    try {
      const response = await fetch('/api/nigeria-time')
      const data = await response.json()
      setNigeriaTime(data.time)
    } catch (err) {
      console.error('Failed to fetch Nigeria time:', err)
      setNigeriaTime('Could not fetch time (using local time)')
    }
  }

  useEffect(() => {
    fetchNigeriaTime()
    const interval = setInterval(fetchNigeriaTime, 60000)
    return () => clearInterval(interval)
  }, [])

  const handleCheckIn = async () => {
    setLoading(true)
    setMessage('')
    setError('')
    
    try {
      const result = await checkIn()
      if (result.success) {
        setMessage(result.message || 'Check-in successful!')
        if (result.newBalance !== undefined) {
          router.refresh()
        }
      } else {
        setError(result.error || 'Check-in failed')
      }
    } catch (err) {
      setError('An unexpected error occurred')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div 
      className="bg-[#FFFFFF] p-6 rounded-xl shadow-sm border border-[#F5F7FA] max-w-2xl mx-auto mb-28"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1">
          <motion.h2 
            className="text-2xl font-bold mb-6 text-[#1A1A1A] flex items-center gap-3"
            initial={{ x: -10 }}
            animate={{ x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <FaCalendarAlt className="text-[#3B82F6]" />
            Daily Check-In
          </motion.h2>
          
          <motion.div 
            className="mb-6 p-4 bg-[#F5F7FA] rounded-lg"
            whileHover={{ scale: 1.01 }}
          >
            <p className="text-sm text-[#4A5568] mb-1 flex items-center gap-2">
              <FaClock className="text-[#3B82F6]" />
              Current Nigeria Time:
            </p>
            <p className="font-mono text-[#1A1A1A] text-lg">{nigeriaTime || 'Loading...'}</p>
          </motion.div>
          
          <motion.button
            onClick={handleCheckIn}
            disabled={loading}
            className={`w-full px-6 py-3 rounded-lg font-medium flex items-center justify-center gap-2 ${
              loading ? 'bg-[#4A5568]' : 'bg-[#3B82F6] hover:bg-[#2563EB]'
            } text-white shadow-md transition-colors`}
            whileTap={{ scale: 0.98 }}
            whileHover={!loading ? { scale: 1.02 } : {}}
          >
            {loading ? (
              <>
                <FaSpinner className="animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <FaCheckCircle />
                Check In Now
              </>
            )}
          </motion.button>
          
          <AnimatePresence>
            {message && (
              <motion.div 
                className="mt-4 p-3 bg-[#10B981]/10 text-[#10B981] rounded-lg flex items-start gap-2 border border-[#10B981]/20"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <FaCheckCircle className="mt-0.5" />
                <span>{message}</span>
              </motion.div>
            )}
            
            {error && (
              <motion.div 
                className="mt-4 p-3 bg-[#EF4444]/10 text-[#EF4444] rounded-lg flex items-start gap-2 border border-[#EF4444]/20"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <FaTimesCircle className="mt-0.5" />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>
          
          <div className="mt-6 space-y-2 text-sm text-[#4A5568]">
            <p className="flex items-center gap-2">
              <FaMoneyBillWave className="text-[#3B82F6]" />
              Earn ₦100 daily for checking in
            </p>
            <p className="flex items-center gap-2">
              <FaClock className="text-[#3B82F6]" />
              Only one check-in allowed per day (00:00 - 23:59 Nigeria time)
            </p>
            <p className="flex items-center gap-2">
              <FaCheckCircle className="text-[#3B82F6]" />
              You must have made at least one deposit to be eligible
            </p>
          </div>
        </div>
        
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-4 text-[#1A1A1A]">Weekly Check-In Rewards</h3>
          <div className="h-64 bg-[#F5F7FA] p-4 rounded-lg">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={checkInData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis 
                  dataKey="day" 
                  tick={{ fill: '#4A5568' }} 
                  axisLine={{ stroke: '#CBD5E0' }} 
                />
                <YAxis 
                  tick={{ fill: '#4A5568' }} 
                  axisLine={{ stroke: '#CBD5E0' }} 
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#E2E8F0',
                    borderRadius: '0.5rem',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                />
                <Bar 
                  dataKey="amount" 
                  fill="#3B82F6" 
                  radius={[4, 4, 0, 0]}
                  animationDuration={1500}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-2 text-sm text-[#4A5568] text-center">
            Weekend check-ins earn bonus rewards!
          </p>
        </div>
      </div>
    </motion.div>
  )
}