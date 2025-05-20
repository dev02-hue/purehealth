'use client'

 
import { signOut } from '@/lib/signOut'
import { useRouter } from 'next/navigation'

export function SignOutButton() {
  const router = useRouter()

  const handleSignOut = async () => {
    try {
      const response = await signOut()
      
      if (response.success) {
        // Clear client-side storage
        if (typeof window !== 'undefined') {
          localStorage.clear()
          sessionStorage.clear()
        }
        
        // Redirect if specified
        router.push(response.clientActions?.redirectTo || '/login')
      } else {
        alert(response.error || 'Sign out failed')
      }
    } catch (error) {
      console.error('Sign out error:', error)
      alert('An error occurred during sign out')
    }
  }

  return (
    <button 
      onClick={handleSignOut}
      className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
    >
      Sign Out
    </button>
  )
}