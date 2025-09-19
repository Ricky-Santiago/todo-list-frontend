import { createRouter, createWebHistory } from 'vue-router'

// Importar vistas
import LoginView from '@/views/auth/LoginView.vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: LoginView,
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/auth/RegisterView.vue'),
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/dashboard/DashboardView.vue'),
    meta: { requiresAuth: true }, // ← Esta ruta requiere autenticación
  },
  {
    path: '/',
    redirect: '/login', // Cambiado para redirigir a login por defecto
  },
  // Ruta catch-all para páginas no encontradas
  {
    path: '/:pathMatch(.*)*',
    redirect: '/login',
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Guard de navegación para verificar autenticación
router.beforeEach((to) => {
  const token = localStorage.getItem('authToken')
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)

  // Si la ruta requiere autenticación y no hay token, ir a login
  if (requiresAuth && !token) {
    return '/login'
  }

  // Solo redirigir a dashboard si hay token Y si no estás ya intentando hacer logout
  if ((to.path === '/login' || to.path === '/register') && token) {
    // Verificar si el token es válido antes de redirigir
    try {
      // Si el token existe pero el usuario quiere ir a login explícitamente, permitir
      if (to.query.force === 'true') {
        return true
      }
      return '/dashboard'
    } catch {
      // Si hay error con el token, limpiarlo y permitir ir a login
      localStorage.removeItem('authToken')
      return true
    }
  }
})

export default router
