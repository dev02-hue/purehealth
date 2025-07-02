/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { processEarnings } from '@/lib/investment-plan'
import { useState } from 'react'
 
export default function ManualEarningsTrigger() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleTrigger = async () => {
    setLoading(true)
    try {
      const data = await processEarnings()
      setResult(data)
    } catch (error) {
      console.error('[Manual Trigger Error]:', error)
      setResult({ success: false, message: 'Error triggering earnings processor' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 bg-white shadow rounded max-w-md mx-auto text-center">
      <button
        onClick={handleTrigger}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Processing...' : 'Manually Trigger Earnings'}
      </button>

      {result && (
        <div className="mt-4 text-left">
          <p className="font-bold">Result:</p>
          <pre className="bg-gray-100 p-2 rounded text-sm whitespace-pre-wrap">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}
