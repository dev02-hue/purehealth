import { BulkDeleteUsers } from '@/app/components/BulkDeleteUsers'
import DepositDashboard from '@/app/components/DepositDashboard'
import React from 'react'

const page = () => {
  return (
    <div>
      <BulkDeleteUsers />
      <DepositDashboard />
</div>
  )
}

export default page