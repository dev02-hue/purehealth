'use client'

import { motion } from 'framer-motion'
import { MdEmail, MdHeadsetMic, MdAccessTime } from 'react-icons/md'
import { FaRegLifeRing } from 'react-icons/fa'
import { HiOutlineChatAlt2 } from 'react-icons/hi'

export default function CustomerCare() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        when: "beforeChildren"
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  }

  const cardVariants = {
    hover: {
      y: -5,
      transition: { duration: 0.2 }
    }
  }

  return (
    <motion.div 
      className="max-w-4xl mx-auto p-4 sm:p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg dark:shadow-gray-900/50 border dark:border-gray-700"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div 
        className="text-center mb-6 sm:mb-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h2 
          className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2 sm:mb-3 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3"
          variants={itemVariants}
        >
          <span className="flex items-center gap-2">
            <MdHeadsetMic className="text-3xl sm:text-4xl" />
            Customer Care
          </span>
        </motion.h2>
        <motion.p 
          className="text-gray-600 dark:text-gray-300 text-base sm:text-lg"
          variants={itemVariants}
        >
          We&apos;re here to help you 24/7
        </motion.p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        {/* Email Support */}
        <motion.div
          className="p-4 sm:p-6 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
          variants={cardVariants}
          whileHover="hover"
        >
          <div className="flex flex-col xs:flex-row gap-3 sm:gap-4">
            <div className="p-2 sm:p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-600 dark:text-blue-400 self-start">
              <MdEmail className="text-xl sm:text-2xl" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-base sm:text-lg text-gray-800 dark:text-gray-100 mb-1">Email Support</h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-2 sm:mb-3">Get help via email with our dedicated support team</p>
              <a 
                href="mailto:info.davidohuopiauk51@gmail.com" 
                className="inline-flex items-center text-sm sm:text-base text-blue-600 dark:text-blue-400 hover:underline break-all"
              >
                info.davidohuopiauk51@gmail.com
              </a>
            </div>
          </div>
        </motion.div>

        {/* Live Chat */}
        <motion.div
          className="p-4 sm:p-6 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
          variants={cardVariants}
          whileHover="hover"
        >
          <div className="flex flex-col xs:flex-row gap-3 sm:gap-4">
            <div className="p-2 sm:p-3 bg-green-100 dark:bg-green-900/30 rounded-full text-green-600 dark:text-green-400 self-start">
              <HiOutlineChatAlt2 className="text-xl sm:text-2xl" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-base sm:text-lg text-gray-800 dark:text-gray-100 mb-1">Live Chat</h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-2 sm:mb-3">Chat with our support agents in real-time</p>
              <button className="w-full xs:w-auto px-3 py-1 sm:px-4 sm:py-2 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white rounded-lg text-sm sm:text-base">
                Start Chat
              </button>
            </div>
          </div>
        </motion.div>

        {/* Help Center */}
        <motion.div
          className="p-4 sm:p-6 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
          variants={cardVariants}
          whileHover="hover"
        >
          <div className="flex flex-col xs:flex-row gap-3 sm:gap-4">
            <div className="p-2 sm:p-3 bg-orange-100 dark:bg-orange-900/30 rounded-full text-orange-600 dark:text-orange-400 self-start">
              <FaRegLifeRing className="text-xl sm:text-2xl" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-base sm:text-lg text-gray-800 dark:text-gray-100 mb-1">Help Center</h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-2 sm:mb-3">Find answers to common questions</p>
              <button className="w-full xs:w-auto px-3 py-1 sm:px-4 sm:py-2 bg-orange-600 hover:bg-orange-700 dark:bg-orange-700 dark:hover:bg-orange-600 text-white rounded-lg text-sm sm:text-base">
                Browse Articles
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div 
        className="mt-6 sm:mt-8 p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 flex flex-col xs:flex-row items-center gap-2 sm:gap-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <MdAccessTime className="text-xl sm:text-2xl text-blue-600 dark:text-blue-400" />
        <div className="text-center xs:text-left">
          <h4 className="font-medium text-sm sm:text-base text-blue-800 dark:text-blue-300">Operating Hours</h4>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">24/7 Customer Support</p>
        </div>
      </motion.div>
    </motion.div>
  )
}