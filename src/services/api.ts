import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL

// Tipos para los parámetros de la API
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
})

// Request interceptor para agregar token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor para manejar errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  },
)

// Servicios específicos de la API
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
