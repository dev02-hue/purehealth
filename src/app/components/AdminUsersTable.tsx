'use client'

import { UserWithAuth } from '@/types/supabase'
import { FiEdit2, FiTrash2, FiSave, FiX, FiSearch } from 'react-icons/fi'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { deleteUserById } from '@/lib/adminUtils'
import { updateUserBalance } from '@/lib/adminUtils'
import { motion, AnimatePresence } from 'framer-motion'
import { checkAdminAndFetchUsers } from '@/lib/adminUtils'

export default function AdminUsersTable({ initialUsers }: { initialUsers: UserWithAuth[] }) {
  const [users, setUsers] = useState<UserWithAuth[]>(initialUsers)
  const [filteredUsers, setFilteredUsers] = useState<UserWithAuth[]>(initialUsers)
  const [searchTerm, setSearchTerm] = useState('')
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [editingUserId, setEditingUserId] = useState<string | null>(null)
  const [editedBalance, setEditedBalance] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(false)

  // Handle search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchTerm.trim() !== '') {
        setIsLoading(true)
        try {
          const result = await checkAdminAndFetchUsers(searchTerm)
          
          if ('isAdmin' in result && result.isAdmin && 'users' in result) {
            setFilteredUsers(result.users)
          } else if ('error' in result) {
            toast.error(result.error)
          }
        } catch (error) {
          console.error('Error searching users:', error)
          toast.error('Failed to search users')
        } finally {
          setIsLoading(false)
        }
      } else {
        setFilteredUsers(users)
      }
    }, 500)
  
    return () => clearTimeout(timer)
  }, [searchTerm, users])

  const handleDelete = async (userId: string) => {
    setIsDeleting(userId)
    try {
      const result = await deleteUserById(userId)
      
      if (result.success) {
        setUsers(prev => prev.filter(user => user.id !== userId))
        setFilteredUsers(prev => prev.filter(user => user.id !== userId))
        toast.success('User deleted successfully')
        router.refresh()
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

  const startEditing = (userId: string, currentBalance: number) => {
    setEditingUserId(userId)
    setEditedBalance(currentBalance)
  }

  const cancelEditing = () => {
    setEditingUserId(null)
    setEditedBalance(0)
  }

  const handleBalanceUpdate = async (userId: string) => {
    try {
      const result = await updateUserBalance(userId, editedBalance)
      
      if (result.success) {
        setUsers(prev => prev.map(user => 
          user.id === userId ? { ...user, balance: result.updatedBalance || 0 } : user
        ))
        setFilteredUsers(prev => prev.map(user => 
          user.id === userId ? { ...user, balance: result.updatedBalance || 0 } : user
        ))
        toast.success('Balance updated successfully')
        setEditingUserId(null)
        router.refresh()
      } else if (result.error) {
        toast.error(result.error)
      }
    } catch (error) {
      console.error('Error updating balance:', error)
      toast.error('An error occurred while updating the balance')
    }
  }

  // Animation variants
  const rowVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, x: -50 }
  }

  return (
    <div className="w-full max-w-[100vw] px-1">
      {/* Search Bar */}
      <div className="mb-4 relative max-w-md mx-auto">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {isLoading && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-500"></div>
            </div>
          )}
        </div>
      </div>

      {/* Responsive Table Container */}
      <div className="overflow-x-auto overflow-y-hidden rounded-lg border dark:border-gray-700 shadow-sm">
        <div className="min-w-[320px]"> {/* Changed from 600px to 320px */}
          <table className="w-full bg-white dark:bg-gray-800">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="py-2 px-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider xs:table-cell hidden">ID</th>
                <th className="py-2 px-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
                <th className="py-2 px-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th> {/* Removed sm:hidden */}
                <th className="py-2 px-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Balance</th>
                <th className="py-2 px-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider xs:table-cell hidden">Status</th>
                <th className="py-2 px-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider md:table-cell hidden">Last Active</th>
                <th className="py-2 px-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              <AnimatePresence>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map(user => (
                    <motion.tr
                      key={user.id}
                      variants={rowVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    >
                      <td className="py-2 px-2 text-sm text-gray-900 dark:text-gray-100 whitespace-nowrap xs:table-cell hidden">
                        <span className="font-mono">{user.id.substring(0, 6)}...</span>
                      </td>
                      <td className="py-2 px-2 text-sm text-gray-900 dark:text-gray-100 whitespace-nowrap overflow-hidden text-ellipsis max-w-[80px] sm:max-w-[120px]">
                        {user.auth_user?.email}
                      </td>
                      <td className="py-2 px-2 text-sm text-gray-900 dark:text-gray-100 whitespace-nowrap overflow-hidden text-ellipsis max-w-[80px]">
                        {user.first_name} {user.last_name}
                      </td>
                      <td className="py-2 px-2 text-sm text-gray-900 dark:text-gray-100 whitespace-nowrap">
                        {editingUserId === user.id ? (
                          <input
                            type="number"
                            value={editedBalance}
                            onChange={(e) => setEditedBalance(Number(e.target.value))}
                            className="w-16 px-1 py-1 text-sm border rounded dark:bg-gray-700 dark:border-gray-600"
                          />
                        ) : (
                          <span className="font-medium">
                            ${user.balance?.toLocaleString()}
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-2 text-sm xs:table-cell hidden">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${
                          user.auth_user?.email_confirmed_at 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        }`}>
                          {user.auth_user?.email_confirmed_at ? 'Verified' : 'Pending'}
                        </span>
                      </td>
                      <td className="py-2 px-2 text-sm text-gray-900 dark:text-gray-100 md:table-cell hidden">
                        {user.auth_user?.last_sign_in_at 
                          ? new Date(user.auth_user.last_sign_in_at).toLocaleDateString()
                          : 'Never'}
                      </td>
                      <td className="py-2 px-2 text-sm text-gray-900 dark:text-gray-100 whitespace-nowrap">
                        <div className="flex gap-1 items-center">
                          {editingUserId === user.id ? (
                            <>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleBalanceUpdate(user.id)}
                                className="p-1 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                                title="Save"
                              >
                                <FiSave size={16} />
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={cancelEditing}
                                className="p-1 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300"
                                title="Cancel"
                              >
                                <FiX size={16} />
                              </motion.button>
                            </>
                          ) : (
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => startEditing(user.id, user.balance || 0)}
                              className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                              title="Edit"
                            >
                              <FiEdit2 size={16} />
                            </motion.button>
                          )}
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleDelete(user.id)}
                            disabled={isDeleting === user.id}
                            className={`p-1 ${isDeleting === user.id 
                              ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed' 
                              : 'text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300'
                            }`}
                            title="Delete"
                          >
                            {isDeleting === user.id ? (
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-600"></div>
                            ) : (
                              <FiTrash2 size={16} />
                            )}
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <motion.tr
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    <td colSpan={7} className="py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                      {isLoading ? 'Searching...' : 'No users found'}
                    </td>
                  </motion.tr>
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}