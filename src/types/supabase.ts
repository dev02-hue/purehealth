export type UserProfile = {
    id: string
    first_name: string
    last_name: string
    email: string | null
    phone_number: string | null
    balance: number
    is_admin: boolean
    is_active: boolean
    created_at: string
    auth_email: string
  }
  
  export type AuthUser = {
    id: string
    email: string
    last_sign_in_at: string | null
    email_confirmed_at: string | null
  }
  
  export type UserWithAuth = UserProfile & {
    auth_user: AuthUser | null
  }