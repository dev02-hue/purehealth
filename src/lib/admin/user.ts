'use server'

import { supabase } from '@/lib/supabaseClient'
import { cookies } from 'next/headers'

// Type definitions
interface UserProfile {
  id: string
  email?: string
  phone_number?: string
  first_name: string
  last_name: string
  balance: number
  referral_code: string
  referred_by: string | null
  created_at: string
  is_admin?: boolean
}

interface FullUserData {
  auth: {
    id: string
    email?: string
    phone?: string
    last_sign_in_at?: string
    created_at: string
  }
  profile: UserProfile
  password?: string // Only available for new passwords
}

// Improved verifyAdmin function with better error handling
async function verifyAdmin() {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('user_id')?.value

    if (!userId) {
      console.error('Admin verification failed: No user_id cookie found')
      throw new Error('Authentication required - Please log in')
    }

    const { data: adminData, error: adminError } = await supabase
      .from('profiles')
      .select('is_admin, email')
      .eq('id', userId)
      .single()

    if (adminError) {
      console.error('Database error during admin verification:', adminError)
      throw new Error('Error verifying admin privileges')
    }

    console.log(`Admin check for user ${adminData?.email}:`, adminData?.is_admin ? 'ADMIN' : 'NOT ADMIN')

    if (!adminData?.is_admin) {
      throw new Error('Admin privileges required - Your account is not authorized')
    }

    return true
  } catch (error) {
    console.error('Admin verification failed:', error)
    throw error
  }
}

// Get all users with their information
export async function getAllUsers(): Promise<{ users: FullUserData[], error?: string }> {
  try {
    await verifyAdmin()

    // Get auth users (including email/phone)
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
    if (authError) {
      console.error('Error fetching auth users:', authError)
      throw authError
    }

    // Get profile information
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('*')
    
    if (profileError) {
      console.error('Error fetching profiles:', profileError)
      throw profileError
    }

    // Combine data more efficiently
    const users = authUsers.users.map(authUser => {
      const profile = profiles.find(p => p.id === authUser.id) || {
        id: authUser.id,
        first_name: '',
        last_name: '',
        balance: 0,
        referral_code: '',
        referred_by: null,
        created_at: new Date().toISOString()
      } as UserProfile

      return {
        auth: {
          id: authUser.id,
          email: authUser.email,
          phone: authUser.phone,
          last_sign_in_at: authUser.last_sign_in_at,
          created_at: authUser.created_at
        },
        profile: {
          ...profile,
          email: profile.email || authUser.email,
          phone_number: profile.phone_number || authUser.phone
        }
      }
    })

    return { users }
  } catch (error) {
    console.error('Error in getAllUsers:', error)
    return { 
      users: [], 
      error: error instanceof Error ? error.message : 'Failed to fetch users' 
    }
  }
}

// Update user password (admin function)
export async function updateUserPassword(
  userId: string, 
  newPassword: string
): Promise<{ success: boolean, error?: string }> {
  try {
    await verifyAdmin()

    const { error } = await supabase.auth.admin.updateUserById(userId, {
      password: newPassword
    })

    if (error) {
      console.error('Password update error:', error)
      throw error
    }

    console.log(`Password updated for user ${userId}`)
    return { success: true }
  } catch (error) {
    console.error('Error in updateUserPassword:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update password' 
    }
  }
}

// Delete user (admin function)
export async function deleteUser(userId: string): Promise<{ success: boolean, error?: string }> {
  try {
    await verifyAdmin()

    // First delete profile data
    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId)

    if (profileError) {
      console.error('Profile deletion error:', profileError)
      throw profileError
    }

    // Then delete auth user
    const { error: authError } = await supabase.auth.admin.deleteUser(userId)
    if (authError) {
      console.error('Auth user deletion error:', authError)
      throw authError
    }

    console.log(`Successfully deleted user ${userId}`)
    return { success: true }
  } catch (error) {
    console.error('Error in deleteUser:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to delete user' 
    }
  }
}

// Update user profile information
export async function updateUserProfile(
  userId: string,
  updates: Partial<UserProfile>
): Promise<{ success: boolean, error?: string }> {
  try {
    await verifyAdmin()

    // Prevent updating admin status through this endpoint
    if ('is_admin' in updates) {
      console.warn('Attempt to modify admin status through updateUserProfile')
      throw new Error('Admin status can only be modified through dedicated endpoint')
    }

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)

    if (error) {
      console.error('Profile update error:', error)
      throw error
    }

    console.log(`Profile updated for user ${userId}`)
    return { success: true }
  } catch (error) {
    console.error('Error in updateUserProfile:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update profile' 
    }
  }
}

// Additional function to update admin status
export async function updateAdminStatus(
  userId: string,
  isAdmin: boolean
): Promise<{ success: boolean, error?: string }> {
  try {
    await verifyAdmin()

    const { error } = await supabase
      .from('profiles')
      .update({ is_admin: isAdmin })
      .eq('id', userId)

    if (error) throw error

    console.log(`Admin status updated for user ${userId}: ${isAdmin ? 'ADMIN' : 'NOT ADMIN'}`)
    return { success: true }
  } catch (error) {
    console.error('Error updating admin status:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update admin status' 
    }
  }
}