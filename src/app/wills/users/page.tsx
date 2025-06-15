// app/admin/users/page.tsx

import AdminUsersTable from "@/app/components/AdminUsersTable"
import { checkAdminAndFetchUsers } from "@/lib/adminUtils"

 

export default async function AdminUsersPage() {
  const result = await checkAdminAndFetchUsers()

  if ('error' in result) {
    return (
      <div className="p-6 text-red-600">
        {result.error}
      </div>
    )
  }

  if (!result.isAdmin) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p>{result.message}</p>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6">
      <h1 className="text-2xl font-bold mb-6">User Management</h1>
      <AdminUsersTable initialUsers={result.users} />
      </div>
  )
}