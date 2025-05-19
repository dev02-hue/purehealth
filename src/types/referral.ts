export type Profile = {
    id: string
    first_name: string
    last_name: string
    email: string
  }
  
  export type Referral = {
    level: number
    created_at: string
    profiles: Profile
  }
  
  export type ReferralStats = {
    level1: number
    level2: number
    level3: number
    total: number
  }
  
  export type ReferralData = {
    referralCode: string
    stats: ReferralStats
    referrals: Referral[]
  }
  
  export type ReferralError = {
    error: string
  }
  
  export type ReferralResponse = ReferralData | ReferralError