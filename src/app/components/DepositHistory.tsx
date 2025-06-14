'use client'

import { motion } from 'framer-motion'
import { 
  FiDollarSign, 
  FiClock, 
  FiCheckCircle, 
  FiXCircle,
  FiCalendar,
  FiTrendingUp,
  FiRefreshCw
} from 'react-icons/fi'
import { format } from 'date-fns'

// Color palette
const COLORS = {
  primary: '#3B82F6', // Sheraton blue
  secondary: '#EC4899', // Sheraton pink
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  background: '#FFFFFF',
  cardBg: '#F5F7FA',
  textDark: '#1A1A1A',
  textLight: '#4A5568',
  border: '#E5E7EB'
}

type Deposit = {
  id: string;
  created_at: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  payment_method?: string;
  reference?: string;
};

type Props = {
  deposits: Deposit[];
  error?: string;
  loading?: boolean;
  onRefresh?: () => void;
};

const StatusBadge = ({ status }: { status: string }) => {
  const statusConfig = {
    pending: {
      icon: <FiClock className="text-yellow-500" />,
      bg: 'bg-yellow-50',
      text: 'text-yellow-700',
      border: 'border-yellow-200'
    },
    completed: {
      icon: <FiCheckCircle className="text-green-500" />,
      bg: 'bg-green-50',
      text: 'text-green-700',
      border: 'border-green-200'
    },
    failed: {
      icon: <FiXCircle className="text-red-500" />,
      bg: 'bg-red-50',
      text: 'text-red-700',
      border: 'border-red-200'
    }
  } as const; // Optional, helps narrow type
  
  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
  

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${config.bg} ${config.text} ${config.border} border`}>
      {config.icon}
      <span className="capitalize font-medium">{status}</span>
    </div>
  )
}

export default function DepositHistory({ deposits, error, loading, onRefresh }: Props) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05, when: "beforeChildren" }
    }
  };

  const itemVariants = {
    hidden: { y: 10, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1, 
      transition: { 
        type: "spring", 
        stiffness: 120,
        damping: 10
      } 
    }
  };

  if (error) {
    return (
      <motion.div
        className="p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <FiXCircle className="text-lg" />
        <div>
          <p className="font-medium">Transaction Error</p>
          <p className="text-sm">{error}</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="rounded-xl shadow-sm p-6"
      style={{ backgroundColor: COLORS.background }}
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.3 }}
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <motion.h2 
          className="text-2xl font-bold flex items-center gap-3"
          style={{ color: COLORS.primary }}
          initial={{ x: -10, opacity: 0 }} 
          animate={{ x: 0, opacity: 1 }} 
          transition={{ delay: 0.1 }}
        >
          <FiTrendingUp className="text-2xl" />
          <span>Sheraton Deposit Records</span>
        </motion.h2>
        
        {onRefresh && (
          <motion.button
            onClick={onRefresh}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm"
            style={{ 
              backgroundColor: COLORS.primary,
              color: '#FFFFFF'
            }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <FiRefreshCw className={loading ? 'animate-spin' : ''} />
            {loading ? 'Refreshing...' : 'Refresh Data'}
          </motion.button>
        )}
      </div>

      {deposits.length === 0 ? (
        <motion.div 
          className="py-12 text-center rounded-lg"
          style={{ backgroundColor: COLORS.cardBg }}
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }}
        >
          <div className="mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-4"
            style={{ backgroundColor: COLORS.primary + '20' }}>
            <FiDollarSign className="text-3xl" style={{ color: COLORS.primary }} />
          </div>
          <h3 className="text-lg font-medium mb-2" style={{ color: COLORS.textDark }}>
            No Deposit History Found
          </h3>
          <p className="text-sm max-w-md mx-auto" style={{ color: COLORS.textLight }}>
            Your deposit records will appear here once you fund your Sheraton investment account
          </p>
        </motion.div>
      ) : (
        <motion.div 
          className="overflow-hidden rounded-lg border"
          style={{ borderColor: COLORS.border }}
          variants={containerVariants} 
          initial="hidden" 
          animate="visible"
        >
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y" style={{ borderColor: COLORS.border }}>
              <thead className="text-left">
                <motion.tr 
                  variants={itemVariants}
                  style={{ backgroundColor: COLORS.cardBg }}
                >
                  <th className="px-6 py-4 text-xs font-medium tracking-wider" style={{ color: COLORS.textLight }}>
                    TRANSACTION
                  </th>
                  <th className="px-6 py-4 text-xs font-medium tracking-wider flex items-center gap-2" style={{ color: COLORS.textLight }}>
                    <FiCalendar />
                    DATE/TIME
                  </th>
                  <th className="px-6 py-4 text-xs font-medium tracking-wider" style={{ color: COLORS.textLight }}>
                    AMOUNT
                  </th>
                  <th className="px-6 py-4 text-xs font-medium tracking-wider" style={{ color: COLORS.textLight }}>
                    STATUS
                  </th>
                </motion.tr>
              </thead>
              <motion.tbody 
                className="divide-y"
                style={{ borderColor: COLORS.border }}
                variants={containerVariants}
              >
                {deposits.map((deposit) => (
                  <motion.tr 
                    key={deposit.id} 
                    className="transition-colors hover:bg-blue-50/50"
                    variants={itemVariants} 
                    whileHover={{ scale: 1.005 }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium" style={{ color: COLORS.textDark }}>
                          {deposit.payment_method || 'Bank Transfer'}
                        </span>
                        {deposit.reference && (
                          <span className="text-xs" style={{ color: COLORS.textLight }}>
                            Ref: {deposit.reference}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: COLORS.textDark }}>
                      {format(new Date(deposit.created_at), 'MMM d, yyyy - h:mm a')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium" style={{ color: COLORS.textDark }}>
                      ₦{deposit.amount?.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={deposit.status} />
                    </td>
                  </motion.tr>
                ))}
              </motion.tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Sheraton Branding */}
      <motion.div 
        className="mt-8 pt-6 border-t text-center"
        style={{ borderColor: COLORS.border }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <p className="text-sm" style={{ color: COLORS.textLight }}>
          Sheraton Investment Platform • Secure Transactions
        </p>
      </motion.div>
    </motion.div>
  )
}