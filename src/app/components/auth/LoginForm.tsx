'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from '@/app/api/auth/login'
import { motion } from 'framer-motion'
import { FiMail, FiPhone, FiLock, FiArrowRight, FiCheckCircle, FiEye, FiEyeOff } from 'react-icons/fi'

export default function LoginForm() {
  const [form, setForm] = useState({
    email: '',
    phone: '',
    password: '',
    loginMethod: 'email' as 'email' | 'phone'
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const toggleLoginMethod = () => {
    setForm({
      ...form,
      email: '',
      phone: '',
      loginMethod: form.loginMethod === 'email' ? 'phone' : 'email'
    })
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
  
    try {
      console.log('Submitting form with:', form)
      
      // Prepare the data to send based on login method
      const loginData = form.loginMethod === 'email' 
        ? { email: form.email, password: form.password }
        : { phone: form.phone, password: form.password }

      const res = await signIn(loginData)
      console.log('signIn response:', res)
  
      if (res.error) {
        console.log('Login error:', res.error)
        setError(res.error)
      } else {
        // Store session in localStorage for persistence
        if (res.session) {
          localStorage.setItem('supabase.auth.token', JSON.stringify({
            currentSession: {
              access_token: res.session.access_token,
              refresh_token: res.session.refresh_token,
              expires_at: res.session.expires_at
            },
            expiresAt: res.session.expires_at
          }))
          
          // Store user data in localStorage for easy access
          if (res.user) {
            localStorage.setItem('supabase.auth.user', JSON.stringify({
              id: res.user.id,
              email: res.user.email,
              phone: res.user.phone,
              created_at: res.user.created_at
            }))
          }
        }

        console.log('Login successful, redirecting...')
        setSuccess(true)
        // Redirect to dashboard after 1.5 seconds
        setTimeout(() => router.push('/'), 1500)
      }
    } catch (err) {
      console.error('Unexpected error:', err)
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  // Check for existing session on component mount
  useEffect(() => {
    const checkSession = () => {
      const sessionStr = localStorage.getItem('supabase.auth.token')
      if (sessionStr) {
        try {
          const session = JSON.parse(sessionStr)
          if (session?.currentSession?.access_token) {
            // If session exists, redirect to dashboard
            router.push('/')
          }
        } catch (e) {
          console.error('Error parsing session:', e)
          localStorage.removeItem('supabase.auth.token')
        }
      }
    }
    checkSession()
  }, [router])

  if (success) {
    return (
      <motion.div 
        className="max-w-md mx-auto mt-16 p-8 bg-white rounded-xl shadow-lg text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <FiCheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Login Successful!</h2>
        <p className="text-gray-600 mb-6">Welcome back!</p>
        <p className="text-gray-500 text-sm">Redirecting to your dashboard...</p>
      </motion.div>
    )
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto mt-16 space-y-4 p-8 bg-white rounded-xl shadow-lg"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Welcome Back</h2>
        <p className="text-gray-500">Sign in to purehealth your account</p>
      </div>

      <div className="flex justify-center mb-4">
        <button
          type="button"
          onClick={toggleLoginMethod}
          className="text-xl text-blue-600 hover:underline"
        >
          {form.loginMethod === 'email' 
            ? 'Use phone number instead' 
            : 'Use email instead'}
        </button>
      </div>

      {form.loginMethod === 'email' ? (
        <div className="relative">
          <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            name="email"
            type="email"
            placeholder="Email address"
            value={form.email}
            onChange={handleChange}
            required
            className="w-full pl-10 p-3 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      ) : (
        
        <div className="relative">
          <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            name="phone"
            type="tel"
            placeholder="Phone number"
            value={form.phone}
            onChange={handleChange}
            required
            className="w-full pl-10 p-3 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}

      <div className="relative">
        <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          name="password"
          type={showPassword ? "text" : "password"}
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
          minLength={6}
          className="w-full pl-10 pr-10 p-3 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="button"
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? <FiEyeOff /> : <FiEye />}
        </button>
      </div>

      <div className="flex justify-between items-center">
        <button 
          type="button" 
          onClick={() => router.push('/forgot-password')}
          className="text-sm text-blue-600 hover:underline"
        >
          Forgot password?
        </button>
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
          loading 
            ? 'bg-blue-400 cursor-not-allowed' 
            : 'bg-blue-600 hover:bg-blue-700 text-white'
        }`}
      >
        {loading ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Logging in...
          </>
        ) : (
          <>
            Login <FiArrowRight className="ml-2" />
          </>
        )}
      </button>

      <div className="text-center text-sm text-gray-500 mt-4">
        Don&apos;t have an account?{' '}
        <button 
          type="button" 
          onClick={() => router.push('/signup')}
          className="text-blue-600 cursor-pointer hover:underline"
        >
          Sign up
        </button>
      </div>
    </motion.form>
  )
}