"use server";
import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"

export async function getInvestments() {
    const cookieStore =await cookies()
    const userId = cookieStore.get('user_id')?.value
  
    if (!userId) {
      throw new Error('User not authenticated')
    }
  
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase credentials are missing')
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey)
  
    const { data: investments, error } = await supabase
      .from('investments')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
  
    if (error) {
      throw new Error('Failed to fetch investments')
    }
  
    return investments || []
  }