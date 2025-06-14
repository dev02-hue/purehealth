// app/deposit-history/page.tsx or wherever you're rendering this
import { getDepositHistory } from '@/lib/deposit'
import DepositHistory from '../components/DepositHistory'
// import DepositHistory from '@/components/DepositHistory'

export default async function DepositHistoryPage() {
  const { deposits, error } = await getDepositHistory()

  console.log("Fetched deposits:", deposits) // ✅ Debug log
  console.log("Error:", error) // ✅ Debug log

  return <DepositHistory deposits={deposits}   />
}
