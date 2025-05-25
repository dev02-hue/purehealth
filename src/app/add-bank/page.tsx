'use client'

import { useEffect, useState } from 'react'
import {
  createUserDetails,
  getUserDetails,
  updateUserDetails,
} from '@/lib/details'
import { motion } from 'framer-motion'
import { FiEdit, FiSave, FiDollarSign, FiUser, FiCreditCard, FiLoader } from 'react-icons/fi'

export default function ProfilePage() {
  const [form, setForm] = useState({
    bank_account: '',
    account_name: '',
    account_number: '',
  })

  const [details, setDetails] = useState<{
    bank_account: string
    account_name: string
    account_number: string
  } | null>(null)

  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    const fetchDetails = async () => {
      const res = await getUserDetails()
      if (res.details) {
        setDetails(res.details)
        setForm({
          bank_account: res.details.bank_account,
          account_name: res.details.account_name,
          account_number: res.details.account_number,
        })
      }
      setLoading(false)
    }

    fetchDetails()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async () => {
    setLoading(true)
    const res = details
      ? await updateUserDetails(form)
      : await createUserDetails(form)

    if (res.success) {
      setMessage('Details saved successfully!')
      setDetails(form)
      setIsEditing(false)
    } else {
      setMessage(res.error || 'Failed to save.')
    }
    setLoading(false)
  }

  if (loading && !isEditing) return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex justify-center items-center p-10"
    >
      <FiLoader className="animate-spin text-2xl text-blue-600 dark:text-blue-400" />
    </motion.div>
  )

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-md mx-auto mt-10 p-6 border rounded-xl shadow-sm bg-white
                dark:bg-gray-800 dark:border-gray-600 dark:shadow-gray-900/50"
    >
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2
                    dark:text-gray-100">
        <FiDollarSign className="text-blue-600 dark:text-blue-400" /> Bank Details
      </h2>

      {isEditing || !details ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="mb-3 relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <FiDollarSign className="text-gray-400 dark:text-gray-500" />
            </div>
            <input
              name="bank_account"
              value={form.bank_account}
              onChange={handleChange}
              placeholder="Bank Name"
              className="w-full pl-10 p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition
                        dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-blue-400 dark:text-gray-100 dark:placeholder-gray-400"
            />
          </div>

          <div className="mb-3 relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <FiUser className="text-gray-400 dark:text-gray-500" />
            </div>
            <input
              name="account_name"
              value={form.account_name}
              onChange={handleChange}
              placeholder="Account Name"
              className="w-full pl-10 p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition
                        dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-blue-400 dark:text-gray-100 dark:placeholder-gray-400"
            />
          </div>

          <div className="mb-4 relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <FiCreditCard className="text-gray-400 dark:text-gray-500" />
            </div>
            <input
              name="account_number"
              value={form.account_number}
              onChange={handleChange}
              placeholder="Account Number"
              className="w-full pl-10 p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition
                        dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-blue-400 dark:text-gray-100 dark:placeholder-gray-400"
            />
          </div>

          <motion.button
            onClick={handleSubmit}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            disabled={loading}
            className="w-full flex justify-center items-center gap-2 bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:bg-blue-400 transition
                      dark:bg-blue-700 dark:hover:bg-blue-600 dark:disabled:bg-blue-900"
          >
            {loading ? (
              <FiLoader className="animate-spin" />
            ) : (
              <>
                <FiSave /> {details ? 'Update Details' : 'Save Details'}
              </>
            )}
          </motion.button>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
            <div className="flex items-center gap-2">
              <FiDollarSign className="text-blue-600 dark:text-blue-400" />
              <p><strong>Bank:</strong> {details.bank_account}</p>
            </div>
            <div className="flex items-center gap-2">
              <FiUser className="text-blue-600 dark:text-blue-400" />
              <p><strong>Name:</strong> {details.account_name}</p>
            </div>
            <div className="flex items-center gap-2">
              <FiCreditCard className="text-blue-600 dark:text-blue-400" />
              <p><strong>Number:</strong> {details.account_number}</p>
            </div>
          </div>

          <motion.button
            onClick={() => setIsEditing(true)}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="mt-4 w-full flex justify-center items-center gap-2 bg-gray-100 text-gray-800 p-2 rounded hover:bg-gray-200 transition
                      dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600"
          >
            <FiEdit /> Edit Details
          </motion.button>
        </motion.div>
      )}

      {message && (
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 text-sm text-green-600 dark:text-green-400"
        >
          {message}
        </motion.p>
      )}
    </motion.div>
  )
}