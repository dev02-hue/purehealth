'use client'

 import { motion } from 'framer-motion'
import { 
  FiDollarSign, 
  FiHome,
  FiClock,
  FiUsers,
  FiMail,
  FiPieChart,
  FiCreditCard,
  FiGift,
  FiTrendingUp,
  FiImage
} from 'react-icons/fi'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts'
import Link from 'next/link'
import Image from 'next/image'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']

export default function SheratonDashboard() {
  // Chart data
  const performanceData = [
    { name: 'Week 1', returns: 750 },
    { name: 'Week 2', returns: 1500 },
    { name: 'Week 3', returns: 2250 },
    { name: 'Week 4', returns: 3000 },
    { name: 'Week 5', returns: 3750 },
  ]

  const investmentPlans = [
    { amount: 3000, earn: 750 },
    { amount: 5000, earn: 1250 },
    { amount: 10000, earn: 2500 },
    { amount: 20000, earn: 5000 },
    { amount: 40000, earn: 10000 },
    { amount: 80000, earn: 20000 },
    { amount: 150000, earn: 37500 },
    { amount: 300000, earn: 75000 },
    { amount: 500000, earn: 125000 },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-4 ">
      {/* Luxury Background Elements */}
      <div className="fixed inset-0 overflow-hidden opacity-10 pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-amber-400 dark:bg-amber-600"
            initial={{ 
              y: Math.random() * 100,
              x: Math.random() * 100,
              opacity: 0.2,
              scale: Math.random() * 0.5 + 0.5
            }}
            animate={{
              y: [null, Math.random() * 100],
              x: [null, Math.random() * 100],
              transition: {
                duration: Math.random() * 10 + 10,
                repeat: Infinity,
                repeatType: 'reverse'
              }
            }}
            style={{
              width: `${Math.random() * 20 + 5}px`,
              height: `${Math.random() * 20 + 5}px`,
            }}
          />
        ))}
      </div>

      <div className="max-w-7xl mx-auto relative mt-16">
        {/* Luxury Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3"
          >
            <div className="p-3 bg-amber-100 dark:bg-amber-900/50 rounded-xl">
              <FiHome className="text-amber-600 dark:text-amber-400 text-2xl" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-amber-800 dark:text-amber-200">Sheraton Investments</h1>
              <p className="text-sm text-amber-600 dark:text-amber-400">Luxury returns experience</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex gap-3"
          >
            <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-full shadow-sm hover:shadow-md transition-all">
              <FiGift className="text-amber-600 dark:text-amber-400" />
              <span className="text-sm font-medium">Get Bonus</span>
            </button>
          </motion.div>
        </header>

        {/* MAIN CONTENT */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* QUICK ACTIONS SIDEBAR */}
          <motion.div 
            className="space-y-4"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
          >
            {[
              { icon: <FiDollarSign />, label: 'Deposit', href: '/deposit', color: 'bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400' },
              { icon: <FiCreditCard />, label: 'Withdraw', href: '/withdraw', color: 'bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400' },
              { icon: <FiUsers />, label: 'Check-in', href: '/checkin', color: 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400' },
              { icon: <FiMail />, label: 'Concierge', href: '/contact', color: 'bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400' },
            ].map((action, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  href={action.href}
                  className={`flex items-center gap-3 p-4 rounded-xl ${action.color} shadow-sm hover:shadow-md transition-all`}
                >
                  <div className="text-xl">{action.icon}</div>
                  <span className="font-medium">{action.label}</span>
                </Link>
              </motion.div>
            ))}
          </motion.div>

          {/* CENTER CONTENT */}
          <div className="lg:col-span-2 space-y-6">
            {/* Performance Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <FiTrendingUp className="text-amber-600 dark:text-amber-400" />
                  <span>35-Day Growth Projection</span>
                </h2>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  ₦10,000 Investment
                </div>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => [`₦${value}`, "Returns"]}
                      labelFormatter={(label) => `Week ${label.split(' ')[1]}`}
                    />
                    <Bar 
                      dataKey="returns" 
                      radius={[4, 4, 0, 0]}
                      animationDuration={1500}
                    >
                      {performanceData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={COLORS[index % COLORS.length]} 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Investment Plans */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {investmentPlans.slice(0, 4).map((plan, i) => (
                <motion.div
                  key={i}
                  whileHover={{ y: -5 }}
                  className={`p-5 rounded-xl shadow-sm border transition-all ${i % 2 === 0 ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-800/50' : 'bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800/50'}`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold text-lg">₦{plan.amount.toLocaleString()}</h3>
                    <div className="px-2 py-1 bg-white dark:bg-gray-800 rounded-md text-xs font-medium">
                      35 days
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">
                    ₦{plan.earn.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Total returns (25%)
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* RIGHT SIDEBAR - PLAN DETAILS */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Plan Highlights */}
            <div className="bg-white dark:bg-gray-800/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
              <h2 className="text-xl font-semibold flex items-center gap-2 mb-6">
                <FiPieChart className="text-amber-600 dark:text-amber-400" />
                <span>Plan Features</span>
              </h2>
              <ul className="space-y-4">
                <li className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400 flex items-center justify-center">
                    ✓
                  </div>
                  <div>
                    <div className="font-medium">Welcome Bonus</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">₦500 on first deposit</div>
                  </div>
                </li>
                <li className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    ✓
                  </div>
                  <div>
                    <div className="font-medium">Referral Program</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">30% direct + 4% indirect</div>
                  </div>
                </li>
                <li className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                    ✓
                  </div>
                  <div>
                    <div className="font-medium">Check-in Bonus</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">₦100 daily check-in</div>
                  </div>
                </li>
              </ul>
            </div>

            {/* Quick Stats */}
            <div className="bg-white dark:bg-gray-800/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
              <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
                <FiClock className="text-amber-600 dark:text-amber-400" />
                <span>Plan Duration</span>
              </h2>
              <div className="flex items-center justify-center py-4">
                <div className="text-5xl font-bold text-amber-600 dark:text-amber-400">
                  35
                </div>
                <div className="ml-2">
                  <div className="text-sm uppercase text-gray-500 dark:text-gray-400">Days</div>
                  <div className="text-green-600 dark:text-green-400 font-medium">Fixed Term</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* INVESTMENT PLANS IMAGE SECTION */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-12 bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden"
        >
          <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3">
            <FiImage className="text-amber-600 dark:text-amber-400 text-xl" />
            <h2 className="text-xl font-semibold">Investment Plans</h2>
          </div>
          
          <div className="p-6">
          <div className="w-full max-w-3xl mx-auto rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
  <Image
    src="/WhatsApp Image 2025-06-11 at 9.46.40 AM.jpeg"
    alt="Sheraton Investment Plans"
    width={1200}          // Adjust as needed for your layout
    height={600}          // Keep aspect ratio consistent
    className="w-full h-auto object-cover"
  />
</div>

            
            <div className="mt-4 text-center text-gray-500 dark:text-gray-400">
              <p>Our comprehensive investment plans designed for maximum returns</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}