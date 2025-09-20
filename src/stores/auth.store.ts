import { defineStore } from 'pinia'
import { authApi } from '@/services/api'
import type { UserProfile } from '@/types/user'

interface AuthState {
  user: UserProfile | null
  token: string | null
  isLoading: boolean
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    token: localStorage.getItem('authToken'),
    isLoading: false,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    currentUser: (state) => state.user,
    authToken: (state) => state.token,
  },

  actions: {
    async login(credentials: { email: string; password: string }) {
      console.log('🔐 Auth Store: Starting login process', { email: credentials.email })
      this.isLoading = true
      try {
        console.log('🌐 Auth Store: Making API call to login endpoint')
        const response = await authApi.login(credentials)
        console.log('✅ Auth Store: Login API response received', response)

        this.token = response.data.token
        this.user = response.data.user

        if (this.token) {
          localStorage.setItem('authToken', this.token)
          console.log('💾 Auth Store: Token saved to localStorage')
        }

        console.log('🎉 Auth Store: Login successful')
        return response.data
      } catch (error) {
        console.error('❌ Auth Store: Login error:', error)

        throw error
      } finally {
        this.isLoading = false
        console.log('🔄 Auth Store: Login process finished')
      }
    },

    async register(userData: {
      email: string
      password: string
      first_name: string
      last_name: string
    }) {
      this.isLoading = true
      try {
        const response = await authApi.register(userData)

        this.token = response.data.token
        this.user = response.data.user

        if (this.token) {
          localStorage.setItem('authToken', this.token)
        }

        return response.data
      } catch (error) {
        console.error('Register error:', error)
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async getProfile() {
      try {
        const response = await authApi.getProfile()
        this.user = response.data
        return response.data
      } catch (error) {
        console.error('Get profile error:', error)
        throw error
      }
    },

    logout() {
      authApi.logout().catch(console.error)

      this.token = null
      this.user = null

      localStorage.removeItem('authToken')

      window.location.href = '/login'
    },

    async initializeAuth() {
      if (this.token && !this.user) {
        try {
          await this.getProfile()
        } catch {
          this.logout()
        }
      }
    },
  },
})
