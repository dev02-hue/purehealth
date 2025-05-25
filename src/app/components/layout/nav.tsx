'use client'

import { Dispatch, SetStateAction } from 'react'
import { FiHome, FiUsers, FiUser, FiPlusCircle, FiSettings } from 'react-icons/fi'
import Link from 'next/link'

interface NavProps {
  activeTab: string
  setActiveTab: Dispatch<SetStateAction<string>>
}

export function Nav({ activeTab, setActiveTab }: NavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 py-2 px-4">
      <div className="flex justify-around items-center max-w-md mx-auto">
        <Link
          href="/"
          onClick={() => setActiveTab('plan')}
          className={`flex flex-col items-center p-2 ${
            activeTab === 'plan' 
              ? 'text-blue-600 dark:text-blue-400' 
              : 'text-gray-500 dark:text-gray-300'
          }`}
        >
          <FiHome className="text-xl" />
          <span className="text-xs mt-1">Home</span>
        </Link>
        
        <Link
          href="/invite"
          onClick={() => setActiveTab('invite')}
          className={`flex flex-col items-center p-2 ${
            activeTab === 'invite' 
              ? 'text-blue-600 dark:text-blue-400' 
              : 'text-gray-500 dark:text-gray-300'
          }`}
        >
          <FiUsers className="text-xl" />
          <span className="text-xs mt-1">Invite</span>
        </Link>
        
        <Link
      href="/plans"
      className="flex flex-col items-center p-2 text-gray-500 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition"
    >
      <FiPlusCircle className="text-2xl text-blue-600 dark:text-blue-400" />
      <span className="text-xs mt-1">Plans</span>
    </Link>
        
        <Link
          href="/profile"
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center p-2 ${
            activeTab === 'profile' 
              ? 'text-blue-600 dark:text-blue-400' 
              : 'text-gray-500 dark:text-gray-300'
          }`}
        >
          <FiUser className="text-xl" />
          <span className="text-xs mt-1">Profile</span>
        </Link>
        
        <Link
          href="/settings"
          className={`flex flex-col items-center p-2 ${
            activeTab === 'settings' 
              ? 'text-blue-600 dark:text-blue-400' 
              : 'text-gray-500 dark:text-gray-300'
          }`}
          onClick={() => setActiveTab('settings')}
        >
          <FiSettings className="text-xl" />
          <span className="text-xs mt-1">Settings</span>
        </Link>
      </div>
    </nav>
  )
}