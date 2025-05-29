'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signUp } from '@/app/api/auth/signup'
import { motion } from 'framer-motion'
import { FiUser, FiMail, FiPhone, FiLock, FiArrowRight, FiCheckCircle, FiGift, FiX } from 'react-icons/fi'

export default function SignupForm() {
  const defaultInviteCode = '3c65cef37fc2';
  
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    referredCode: defaultInviteCode,
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleClearInviteCode = () => {
    setForm({ ...form, referredCode: '' });
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await signUp({
        ...form,
        referredCode: form.referredCode || undefined, 
      })

      if (res.error) {
        setError(res.error)
      } else {
        setSuccess(true)
        setTimeout(() => router.push('/login'), 3000)
      }
    } catch {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <motion.div
  className="max-w-md mx-auto mt-24 px-8 py-10 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 text-center transition-all duration-300"
  initial={{ opacity: 0, y: 30 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6, ease: 'easeOut' }}
>
  <FiCheckCircle className="w-16 h-16 text-green-500 dark:text-emerald-500 mx-auto mb-6" />
  <h2 className="text-3xl font-semibold text-gray-900 dark:text-white mb-3">
    Registration Successful
  </h2>
  <p className="text-md text-gray-600 dark:text-gray-300">
    Your account has been created successfully. You can now log in and start exploring.
  </p>
</motion.div>

    )
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto mt-16 space-y-4 p-8 bg-white dark:bg-gray-900 rounded-xl shadow-lg dark:shadow-xl dark:border dark:border-gray-800"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Create Account</h2>
        <p className="text-gray-500 dark:text-gray-400">Join Pure Health for vitality and wellness</p>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
          <input
            name="firstName"
            placeholder="First Name"
            value={form.firstName}
            onChange={handleChange}
            required
            className="w-full pl-10 p-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-emerald-500 bg-transparent text-black dark:text-white"
          />
        </div>
        <div className="relative flex-1">
          <input
            name="lastName"
            placeholder="Last Name"
            value={form.lastName}
            onChange={handleChange}
            required
            className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-emerald-500 bg-transparent text-black dark:text-white"
          />
        </div>
      </div>

      <div className="relative">
        <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
        <input
          name="email"
          type="email"
          placeholder="Email (optional)"
          value={form.email}
          onChange={handleChange}
          className="w-full pl-10 p-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-emerald-500 bg-transparent text-black dark:text-white"
        />
      </div>

      <div className="relative">
        <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
        <input
          name="phone"
          type="tel"
          placeholder="Phone"
          value={form.phone}
          onChange={handleChange}
          className="w-full pl-10 p-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-emerald-500 bg-transparent text-black dark:text-white"
        />
      </div>

      <div className="relative">
        <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
        <input
          name="password"
          type="password"
          placeholder="Password (min 6 characters)"
          value={form.password}
          onChange={handleChange}
          required
          minLength={6}
          className="w-full pl-10 p-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-emerald-500 bg-transparent text-black dark:text-white"
        />
      </div>

      <div className="relative">
        <FiGift className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
        <input
          name="referredCode"
          placeholder="Invite Code (optional)"
          value={form.referredCode}
          onChange={handleChange}
          className="w-full pl-10 pr-10 p-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-emerald-500 bg-transparent text-black dark:text-white"
        />
        {form.referredCode && (
          <button
            type="button"
            onClick={handleClearInviteCode}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
            aria-label="Clear invite code"
          >
            <FiX />
          </button>
        )}
      </div>

      {error && (
        <div className="text-red-600 dark:text-red-400 text-sm p-2 bg-red-50 dark:bg-red-900/30 rounded text-center">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className={`w-full py-3 px-4 rounded-lg transition flex items-center justify-center ${
          loading 
            ? 'bg-blue-400 dark:bg-emerald-600 cursor-not-allowed' 
            : 'bg-blue-600 hover:bg-blue-700 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white'
        }`}
      >
        {loading ? 'Creating account...' : (
          <>
            Sign Up <FiArrowRight className="ml-2" />
          </>
        )}
      </button>

      <div className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
        Already have an account?{' '}
        <button 
          type="button" 
          onClick={() => router.push('/login')}
          className="text-blue-600 dark:text-emerald-400 hover:underline ml-1"
        >
          Login
        </button>
      </div>
    </motion.form>
  )
}