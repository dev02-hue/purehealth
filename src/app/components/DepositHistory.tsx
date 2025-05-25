// components/DepositHistory.tsx
'use client'

import { motion } from 'framer-motion'
import { FaHistory, FaMoneyBillWave, FaClock, FaCheckCircle, FaTimesCircle } from 'react-icons/fa'

type Deposit = {
  id: string;
  created_at: string;
  amount: number;
  status: string;
};

type Props = {
  deposits: Deposit[];
  error: string | null;
};

const statusConfig = {
  pending: {
    icon: <FaClock className="text-yellow-500 dark:text-yellow-400" />,
    bg: 'bg-yellow-50 dark:bg-yellow-900/30',
    text: 'text-yellow-700 dark:text-yellow-300',
    border: 'border-yellow-200 dark:border-yellow-800'
  },
  completed: {
    icon: <FaCheckCircle className="text-green-500 dark:text-green-400" />,
    bg: 'bg-green-50 dark:bg-green-900/30',
    text: 'text-green-700 dark:text-green-300',
    border: 'border-green-200 dark:border-green-800'
  },
  failed: {
    icon: <FaTimesCircle className="text-red-500 dark:text-red-400" />,
    bg: 'bg-red-50 dark:bg-red-900/30',
    text: 'text-red-700 dark:text-red-300',
    border: 'border-red-200 dark:border-red-800'
  }
};

export default function DepositHistory({ deposits, error }: Props) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05, when: "beforeChildren" }
    }
  };

  const itemVariants = {
    hidden: { y: 10, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 120 } }
  };

  if (error) {
    return (
      <motion.div
        className="p-4 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg flex items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <FaTimesCircle />
        {error}
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/50 p-6 border dark:border-gray-700" 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.3 }}
    >
      <motion.h2 
        className="text-2xl font-bold mb-6 text-blue-600 dark:text-blue-400 flex items-center gap-3" 
        initial={{ x: -10, opacity: 0 }} 
        animate={{ x: 0, opacity: 1 }} 
        transition={{ delay: 0.1 }}
      >
        <FaHistory className="text-blue-500 dark:text-blue-400" />
        Deposit History
      </motion.h2>

      {deposits.length === 0 ? (
        <motion.div 
          className="py-8 text-center bg-gray-50 dark:bg-gray-700/30 rounded-lg" 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }}
        >
          <p className="text-gray-500 dark:text-gray-400">No deposit history found</p>
        </motion.div>
      ) : (
        <motion.div 
          className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700" 
          variants={containerVariants} 
          initial="hidden" 
          animate="visible"
        >
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700/30">
                <motion.tr variants={itemVariants}>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1">
                    <FaMoneyBillWave className="text-blue-500 dark:text-blue-400" /> Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                </motion.tr>
              </thead>
              <motion.tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700" variants={containerVariants}>
                {deposits.map((deposit) => {
                  const status = deposit.status.toLowerCase();
                  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

                  return (
                    <motion.tr 
                      key={deposit.id} 
                      className="hover:bg-blue-50 dark:hover:bg-gray-700/50 transition-colors" 
                      variants={itemVariants} 
                      whileHover={{ scale: 1.005 }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                        {new Date(deposit.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                        ₦{deposit.amount?.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs ${config.bg} ${config.text} ${config.border} border`}>
                          {config.icon}
                          <span className="capitalize">{status}</span>
                        </span>
                      </td>
                    </motion.tr>
                  );
                })}
              </motion.tbody>
            </table>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}