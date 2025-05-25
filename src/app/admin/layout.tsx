// app/admin/layout.tsx
import Link from "next/link";
import { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white p-4 space-y-4">
        <h2 className="text-2xl font-bold mb-6">Admin Panel</h2>
        <nav className="space-y-2">
          <Link href="/admin/users" className="block hover:bg-gray-700 px-4 py-2 rounded">
            All Users
          </Link>
          <Link href="/admin/deposits" className="block hover:bg-gray-700 px-4 py-2 rounded">
            All Deposits
          </Link>
          <Link href="/admin/withdrawals" className="block hover:bg-gray-700 px-4 py-2 rounded">
            All Withdrawals
          </Link>
          <Link href="/admin/reports" className="block hover:bg-gray-700 px-4 py-2 rounded">
            Reports
          </Link>
          <Link href="/admin/settings" className="block hover:bg-gray-700 px-4 py-2 rounded">
            Settings
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-gray-100 p-6 overflow-auto">
        {children}
      </main>
    </div>
  );
}
