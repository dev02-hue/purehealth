'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from '@/app/api/auth/login'
import { motion } from 'framer-motion'
import { FiMail, FiPhone, FiLock, FiArrowRight, FiEye, FiEyeOff } from 'react-icons/fi'
import { Suspense } from 'react'

function LoginFormContent() {
  const [form, setForm] = useState({
    email: '',
    phone: '',
    password: '',
    loginMethod: 'phone' as 'email' | 'phone'
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
      const loginData = form.loginMethod === 'email' 
        ? { email: form.email, password: form.password }
        : { phone: form.phone, password: form.password }

      const res = await signIn(loginData)
  
      if (res.error) {
        setError(res.error)
      } else {
        if (res.session) {
          localStorage.setItem('supabase.auth.token', JSON.stringify({
            currentSession: {
              access_token: res.session.access_token,
              refresh_token: res.session.refresh_token,
              expires_at: res.session.expires_at
            },
            expiresAt: res.session.expires_at
          }))
          
          if (res.user) {
            localStorage.setItem('supabase.auth.user', JSON.stringify({
              id: res.user.id,
              email: res.user.email,
              phone: res.user.phone,
              created_at: res.user.created_at
            }))
          }
        }

        setSuccess(true)
        setTimeout(() => router.push('/'), 1500)
      }
    } catch (err) {
                console.log(err)
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const checkSession = () => {
      const sessionStr = localStorage.getItem('supabase.auth.token')
      if (sessionStr) {
        try {
          const session = JSON.parse(sessionStr)
          if (session?.currentSession?.access_token) {
            router.push('/')
          }
        } catch (e) {
          console.log(e)
          localStorage.removeItem('supabase.auth.token')
        }
      }
    }
    checkSession()
  }, [router])

  if (success) {
    return (
      <motion.div 
        className="max-w-md mx-auto mt-24 px-8 py-12 bg-surface dark:bg-surface rounded-2xl shadow-lg border border-border dark:border-border text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="mb-6">
          <svg width="60" height="60" viewBox="0 0 24 24" className="mx-auto text-primary dark:text-primary">
            <path fill="currentColor" d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10s10-4.5 10-10S17.5 2 12 2m-2 15l-5-5l1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9Z"/>
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-heading dark:text-heading mb-4">
          Welcome Back to Sheraton
        </h2>
        <p className="text-text-muted dark:text-text-muted mb-6">
          You&apos;ve successfully logged in. Redirecting to your account...
        </p>
        <div className="animate-pulse text-text-muted dark:text-text-muted text-sm">
          One moment please...
        </div>
      </motion.div>
    )
  }

  return (
    <div className="min-h-screen bg-background dark:bg-background flex items-center justify-center p-4">
      <motion.form
        onSubmit={handleSubmit}
        className="w-full max-w-lg bg-surface dark:bg-surface rounded-2xl shadow-xl overflow-hidden border border-border dark:border-border"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="bg-primary dark:bg-primary p-6 text-center">
          <h1 className="text-2xl font-bold text-button-text dark:text-button-text">
            Sheraton Member Login
          </h1>
          <p className="text-button-text/80 dark:text-button-text/80 mt-1">
            Access your exclusive benefits
          </p>
        </div>

        <div className="p-8 space-y-5">
          <div className="flex justify-center">
            <button
              type="button"
              onClick={toggleLoginMethod}
              className="text-sm text-secondary hover:text-secondary-hover dark:text-secondary dark:hover:text-secondary-hover flex items-center"
            >
              {form.loginMethod === 'email' ? (
                <>
                  <FiPhone className="mr-2" /> Use phone number instead
                </>
              ) : (
                <>
                  <FiMail className="mr-2" /> Use email instead
                </>
              )}
            </button>
          </div>

          {form.loginMethod === 'phone' ? (
            <div className="space-y-1">
              <label className="block text-sm font-medium text-text dark:text-text">
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiPhone className="h-5 w-5 text-text-muted dark:text-text-muted" />
                </div>
                <input
                  name="phone"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={form.phone}
                  onChange={handleChange}
                  required
                  className="block w-full pl-10 pr-3 py-2 border border-border dark:border-border rounded-lg bg-transparent text-text dark:text-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              <label className="block text-sm font-medium text-text dark:text-text">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMail className="h-5 w-5 text-text-muted dark:text-text-muted" />
                </div>
                <input
                  name="email"
                  type="email"
                  placeholder="your@email.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="block w-full pl-10 pr-3 py-2 border border-border dark:border-border rounded-lg bg-transparent text-text dark:text-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="block text-sm font-medium text-text dark:text-text">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiLock className="h-5 w-5 text-text-muted dark:text-text-muted" />
              </div>
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                required
                minLength={6}
                className="block w-full pl-10 pr-10 py-2 border border-border dark:border-border rounded-lg bg-transparent text-text dark:text-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primary focus:border-transparent"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <FiEyeOff className="h-5 w-5 text-text-muted dark:text-text-muted hover:text-text dark:hover:text-text" />
                ) : (
                  <FiEye className="h-5 w-5 text-text-muted dark:text-text-muted hover:text-text dark:hover:text-text" />
                )}
              </button>
            </div>
          </div>

          <div className="flex justify-end">
            <button 
              type="button" 
              onClick={() => router.push('/forgot-password')}
              className="text-sm text-secondary hover:text-secondary-hover dark:text-secondary dark:hover:text-secondary-hover"
            >
              Forgot password?
            </button>
          </div>

          {error && (
            <div className="p-3 text-sm text-white bg-secondary dark:bg-secondary rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-4 border-white border-1 cursor-pointer rounded-lg font-medium transition flex items-center justify-center ${
              loading 
                ? 'bg-primary/80 dark:bg-primary/80 cursor-not-allowed' 
                : 'bg-primary hover:bg-primary-hover dark:bg-primary dark:hover:bg-primary-hover text-button-text dark:text-button-text'
            }`}
          >
            {loading ? (
              <span className="inline-flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing in...
              </span>
            ) : (
              <>
                Access Your Account <FiArrowRight className="ml-2" />
              </>
            )}
          </button>

          <div className="text-center text-sm text-text-muted dark:text-text-muted pt-2">
            Not a member yet?{' '}
            <button 
              type="button" 
              onClick={() => router.push('/signup')}
              className="font-medium text-secondary hover:text-secondary-hover dark:text-secondary dark:hover:text-secondary-hover"
            >
              Join Sheraton
            </button>
          </div>
        </div>
      </motion.form>
    </div>
  )
}

export default function LoginForm() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background dark:bg-background flex items-center justify-center">
        <div className="animate-pulse text-text dark:text-text">Loading Sheraton...</div>
      </div>
    }>
      <LoginFormContent />
    </Suspense>
  )
}