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

  console.log('Component rendering. Current state:', {
    transactions,
    loading,
    rejectNote,
    selectedTx
  })

  useEffect(() => {
    console.log('useEffect running - initial mount')
    fetchPendingDeposits()
    
    // Set up real-time subscription
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

    console.log('Supabase channel subscribed:', channel)

    return () => {
      console.log('Cleaning up - unsubscribing from channel')
      supabase.removeChannel(channel)
    }
  }, [])

  const fetchPendingDeposits = async () => {
    console.log('fetchPendingDeposits called')
    setLoading(true)
    try {
      console.log('Fetching transactions from Supabase...')
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('type', 'deposit')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching transactions:', error)
      } else {
        console.log('Successfully fetched transactions:', data)
        setTransactions(data || [])
      }
    } catch (err) {
      console.error('Unexpected error in fetchPendingDeposits:', err)
    } finally {
      setLoading(false)
      console.log('fetchPendingDeposits completed')
    }
  }

  async function handleApprove(transactionId: number) {
    try {
      await approveTransaction(transactionId);
      alert('Transaction approved successfully!');
      // Refresh your transactions list
    } catch (error) {
      if (error instanceof Error) {
        alert(`Approval failed: ${error.message}`);
      } else {
        alert('Approval failed: An unknown error occurred.');
      }
    }
  }
  // In your button onClick:
  

  const handleReject = async (transactionId: string) => {
    console.log('Rejecting transaction:', transactionId, 'with note:', rejectNote)
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

      console.log('Rejection response:', response)

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Rejection failed with status:', response.status, 'Error:', errorData)
        throw new Error('Rejection failed')
      }

      console.log('Rejection successful')
      setSelectedTx(null)
      setRejectNote('')
    } catch (error) {
      console.error('Error in handleReject:', error)
    }
  }

  console.log('Rendering UI with', transactions.length, 'transactions')

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Deposit Approvals</h1>
      
      {loading ? (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          <span className="ml-2">Loading transactions...</span>
        </div>
      ) : (
        <>
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              Showing {transactions.length} transactions
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg overflow-hidden">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-3 px-4 text-left">Date</th>
                  <th className="py-3 px-4 text-left">Phone num</th>
                  <th className="py-3 px-4 text-left">Amount</th>
                  <th className="py-3 px-4 text-left">Reference</th>
                  <th className="py-3 px-4 text-left">Status</th>
                  <th className="py-3 px-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {transactions.length > 0 ? (
                  transactions.map((tx) => (
                    <tr key={tx.id}>
                      <td className="py-3 px-4">{new Date(tx.created_at).toLocaleString()}</td>
                      <td className="py-3 px-4">{tx.user_email}</td>
                      <td className="py-3 px-4">₦{tx.amount.toLocaleString()}</td>
                      <td className="py-3 px-4">{tx.reference}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          tx.status === 'completed' ? 'bg-green-100 text-green-800' :
                          tx.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {tx.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 space-x-2">
                        {tx.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(Number(tx.id))}
                              className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => setSelectedTx(tx.id)}
                              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
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
                    <td colSpan={6} className="py-4 text-center text-gray-500">
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Reject Deposit</h2>
            <textarea
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              placeholder="Enter reason for rejection..."
              className="w-full p-2 border rounded mb-4 h-24"
              required
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setSelectedTx(null)}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>
              <button
                onClick={() => handleReject(selectedTx)}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
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