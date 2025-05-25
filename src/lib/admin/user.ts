// lib/admin/users.ts
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

// Helper function to verify admin access
async function verifyAdmin() {
  const cookieStore =await cookies()
  const userId = cookieStore.get('user_id')?.value

  if (!userId) {
    throw new Error('Authentication required')
  }

  const { data: adminData, error: adminError } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', userId)
    .single()

  if (adminError || !adminData?.is_admin) {
    throw new Error('Admin privileges required')
  }

  return true
}

// Get all users with their information
export async function getAllUsers(): Promise<{ users: FullUserData[], error?: string }> {
  try {
    await verifyAdmin()

    // Get auth users (including email/phone)
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
    if (authError) throw authError

    // Get profile information
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('*')
    
    if (profileError) throw profileError

    // Combine data
    const users = authUsers.users.map(authUser => {
      const profile = profiles.find(p => p.id === authUser.id) || {} as UserProfile
      return {
        auth: {
          id: authUser.id,
          email: authUser.email,
          phone: authUser.phone,
          last_sign_in_at: authUser.last_sign_in_at,
          created_at: authUser.created_at
        },
        profile: {
          id: profile.id,
          email: profile.email,
          phone_number: profile.phone_number,
          first_name: profile.first_name,
          last_name: profile.last_name,
          balance: profile.balance,
          referral_code: profile.referral_code,
          referred_by: profile.referred_by,
          created_at: profile.created_at
        }
      }
    })

    return { users }
  } catch (error) {
    console.error('Error fetching users:', error)
    return { users: [], error: error instanceof Error ? error.message : 'Failed to fetch users' }
  }
}

// Update user password (admin function)
export async function updateUserPassword(
  userId: string, 
  newPassword: string
): Promise<{ success: boolean, error?: string }> {
  try {
    await verifyAdmin()

    const {  error } = await supabase.auth.admin.updateUserById(userId, {
      password: newPassword
    })

    if (error) throw error

    return { success: true }
  } catch (error) {
    console.error('Error updating password:', error)
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

    if (profileError) throw profileError

    // Then delete auth user
    const { error: authError } = await supabase.auth.admin.deleteUser(userId)
    if (authError) throw authError

    return { success: true }
  } catch (error) {
    console.error('Error deleting user:', error)
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

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)

    if (error) throw error

    return { success: true }
  } catch (error) {
    console.error('Error updating profile:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update profile' 
    }
  }
}