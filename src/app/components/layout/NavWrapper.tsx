'use client'

import { useState } from 'react'
import { Nav } from './nav'

export default function NavWrapper() {
  const [activeTab, setActiveTab] = useState('home')

  return <Nav activeTab={activeTab} setActiveTab={setActiveTab} />
}
