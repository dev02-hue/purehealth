 // app/bank-accounts/page.tsx
'use client'

import { BankAccount, createBankAccount, deleteBankAccount, getActiveBankAccount, getBankAccounts, updateBankAccount } from '@/lib/bankAccounts'
import { useState, useEffect } from 'react'
 

export default function BankAccountsManager() {
  const [accounts, setAccounts] = useState<BankAccount[]>([])
  const [activeAccount, setActiveAccount] = useState<BankAccount | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<Omit<BankAccount, 'id' | 'created_at' | 'updated_at'>>({
    bank_name: '',
    account_number: '',
    account_name: '',
    is_active: false
  })
  const [editId, setEditId] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [accountsResult, activeAccountResult] = await Promise.all([
        getBankAccounts(),
        getActiveBankAccount()
      ])

      if ('error' in accountsResult) {
        throw new Error(accountsResult.error)
      }
      
      setAccounts(accountsResult)
      setActiveAccount(activeAccountResult)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    try {
      let result
      if (editId) {
        result = await updateBankAccount(editId, formData)
      } else {
        result = await createBankAccount(formData)
      }

      if ('error' in result) {
        throw new Error(result.error)
      }

      setFormData({
        bank_name: '',
        account_number: '',
        account_name: '',
        is_active: false
      })
      setEditId(null)
      await fetchData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Operation failed')
    }
  }

  const handleEdit = (account: BankAccount) => {
    setFormData({
      bank_name: account.bank_name,
      account_number: account.account_number,
      account_name: account.account_name,
      is_active: account.is_active
    })
    setEditId(account.id!)
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this account?')) {
      setError(null)
      const result = await deleteBankAccount(id)
      if (result.error) {
        setError(result.error)
      } else {
        await fetchData()
      }
    }
  }

  const handleSetActive = async (id: string) => {
    try {
      // First deactivate all accounts
      await Promise.all(
        accounts.map(account => 
          updateBankAccount(account.id!, { is_active: false })
        )
      )
      
      // Then activate the selected one
      const result = await updateBankAccount(id, { is_active: true })
      
      if ('error' in result) {
        throw new Error(result.error)
      }
      
      await fetchData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set active account')
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Bank Account Management</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {activeAccount && (
        <div className="bg-green-50 border border-green-200 p-4 rounded mb-6">
          <h2 className="text-lg font-semibold mb-2">Active Bank Account</h2>
          <p><strong>Bank:</strong> {activeAccount.bank_name}</p>
          <p><strong>Account Number:</strong> {activeAccount.account_number}</p>
          <p><strong>Account Name:</strong> {activeAccount.account_name}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">
            {editId ? 'Edit Account' : 'Add New Account'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Bank Name</label>
              <input
                type="text"
                name="bank_name"
                value={formData.bank_name}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Account Number</label>
              <input
                type="text"
                name="account_number"
                value={formData.account_number}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Account Name</label>
              <input
                type="text"
                name="account_name"
                value={formData.account_name}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                name="is_active"
                id="is_active"
                checked={formData.is_active}
                onChange={handleInputChange}
                className="mr-2"
              />
              <label htmlFor="is_active" className="text-sm font-medium">
                Set as active account
              </label>
            </div>
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              {editId ? 'Update Account' : 'Add Account'}
            </button>
            {editId && (
              <button
                type="button"
                onClick={() => {
                  setEditId(null)
                  setFormData({
                    bank_name: '',
                    account_number: '',
                    account_name: '',
                    is_active: false
                  })
                }}
                className="ml-2 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            )}
          </form>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Bank Accounts</h2>
          {accounts.length === 0 ? (
            <p>No bank accounts found</p>
          ) : (
            <div className="space-y-4">
              {accounts.map(account => (
                <div
                  key={account.id}
                  className={`border rounded p-4 ${account.is_active ? 'bg-green-50 border-green-200' : ''}`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{account.bank_name}</h3>
                      <p className="text-sm text-gray-600">{account.account_number}</p>
                      <p className="text-sm">{account.account_name}</p>
                      {account.is_active && (
                        <span className="inline-block mt-1 px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                          Active
                        </span>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(account)}
                        className="text-blue-500 hover:text-blue-700 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(account.id!)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Delete
                      </button>
                      {!account.is_active && (
                        <button
                          onClick={() => handleSetActive(account.id!)}
                          className="text-green-500 hover:text-green-700 text-sm"
                        >
                          Set Active
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}