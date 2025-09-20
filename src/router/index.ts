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

  console.log('🚦 Router Guard:', {
    to: to.path,
    token: token ? 'EXISTS' : 'NULL',
    requiresAuth,
    tokenLength: token?.length || 0,
  })

  // 🔒 BLOQUEAR acceso a rutas protegidas sin token válido
  if (requiresAuth && (!token || token.trim() === '')) {
    console.log('� BLOCKED: No valid token for protected route, redirecting to login')
    return '/login'
  }

  // 🏠 Solo redirigir a dashboard desde la ruta raíz si hay token válido
  if (to.path === '/' && token && token.trim() !== '') {
    console.log('🏠 Root path with valid token, redirecting to dashboard')
    return '/dashboard'
  }

  // ✅ Permitir acceso normal a todas las demás rutas
  console.log('✅ Navigation allowed to:', to.path)
})

export default router
