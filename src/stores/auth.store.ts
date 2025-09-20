import { defineStore } from 'pinia'
import { authApi } from '@/services/api'
import type { UserProfile } from '@/types/user'

// Definimos la interfaz para el estado del store
interface AuthState {
  user: UserProfile | null
  token: string | null
  isLoading: boolean
}

export const useAuthStore = defineStore('auth', {
  // Estado inicial del store
  state: (): AuthState => ({
    user: null,
    token: localStorage.getItem('authToken'), // ← Recupera token del localStorage
    isLoading: false,
  }),

  // Getters (computadas reactivas)
  getters: {
    isAuthenticated: (state) => !!state.token, // ← true si hay token
    currentUser: (state) => state.user, // ← Retorna el usuario
    authToken: (state) => state.token, // ← Retorna el token
  },

  // Actions (métodos que modifican el estado)
  actions: {
    /**
     * 🔐 Login de usuario
     * 1. Hace request al backend
     * 2. Guarda token en localStorage
     * 3. Actualiza el estado del store
     */
    async login(credentials: { email: string; password: string }) {
      console.log('🔐 Auth Store: Starting login process', { email: credentials.email }) // Debug log
      this.isLoading = true
      try {
        console.log('🌐 Auth Store: Making API call to login endpoint') // Debug log
        const response = await authApi.login(credentials)
        console.log('✅ Auth Store: Login API response received', response) // Debug log

        this.token = response.data.token
        this.user = response.data.user

        // 💾 Guardar token en localStorage para persistencia
        if (this.token) {
          localStorage.setItem('authToken', this.token)
          console.log('💾 Auth Store: Token saved to localStorage') // Debug log
        }

        console.log('🎉 Auth Store: Login successful') // Debug log
        return response.data
      } catch (error) {
        // ❌ Manejo de errores
        console.error('❌ Auth Store: Login error:', error)

        // Re-lanzar el error para que el componente lo pueda manejar
        throw error
      } finally {
        this.isLoading = false
        console.log('🔄 Auth Store: Login process finished') // Debug log
      }
    },

    /**
     * 📝 Registro de nuevo usuario
     * Similar a login pero para registro
     */
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

    /**
     * 👤 Obtener perfil del usuario
     * Útil cuando se recarga la página
     */
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

    /**
     * 🚪 Logout - Limpiar toda la autenticación
     */
    logout() {
      // 1. 📤 Hacer logout en el backend
      authApi.logout().catch(console.error)

      // 2. 🧹 Limpiar estado local
      this.token = null
      this.user = null

      // 3. 🗑️ Remover token del localStorage
      localStorage.removeItem('authToken')

      // 4. 🔄 Redirigir al login
      window.location.href = '/login'
    },

    /**
     * 🔄 Inicializar autenticación al cargar la app
     * Verifica si hay token y obtiene el perfil
     */
    async initializeAuth() {
      if (this.token && !this.user) {
        try {
          await this.getProfile()
        } catch {
          // Si el token es inválido, limpiar
          this.logout()
        }
      }
    },
  },
})
