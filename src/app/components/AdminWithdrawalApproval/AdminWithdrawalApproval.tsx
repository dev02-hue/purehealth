// components/AdminWithdrawalApproval.tsx
'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { approveWithdrawal } from '@/lib/withdrawal'
import { Withdrawal } from '@/types/withdrawal'

export default function AdminWithdrawalApproval() {
  const [pendingWithdrawals, setPendingWithdrawals] = useState<Withdrawal[]>([])
  const [loading, setLoading] = useState(true)
  const [approvingId, setApprovingId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPendingWithdrawals = async () => {
      try {
        const { data, error } = await supabase
          .from('withdrawals')
          .select('*')
          .eq('status', 'pending')
          .order('created_at', { ascending: true })

        if (error) throw error

        setPendingWithdrawals(data || [])
      } catch (error) {
        console.error('Error fetching pending withdrawals:', error)
        setError('Failed to load withdrawals')
      } finally {
        setLoading(false)
      }
    }

    fetchPendingWithdrawals()
  }, [])

  const handleApprove = async (withdrawalId: number) => {
    setApprovingId(withdrawalId)
    setError(null)
    try {
      const { success, error } = await approveWithdrawal(withdrawalId)
      
      if (!success) {
        throw new Error(error || 'Failed to approve withdrawal')
      }

      // Refresh the list after approval
      setPendingWithdrawals(prev => 
        prev.filter(w => w.id !== withdrawalId)
      )
    } catch (err: unknown) {
      console.error('Approval failed:', err)
      setError(err instanceof Error ? err.message : 'Failed to approve withdrawal')
    } finally {
      setApprovingId(null)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-32">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 dark:border-blue-400"></div>
      <span className="ml-2 text-gray-600 dark:text-gray-300">Loading...</span>
    </div>
  )

  return (
    <div className="mt-8 mb-36 bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">Pending Withdrawals</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 rounded border border-red-200 dark:border-red-800">
          {error}
        </div>
      )}
      
      {pendingWithdrawals.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-400">No pending withdrawals</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white dark:bg-gray-800 border dark:border-gray-700">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-700">
                <th className="py-2 px-4 border dark:border-gray-700 text-gray-800 dark:text-gray-300">Date</th>
                <th className="py-2 px-4 border dark:border-gray-700 text-gray-800 dark:text-gray-300">User ID</th>
                <th className="py-2 px-4 border dark:border-gray-700 text-gray-800 dark:text-gray-300">Amount</th>
                <th className="py-2 px-4 border dark:border-gray-700 text-gray-800 dark:text-gray-300">Fee</th>
                <th className="py-2 px-4 border dark:border-gray-700 text-gray-800 dark:text-gray-300">Bank</th>
                <th className="py-2 px-4 border dark:border-gray-700 text-gray-800 dark:text-gray-300">Account</th>
                <th className="py-2 px-4 border dark:border-gray-700 text-gray-800 dark:text-gray-300">Action</th>
              </tr>
            </thead>
            <tbody>
              {pendingWithdrawals.map((withdrawal) => (
                <tr 
                  key={withdrawal.id} 
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                >
                  <td className="py-2 px-4 border dark:border-gray-700 text-gray-600 dark:text-gray-300">
                    {new Date(withdrawal.created_at).toLocaleString()}
                  </td>
                  <td className="py-2 px-4 border dark:border-gray-700 text-gray-600 dark:text-gray-300">
                    {withdrawal.user_id}
                  </td>
                  <td className="py-2 px-4 border dark:border-gray-700 text-gray-600 dark:text-gray-300">
                    ₦{withdrawal.amount.toLocaleString()}
                  </td>
                  <td className="py-2 px-4 border dark:border-gray-700 text-gray-600 dark:text-gray-300">
                    {withdrawal.fee}
                  </td>
                  <td className="py-2 px-4 border dark:border-gray-700 text-gray-600 dark:text-gray-300">
                    {withdrawal.bank_name}
                  </td>
                  <td className="py-2 px-4 border dark:border-gray-700 text-gray-600 dark:text-gray-300">
                    {withdrawal.account_number}
                  </td>
                  <td className="py-2 px-4 border dark:border-gray-700">
                    <button
                      onClick={() => handleApprove(withdrawal.id)}
                      disabled={approvingId === withdrawal.id}
                      className={`px-3 py-1 rounded text-white ${
                        approvingId === withdrawal.id
                          ? 'bg-green-300 dark:bg-green-700'
                          : 'bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700'
                      }`}
                    >
                      {approvingId === withdrawal.id ? 'Approving...' : 'Approve'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}