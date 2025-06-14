'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { 
  FaMoneyBillWave, 
  FaPlusCircle, 
  FaChevronRight,
  FaChartLine,
  FaWallet,
  FaUserCog,
  FaShieldAlt,
  FaBell,
  FaQuestionCircle,
  FaCog
} from 'react-icons/fa'
import { useRouter } from 'next/navigation'
import ThemeToggle from './ThemeToggle'
import { SignOutButton } from '../auth/SignOutButton'

type SettingsTab = 'account' | 'transactions' | 'investments' | 'preferences'

export default function SettingsPanel() {
  const router = useRouter()
  const [activeItem, setActiveItem] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<SettingsTab>('account')

  const settingsCategories = {
    account: [
      {
        id: 'profile',
        title: 'Profile Settings',
        icon: <FaUserCog className="text-blue-500" size={18} />,
        action: () => router.push('/profile')
      },
      {
        id: 'change-password',
        title: 'Change Password',
        icon: <FaShieldAlt className="text-green-500" size={18} />,
        action: () => router.push('/change-password')
      },
      {
        id: 'notifications',
        title: 'Notification Preferences',
        icon: <FaBell className="text-yellow-500" size={18} />,
        action: () => router.push('/notifications')
      }
    ],
    transactions: [
      {
        id: 'withdrawal-history',
        title: 'Withdrawal History',
        icon: <FaMoneyBillWave className="text-purple-500" size={18} />,
        action: () => router.push('/withdrawal-history')
      },
      {
        id: 'deposit-history',
        title: 'Deposit History',
        icon: <FaChartLine className="text-teal-500" size={18} />,
        action: () => router.push('/deposit-history')
      },
      {
        id: 'income-history',
        title: 'Income History',
        icon: <FaWallet className="text-blue-400" size={18} />,
        action: () => router.push('/income')
      }
    ],
    investments: [
      {
        id: 'active-investment',
        title: 'Active Investments',
        icon: <FaChartLine className="text-green-600" size={18} />,
        action: () => router.push('/active-investment')
      },
      {
        id: 'add-bank',
        title: 'Bank Accounts',
        icon: <FaPlusCircle className="text-orange-500" size={18} />,
        action: () => router.push('/add-bank')
      }
    ],
    preferences: [
      {
        id: 'theme',
        title: 'Appearance',
        icon: <ThemeToggle />,
        action: null
      },
      {
        id: 'help',
        title: 'Help Center',
        icon: <FaQuestionCircle className="text-gray-500" size={18} />,
        action: () => router.push('/contact')
      },
      {
        id: 'sign-out',
        title: 'Sign Out',
        icon: <SignOutButton />,
        action: null
      }
    ]
  }

  const tabItems = [
    {
      id: 'account',
      title: 'Account',
      icon: <FaUserCog size={16} />
    },
    {
      id: 'transactions',
      title: 'Transactions',
      icon: <FaMoneyBillWave size={16} />
    },
    {
      id: 'investments',
      title: 'Investments',
      icon: <FaChartLine size={16} />
    },
    {
      id: 'preferences',
      title: 'Preferences',
      icon: <FaCog size={16} />
    }
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        when: "beforeChildren"
      }
    }
  }

  const itemVariants = {
    hidden: { y: 10, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10
      }
    },
    tap: { scale: 0.98 },
    hover: { 
      x: 5,
      transition: { type: "spring", stiffness: 300 }
    }
  }

  const tabVariants = {
    active: {
      backgroundColor: "#3B82F6",
      color: "#FFFFFF",
      transition: { duration: 0.2 }
    },
    inactive: {
      backgroundColor: "transparent",
      color: "#6B7280",
      transition: { duration: 0.2 }
    }
  }

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-b from-gray-50 to-blue-50 p-2 sm:p-4 dark:from-gray-900 dark:to-gray-800"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <motion.div
          className="mb-6 sm:mb-8"
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white">
                Settings
              </h1>
              <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">
                Manage your Sheraton account
              </p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-r from-blue-600 to-blue-400 flex items-center justify-center text-white font-bold">
              S
            </div>
          </div>
        </motion.div>

        {/* Tab Navigation */}
        <div className="mb-4 sm:mb-6 overflow-x-auto">
          <div className="w-max min-w-full sm:w-full">
            <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
              {tabItems.map((tab) => (
                <motion.button
                  key={tab.id}
                  className={`flex items-center justify-center px-3 py-1 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium rounded-md whitespace-nowrap ${
                    activeTab === tab.id ? 'text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                  onClick={() => setActiveTab(tab.id as SettingsTab)}
                  variants={tabVariants}
                  animate={activeTab === tab.id ? "active" : "inactive"}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="mr-1 sm:mr-2">{tab.icon}</span>
                  {tab.title}
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        {/* Settings Content */}
        <motion.div
          className="space-y-4 sm:space-y-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          key={activeTab}
        >
          <h2 className="text-lg sm:text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2 sm:mb-3 px-2">
            {tabItems.find(tab => tab.id === activeTab)?.title} Settings
          </h2>
          
          <div className="space-y-2">
            {settingsCategories[activeTab].map((item) => (
              <motion.div
                key={item.id}
                variants={itemVariants}
                whileHover={item.action ? "hover" : undefined}
                whileTap={item.action ? "tap" : undefined}
              >
                <div
                  className={`flex items-center justify-between p-3 sm:p-4 rounded-lg sm:rounded-xl ${
                    item.action 
                      ? 'bg-white dark:bg-gray-800 shadow-xs sm:shadow-sm hover:shadow-sm sm:hover:shadow-md cursor-pointer transition-all' 
                      : 'bg-gray-100 dark:bg-gray-800/50'
                  } ${
                    activeItem === item.id ? 'ring-1 sm:ring-2 ring-blue-500/50' : ''
                  }`}
                  onClick={() => {
                    if (item.action) {
                      setActiveItem(item.id)
                      item.action()
                    }
                  }}
                >
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    <div className={`p-2 sm:p-3 rounded-md sm:rounded-lg ${
                      item.action 
                        ? 'bg-blue-50 dark:bg-gray-700' 
                        : 'bg-gray-200 dark:bg-gray-700'
                    }`}>
                      {item.icon}
                    </div>
                    <span className="text-sm sm:text-base font-medium text-gray-700 dark:text-gray-200">
                      {item.title}
                    </span>
                  </div>
                  {item.action && (
                    <FaChevronRight className="text-gray-400 text-xs sm:text-sm" />
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div 
          className="mt-8 sm:mt-12 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-1 sm:mb-2">
            Sheraton Investment Platform
          </div>
          <div className="text-2xs sm:text-xs text-gray-400 dark:text-gray-500">
            Version 2.4.1 • Last updated June 2023
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}