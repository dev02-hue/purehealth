'use server'

import { supabase } from './supabaseClient'
import { cookies } from 'next/headers'
import { UserWithAuth } from '@/types/supabase'
import { createClient } from '@supabase/supabase-js'

type AdminResponse = 
  | { isAdmin: true, users: UserWithAuth[] }
  | { isAdmin: false, user: UserWithAuth, message: string }
  | { error: string }

  type BulkDeleteResponse = {
    success?: boolean
    deletedCount?: number
    error?: string
  }

type UpdateBalanceResponse = {
  success?: boolean
  updatedBalance?: number
  error?: string
}


export async function checkAdminAndFetchUsers(searchTerm?: string): Promise<AdminResponse> {
  try {
    // 1. Get session from cookies
    const cookieStore = await cookies()
    const accessToken = cookieStore.get('sb-access-token')?.value
    const refreshToken = cookieStore.get('sb-refresh-token')?.value

    if (!accessToken || !refreshToken) {
      return { error: 'Not authenticated. Please log in.' }
    }

    // 2. Set session on Supabase client
    const { data: { session }, error: sessionError } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    })

    if (sessionError || !session?.user) {
      return { error: 'Session expired. Please log in again.' }
    }

    // 3. Get the current user's profile
    const { data: currentUser, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single()

    if (profileError || !currentUser) {
      return { error: 'Failed to fetch user profile.' }
    }

    // 4. Get auth data separately
    const { data: authUser } = await supabase.auth.admin.getUserById(session.user.id)
    
    const currentUserWithAuth: UserWithAuth = {
      ...currentUser,
      auth_user: authUser ? {
        id: authUser?.user?.id || '',
        email: authUser?.user?.email || '',
        last_sign_in_at: authUser?.user?.last_sign_in_at || null,
        email_confirmed_at: authUser?.user?.email_confirmed_at || null
      } : null
    }

    // 5. If not admin, return just the current user's data
    if (!currentUserWithAuth.is_admin) {
      return {
        isAdmin: false,
        user: currentUserWithAuth,
        message: 'This user is not an admin'
      }
    }

    // 6. If admin, fetch all users (profiles first) with optional search
    let query = supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: true }) // Changed to ascending

    // Add search condition if searchTerm is provided
    if (searchTerm && searchTerm.trim() !== '') {
      query = query
        .or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%`)
    }

    const { data: allProfiles, error: profilesError } = await query

    if (profilesError) {
      return { error: 'Failed to fetch user profiles.' }
    }

    // 7. Get auth data for all users in batches
    const allUsersWithAuth: UserWithAuth[] = []
    
    const batchSize = 10
    for (let i = 0; i < allProfiles.length; i += batchSize) {
      const batch = allProfiles.slice(i, i + batchSize)
      const userIds = batch.map(p => p.id)
      
      const { data: authUsers } = await supabase.auth.admin.listUsers({
        page: 1,
        perPage: batchSize
      })

      batch.forEach(profile => {
        const authUser = authUsers?.users.find(u => userIds.includes(u.id))
        allUsersWithAuth.push({
          ...profile,
          auth_user: authUser ? {
            id: authUser.id,
            email: authUser.email || '',
            last_sign_in_at: authUser.last_sign_in_at || null,
            email_confirmed_at: authUser.email_confirmed_at || null
          } : null
        })
      })
    }

    return {
      isAdmin: true,
      users: allUsersWithAuth
    }

  } catch (error) {
    console.error('Admin check error:', error)
    return { error: 'An unexpected error occurred.' }
  }
}
// deleteuser
   


export async function deleteUserById(userId: string): Promise<{ success?: boolean; error?: string }> {
  try {
    // 1. Get session
    const cookieStore = await cookies()
    const accessToken = cookieStore.get('sb-access-token')?.value
    const refreshToken = cookieStore.get('sb-refresh-token')?.value

    if (!accessToken || !refreshToken) {
      return { error: 'Not authenticated. Please log in.' }
    }

    const { data: { session }, error: sessionError } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    })

    if (sessionError || !session?.user) {
      return { error: 'Session expired. Please log in again.' }
    }

    // 2. Check if current user is admin
    const { data: currentUser, error: profileError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', session.user.id)
      .single()

    if (profileError || !currentUser?.is_admin) {
      return { error: 'Unauthorized. Admin access required.' }
    }

    // 3. Create admin Supabase client using service role
    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!, // ✅ Use service role key!
      {
        auth: {
          persistSession: false
        }
      }
    )

    // 4. Delete from Supabase Auth
    const { error: authDeleteError } = await adminClient.auth.admin.deleteUser(userId)
    if (authDeleteError) {
      console.error('Auth deletion error:', authDeleteError)
      return { error: 'Failed to delete user from authentication system.' }
    }

    // 5. Delete from profiles table
    const { error: profileDeleteError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId)

    if (profileDeleteError) {
      console.error('Profile deletion error:', profileDeleteError)
      return { error: 'User auth deleted but failed to remove profile.' }
    }

    return { success: true }

  } catch (error) {
    console.error('Delete user error:', error)
    return { error: 'An unexpected error occurred.' }
  }
}



export async function updateUserBalance(
  userId: string,
  newBalance: number
): Promise<UpdateBalanceResponse> {
  try {
    // 1. Get session from cookies
    const cookieStore = await cookies()
    const accessToken = cookieStore.get('sb-access-token')?.value
    const refreshToken = cookieStore.get('sb-refresh-token')?.value

    if (!accessToken || !refreshToken) {
      return { error: 'Not authenticated. Please log in.' }
    }

    // 2. Set session on Supabase client
    const { data: { session }, error: sessionError } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    })

    if (sessionError || !session?.user) {
      return { error: 'Session expired. Please log in again.' }
    }

    // 3. Check if current user is admin
    const { data: currentUser, error: profileError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', session.user.id)
      .single()

    if (profileError || !currentUser?.is_admin) {
      return { error: 'Unauthorized. Admin access required.' }
    }

    // 4. Validate the new balance
    if (typeof newBalance !== 'number' || newBalance < 0) {
      return { error: 'Invalid balance amount.' }
    }

    // 5. Update the user's balance in the profiles table
    const { data: updatedUser, error: updateError } = await supabase
      .from('profiles')
      .update({ balance: newBalance })
      .eq('id', userId)
      .select('balance')
      .single()

    if (updateError || !updatedUser) {
      console.error('Balance update error:', updateError)
      return { error: 'Failed to update user balance.' }
    }

    return { 
      success: true,
      updatedBalance: updatedUser.balance 
    }

  } catch (error) {
    console.error('Update balance error:', error)
    return { error: 'An unexpected error occurred.' }
  }
}






export async function deleteAllUsersExceptAdmin(adminEmail: string): Promise<BulkDeleteResponse> {
  try {
    // 1. Get session from cookies
    const cookieStore =await cookies()
    const accessToken = cookieStore.get('sb-access-token')?.value
    const refreshToken = cookieStore.get('sb-refresh-token')?.value

    if (!accessToken || !refreshToken) {
      return { error: 'Not authenticated. Please log in.' }
    }

    // 2. Set session on Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        },
        auth: {
          persistSession: false
        }
      }
    )

    const { data: { session }, error: sessionError } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    })

    if (sessionError || !session?.user) {
      return { error: 'Session expired. Please log in again.' }
    }

    // 3. Verify current user is admin
    const { data: currentUser, error: profileError } = await supabase
      .from('profiles')
      .select('is_admin, email')
      .eq('id', session.user.id)
      .single()

    if (profileError || !currentUser?.is_admin) {
      return { error: 'Unauthorized. Admin access required.' }
    }

    // 4. Create admin client with service role
    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          persistSession: false
        }
      }
    )

    // 5. Get all users except the admin
    const { data: { users }, error: listError } = await adminClient.auth.admin.listUsers()
    if (listError) {
      return { error: 'Failed to fetch users.' }
    }

    const usersToDelete = users.filter(user => 
      user.email !== adminEmail && user.email !== currentUser.email
    )

    if (usersToDelete.length === 0) {
      return { success: true, deletedCount: 0 }
    }

    // 6. Delete users in batches (Supabase has rate limits)
    const BATCH_SIZE = 5
    let deletedCount = 0
    const errors: string[] = []

    for (let i = 0; i < usersToDelete.length; i += BATCH_SIZE) {
      const batch = usersToDelete.slice(i, i + BATCH_SIZE)
      
      await Promise.all(batch.map(async (user) => {
        try {
          // Delete auth user
          const { error: authError } = await adminClient.auth.admin.deleteUser(user.id)
          if (authError) throw authError

          // Delete profile
          const { error: profileError } = await adminClient
            .from('profiles')
            .delete()
            .eq('id', user.id)

          if (profileError) throw profileError

          deletedCount++
        } catch (error) {
          errors.push(`Failed to delete user ${user.email}: ${error instanceof Error ? error.message : String(error)}`)
        }
      }))
    }

    if (errors.length > 0) {
      console.error('Bulk deletion errors:', errors)
      return { 
        success: errors.length < usersToDelete.length,
        deletedCount,
        error: `Completed with ${errors.length} errors. First error: ${errors[0]}`
      }
    }

    return { success: true, deletedCount }

  } catch (error) {
    console.error('Bulk delete error:', error)
    return { 
      error: error instanceof Error ? error.message : 'An unexpected error occurred.' 
    }
  }
}