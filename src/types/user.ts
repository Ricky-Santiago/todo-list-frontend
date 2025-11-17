export interface UserProfile {
  id: string
  email: string
  first_name: string
  last_name: string
  created_at: string
  updated_at?: string
}

export interface LoginResponse {
  token: string
  user: UserProfile
  message: string
}

export type RegisterResponse = LoginResponse
