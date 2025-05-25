'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FiLogOut } from 'react-icons/fi'
import { motion } from 'framer-motion'
import { signOut } from '@/lib/signOut'

export function SignOutButton() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSignOut = async () => {
    setIsLoading(true)
    try {
      const response = await signOut()
      if (response.success) {
        if (typeof window !== 'undefined') {
          localStorage.clear()
          sessionStorage.clear()
        }
        router.push(response.clientActions?.redirectTo || '/login')
      } else {
        alert(response.error || 'Sign out failed')
      }
    } catch (err) {
      console.error(err)
      alert('An error occurred during sign out')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <motion.button
        onClick={() => setIsOpen(true)}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-md text-white"
      >
        <FiLogOut className="h-5 w-5" />
        <span>Sign Out</span>
      </motion.button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full shadow-xl">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Confirm Sign Out</h2>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              Are you sure you want to log out?
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleSignOut}
                disabled={isLoading}
                className={`px-4 py-2 rounded text-white ${
                  isLoading
                    ? 'bg-red-400 cursor-not-allowed'
                    : 'bg-red-500 hover:bg-red-600'
                }`}
              >
                {isLoading ? 'Signing out...' : 'Yes, Sign Out'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
