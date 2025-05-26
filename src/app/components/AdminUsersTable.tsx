// components/admin/AdminUsersTable.tsx
'use client'

import { UserWithAuth } from '@/types/supabase'
import { FiEdit2, FiTrash2 } from 'react-icons/fi'
 import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'react-hot-toast' // Optional for notifications
import { deleteUserById } from '@/lib/adminUtils'

export default function AdminUsersTable({ users }: { users: UserWithAuth[] }) {
  const [currentUsers, setCurrentUsers] = useState<UserWithAuth[]>(users)
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  const handleDelete = async (userId: string) => {
    setIsDeleting(userId)
    try {
      const result = await deleteUserById(userId)
      
      if (result.success) {
        setCurrentUsers(prev => prev.filter(user => user.id !== userId))
        toast.success('User deleted successfully')
        router.refresh() // Refresh the page to get updated data
      } else if (result.error) {
        toast.error(result.error)
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      toast.error('An error occurred while deleting the user')
    } finally {
      setIsDeleting(null)
    }
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
        <thead className="bg-gray-100 dark:bg-gray-700">
          <tr>
            <th className="py-3 px-4 text-left">ID</th>
            <th className="py-3 px-4 text-left">Email</th>
            <th className="py-3 px-4 text-left">Name</th>
            <th className="py-3 px-4 text-left">Status</th>
            <th className="py-3 px-4 text-left">Last Active</th>
            <th className="py-3 px-4 text-left">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {currentUsers.map(user => (
            <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
              <td className="py-3 px-4 text-sm">{user.id.substring(0, 8)}...</td>
              <td className="py-3 px-4 text-sm">{user.auth_user?.email}</td>
              <td className="py-3 px-4 text-sm">{user.first_name} {user.last_name}</td>
              <td className="py-3 px-4 text-sm">
                <span className={`px-2 py-1 rounded-full text-xs ${
                  user.auth_user?.email_confirmed_at 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                }`}>
                  {user.auth_user?.email_confirmed_at ? 'Verified' : 'Pending'}
                </span>
              </td>
              <td className="py-3 px-4 text-sm">
                {user.auth_user?.last_sign_in_at 
                  ? new Date(user.auth_user.last_sign_in_at).toLocaleString()
                  : 'Never'}
              </td>
              <td className="py-3 px-4 text-sm">
                <div className="flex gap-2">
                  <button className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                    <FiEdit2 />
                  </button>
                  <button 
                    onClick={() => handleDelete(user.id)}
                    disabled={isDeleting === user.id}
                    className={`p-1 ${isDeleting === user.id 
                      ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed' 
                      : 'text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300'
                    }`}
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}