'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signUp } from '@/app/api/auth/signup'
import { motion } from 'framer-motion'
import { FiUser, FiMail, FiPhone, FiLock, FiArrowRight, FiCheckCircle, FiGift } from 'react-icons/fi'

export default function SignupForm() {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    referredCode: '', // New field for invite code
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await signUp({
        ...form,
        referredCode: form.referredCode || undefined, // Convert empty string to undefined
      })

      if (res.error) {
        setError(res.error)
      } else {
        setSuccess(true)
        // Optionally redirect after 3 seconds
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
        className="max-w-md mx-auto mt-16 p-8 bg-white rounded-xl shadow-lg text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <FiCheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Registration Successful!</h2>
        <p className="text-gray-600 mb-6">Your account has been created successfully.</p>
       </motion.div>
    )
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto mt-16 space-y-4 p-8 bg-white rounded-xl shadow-lg"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Create Account</h2>
        <p className="text-gray-500">Join us in just a few steps</p>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            name="firstName"
            placeholder="First Name"
            value={form.firstName}
            onChange={handleChange}
            required
            className="w-full pl-10 p-3 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="relative flex-1">
          <input
            name="lastName"
            placeholder="Last Name"
            value={form.lastName}
            onChange={handleChange}
            required
            className="w-full p-3 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="relative">
        <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          name="email"
          type="email"
          placeholder="Email (optional)"
          value={form.email}
          onChange={handleChange}
          className="w-full pl-10 p-3 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="relative">
        <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          name="phone"
          type="tel"
          placeholder="Phone"
          value={form.phone}
          onChange={handleChange}
          className="w-full pl-10 p-3 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="relative">
        <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          name="password"
          type="password"
          placeholder="Password (min 6 characters)"
          value={form.password}
          onChange={handleChange}
          required
          minLength={6}
          className="w-full pl-10 p-3 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="relative">
        <FiGift className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          name="referredCode"
          placeholder="Invite Code (optional)"
          value={form.referredCode}
          onChange={handleChange}
          className="w-full pl-10 p-3 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {error && (
        <div className="text-red-600 text-sm p-2 bg-red-50 rounded text-center">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className={`w-full py-3 px-4 rounded-lg transition flex items-center justify-center ${
          loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'
        }`}
      >
        {loading ? 'Creating account...' : (
          <>
            Sign Up <FiArrowRight className="ml-2" />
          </>
        )}
      </button>

      <div className="text-center text-sm text-gray-500 mt-4">
         Click here to login?{' '}
        <button 
          type="button" 
          onClick={() => router.push('/login')}
          className="text-blue-600 ml-1 cursor-pointer hover:underline"
        >
          Login
        </button>
      </div>
    </motion.form>
  )
}