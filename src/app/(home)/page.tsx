 import React from 'react'
import DashboardNav from '../components/layout/DashboardNav'
import DashboardBody from '../components/layout/DashboardBody'
import InvestmentPlans from '../components/layout/InvestmentPlans'
 
 const page = () => {
   return (
     <div>
      <DashboardNav />
      <DashboardBody />
      <InvestmentPlans />
     </div>
   )
 }
 
 export default page