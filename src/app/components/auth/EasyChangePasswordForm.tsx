'use client'

import { useState } from 'react'
import { easyChangePassword } from '@/lib/auth'
import toast from 'react-hot-toast'

export function EasyChangePasswordForm() {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      const result = await easyChangePassword({
        newPassword,
        confirmPassword,
      })

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Password changed successfully!')
        setNewPassword('')
        setConfirmPassword('')
      }
    } catch  {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md
                  dark:bg-gray-800 dark:border dark:border-gray-600 dark:shadow-gray-900/50">
      <h2 className="text-2xl font-bold mb-6 text-center
                    dark:text-gray-100">
        Change Your Password
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700
                          dark:text-gray-300">
            New Password
            <span className="text-xs text-gray-500 ml-1
                            dark:text-gray-400">(min 6 characters)</span>
          </label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500
                      dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:focus:ring-blue-400 dark:focus:border-blue-400 dark:placeholder-gray-400"
            disabled={isLoading}
            placeholder="Enter new password"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700
                          dark:text-gray-300">
            Confirm New Password
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500
                      dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:focus:ring-blue-400 dark:focus:border-blue-400 dark:placeholder-gray-400"
            disabled={isLoading}
            placeholder="Confirm new password"
          />
        </div>

        <div className="text-xs text-gray-500 dark:text-gray-400">
          <p>Tip: Use something easy to remember but hard for others to guess.</p>
        </div>

        <div>
          <button
            type="submit"
            disabled={isLoading || !newPassword || !confirmPassword}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed
                      dark:bg-blue-600 dark:hover:bg-blue-500 dark:focus:ring-blue-400 dark:focus:ring-offset-gray-800"
          >
            {isLoading ? 'Updating...' : 'Change Password'}
          </button>
        </div>
      </form>
    </div>
  )
}