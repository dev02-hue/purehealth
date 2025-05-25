'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { Nav } from './nav'

export default function NavWrapper() {
  const [activeTab, setActiveTab] = useState('home')
  const pathname = usePathname()

  console.log('Current pathname:', pathname) // Debugging

  // Don't show Nav on login, signup, or admin pages
  const hideNav = pathname === '/login' || pathname === '/signup' || pathname === '/admin'

  if (hideNav) return null

  return <Nav activeTab={activeTab} setActiveTab={setActiveTab} />
}
