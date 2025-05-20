'use client'

import { motion } from 'framer-motion'
import { FaTelegram, FaArrowRight, FaUsers, FaComments } from 'react-icons/fa'
import { FiExternalLink } from 'react-icons/fi'

export default function TelegramGroupPage() {
  const telegramGroupLink = 'https://t.me/+sNlISBgVcSw2YmNk'
  
  const features = [
    {
      icon: <FaUsers className="text-2xl text-blue-400" />,
      title: "Community Support",
      description: "Get help from thousands of community members"
    },
    {
      icon: <FaComments className="text-2xl text-blue-400" />,
      title: "Latest Updates",
      description: "Be the first to know about new features and updates"
    },
    {
      icon: <FaTelegram className="text-2xl text-blue-400" />,
      title: "Direct Access",
      description: "Connect directly with our team and other users"
    }
  ]

  const copyToClipboard = () => {
    navigator.clipboard.writeText(telegramGroupLink)
    alert('Link copied to clipboard!')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto"
      >
        {/* Header Section */}
        <div className="text-center mb-12">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="inline-block mb-6"
          >
            <div className="bg-blue-100 dark:bg-gray-800 p-4 rounded-full inline-block">
              <FaTelegram className="text-5xl text-blue-500 dark:text-blue-400" />
            </div>
          </motion.div>
          <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-4">
            Join Our Telegram Community
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-900 max-w-2xl mx-auto">
            Connect with other users, get support, and stay updated with the latest news
          </p>
        </div>

        {/* Main Card */}
        <motion.div
          whileHover={{ y: -5 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden mb-12"
        >
          <div className="p-8 sm:p-10">
            <div className="flex flex-col md:flex-row items-center">
              <div className="flex-shrink-0 mb-6 md:mb-0 md:mr-8">
                <div className="bg-blue-100 dark:bg-gray-700 p-6 rounded-xl">
                  <FaTelegram className="text-6xl text-blue-500 dark:text-blue-400" />
                </div>
              </div>
              <div className="flex-grow text-center md:text-left">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-3">
                  Official Telegram Group
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Join our growing community of users to get help, share feedback, and
                  stay informed about all updates.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <motion.a
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    href={telegramGroupLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center px-6 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
                  >
                    Join Now <FaArrowRight className="ml-2" />
                  </motion.a>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={copyToClipboard}
                    className="flex items-center justify-center px-6 py-3 bg-gray-100 dark:bg-gray-700 dark:text-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    Copy Link <FiExternalLink className="ml-2" />
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 + 0.3 }}
              whileHover={{ y: -5 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-100 dark:border-gray-700"
            >
              <div className="flex items-center mb-4">
                {feature.icon}
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 ml-3">
                  {feature.title}
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-8"
        >
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6 text-center">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {[
              {
                question: "Do I need a Telegram account to join?",
                answer: "Yes, you'll need a Telegram account to participate in our group."
              },
              {
                question: "Is the group moderated?",
                answer: "Yes, our community managers moderate the group to ensure a positive experience for everyone."
              },
              {
                question: "Can I share this invite link?",
                answer: "Absolutely! Feel free to share the invite link with anyone who might benefit from our community."
              }
            ].map((item, index) => (
              <div key={index} className="border-b border-gray-100 dark:border-gray-700 pb-4">
                <h3 className="font-medium text-gray-800 dark:text-gray-100 mb-1">{item.question}</h3>
                <p className="text-gray-600 dark:text-gray-300">{item.answer}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Final CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-12"
        >
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">
            Ready to join the conversation?
          </h2>
          <motion.a
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            href={telegramGroupLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-bold shadow-lg hover:shadow-xl transition-all"
          >
            <FaTelegram className="text-2xl mr-3" />
            Join Our Telegram Group Now
          </motion.a>
        </motion.div>
      </motion.div>
    </div>
  )
}