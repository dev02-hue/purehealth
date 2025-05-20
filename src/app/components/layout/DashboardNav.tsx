'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useMediaQuery } from 'react-responsive'
import { getUserProfile } from '@/lib/profile/profile'
 
export default function DashboardNav() {
  const [userData, setUserData] = useState({
    firstName: '',
    lastName: '',
    balance: '0',
    profit: '0'
  })

  const isSmallScreen = useMediaQuery({ maxWidth: 640 })
  const isVerySmallScreen = useMediaQuery({ maxWidth: 375 })

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        // Get token from localStorage
        const rawToken = localStorage.getItem('supabase.auth.token')
        if (!rawToken) {
          console.error('No token found in localStorage')
          return
        }

        // Parse token and extract access_token
        const parsedToken = JSON.parse(rawToken)
        const accessToken = parsedToken?.currentSession?.access_token

        if (!accessToken) {
          console.error('Access token not found in parsed token')
          return
        }

        // Use the imported utility function
        const profile = await getUserProfile()
        
        setUserData({
          firstName: profile.first_name || '',
          lastName: profile.last_name || '',
          balance: profile.balance?.toString() || '0',
          profit: '0' // Default profit if not available
        })

      } catch (err) {
        if (err instanceof Error) {
          console.error('Failed to fetch profile:', err.message)
        } else {
          console.error('Failed to fetch profile:', err)
        }
        // You might want to set some error state here
      }
    }

    fetchUserProfile()
  }, [])
  const profitValue = parseFloat(userData.profit)
  const isProfitPositive = profitValue >= 0

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { y: -20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.3
      }
    }
  }

  const formatCompactNumber = (num: number) => {
    if (isVerySmallScreen) {
      if (num >= 1000000) return `₦${(num / 1000000).toFixed(1)}M`
      if (num >= 1000) return `₦${(num / 1000).toFixed(1)}K`
      return `₦${num.toFixed(2)}`
    }
    return `₦${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  return (
    <motion.nav 
      className="bg-white border-b border-gray-200"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="mx-auto px-2 sm:px-4">
        <div className="flex justify-between h-12 sm:h-14 items-center">
          {/* Logo/Brand */}
          <motion.div className="flex-shrink-0 flex items-center" variants={itemVariants}>
            <h1 className={`${isVerySmallScreen ? 'text-sm' : 'text-md'} font-semibold text-gray-900 whitespace-nowrap`}>
              PURE HEALTH
            </h1>
          </motion.div>

          {/* User Profile Section */}
          <motion.div 
            className="flex items-center space-x-1 sm:space-x-2"
            variants={containerVariants}
          >
            {/* Balance Card */}
            <motion.div 
              className="bg-blue-50 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded border border-blue-100"
              variants={itemVariants}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center space-x-1">
                <div className="bg-blue-100 p-0.5 rounded">
                  <svg
                    className={`${isVerySmallScreen ? 'w-2.5 h-2.5' : 'w-3 h-3'} text-blue-600`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="flex flex-col">
                  <p className={`${isVerySmallScreen ? 'text-[8px]' : 'text-[10px]'} text-gray-500 font-medium leading-none`}>
                    Balance
                  </p>
                  <p className={`${isVerySmallScreen ? 'text-[10px]' : 'text-xs'} font-semibold text-gray-900 whitespace-nowrap leading-none`}>
                    {formatCompactNumber(parseFloat(userData.balance))}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Profit Card */}
            <motion.div 
              className={`${isProfitPositive ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'} px-1.5 py-0.5 sm:px-2 sm:py-1 rounded border`}
              variants={itemVariants}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center space-x-1">
                <div className={`${isProfitPositive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'} p-0.5 rounded`}>
                  <svg
                    className={`${isVerySmallScreen ? 'w-2.5 h-2.5' : 'w-3 h-3'}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d={isProfitPositive ? 
                        "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" : 
                        "M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"}
                    />
                  </svg>
                </div>
                <div className="flex flex-col">
                  <p className={`${isVerySmallScreen ? 'text-[8px]' : 'text-[10px]'} text-gray-500 font-medium leading-none`}>
                    P/L
                  </p>
                  <p className={`${isVerySmallScreen ? 'text-[10px]' : 'text-xs'} font-semibold whitespace-nowrap leading-none ${isProfitPositive ? 'text-green-700' : 'text-red-700'}`}>
                    {isProfitPositive ? '+' : ''}{formatCompactNumber(Math.abs(profitValue))}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* User Profile */}
            <motion.div 
              className="flex items-center"
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
            >
              {!isSmallScreen && (
                <div className="text-right mr-1 hidden sm:block">
                  <p className={`${isVerySmallScreen ? 'text-[10px]' : 'text-xs'} font-medium text-gray-900 whitespace-nowrap`}>
                    {userData.firstName} {userData.lastName.charAt(0)}.
                  </p>
                  <p className={`${isVerySmallScreen ? 'text-[8px]' : 'text-[10px]'} text-gray-500`}>
                    Premium
                  </p>
                </div>
              )}
              
              <div className="relative">
                <div className={`bg-gray-800 rounded-full ${isVerySmallScreen ? 'h-5 w-5 text-xs' : 'h-6 w-6 text-sm'} flex items-center justify-center text-white font-medium`}>
                  {userData.firstName.charAt(0)}{userData.lastName.charAt(0)}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.nav>
  )
}