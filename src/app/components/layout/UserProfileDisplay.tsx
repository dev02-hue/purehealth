'use client'

import { getUsermainProfile } from '@/lib/profile/mainprofile'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { 
  FiUser, FiMail, FiPhone, FiDollarSign, 
  FiGift, FiCalendar, FiLoader, FiAlertCircle 
} from 'react-icons/fi'
import { FaCopy } from 'react-icons/fa'
import { toast } from 'react-hot-toast'

export default function UserProfileDisplay() {
  interface UserProfile {
    first_name: string
    last_name: string
    email: string
    phone_number?: string
    balance?: number
    referral_code: string
    created_at: string
  }

  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true)
        const profileData = await getUsermainProfile()
        setProfile(profileData)
        setError(null)
      } catch (err: unknown) {
        console.error('Failed to fetch profile:', err)
        if (err instanceof Error) {
          setError(err.message || 'Failed to load profile')
        } else {
          setError('Failed to load profile')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  const copyReferralCode = () => {
    if (profile?.referral_code) {
      navigator.clipboard.writeText(profile.referral_code)
      toast.success('Referral code copied!')
    }
  }

  // Format the created_at date
  const formattedDate = new Date(profile?.created_at || '').toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center min-h-[300px]"
      >
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            className="mx-auto mb-4"
          >
            <FiLoader className="text-3xl text-blue-500 animate-spin" />
          </motion.div>
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </motion.div>
    )
  }

  if (error) {
    return (
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-lg border border-red-100"
      >
        <div className="text-center">
          <FiAlertCircle className="text-4xl text-red-500 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Error Loading Profile</h2>
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </motion.div>
    )
  }

  if (!profile) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-lg"
      >
        <div className="text-center">
          <FiUser className="text-4xl text-gray-400 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">No Profile Found</h2>
          <p className="text-gray-500">We couldn&#39;t find any profile data for your account.</p>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="max-w-md mx-auto"
    >
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-t-xl p-6 text-white">
        <h1 className="text-2xl font-bold text-center">Your Profile</h1>
        <div className="flex justify-center mt-4">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-3xl font-bold">
            {profile.first_name.charAt(0)}{profile.last_name.charAt(0)}
          </div>
        </div>
        <p className="text-center mt-3 text-white/90">
          {profile.first_name} {profile.last_name}
        </p>
      </div>

      <div className="bg-white rounded-b-xl shadow-lg overflow-hidden">
        <div className="p-6 space-y-5">
          <ProfileItem 
            icon={<FiUser className="text-blue-500" />}
            label="Name"
            value={`${profile.first_name} ${profile.last_name}`}
          />
          
          <ProfileItem 
            icon={<FiMail className="text-blue-500" />}
            label="Email"
            value={profile.email}
          />
          
          <ProfileItem 
            icon={<FiPhone className="text-blue-500" />}
            label="Phone"
            value={profile.phone_number || 'Not provided'}
          />
          
          <ProfileItem 
            icon={<FiDollarSign className="text-blue-500" />}
            label="Balance"
            value={`$${profile.balance?.toFixed(2) || '0.00'}`}
          />
          
          <div className="relative">
            <ProfileItem 
              icon={<FiGift className="text-blue-500" />}
              label="Referral Code"
              value={profile.referral_code}
            />
            <button
              onClick={copyReferralCode}
              className="absolute right-0 top-0 p-2 text-gray-400 hover:text-blue-500 transition-colors"
              title="Copy referral code"
            >
              <FaCopy />
            </button>
          </div>
          
          <ProfileItem 
            icon={<FiCalendar className="text-blue-500" />}
            label="Member Since"
            value={formattedDate}
          />
        </div>

        {/* <div className="px-6 py-4 bg-gray-50 border-t">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-medium shadow hover:shadow-md transition-all"
          >
            Edit Profile
          </motion.button>
        </div> */}
      </div>
    </motion.div>
  )
}

function ProfileItem({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <motion.div 
      whileHover={{ x: 5 }}
      className="flex items-start"
    >
      <div className="mr-3 mt-1">
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-sm text-gray-500">{label}</p>
        <p className="font-medium text-gray-800">{value}</p>
      </div>
    </motion.div>
  )
}