'use client'

import { getUsermainProfile } from '@/lib/profile/mainprofile'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { 
  FiUser,  FiDollarSign, 
  FiGift, FiLoader, FiAlertCircle,
  FiCopy, FiTrendingUp
} from 'react-icons/fi'
import { toast } from 'react-hot-toast'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  ResponsiveContainer,
  PieChart, 
  Pie,
  Cell
} from 'recharts'

export default function UserProfileDisplay() {
  interface UserProfile {
    first_name: string
    last_name: string
    email: string
    phone_number?: string
    balance?: number
    referral_code: string
    created_at: string
    investment_history?: Array<{ date: string, amount: number }>
  }

  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true)
        const profileData = await getUsermainProfile()
        setProfile({
          ...profileData,
          // Mock investment history data - replace with real data from your API
          investment_history: [
            { date: '2023-01', amount: 50000 },
            { date: '2023-02', amount: 75000 },
            { date: '2023-03', amount: 100000 },
            { date: '2023-04', amount: 125000 },
            { date: '2023-05', amount: 150000 },
          ]
        })
        setError(null)
      } catch (err: unknown) {
        console.error('Failed to fetch profile:', err)
        setError(err instanceof Error ? err.message : 'Failed to load profile')
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  const copyReferralCode = () => {
    if (profile?.referral_code) {
      navigator.clipboard.writeText(profile.referral_code)
      toast.success('Referral code copied!', {
        style: {
          background: '#B45309',
          color: '#fff',
        }
      })
    }
  }

  const formattedDate = new Date(profile?.created_at || '').toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  // Chart data
  const investmentData = profile?.investment_history || []
  const pieData = [
    { name: 'Active', value: profile?.balance || 0 },
    { name: 'Withdrawn', value: 50000 }, // Mock data
    { name: 'Earnings', value: 25000 }, // Mock data
  ]

  const COLORS = ['#B45309', '#92400E', '#D97706']

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center min-h-[300px]"
      >
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            className="mx-auto mb-4"
          >
            <FiLoader className="text-3xl text-amber-600 animate-spin" />
          </motion.div>
          <p className="text-amber-700 dark:text-amber-300">Loading your profile...</p>
        </div>
      </motion.div>
    )
  }

  if (error) {
    return (
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="max-w-md mx-auto p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-red-200 dark:border-red-900/50"
      >
        <div className="text-center">
          <FiAlertCircle className="text-4xl text-red-500 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">Error Loading Profile</h2>
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </motion.div>
    )
  }

  if (!profile) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-md mx-auto p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg"
      >
        <div className="text-center">
          <FiUser className="text-4xl text-amber-400 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">No Profile Found</h2>
          <p className="text-gray-500 dark:text-gray-300">We couldn&apos;t find any profile data for your account. Please sign out and signin again </p>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="max-w-3xl mx-auto"
    >
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-amber-600 to-amber-700 rounded-t-xl p-6 text-white ">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="text-center md:text-left mb-4 md:mb-0">
            <h1 className="text-2xl font-bold">Sheraton Investments</h1>
            <p className="text-amber-100">Premium Member Profile</p>
          </div>
          <div className="flex items-center">
            <div className="w-16 h-16 bg-amber-500/30 rounded-full flex items-center justify-center text-2xl font-bold border-2 border-amber-300">
              {profile.first_name.charAt(0)}{profile.last_name.charAt(0)}
            </div>
            <div className="ml-4">
              <p className="font-medium">
                {profile.first_name} {profile.last_name}
              </p>
              <p className="text-sm text-amber-100">{profile.email}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white dark:bg-gray-800 rounded-b-xl shadow-lg overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 mb-10">
          {/* Personal Info Column */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-5 border border-amber-100 dark:border-amber-900/30">
              <h2 className="text-lg font-semibold text-amber-800 dark:text-amber-200 mb-4 flex items-center">
                <FiUser className="mr-2" />
                Personal Information
              </h2>
              
              <ProfileItem 
                label="Full Name"
                value={`${profile.first_name} ${profile.last_name}`}
              />
              
              <ProfileItem 
                label="Email"
                value={profile.email}
              />
              
              <ProfileItem 
                label="Phone"
                value={profile.phone_number || 'Not provided'}
              />
              
              <ProfileItem 
                label="Member Since"
                value={formattedDate}
              />
            </div>

            {/* Referral Section */}
            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-5 border border-amber-100 dark:border-amber-900/30">
              <h2 className="text-lg font-semibold text-amber-800 dark:text-amber-200 mb-4 flex items-center">
                <FiGift className="mr-2" />
                Referral Program
              </h2>
              
              <div className="relative">
                <ProfileItem 
                  label="Your Referral Code"
                  value={profile.referral_code}
                />
                <button
                  onClick={copyReferralCode}
                  className="absolute right-0 top-0 p-1 text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 transition-colors"
                  title="Copy referral code"
                >
                  <FiCopy size={18} />
                </button>
              </div>
              
              <div className="mt-4 text-sm text-amber-700 dark:text-amber-300">
                <p>Earn 30% direct + 4% indirect bonuses</p>
                <p className="mt-1">Share your code with friends!</p>
              </div>
            </div>
          </div>

          {/* Financial Info Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Balance Card */}
            <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl p-5 text-white shadow-lg">
              <h2 className="text-lg font-semibold mb-1">Account Balance</h2>
              <p className="text-3xl font-bold mb-2">₦{profile.balance?.toLocaleString() || '0'}</p>
              <div className="flex items-center text-amber-100 text-sm">
                <FiTrendingUp className="mr-1" />
                <span>25% monthly returns</span>
              </div>
            </div>

            {/* Investment History Chart */}
            <div className="bg-white dark:bg-gray-800/80 rounded-xl p-5 border border-amber-100 dark:border-amber-900/30 shadow-sm">
              <h2 className="text-lg font-semibold text-amber-800 dark:text-amber-200 mb-4 flex items-center">
                <FiDollarSign className="mr-2" />
                Investment History
              </h2>
              
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={investmentData}>
                    <XAxis 
                      dataKey="date" 
                      tick={{ fill: '#92400E' }}
                      axisLine={{ stroke: '#B45309' }}
                    />
                    <YAxis 
                      tick={{ fill: '#92400E' }}
                      axisLine={{ stroke: '#B45309' }}
                    />
                    <Bar 
                      dataKey="amount" 
                      fill="#D97706"
                      radius={[4, 4, 0, 0]}
                    >
                      {investmentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Portfolio Breakdown */}
            <div className="bg-white dark:bg-gray-800/80 rounded-xl p-5 border border-amber-100 dark:border-amber-900/30 shadow-sm">
              <h2 className="text-lg font-semibold text-amber-800 dark:text-amber-200 mb-4 flex items-center">
                <FiTrendingUp className="mr-2" />
                Portfolio Breakdown
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="flex flex-col justify-center">
                  {pieData.map((item, index) => (
                    <div key={item.name} className="flex items-center mb-2">
                      <div 
                        className="w-4 h-4 rounded-full mr-2"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="text-sm text-amber-800 dark:text-amber-200">
                        {item.name}: ₦{item.value.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function ProfileItem({ label, value }: { label: string, value: string }) {
  return (
    <motion.div 
      whileHover={{ x: 5 }}
      className="mb-4 last:mb-0"
    >
      <p className="text-xs text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-1">{label}</p>
      <p className="font-medium text-gray-800 dark:text-amber-100">{value}</p>
    </motion.div>
  )
}