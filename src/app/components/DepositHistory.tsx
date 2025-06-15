'use client'

import { motion } from 'framer-motion'
import { 
   FiClock, 
  FiCheckCircle, 
  FiXCircle,
  FiCalendar,
  FiTrendingUp,
  FiRefreshCw,
  FiInfo,
  FiArrowUpRight
} from 'react-icons/fi'
import { format } from 'date-fns'
import { FaNairaSign } from 'react-icons/fa6'

// Enhanced color palette with gradients
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
  border: '#E5E7EB',
  primaryGradient: 'linear-gradient(135deg, #3B82F6 0%, #6366F1 100%)',
  secondaryGradient: 'linear-gradient(135deg, #EC4899 0%, #F43F5E 100%)'
}

type Deposit = {
  id: string;
  created_at: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  payment_method?: string;
  reference?: string;
  currency?: string;
};

type Props = {
  deposits: Deposit[];
  error?: string;
  loading?: boolean;
  onRefresh?: () => void;
  totalDeposits?: number;
  lastUpdated?: string;
};

const StatusBadge = ({ status }: { status: string }) => {
  const statusConfig = {
    pending: {
      icon: <FiClock className="text-yellow-500" size={14} />,
      bg: 'bg-yellow-50',
      text: 'text-yellow-700',
      border: 'border-yellow-200'
    },
    completed: {
      icon: <FiCheckCircle className="text-green-500" size={14} />,
      bg: 'bg-green-50',
      text: 'text-green-700',
      border: 'border-green-200'
    },
    failed: {
      icon: <FiXCircle className="text-red-500" size={14} />,
      bg: 'bg-red-50',
      text: 'text-red-700',
      border: 'border-red-200'
    }
  } as const;
  
  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

  return (
    <motion.div 
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs ${config.bg} ${config.text} ${config.border} border`}
      whileHover={{ scale: 1.05 }}
      transition={{ type: 'spring', stiffness: 400, damping: 10 }}
    >
      {config.icon}
      <span className="capitalize font-medium">{status}</span>
    </motion.div>
  )
}

const StatCard = ({ 
  title, 
  value, 
  icon,
  trend
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down';
}) => {
  return (
    <motion.div 
      className="flex-1 bg-white rounded-xl p-4 shadow-sm border flex items-center gap-4"
      style={{ borderColor: COLORS.border }}
      whileHover={{ y: -2 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <div 
        className="p-3 rounded-lg flex items-center justify-center"
        style={{ 
          background: trend === 'up' ? COLORS.primaryGradient : COLORS.secondaryGradient,
          color: 'white'
        }}
      >
        {icon}
      </div>
      <div>
        <p className="text-xs font-medium" style={{ color: COLORS.textLight }}>{title}</p>
        <p className="text-lg font-bold mt-1" style={{ color: COLORS.textDark }}>{value}</p>
      </div>
    </motion.div>
  )
}

export default function DepositHistory({ 
  deposits, 
  error, 
  loading, 
  onRefresh,
  totalDeposits = 0,
  lastUpdated 
}: Props) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { 
        staggerChildren: 0.05, 
        when: "beforeChildren",
        type: "spring",
        stiffness: 100
      }
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
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring' }}
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
      className="rounded-xl shadow-sm p-6 relative mb-20"
      style={{ backgroundColor: COLORS.background }}
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.4 }}
    >
      {/* Floating decorative elements */}
      <motion.div 
        className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10 blur-xl"
        style={{ backgroundColor: COLORS.primary }}
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.15, 0.1]
        }}
        transition={{ 
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <motion.h2 
          className="text-2xl font-bold flex items-center gap-3"
          style={{ color: COLORS.textDark }}
          initial={{ x: -10, opacity: 0 }} 
          animate={{ x: 0, opacity: 1 }} 
          transition={{ delay: 0.1 }}
        >
          <div 
            className="p-2 rounded-lg flex items-center justify-center"
            style={{ 
              background: COLORS.primaryGradient,
              color: 'white'
            }}
          >
            <FiTrendingUp className="text-xl" />
          </div>
          <span>Deposit Records</span>
        </motion.h2>
        
        <div className="flex items-center gap-3">
          {lastUpdated && (
            <motion.p 
              className="text-xs hidden sm:block"
              style={{ color: COLORS.textLight }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Last updated: {format(new Date(lastUpdated), 'MMM d, h:mm a')}
            </motion.p>
          )}
          
          {onRefresh && (
            <motion.button
              onClick={onRefresh}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
              style={{ 
                backgroundColor: COLORS.primary,
                color: '#FFFFFF'
              }}
              whileHover={{ scale: 1.03, boxShadow: `0 4px 12px ${COLORS.primary}40` }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <FiRefreshCw className={loading ? 'animate-spin' : ''} />
              {loading ? 'Refreshing...' : 'Refresh'}
            </motion.button>
          )}
        </div>
      </div>

      {/* Stats Overview */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <StatCard 
          title="Total Deposits" 
          value={`₦${totalDeposits.toLocaleString()}`} 
          icon={<FaNairaSign size={18} />}
          trend="up"
        />
        <StatCard 
          title="Completed" 
          value={deposits.filter(d => d.status === 'completed').length.toString()} 
          icon={<FiCheckCircle size={18} />}
          trend="up"
        />
        <StatCard 
          title="Pending/Failed" 
          value={deposits.filter(d => d.status !== 'completed').length.toString()} 
          icon={<FiInfo size={18} />}
          trend="down"
        />
      </motion.div>

      {deposits.length === 0 ? (
        <motion.div 
          className="py-12 text-center rounded-lg"
          style={{ backgroundColor: COLORS.cardBg }}
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-4"
            style={{ 
              background: COLORS.primaryGradient,
              color: 'white'
            }}>
            <FaNairaSign className="text-3xl" />
          </div>
          <h3 className="text-lg font-medium mb-2" style={{ color: COLORS.textDark }}>
            No Deposit History Found
          </h3>
          <p className="text-sm max-w-md mx-auto" style={{ color: COLORS.textLight }}>
            Your deposit records will appear here once transactions are completed
          </p>
          <motion.button
            className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
            style={{ 
              backgroundColor: COLORS.primary,
              color: '#FFFFFF'
            }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
          >
            Make a Deposit
            <FiArrowUpRight />
          </motion.button>
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
                  <th className="px-6 py-4 text-xs font-medium tracking-wider uppercase" style={{ color: COLORS.textLight }}>
                    Transaction Details
                  </th>
                  <th className="px-6 py-4 text-xs font-medium tracking-wider uppercase flex items-center gap-2" style={{ color: COLORS.textLight }}>
                    <FiCalendar />
                    Date/Time
                  </th>
                  <th className="px-6 py-4 text-xs font-medium tracking-wider uppercase" style={{ color: COLORS.textLight }}>
                    Amount
                  </th>
                  <th className="px-6 py-4 text-xs font-medium tracking-wider uppercase" style={{ color: COLORS.textLight }}>
                    Status
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
                    className="transition-colors hover:bg-blue-50/30"
                    variants={itemVariants} 
                    whileHover={{ 
                      backgroundColor: '#F8FAFC',
                      transition: { duration: 0.1 }
                    }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium flex items-center gap-2" style={{ color: COLORS.textDark }}>
                          {deposit.payment_method || 'Bank Transfer'}
                        </span>
                        {deposit.reference && (
                          <span className="text-xs mt-1" style={{ color: COLORS.textLight }}>
                            Ref: {deposit.reference}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-sm" style={{ color: COLORS.textDark }}>
                          {format(new Date(deposit.created_at), 'MMM d, yyyy')}
                        </span>
                        <span className="text-xs mt-1" style={{ color: COLORS.textLight }}>
                          {format(new Date(deposit.created_at), 'h:mm a')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium" style={{ color: COLORS.textDark }}>
                          ₦{deposit.amount?.toLocaleString()}
                        </span>
                        {deposit.currency && deposit.currency !== 'NGN' && (
                          <span className="text-xs px-2 py-0.5 rounded" style={{ 
                            backgroundColor: COLORS.primary + '20',
                            color: COLORS.primary
                          }}>
                            {deposit.currency}
                          </span>
                        )}
                      </div>
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

      {/* Sheraton Branding with enhanced animation */}
      <motion.div 
        className="mt-8 pt-6 border-t text-center relative overflow-hidden"
        style={{ borderColor: COLORS.border }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <motion.div 
          className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-30"
          animate={{
            x: ['-100%', '100%']
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'linear'
          }}
        />
        <p className="text-sm relative z-10" style={{ color: COLORS.textLight }}>
          Sheraton Investment Platform • Secure Transactions • {new Date().getFullYear()}
        </p>
      </motion.div>
    </motion.div>
  )
}