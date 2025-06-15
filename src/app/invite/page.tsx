'use client'

import { getReferralData } from '@/lib/referral/referrals'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts'
import { FaCopy, FaFacebook, FaTwitter, FaWhatsapp, FaLinkedin, FaTelegram, FaLink } from 'react-icons/fa'
import { FiShare2, FiUsers, FiTrendingUp, FiAward } from 'react-icons/fi'
import { toast } from 'react-hot-toast'

const COLORS = ['#B45309', '#92400E', '#D97706', '#F59E0B', '#FCD34D'];

export default function InviteProfileClient() {
  const [referralCode, setReferralCode] = useState('')
  const [levels, setLevels] = useState<{ level: number; count: number }[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCopied, setIsCopied] = useState(false)
  const [exampleAmount] = useState(10000) // Example transaction amount for calculations

  useEffect(() => {
    const fetchReferralData = async () => {
      try {
        setIsLoading(true)
        const data = await getReferralData()
        setReferralCode(data.referralCode)
        // Only show levels 1 and 2 since those are the only ones with rewards
        setLevels([
          { level: 1, count: data.levels[0]?.count || 0 },
          { level: 2, count: data.levels[1]?.count || 0 }
        ])
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
    if (!fullLink) return
    navigator.clipboard.writeText(fullLink)
    setIsCopied(true)
    toast.success('Link copied to clipboard!', {
      style: {
        background: '#B45309',
        color: '#fff',
      }
    })
    setTimeout(() => setIsCopied(false), 2000)
  }

  const shareOnSocial = (platform: string) => {
    if (!fullLink) return
    let url = ''
    const text = `Join with my referral link and earn rewards: ${fullLink}`
    
    switch (platform) {
      case 'facebook': url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullLink)}`; break
      case 'twitter': url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`; break
      case 'whatsapp': url = `https://wa.me/?text=${encodeURIComponent(text)}`; break
      case 'linkedin': url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(fullLink)}`; break
      case 'telegram': url = `https://t.me/share/url?url=${encodeURIComponent(fullLink)}&text=${encodeURIComponent(text)}`; break
      default: return
    }
    
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  // Data for charts - only showing levels 1 and 2
  const pieData = [
    { name: 'Direct (30%)', value: levels[0]?.count || 0 },
    { name: 'Level 2 (3%)', value: levels[1]?.count || 0 }
  ]

  const radarData = levels.map(level => ({
    subject: `Level ${level.level}`,
    referrals: level.count,
    fullMark: Math.max(10, levels.reduce((max, l) => Math.max(max, l.count), 0))
  }))

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-600 to-amber-700 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-amber-500/20 backdrop-blur-md rounded-xl p-8 max-w-2xl w-full text-center border border-amber-300/30"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            className="w-12 h-12 border-4 border-amber-300/30 border-t-amber-200 rounded-full mx-auto mb-6"
          />
          <h2 className="text-2xl font-bold text-white mb-2">Loading Your Referral Dashboard</h2>
          <p className="text-amber-100">Preparing your rewards overview...</p>
        </motion.div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-600 to-amber-700 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-amber-500/20 backdrop-blur-md rounded-xl p-8 max-w-2xl w-full border border-amber-300/30"
        >
          <h2 className="text-2xl font-bold text-white mb-4">Referral Program</h2>
          <div className="bg-red-400/20 border border-red-400/30 text-white px-4 py-3 rounded-lg">
            {error}
          </div>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-white text-amber-700 hover:bg-amber-50 font-medium rounded-lg px-4 py-2 transition-all"
          >
            Try Again
          </button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-600 to-amber-700 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-6xl mx-auto"
      >
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-white mb-2">Referral Program</h1>
          <p className="text-amber-100 text-lg">Earn 30% on direct referrals and 3% on level 2</p>
        </div>

        {/* Three-Chart Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Bar Chart - Referral Levels */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-amber-500/20 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-amber-300/30"
          >
            <div className="flex items-center gap-2 mb-6">
              <FiUsers className="text-amber-200 text-xl" />
              <h2 className="text-xl font-semibold text-white">Referral Levels</h2>
            </div>
            
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={levels}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis 
                    dataKey="level" 
                    tick={{ fill: '#FCD34D' }}
                    label={{ value: 'Level', position: 'insideBottom', fill: '#FCD34D', offset: -5 }}
                  />
                  <YAxis 
                    tick={{ fill: '#FCD34D' }}
                    label={{ value: 'Referrals', angle: -90, position: 'insideLeft', fill: '#FCD34D' }}
                  />
                  <Tooltip 
                    contentStyle={{
                      background: 'rgba(30, 30, 30, 0.9)',
                      borderColor: '#B45309',
                      borderRadius: '0.5rem',
                      color: 'white'
                    }}
                    formatter={(value, name, props) => [
                      `${value} referral${value === 1 ? '' : 's'}`,
                      `Level ${props.payload.level}`
                    ]}
                  />
                  <Bar 
                    dataKey="count" 
                    fill="url(#barGradient)"
                    radius={[4, 4, 0, 0]}
                  >
                    <defs>
                      <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#F59E0B" />
                        <stop offset="100%" stopColor="#B45309" />
                      </linearGradient>
                    </defs>
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Pie Chart - Referral Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-amber-500/20 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-amber-300/30"
          >
            <div className="flex items-center gap-2 mb-6">
              <FiTrendingUp className="text-amber-200 text-xl" />
              <h2 className="text-xl font-semibold text-white">Referral Distribution</h2>
            </div>
            
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      background: 'rgba(30, 30, 30, 0.9)',
                      borderColor: '#B45309',
                      borderRadius: '0.5rem',
                      color: 'white'
                    }}
                    formatter={(value, name) => [
                      `${value} referral${value === 1 ? '' : 's'}`,
                      name
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Radar Chart - Performance */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-amber-500/20 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-amber-300/30"
          >
            <div className="flex items-center gap-2 mb-6">
              <FiAward className="text-amber-200 text-xl" />
              <h2 className="text-xl font-semibold text-white">Network Performance</h2>
            </div>
            
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.2)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#FCD34D' }} />
                  <PolarRadiusAxis angle={30} tick={{ fill: '#FCD34D' }} />
                  <Radar
                    name="Referrals"
                    dataKey="referrals"
                    stroke="#B45309"
                    fill="#F59E0B"
                    fillOpacity={0.6}
                  />
                  <Tooltip 
                    contentStyle={{
                      background: 'rgba(30, 30, 30, 0.9)',
                      borderColor: '#B45309',
                      borderRadius: '0.5rem',
                      color: 'white'
                    }}
                    formatter={(value) => [`${value} referral${value === 1 ? '' : 's'}`, 'Count']}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* Referral Link Card */}
        <motion.div
          whileHover={{ scale: 1.01 }}
          className="bg-amber-500/20 backdrop-blur-md rounded-2xl p-6 mb-8 shadow-lg border border-amber-300/30"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h2 className="text-xl font-semibold text-white mb-2 flex items-center gap-2">
                <FiShare2 className="text-amber-200" /> Your Exclusive Referral Link
              </h2>
              <p className="text-amber-100">Share this link to invite friends</p>
            </div>
            <button
              onClick={copyToClipboard}
              disabled={!fullLink}
              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
                isCopied
                  ? 'bg-green-500 text-white'
                  : 'bg-white text-amber-700 hover:bg-amber-50 disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
            >
              <FaCopy /> {isCopied ? 'Copied!' : 'Copy Link'}
            </button>
          </div>
          
          <div className="bg-amber-400/10 rounded-lg p-3 mb-6 overflow-x-auto">
            <code className="text-amber-100 break-all">{fullLink || 'Loading referral code...'}</code>
          </div>

          <div>
            <h3 className="text-amber-100 mb-3">Share on social networks:</h3>
            <div className="flex flex-wrap gap-3">
              {[
                { platform: 'facebook', icon: <FaFacebook className="text-blue-400" /> },
                { platform: 'twitter', icon: <FaTwitter className="text-sky-400" /> },
                { platform: 'whatsapp', icon: <FaWhatsapp className="text-green-400" /> },
                { platform: 'linkedin', icon: <FaLinkedin className="text-blue-500" /> },
                { platform: 'telegram', icon: <FaTelegram className="text-blue-300" /> },
                { platform: 'link', icon: <FaLink className="text-amber-300" /> },
              ].map(({ platform, icon }) => (
                <motion.button
                  key={platform}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => shareOnSocial(platform)}
                  disabled={!fullLink}
                  className="w-12 h-12 flex items-center justify-center bg-amber-400/20 rounded-full hover:bg-amber-400/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  title={`Share on ${platform.charAt(0).toUpperCase() + platform.slice(1)}`}
                >
                  {icon}
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Rewards Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-amber-500/20 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-amber-300/30"
        >
          <h2 className="text-xl font-semibold text-white mb-6">Your Referral Rewards</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {[
              {
                title: "Direct Referrals",
                value: `₦${(levels[0]?.count * exampleAmount * 0.30).toLocaleString()}`,
                description: "30% of their investment",
                icon: <FiUsers className="text-3xl text-amber-300" />,
                example: `Example: ₦${exampleAmount.toLocaleString()} → ₦${(exampleAmount * 0.30).toLocaleString()}`
              },
              {
                title: "Level 2 Network",
                value: `₦${(levels[1]?.count * exampleAmount * 0.03).toLocaleString()}`,
                description: "3% of their investment",
                icon: <FiTrendingUp className="text-3xl text-amber-300" />,
                example: `Example: ₦${exampleAmount.toLocaleString()} → ₦${(exampleAmount * 0.03).toLocaleString()}`
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -5 }}
                className="bg-amber-400/10 p-5 rounded-xl border border-amber-300/20 hover:border-amber-300/40 transition-colors"
              >
                <div className="flex items-center gap-3 mb-3">
                  {item.icon}
                  <h3 className="text-lg font-medium text-white">{item.title}</h3>
                </div>
                <p className="text-2xl font-bold text-amber-200 mb-2">{item.value}</p>
                <p className="text-amber-100 mb-1">{item.description}</p>
                <p className="text-xs text-amber-200/70">{item.example}</p>
              </motion.div>
            ))}
          </div>

          <div className="bg-amber-500/10 rounded-xl p-5 border border-amber-400/20">
            <h3 className="text-lg font-medium text-white mb-3">How It Works</h3>
            <ul className="space-y-3 text-amber-100">
              <li className="flex items-start gap-2">
                <span className="text-amber-300">•</span>
                <span>Earn <strong>30%</strong> of investments from people you directly refer</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-300">•</span>
                <span>Earn <strong>3%</strong> of investments from their referrals (your level 2)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-300">•</span>
                <span>Rewards are calculated automatically and added to your balance</span>
              </li>
            </ul>
          </div>
        </motion.div>

        {/* Referral Network List */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-amber-500/20 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-amber-300/30 mt-8"
        >
          <div className="flex items-center gap-2 mb-6">
            <FiUsers className="text-amber-200 text-xl" />
            <h2 className="text-xl font-semibold text-white">Your Referral Network</h2>
          </div>
          
          {levels.length === 0 ? (
            <div className="text-center py-8 text-amber-100/70">
              <p>No referrals yet. Start sharing your link!</p>
              <button 
                onClick={copyToClipboard}
                disabled={!fullLink}
                className="mt-4 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Copy Referral Link
              </button>
            </div>
          ) : (
            <ul className="space-y-4">
              {levels.map(({ level, count }) => (
                <motion.li 
                  key={level}
                  whileHover={{ scale: 1.02 }}
                  className="flex items-center bg-amber-400/10 p-4 rounded-lg border border-amber-300/20"
                >
                  <div className="w-10 h-10 flex items-center justify-center bg-amber-600 rounded-full mr-4 font-bold text-white">
                    {level}
                  </div>
                  <div className="flex-grow">
                    <div className="flex justify-between text-white mb-2">
                      <span className="text-amber-100">
                        {level === 1 ? 'Direct Referrals' : 'Level 2 Referrals'}
                      </span>
                      <span className="font-bold text-amber-200">
                        {count} {count === 1 ? 'Referral' : 'Referrals'}
                      </span>
                    </div>
                    <div className="w-full bg-amber-400/20 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-amber-400 to-amber-600 h-2 rounded-full"
                        style={{ width: `${Math.min(100, (count / 10) * 100)}%` }}
                      />
                    </div>
                    <div className="mt-1 text-xs text-amber-200/80">
                      Potential Earnings: ₦{(count * exampleAmount * (level === 1 ? 0.30 : 0.03)).toLocaleString()}
                    </div>
                  </div>
                </motion.li>
              ))}
            </ul>
          )}
        </motion.div>
      </motion.div>
    </div>
  )
}