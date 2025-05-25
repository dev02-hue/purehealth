'use client'

import { getReferralData } from '@/lib/referral/referrals'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { FaCopy, FaFacebook, FaTwitter, FaWhatsapp, FaLinkedin, FaTelegram, FaLink } from 'react-icons/fa'
import { FiShare2 } from 'react-icons/fi'
import { toast } from 'react-hot-toast'

export default function InviteProfileClient() {
  const [referralCode, setReferralCode] = useState('')
  const [levels, setLevels] = useState<{ level: number; count: number }[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCopied, setIsCopied] = useState(false)

  useEffect(() => {
    const fetchReferralData = async () => {
      try {
        setIsLoading(true)
        const data = await getReferralData()
        setReferralCode(data.referralCode)
        setLevels(data.levels)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load referral data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchReferralData()
  }, [])

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
  const fullLink = referralCode ? `${baseUrl}/signup?ref=${referralCode}` : ''

  const copyToClipboard = () => {
    navigator.clipboard.writeText(fullLink)
    setIsCopied(true)
    toast.success('Link copied to clipboard!')
    setTimeout(() => setIsCopied(false), 2000)
  }

  const shareOnSocial = (platform: string) => {
    let url = ''
    const text = `Join me using my referral link: ${fullLink}`
    
    switch (platform) {
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullLink)}`
        break
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`
        break
      case 'whatsapp':
        url = `https://wa.me/?text=${encodeURIComponent(text)}`
        break
      case 'linkedin':
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(fullLink)}`
        break
      case 'telegram':
        url = `https://t.me/share/url?url=${encodeURIComponent(fullLink)}&text=${encodeURIComponent(text)}`
        break
      default:
        return
    }
    
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4 ">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white/10 dark:bg-gray-800/90 backdrop-blur-md rounded-xl p-8 max-w-2xl w-full text-center border border-white/10 dark:border-gray-700"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            className="w-12 h-12 border-4 border-white/30 dark:border-gray-600 border-t-white dark:border-t-blue-400 rounded-full mx-auto mb-6"
          />
          <h2 className="text-2xl font-bold text-white dark:text-gray-100 mb-2">Loading Your Referral Data</h2>
          <p className="text-white/80 dark:text-gray-300">We&#39;re preparing your amazing rewards dashboard...</p>
        </motion.div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white/10 dark:bg-gray-800/90 backdrop-blur-md rounded-xl p-8 max-w-2xl w-full border border-white/10 dark:border-gray-700"
        >
          <h2 className="text-2xl font-bold text-white dark:text-gray-100 mb-4">Invite Friends</h2>
          <div className="bg-red-400/20 dark:bg-red-900/30 border border-red-400/50 dark:border-red-700 text-white px-4 py-3 rounded-lg">
            {error}
          </div>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-600 font-medium rounded-lg px-4 py-2 transition-all"
          >
            Try Again
          </button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-white dark:text-gray-100 mb-2">Invite Friends</h1>
          <p className="text-white/80 dark:text-gray-300 text-lg">Invite friends and earn amazing rewards</p>
        </div>

        {/* Referral Link Card */}
        <motion.div
          whileHover={{ scale: 1.01 }}
          className="bg-white/10 dark:bg-gray-800/90 backdrop-blur-md rounded-2xl p-6 mb-8 shadow-lg border border-white/10 dark:border-gray-700"
        >
          <h2 className="text-xl font-semibold text-white dark:text-gray-100 mb-4 flex items-center gap-2">
            <FiShare2 className="text-purple-300 dark:text-purple-400" /> Your Unique Referral Link
          </h2>
          
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="flex-grow bg-white/5 dark:bg-gray-700/50 rounded-lg p-3 overflow-x-auto">
              <code className="text-blue-100 dark:text-blue-300 break-all">{fullLink}</code>
            </div>
            <button
              onClick={copyToClipboard}
              className={`flex-shrink-0 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
                isCopied
                  ? 'bg-green-500 text-white'
                  : 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-600'
              }`}
            >
              <FaCopy /> {isCopied ? 'Copied!' : 'Copy'}
            </button>
          </div>

          <div className="mt-6">
            <h3 className="text-white/80 dark:text-gray-300 mb-3">Share via:</h3>
            <div className="flex flex-wrap gap-3">
              {[
                { platform: 'facebook', icon: <FaFacebook className="text-blue-400 dark:text-blue-500" /> },
                { platform: 'twitter', icon: <FaTwitter className="text-sky-400 dark:text-sky-500" /> },
                { platform: 'whatsapp', icon: <FaWhatsapp className="text-green-400 dark:text-green-500" /> },
                { platform: 'linkedin', icon: <FaLinkedin className="text-blue-500 dark:text-blue-600" /> },
                { platform: 'telegram', icon: <FaTelegram className="text-blue-300 dark:text-blue-400" /> },
                { platform: 'link', icon: <FaLink className="text-purple-300 dark:text-purple-400" /> },
              ].map(({ platform, icon }) => (
                <motion.button
                  key={platform}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => shareOnSocial(platform)}
                  className="w-12 h-12 flex items-center justify-center bg-white/10 dark:bg-gray-700 rounded-full backdrop-blur-sm hover:bg-white/20 dark:hover:bg-gray-600 transition-all"
                  title={`Share on ${platform.charAt(0).toUpperCase() + platform.slice(1)}`}
                >
                  {icon}
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Stats and Chart Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Referral Levels Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/10 dark:bg-gray-800/90 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white/10 dark:border-gray-700"
          >
            <h2 className="text-xl font-semibold text-white dark:text-gray-100 mb-6">Your Referral Levels</h2>
            
            {levels.length === 0 ? (
              <div className="text-center py-8 text-white/70 dark:text-gray-400">
                <p>No referrals yet. Start sharing your link!</p>
              </div>
            ) : (
              <ul className="space-y-4">
                {levels.map(({ level, count }) => (
                  <li key={level} className="flex items-center">
                    <div className="w-10 h-10 flex items-center justify-center bg-white/10 dark:bg-gray-700 rounded-full mr-4 font-bold text-white dark:text-gray-100">
                      {level}
                    </div>
                    <div className="flex-grow">
                      <div className="flex justify-between text-white dark:text-gray-100 mb-1">
                        <span>Level {level}</span>
                        <span className="font-bold">{count}</span>
                      </div>
                      <div className="w-full bg-white/10 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-400 to-purple-500 dark:from-blue-500 dark:to-purple-600 h-2 rounded-full"
                          style={{ width: `${Math.min(100, (count / 10) * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </motion.div>

          {/* Chart Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/10 dark:bg-gray-800/90 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white/10 dark:border-gray-700"
          >
            <h2 className="text-xl font-semibold text-white dark:text-gray-100 mb-6">Referral Performance</h2>
            
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={levels}>
                  <CartesianGrid 
                    strokeDasharray="3 3" 
                    stroke="rgba(255,255,255,0.1)" 
                    strokeOpacity={0.5}
                  />
                  <XAxis 
                    dataKey="level" 
                    tick={{ fill: 'rgba(255,255,255,0.8)' }} 
                    label={{ 
                      value: 'Level', 
                      position: 'insideBottom', 
                      fill: 'rgba(255,255,255,0.8)',
                      offset: -5
                    }}
                  />
                  <YAxis 
                    tick={{ fill: 'rgba(255,255,255,0.8)' }} 
                    label={{ 
                      value: 'Count', 
                      angle: -90, 
                      position: 'insideLeft', 
                      fill: 'rgba(255,255,255,0.8)',
                      style: { textAnchor: 'middle' }
                    }}
                  />
                  <Tooltip 
                    contentStyle={{
                      background: 'rgba(0,0,0,0.7)',
                      borderColor: 'rgba(255,255,255,0.2)',
                      borderRadius: '0.5rem',
                      color: 'white'
                    }}
                    itemStyle={{ color: 'white' }}
                    labelStyle={{ color: 'white' }}
                  />
                  <Bar 
                    dataKey="count" 
                    fill="url(#colorGradient)" 
                    radius={[4, 4, 0, 0]}
                  >
                    <defs>
                      <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#60a5fa" stopOpacity={0.8} />
                        <stop offset="100%" stopColor="#a855f7" stopOpacity={0.8} />
                      </linearGradient>
                    </defs>
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* Rewards Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/10 dark:bg-gray-800/90 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white/10 dark:border-gray-700 mb-20"
        >
          <h2 className="text-xl font-semibold text-white dark:text-gray-100 mb-4">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                title: "Invite Friends",
                desc: "Share your unique link with friends and colleagues",
                emoji: "📤"
              },
              {
                title: "They Sign Up",
                desc: "Your friends sign up using your referral link",
                emoji: "👥"
              },
              {
                title: "Earn Rewards",
                desc: "Get amazing benefits for each successful referral",
                emoji: "🎁"
              }
            ].map((item, index) => (
              <div 
                key={index} 
                className="bg-white/5 dark:bg-gray-700/50 p-4 rounded-lg border border-white/10 dark:border-gray-600 hover:border-white/20 dark:hover:border-gray-500 transition-colors"
              >
                <div className="text-3xl mb-2">{item.emoji}</div>
                <h3 className="font-medium text-white dark:text-gray-100 mb-1">{item.title}</h3>
                <p className="text-white/70 dark:text-gray-300 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}