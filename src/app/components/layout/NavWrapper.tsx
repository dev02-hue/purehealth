'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { Nav } from './nav'

export default function NavWrapper() {
  const [activeTab, setActiveTab] = useState('home')
  const pathname = usePathname()

  // Don't show Nav on login or signup pages
  const hideNav = pathname === '/login' || pathname === '/signup'

  if (hideNav) return null

  return <Nav activeTab={activeTab} setActiveTab={setActiveTab} />
}

