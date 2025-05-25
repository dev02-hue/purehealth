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

  if (loading) return <div>Loading...</div>

  return (
    <div className="mt-8 mb-36">
      <h2 className="text-xl font-bold mb-4">Pending Withdrawals</h2>
      
      {error && (
        <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}
      
      {pendingWithdrawals.length === 0 ? (
        <p>No pending withdrawals</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 border">Date</th>
                <th className="py-2 px-4 border">User ID</th>
                <th className="py-2 px-4 border">Amount</th>
                <th className="py-2 px-4 border">Bank</th>
                <th className="py-2 px-4 border">Account</th>
                <th className="py-2 px-4 border">Action</th>
              </tr>
            </thead>
            <tbody>
              {pendingWithdrawals.map((withdrawal) => (
                <tr key={withdrawal.id} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border">
                    {new Date(withdrawal.created_at).toLocaleString()}
                  </td>
                  <td className="py-2 px-4 border">{withdrawal.user_id}</td>
                  <td className="py-2 px-4 border">
                    ₦{withdrawal.amount.toLocaleString()}
                  </td>
                  <td className="py-2 px-4 border">{withdrawal.bank_name}</td>
                  <td className="py-2 px-4 border">{withdrawal.account_number}</td>
                  <td className="py-2 px-4 border">
                    <button
                      onClick={() => handleApprove(withdrawal.id)}
                      disabled={approvingId === withdrawal.id}
                      className={`px-3 py-1 rounded text-white ${
                        approvingId === withdrawal.id
                          ? 'bg-green-300'
                          : 'bg-green-600 hover:bg-green-700'
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