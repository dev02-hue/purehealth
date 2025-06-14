'use client'

import { Dispatch, SetStateAction } from 'react'
import { motion } from 'framer-motion'
import { FiHome, FiUsers, FiUser, FiPlusCircle, FiSettings } from 'react-icons/fi'
import Link from 'next/link'

interface NavProps {
  activeTab: string
  setActiveTab: Dispatch<SetStateAction<string>>
}

export function Nav({ activeTab, setActiveTab }: NavProps) {
  return (
    <motion.nav 
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white dark:bg-[#1E1E1E] rounded-full shadow-xl border border-gray-200 dark:border-gray-700 px-6 py-3 max-w-md mx-auto z-50"
      style={{
        boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.2)'
      }}
    >
      <div className="flex justify-between items-center gap-6">
        {[
          { icon: <FiHome />, tab: '/', label: 'Home' },
          { icon: <FiUsers />, tab: 'invite', label: 'Friends' },
          { icon: <FiPlusCircle />, tab: 'plans', label: 'New' },
          { icon: <FiUser />, tab: 'profile', label: 'Me' },
          { icon: <FiSettings />, tab: 'settings', label: 'Settings' }
        ].map((item) => (
          <Link
            key={item.tab}
            href={`/${item.tab === 'plans' ? 'plans' : item.tab}`}
            onClick={() => setActiveTab(item.tab)}
            className="relative flex flex-col items-center"
          >
            {activeTab === item.tab && (
              <motion.span 
                layoutId="nav-active"
                className="absolute -top-3 w-1 h-1 rounded-full bg-[#EC4899] dark:bg-[#00F0FF]"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 500 }}
              />
            )}
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className={`text-xl p-2 rounded-full ${
                activeTab === item.tab
                  ? 'text-[#3B82F6] dark:text-[#6366F1]'
                  : 'text-[#4A5568] dark:text-[#A0AEC0]'
              } ${
                activeTab === item.tab 
                  ? 'bg-[#F5F7FA] dark:bg-[#121212]' 
                  : ''
              }`}
            >
              {item.icon}
            </motion.div>
            <span 
              className={`text-xs ${
                activeTab === item.tab
                  ? 'text-[#1A1A1A] dark:text-[#E2E8F0] font-medium'
                  : 'text-[#4A5568] dark:text-[#A0AEC0]'
              }`}
            >
              {item.label}
            </span>
          </Link>
        ))}
      </div>
    </motion.nav>
  )
}