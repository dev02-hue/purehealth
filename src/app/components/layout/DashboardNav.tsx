'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useMediaQuery } from 'react-responsive'
import { getUserProfile } from '@/lib/profile/profile'
import { FiDollarSign,  FiMenu, FiX, FiSun, FiMoon } from 'react-icons/fi'
import { RiVipCrownFill } from 'react-icons/ri'

export default function DashboardNav() {
  const [userData, setUserData] = useState({
    firstName: '',
    lastName: '',
    balance: '0',
    profit: '0'
  })
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(false)

  const isSmallScreen = useMediaQuery({ maxWidth: 768 })
  const isVerySmallScreen = useMediaQuery({ maxWidth: 375 })
  const isTinyScreen = useMediaQuery({ maxWidth: 320 })

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const rawToken = localStorage.getItem('supabase.auth.token')
        if (!rawToken) {
          console.error('No token found in localStorage')
          return
        }

        const parsedToken = JSON.parse(rawToken)
        const accessToken = parsedToken?.currentSession?.access_token

        if (!accessToken) {
          console.error('Access token not found in parsed token')
          return
        }

        const profile = await getUserProfile()
        
        setUserData({
          firstName: profile.first_name || '',
          lastName: profile.last_name || '',
          balance: profile.balance?.toString() || '0',
          profit: '0'
        })

      } catch (err) {
        if (err instanceof Error) {
          console.error('Failed to fetch profile:', err.message)
        } else {
          console.error('Failed to fetch profile:', err)
        }
      }
    }

    fetchUserProfile()
    
    // Check for dark mode preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setDarkMode(true)
    }
  }, [])

  // const profitValue = parseFloat(userData.profit)
  // const isProfitPositive = profitValue >= 0

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
    hidden: { x: -20, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 10
      }
    }
  }

  const formatCompactNumber = (num: number) => {
    if (isTinyScreen) {
      if (num >= 1000000) return `₦${(num / 1000000).toFixed(1)}M`
      if (num >= 1000) return `₦${(num / 1000).toFixed(1)}K`
      return `₦${num.toFixed(0)}`
    }
    if (isVerySmallScreen) {
      return `₦${num.toFixed(num >= 1000 ? 0 : 2)}`
    }
    return `₦${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
  }

  return (
    <>
      <motion.nav 
        className={`${darkMode ? 'bg-[#121212] border-[#1E1E1E]' : 'bg-white border-[#F5F7FA]'} border-b fixed w-full z-20 `}
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <div className={`mx-auto ${isTinyScreen ? 'px-2' : 'px-4'} sm:px-6`}>
          <div className="flex justify-between h-14 items-center">
            {/* Balance Cards - Left Side */}
            <motion.div 
              className="flex items-center space-x-1 sm:space-x-2"
              variants={containerVariants}
            >
              {/* Balance Card */}
              <motion.div 
                className={`${darkMode ? 'bg-[#1E1E1E] border-[#6366F1]' : 'bg-[#F5F7FA] border-[#3B82F6]'} ${isTinyScreen ? 'px-2 py-1' : 'px-3 py-1.5'} rounded-lg border-l-4 shadow-sm`}
                variants={itemVariants}
                whileHover={{ scale: 1.03, boxShadow: darkMode ? '0 0 8px rgba(99, 102, 241, 0.5)' : '0 0 8px rgba(59, 130, 246, 0.5)' }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <div className={`${darkMode ? 'bg-[#6366F1]' : 'bg-[#3B82F6]'} p-1 rounded-full`}>
                    <FiDollarSign className="text-white" size={isTinyScreen ? 12 : 14} />
                  </div>
                  <div>
                    <p className={`${isTinyScreen ? 'text-[8px]' : 'text-xs'} ${darkMode ? 'text-[#A0AEC0]' : 'text-[#4A5568]'}`}>
                      Balance
                    </p>
                    <p className={`${isTinyScreen ? 'text-xs' : 'text-sm'} font-semibold ${darkMode ? 'text-[#E2E8F0]' : 'text-[#1A1A1A]'}`}>
                      {formatCompactNumber(parseFloat(userData.balance))}
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Profit Card
              <motion.div 
                className={`${isProfitPositive ? 
                  `${darkMode ? 'bg-[#1E1E1E] border-[#10B981]' : 'bg-[#F5F7FA] border-[#10B981]'}` : 
                  `${darkMode ? 'bg-[#1E1E1E] border-[#EF4444]' : 'bg-[#F5F7FA] border-[#EF4444]'}`} 
                  ${isTinyScreen ? 'px-2 py-1' : 'px-3 py-1.5'} rounded-lg border-l-4 shadow-sm`}
                variants={itemVariants}
                whileHover={{ 
                  scale: 1.03, 
                  boxShadow: isProfitPositive ? 
                    (darkMode ? '0 0 8px rgba(16, 185, 129, 0.5)' : '0 0 8px rgba(16, 185, 129, 0.5)') : 
                    (darkMode ? '0 0 8px rgba(239, 68, 68, 0.5)' : '0 0 8px rgba(239, 68, 68, 0.5)')
                }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <div className={`${isProfitPositive ? 
                    `${darkMode ? 'bg-[#10B981]' : 'bg-[#10B981]'}` : 
                    `${darkMode ? 'bg-[#EF4444]' : 'bg-[#EF4444]'}`} p-1 rounded-full`}>
                    {isProfitPositive ? 
                      <FiTrendingUp className="text-white" size={isTinyScreen ? 12 : 14} /> : 
                      <FiTrendingDown className="text-white" size={isTinyScreen ? 12 : 14} />}
                  </div>
                  <div>
                    <p className={`${isTinyScreen ? 'text-[8px]' : 'text-xs'} ${darkMode ? 'text-[#A0AEC0]' : 'text-[#4A5568]'}`}>
                      P/L Today
                    </p>
                    <p className={`${isTinyScreen ? 'text-xs' : 'text-sm'} font-semibold ${isProfitPositive ? 
                      `${darkMode ? 'text-[#10B981]' : 'text-[#10B981]'}` : 
                      `${darkMode ? 'text-[#EF4444]' : 'text-[#EF4444]'}`}`}>
                      {isProfitPositive ? '+' : ''}{formatCompactNumber(Math.abs(profitValue))}
                    </p>
                  </div>
                </div>
              </motion.div> */}
            </motion.div>

            {/* Logo/Brand - Right Side */}
            <motion.div 
              className="flex items-center space-x-2"
              variants={itemVariants}
            >
              {/* Mobile Menu Button */}
              {isSmallScreen && (
                <button 
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className={`${darkMode ? 'text-[#E2E8F0]' : 'text-[#1A1A1A]'} p-1 rounded-md`}
                >
                  {mobileMenuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
                </button>
              )}
              
              {/* Dark Mode Toggle - Only on larger screens */}
              {!isSmallScreen && (
                <motion.button
                  onClick={toggleDarkMode}
                  className={`p-1 rounded-full ${darkMode ? 'bg-[#1E1E1E] text-[#00F0FF]' : 'bg-[#F5F7FA] text-[#EC4899]'}`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {darkMode ? <FiSun size={16} /> : <FiMoon size={16} />}
                </motion.button>
              )}

              {/* Logo */}
              <motion.div 
                className="flex items-center"
                whileHover={{ scale: 1.05 }}
              >
                <motion.h1 
                  className={`${isTinyScreen ? 'text-lg' : 'text-xl'} font-bold ${darkMode ? 'text-[#E2E8F0]' : 'text-[#1A1A1A]'}`}
                >
                  <span className={`${darkMode ? 'text-[#6366F1]' : 'text-[#3B82F6]'}`}>SHE</span>RATON
                </motion.h1>
                
                <motion.div 
                  className={`${isTinyScreen ? 'text-[10px] px-1 py-0.5' : 'text-xs px-2 py-1'} rounded-full flex items-center ${darkMode ? 'bg-[#1E1E1E] text-[#00F0FF]' : 'bg-[#F5F7FA] text-[#EC4899]'} ml-2`}
                  whileHover={{ scale: 1.1 }}
                >
                  <RiVipCrownFill className="mr-1" /> {!isTinyScreen && 'PREMIUM'}
                </motion.div>
              </motion.div>

              {/* User Profile - Only on larger screens */}
              {!isSmallScreen && (
                <motion.div 
                  className="flex items-center space-x-2 ml-2"
                  variants={itemVariants}
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="text-right">
                    <p className={`text-xs sm:text-sm font-medium ${darkMode ? 'text-[#E2E8F0]' : 'text-[#1A1A1A]'}`}>
                      {userData.firstName} {userData.lastName.charAt(0)}.
                    </p>
                    <p className={`text-[10px] sm:text-xs ${darkMode ? 'text-[#A0AEC0]' : 'text-[#4A5568]'}`}>
                      Premium
                    </p>
                  </div>
                  
                  <motion.div 
                    className={`relative ${darkMode ? 'bg-[#6366F1]' : 'bg-[#3B82F6]'} rounded-full ${isTinyScreen ? 'h-6 w-6' : 'h-7 w-7'} flex items-center justify-center text-white font-medium`}
                    whileHover={{ rotate: 5 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {userData.firstName.charAt(0)}{userData.lastName.charAt(0)}
                    <motion.div 
                      className="absolute -top-1 -right-1 bg-[#FFD700] rounded-full p-0.5"
                      animate={{ 
                        scale: [1, 1.1, 1],
                        rotate: [0, 10, -10, 0]
                      }}
                      transition={{ 
                        repeat: Infinity, 
                        duration: 2,
                        ease: "easeInOut" 
                      }}
                    >
                      <RiVipCrownFill className="text-[#1A1A1A]" size={10} />
                    </motion.div>
                  </motion.div>
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && isSmallScreen && (
          <motion.div 
            className={`${darkMode ? 'bg-[#1E1E1E]' : 'bg-[#F5F7FA]'} fixed w-full z-10 shadow-lg mt-14`}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className={`${isTinyScreen ? 'px-2 py-2' : 'px-4 py-3'} space-y-3`}>
              {/* User Profile */}
              <motion.div 
                className={`${darkMode ? 'bg-[#121212]' : 'bg-white'} p-3 rounded-lg shadow`}
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <div className="flex items-center space-x-3">
                  <div className={`${darkMode ? 'bg-[#6366F1]' : 'bg-[#3B82F6]'} rounded-full h-10 w-10 flex items-center justify-center text-white font-medium`}>
                    {userData.firstName.charAt(0)}{userData.lastName.charAt(0)}
                  </div>
                  <div>
                    <p className={`font-medium ${darkMode ? 'text-[#E2E8F0]' : 'text-[#1A1A1A]'}`}>
                      {userData.firstName} {userData.lastName}
                    </p>
                    <p className={`text-xs ${darkMode ? 'text-[#A0AEC0]' : 'text-[#4A5568]'}`}>
                      Premium Account
                    </p>
                  </div>
                </div>
              </motion.div>
              
              {/* Dark Mode Toggle */}
              <motion.div 
                className={`${darkMode ? 'bg-[#121212]' : 'bg-white'} p-3 rounded-lg shadow`}
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <button 
                  onClick={toggleDarkMode}
                  className={`w-full flex items-center justify-between ${darkMode ? 'text-[#E2E8F0]' : 'text-[#1A1A1A]'}`}
                >
                  <span>Dark Mode</span>
                  <motion.div 
                    className={`w-10 h-5 rounded-full flex items-center px-0.5 ${darkMode ? 'bg-[#6366F1] justify-end' : 'bg-[#3B82F6] justify-start'}`}
                    layout
                  >
                    <motion.div 
                      className="w-4 h-4 bg-white rounded-full"
                      layout
                    />
                  </motion.div>
                </button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}