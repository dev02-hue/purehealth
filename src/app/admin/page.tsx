import React from 'react'
import DepositDashboard from '../components/DepositDashboard'
import AdminWithdrawalApproval from '../components/AdminWithdrawalApproval/AdminWithdrawalApproval'
  
const page = () => {
  return (
    <div>
       <DepositDashboard />
       <AdminWithdrawalApproval />
    </div>
  )
}

export default page