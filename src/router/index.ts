import { createRouter, createWebHistory } from 'vue-router'

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
    meta: { requiresAuth: true },
  },
  {
    path: '/',
    redirect: '/login',
  },

  {
    path: '/:pathMatch(.*)*',
    redirect: '/login',
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to) => {
  const token = localStorage.getItem('authToken')
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)

  console.log('🚦 Router Guard:', {
    to: to.path,
    token: token ? 'EXISTS' : 'NULL',
    requiresAuth,
    tokenLength: token?.length || 0,
  })

  if (requiresAuth && (!token || token.trim() === '')) {
    console.log('� BLOCKED: No valid token for protected route, redirecting to login')
    return '/login'
  }

  if (to.path === '/' && token && token.trim() !== '') {
    console.log('🏠 Root path with valid token, redirecting to dashboard')
    return '/dashboard'
  }

  console.log('✅ Navigation allowed to:', to.path)
})

export default router
