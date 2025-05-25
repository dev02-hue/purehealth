'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { 
   
  FaMoneyBillWave, 
   
  FaPlusCircle, 
  FaChevronRight,
  FaChartLine,
  FaWallet
} from 'react-icons/fa'
import { useRouter } from 'next/navigation'
 import ThemeToggle from './ThemeToggle'
import { SignOutButton } from '../auth/SignOutButton'

export default function SettingsPanel() {
  const router = useRouter()
  const [activeItem, setActiveItem] = useState<string | null>(null)

  const settingsItems = [
    {
      id: 'withdrawal-history',
      title: 'Withdrawal History',
      icon: <FaMoneyBillWave className="text-blue-500" />,
      isExternal: true,
      action: () => router.push('/withdrawal-history')
    },
    {
      id: 'deposit-history',
      title: 'Deposit History',
      icon: <FaChartLine className="text-green-500" />,
      isExternal: true,
      action: () => router.push('/deposit-history')
    },
    {
      id: 'income-history',
      title: 'Income History',
      icon: <FaWallet className="text-purple-500" />,
      isExternal: true,
      action: () => router.push('/income')
    },
    {
      id: 'add-bank',
      title: 'Add Bank Account',
      icon: <FaPlusCircle className="text-yellow-500" />,
      isExternal: true,
      action: () => router.push('/add-bank')
    },
    
    {
      id: 'active-investment',
      title: 'Active Investment',
      icon: <FaChartLine className="text-green-500" />,
      isExternal: true,
      action: () => router.push('/active-investment')
    },
    {
      id: 'theme',
      title: 'Appearance',
      icon: <ThemeToggle  />,
      isExternal: false,
      action: null
    },
    {
      id: 'sign-out',
      title: 'Sign Out',
      icon: <SignOutButton />,
      isExternal: false,
      action: null
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
    hidden: { x: -20, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10
      }
    },
    tap: { scale: 0.98 }
  }

  return (
    <motion.div 
      className="min-h-screen bg-gray-50 p-4 dark:bg-gray-900"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="mb-6"
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Settings</h1>
        <p className="text-gray-500 dark:text-gray-400">Manage your account preferences</p>
      </motion.div>

      <motion.div
        className="space-y-2"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {settingsItems.map((item) => (
          <motion.div
            key={item.id}
            variants={itemVariants}
            whileTap={item.isExternal ? "tap" : undefined}
          >
            <div
              className={`flex items-center justify-between p-4 rounded-lg bg-white dark:bg-gray-800 shadow-sm ${
                item.isExternal ? 'cursor-pointer' : ''
              } ${
                activeItem === item.id ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => {
                if (item.isExternal) {
                  setActiveItem(item.id)
                  item.action?.()
                }
              }}
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-full bg-gray-100 dark:bg-gray-700">
                  {item.icon}
                </div>
                <span className="font-medium text-gray-700 dark:text-gray-200">
                  {item.title}
                </span>
              </div>
              {item.isExternal && <FaChevronRight className="text-gray-400" />}
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Placeholder for additional settings */}
      <motion.div 
        className="mt-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
          More options coming soon
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {[1, 2].map((item) => (
            <motion.div
              key={item}
              className="p-4 rounded-lg bg-white dark:bg-gray-800 shadow-sm border border-dashed border-gray-300 dark:border-gray-600"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full mb-2"></div>
              <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}