import React from 'react'
import { SignOutButton } from '../components/auth/SignOutButton'
import ThemeToggle from '../components/layout/ThemeToggle'

const page = () => {
  return (
    <div>
      <SignOutButton />
      <ThemeToggle />
    </div>
  )
}

export default page