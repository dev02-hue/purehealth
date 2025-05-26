'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { approveTransaction } from '@/lib/approve/approve'

type Transaction = {
  id: string
  created_at: string
  user_id: string
  user_email: string
  amount: number
  reference: string
  status: 'pending' | 'completed' | 'rejected'
  admin_approved: boolean | null
}

export default function DepositDashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [rejectNote, setRejectNote] = useState('')
  const [selectedTx, setSelectedTx] = useState<string | null>(null)

  useEffect(() => {
    fetchPendingDeposits()
    
    const channel = supabase
      .channel('transactions_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'transactions'
      }, (payload) => {
        console.log('Realtime change detected:', payload)
        fetchPendingDeposits()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const fetchPendingDeposits = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('type', 'deposit')
        .order('created_at', { ascending: false })

      if (!error) {
        setTransactions(data || [])
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleApprove(transactionId: number) {
    try {
      await approveTransaction(transactionId);
      alert('Transaction approved successfully!');
    } catch (error) {
      if (error instanceof Error) {
        alert(`Approval failed: ${error.message}`);
      } else {
        alert('Approval failed: An unknown error occurred.');
      }
    }
  }

  const handleReject = async (transactionId: string) => {
    try {
      const response = await fetch('/api/admin/reject', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          transactionId,
          adminNotes: rejectNote 
        }),
      })

      if (response.ok) {
        setSelectedTx(null)
        setRejectNote('')
        fetchPendingDeposits()
      }
    } catch (error) {
      console.error('Error in handleReject:', error)
    }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto bg-white dark:bg-gray-900">
      <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100">Deposit Approvals</h1>
      
      {loading ? (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 dark:border-blue-400"></div>
          <span className="ml-2 text-gray-600 dark:text-gray-300">Loading transactions...</span>
        </div>
      ) : (
        <>
          <div className="mb-4">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Showing {transactions.length} transactions
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
              <thead className="bg-gray-100 dark:bg-gray-700">
                <tr>
                  <th className="py-3 px-4 text-left text-gray-800 dark:text-gray-100">Date</th>
                  <th className="py-3 px-4 text-left text-gray-800 dark:text-gray-100">Phone num</th>
                  <th className="py-3 px-4 text-left text-gray-800 dark:text-gray-100">Amount</th>
                  <th className="py-3 px-4 text-left text-gray-800 dark:text-gray-100">Reference</th>
                  <th className="py-3 px-4 text-left text-gray-800 dark:text-gray-100">Status</th>
                  <th className="py-3 px-4 text-left text-gray-800 dark:text-gray-100">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {transactions.length > 0 ? (
                  transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-300">{new Date(tx.created_at).toLocaleString()}</td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-300">{tx.user_email}</td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-300">₦{tx.amount.toLocaleString()}</td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-300">{tx.reference}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          tx.status === 'completed' ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300' :
                          tx.status === 'rejected' ? 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300' :
                          'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300'
                        }`}>
                          {tx.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 space-x-2">
                        {tx.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(Number(tx.id))}
                              className="bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => setSelectedTx(tx.id)}
                              className="bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-4 text-center text-gray-500 dark:text-gray-400">
                      No transactions found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Reject Modal */}
      {selectedTx && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">Reject Deposit</h2>
            <textarea
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              placeholder="Enter reason for rejection..."
              className="w-full p-2 border dark:border-gray-600 rounded mb-4 h-24 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              required
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setSelectedTx(null)}
                className="px-4 py-2 border dark:border-gray-600 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={() => handleReject(selectedTx)}
                className="bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white px-4 py-2 rounded"
                disabled={!rejectNote.trim()}
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}