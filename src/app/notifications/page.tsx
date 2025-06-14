'use client'

import { useState, useEffect } from 'react';
import { FiMail, FiPhone, FiBell, FiCheckCircle, FiLoader } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

export default function NotificationSettings() {
  const [loading, setLoading] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [phoneNotifications, setPhoneNotifications] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Simulate loading data
  useEffect(() => {
    const timer = setTimeout(() => {
      setEmailNotifications(true);
      setPhoneNotifications(false);
      setPushNotifications(true);
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const handleSave = () => {
    setSaveLoading(true);
    setSaveSuccess(false);
    
    // Simulate API call
    setTimeout(() => {
      setSaveLoading(false);
      setSaveSuccess(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-md p-6 sm:p-8 w-full max-w-md text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          >
            <FiLoader className="text-blue-500 text-4xl mx-auto mb-4" />
          </motion.div>
          <h2 className="text-xl font-semibold text-gray-700">Loading notification settings...</h2>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-lg shadow-md overflow-hidden"
        >
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-r from-blue-600 to-blue-500 px-4 sm:px-6 py-4"
          >
            <h1 className="text-xl sm:text-2xl font-bold text-white">Notification Settings</h1>
            <p className="text-blue-100 text-sm sm:text-base">Manage how you receive notifications</p>
          </motion.div>
          
          {/* Content */}
          <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            {/* Email Notifications */}
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center justify-between p-3 sm:p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
            >
              <div className="flex items-center space-x-3 sm:space-x-4">
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="p-2 sm:p-3 bg-blue-100 rounded-full"
                >
                  <FiMail className="text-blue-600 text-lg sm:text-xl" />
                </motion.div>
                <div>
                  <h3 className="font-medium text-gray-800 text-sm sm:text-base">Email Notifications</h3>
                  <p className="text-xs sm:text-sm text-gray-500">Receive notifications via email</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={emailNotifications}
                  onChange={() => setEmailNotifications(!emailNotifications)}
                />
                <motion.div 
                  whileTap={{ scale: 0.95 }}
                  className="w-9 h-5 sm:w-11 sm:h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 sm:after:h-5 sm:after:w-5 after:transition-all peer-checked:bg-blue-600"
                ></motion.div>
              </label>
            </motion.div>
            
            {/* Phone Notifications */}
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="flex items-center justify-between p-3 sm:p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
            >
              <div className="flex items-center space-x-3 sm:space-x-4">
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="p-2 sm:p-3 bg-green-100 rounded-full"
                >
                  <FiPhone className="text-green-600 text-lg sm:text-xl" />
                </motion.div>
                <div>
                  <h3 className="font-medium text-gray-800 text-sm sm:text-base">SMS Notifications</h3>
                  <p className="text-xs sm:text-sm text-gray-500">Receive text message notifications</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={phoneNotifications}
                  onChange={() => setPhoneNotifications(!phoneNotifications)}
                />
                <motion.div 
                  whileTap={{ scale: 0.95 }}
                  className="w-9 h-5 sm:w-11 sm:h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 sm:after:h-5 sm:after:w-5 after:transition-all peer-checked:bg-green-600"
                ></motion.div>
              </label>
            </motion.div>
            
            {/* Push Notifications */}
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="flex items-center justify-between p-3 sm:p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
            >
              <div className="flex items-center space-x-3 sm:space-x-4">
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="p-2 sm:p-3 bg-purple-100 rounded-full"
                >
                  <FiBell className="text-purple-600 text-lg sm:text-xl" />
                </motion.div>
                <div>
                  <h3 className="font-medium text-gray-800 text-sm sm:text-base">Push Notifications</h3>
                  <p className="text-xs sm:text-sm text-gray-500">Receive app notifications</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={pushNotifications}
                  onChange={() => setPushNotifications(!pushNotifications)}
                />
                <motion.div 
                  whileTap={{ scale: 0.95 }}
                  className="w-9 h-5 sm:w-11 sm:h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 sm:after:h-5 sm:after:w-5 after:transition-all peer-checked:bg-purple-600"
                ></motion.div>
              </label>
            </motion.div>
            
            {/* Save Button */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="pt-3 sm:pt-4 flex flex-col sm:flex-row sm:justify-end items-center space-y-3 sm:space-y-0 sm:space-x-4"
            >
              <AnimatePresence>
                {saveSuccess && (
                  <motion.div 
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="flex items-center text-green-600 text-sm sm:text-base"
                  >
                    <FiCheckCircle className="mr-2" />
                    <span>Settings saved successfully!</span>
                  </motion.div>
                )}
              </AnimatePresence>
              <motion.button
                onClick={handleSave}
                disabled={saveLoading}
                whileHover={{ scale: saveLoading ? 1 : 1.03 }}
                whileTap={{ scale: saveLoading ? 1 : 0.97 }}
                className={`px-4 sm:px-6 py-2 rounded-md text-white font-medium text-sm sm:text-base ${saveLoading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'} transition-colors w-full sm:w-auto`}
              >
                {saveLoading ? (
                  <span className="flex items-center justify-center sm:justify-start">
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                      className="mr-2"
                    >
                      <FiLoader />
                    </motion.span>
                    Saving...
                  </span>
                ) : 'Save Changes'}
              </motion.button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}