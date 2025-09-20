import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL

console.log('🔗 API_URL configurada:', API_URL)

interface TaskFilters {
  is_completed?: boolean
  priority?: 'low' | 'medium' | 'high'
  due_date?: string
  page?: number
  limit?: number
}

interface CreateTaskData {
  title: string
  description?: string
  priority: 'low' | 'medium' | 'high'
  due_date?: string
}

interface UpdateTaskData {
  title?: string
  description?: string
  priority?: 'low' | 'medium' | 'high'
  due_date?: string
  is_completed?: boolean
}

export const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use(
  (config) => {
    console.log('📤 API Request:', config.method?.toUpperCase(), config.url)
    const token = localStorage.getItem('authToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    console.error('📤 API Request Error:', error)
    return Promise.reject(error)
  },
)

api.interceptors.response.use(
  (response) => {
    console.log('📥 API Response:', response.status, response.config.url)
    return response
  },
  (error) => {
    console.error('📥 API Response Error:', {
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url,
      message: error.message,
    })

    if (error.response?.status === 401) {
      localStorage.removeItem('authToken')

      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  },
)

export const authApi = {
  login: (credentials: { email: string; password: string }) => api.post('/auth/login', credentials),

  register: (userData: {
    email: string
    password: string
    first_name: string
    last_name: string
  }) => api.post('/auth/register', userData),

  logout: () => api.post('/auth/logout'),

  getProfile: () => api.get('/auth/profile'),

  updateProfile: (userData: { first_name?: string; last_name?: string }) =>
    api.put('/auth/profile', userData),
}

export const tasksApi = {
  getTasks: (params?: TaskFilters) => api.get('/tasks', { params }),

  getTask: (id: string) => api.get(`/tasks/${id}`),

  createTask: (taskData: CreateTaskData) => api.post('/tasks', taskData),

  updateTask: (id: string, taskData: UpdateTaskData) => api.put(`/tasks/${id}`, taskData),

  partialUpdateTask: (id: string, taskData: Partial<UpdateTaskData>) =>
    api.patch(`/tasks/${id}`, taskData),

  deleteTask: (id: string) => api.delete(`/tasks/${id}`),

  toggleTask: (id: string) => api.patch(`/tasks/${id}/toggle`),

  getStats: () => api.get('/tasks/stats'),
}
