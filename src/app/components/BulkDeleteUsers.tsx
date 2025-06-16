'use client'

import { deleteAllUsersExceptAdmin } from '@/lib/adminUtils'
 import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function BulkDeleteUsers() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{success?: boolean, deletedCount?: number, error?: string}>()
  const router = useRouter()

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete all users except admin? This cannot be undone.')) return
    
    setLoading(true)
    try {
      const response = await deleteAllUsersExceptAdmin('chideranwokoye555@gmail.com')
      setResult(response)
      if (response.success) {
        router.refresh() // Refresh the page to update user list
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 border rounded-lg bg-red-50 border-red-200">
      <h3 className="font-medium text-red-800">Danger Zone</h3>
      <p className="text-sm text-red-600 mb-4">
        This will permanently delete all users except the specified admin account.
      </p>
      
      <button
        onClick={handleDelete}
        disabled={loading}
        className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
      >
        {loading ? 'Processing...' : 'Delete All Non-Admin Users'}
      </button>
      
      {result && (
        <div className={`mt-3 p-3 rounded-md ${result.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          {result.success ? (
            <p>Successfully deleted {result.deletedCount} users.</p>
          ) : (
            <p>Error: {result.error}</p>
          )}
        </div>
      )}
    </div>
  )
}