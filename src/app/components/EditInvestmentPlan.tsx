'use client'

import { getAllInvestmentPlans, InvestmentPlan, updateInvestmentPlan } from '@/lib/investmentPlans'
import { useState, useEffect } from 'react'
 
export default function InvestmentPlansManager() {
  const [plans, setPlans] = useState<InvestmentPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingPlan, setEditingPlan] = useState<InvestmentPlan | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  // Fetch all investment plans
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true)
        const result = await getAllInvestmentPlans()
        
        if ('error' in result) {
          setError(result.error)
        } else {
          setPlans(result)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch plans')
      } finally {
        setLoading(false)
      }
    }

    fetchPlans()
  }, [])

  // Handle plan update
  const handleUpdate = async (updatedData: Partial<InvestmentPlan> & { id: number }) => {
    try {
      setLoading(true)
      const result = await updateInvestmentPlan(updatedData)
      
      if ('error' in result) {
        // setError(result.error)
      } else {
        // Update the local state with the modified plan
        setPlans(plans.map(plan => 
          plan.id === updatedData.id ? { ...plan, ...result.data[0] } : plan
        ))
        setEditingPlan(null)
        setIsEditing(false)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update plan')
    } finally {
      setLoading(false)
    }
  }

  // Start editing a plan
  const startEditing = (plan: InvestmentPlan) => {
    setEditingPlan(plan)
    setIsEditing(true)
  }

  // Cancel editing
  const cancelEditing = () => {
    setEditingPlan(null)
    setIsEditing(false)
  }

  if (loading && !isEditing) {
    return <div className="p-4">Loading investment plans...</div>
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>
  }

  return (
    <div className="container mx-auto p-4 mb-20">
      <h1 className="text-2xl font-bold mb-6">Investment Plans Management</h1>
      
      {isEditing && editingPlan ? (
        <EditPlanForm 
          plan={editingPlan} 
          onUpdate={handleUpdate} 
          onCancel={cancelEditing}
          isLoading={loading}
        />
      ) : (
        <PlanList 
          plans={plans} 
          onEdit={startEditing} 
          isLoading={loading}
        />
      )}
    </div>
  )
}

// Component to display the list of plans
function PlanList({ 
  plans, 
  onEdit,
  isLoading 
}: { 
  plans: InvestmentPlan[], 
  onEdit: (plan: InvestmentPlan) => void,
  isLoading: boolean
}) {
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {plans.map(plan => (
          <div key={plan.id} className="border rounded-lg p-4 shadow-sm">
            <h2 className="text-xl font-semibold mb-2">{plan.name}</h2>
            <div className="space-y-2">
              <p><span className="font-medium">Price:</span> ${plan.price}</p>
              <p><span className="font-medium">Daily Income:</span> ${plan.daily_income}</p>
              <p><span className="font-medium">Total Income:</span> ${plan.total_income}</p>
              <p><span className="font-medium">Duration:</span> {plan.duration}</p>
              <p><span className="font-medium">Risk:</span> {plan.risk}</p>
              {plan.volatility && <p><span className="font-medium">Volatility:</span> {plan.volatility}%</p>}
              <p className="text-sm text-gray-600">{plan.description}</p>
            </div>
            <button
              onClick={() => onEdit(plan)}
              disabled={isLoading}
              className="mt-4 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded disabled:bg-blue-300"
            >
              {isLoading ? 'Processing...' : 'Edit Plan'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

// Component for editing a plan
function EditPlanForm({ 
  plan, 
  onUpdate, 
  onCancel,
  isLoading
}: { 
  plan: InvestmentPlan, 
  onUpdate: (data: Partial<InvestmentPlan> & { id: number }) => void,
  onCancel: () => void,
  isLoading: boolean
}) {
  const [formData, setFormData] = useState<Partial<InvestmentPlan>>(plan)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'daily_income' || name === 'total_income' || name === 'volatility' 
        ? parseFloat(value) 
        : value
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onUpdate({ ...formData, id: plan.id })
  }

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Edit Investment Plan</h2>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name || ''}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
            <input
              type="number"
              name="price"
              value={formData.price || ''}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              step="0.01"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Daily Income</label>
            <input
              type="number"
              name="daily_income"
              value={formData.daily_income || ''}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              step="0.01"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Total Income</label>
            <input
              type="number"
              name="total_income"
              value={formData.total_income || ''}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              step="0.01"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
            <input
              type="text"
              name="duration"
              value={formData.duration || ''}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Risk Level</label>
            <select
              name="risk"
              value={formData.risk || ''}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Volatility (%)</label>
            <input
              type="number"
              name="volatility"
              value={formData.volatility || ''}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              step="0.1"
            />
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            name="description"
            value={formData.description || ''}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            rows={3}
            required
          />
        </div>
        
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded disabled:bg-gray-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded disabled:bg-blue-300"
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  )
}