// components/admin/UserManagement.tsx
'use client'

import { useEffect, useState } from 'react'
 
import { motion } from 'framer-motion'
import { 
  FaUserEdit, 
  FaTrash, 
  FaKey, 
  FaSpinner, 
  FaSearch,
  FaCheck,
  FaTimes
} from 'react-icons/fa'
import { MdAdminPanelSettings } from 'react-icons/md'
import { deleteUser, getAllUsers, updateUserPassword, updateUserProfile } from '@/lib/admin/user'

export default function UserManagement() {
  interface User {
    auth: {
      id: string;
      email: string;
      created_at: string;
    };
    profile: {
      first_name: string;
      last_name: string;
      phone_number: string;
      balance: number;
      referral_code?: string;
    };
  }

  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [editingUserId, setEditingUserId] = useState('')
  const [passwordUpdates, setPasswordUpdates] = useState<Record<string, string>>({})
  interface ProfileUpdate {
    first_name?: string;
    last_name?: string;
    phone_number?: string;
    balance?: number;
  }

  const [profileUpdates, setProfileUpdates] = useState<Record<string, ProfileUpdate>>({})

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true)
      const { users, error } = await getAllUsers()
      if (error) {
        setError(error)
      } else {
        setUsers(users.filter(user => user.auth.email !== undefined) as User[])
      }
      setLoading(false)
    }
    fetchUsers()
  }, [])

  const filteredUsers = users.filter(user => 
    user.auth.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.profile.phone_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${user.profile.first_name} ${user.profile.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handlePasswordUpdate = async (userId: string) => {
    if (!passwordUpdates[userId]) {
      setError('Please enter a new password')
      return
    }

    const { success, error } = await updateUserPassword(userId, passwordUpdates[userId])
    if (success) {
      setPasswordUpdates(prev => ({ ...prev, [userId]: '' }))
      setEditingUserId('')
    } else {
      setError(error || 'Failed to update password')
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return
    
    const { success, error } = await deleteUser(userId)
    if (success) {
      setUsers(prev => prev.filter(user => user.auth.id !== userId))
    } else {
      setError(error || 'Failed to delete user')
    }
  }

  const handleProfileUpdate = async (userId: string) => {
    const updates = profileUpdates[userId]
    if (!updates) return

    const { success, error } = await updateUserProfile(userId, updates)
    if (success) {
      setProfileUpdates(prev => ({ ...prev, [userId]: {} }))
      setEditingUserId('')
      // Refresh user data
      const { users } = await getAllUsers()
      setUsers(users.filter(user => user.auth.email !== undefined) as User[])
    } else {
      setError(error || 'Failed to update profile')
    }
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <MdAdminPanelSettings className="text-blue-500" />
        User Management
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg flex items-center gap-2">
          <FaTimes />
          {error}
        </div>
      )}

      <div className="mb-6 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <FaSearch className="text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search users by name, email or phone..."
          className="pl-10 w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-32">
          <FaSpinner className="animate-spin text-blue-500 text-2xl mr-3" />
          <span>Loading users...</span>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <motion.tr 
                  key={user.auth.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">
                      {user.profile.first_name} {user.profile.last_name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {user.profile.referral_code}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.auth.email}</div>
                    <div className="text-sm text-gray-500">{user.profile.phone_number}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${user.profile.balance.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.auth.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      {editingUserId === user.auth.id ? (
                        <>
                          <button
                            onClick={() => handlePasswordUpdate(user.auth.id)}
                            className="text-green-600 hover:text-green-900 p-1"
                          >
                            <FaCheck />
                          </button>
                          <button
                            onClick={() => setEditingUserId('')}
                            className="text-red-600 hover:text-red-900 p-1"
                          >
                            <FaTimes />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => setEditingUserId(user.auth.id)}
                            className="text-blue-600 hover:text-blue-900 p-1"
                          >
                            <FaUserEdit />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.auth.id)}
                            className="text-red-600 hover:text-red-900 p-1"
                          >
                            <FaTrash />
                          </button>
                          <button
                            onClick={() => handleProfileUpdate(user.auth.id)}
                            className="text-yellow-600 hover:text-yellow-900 p-1"
                          >
                            <FaKey />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}