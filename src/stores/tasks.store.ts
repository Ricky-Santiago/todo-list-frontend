import { defineStore } from 'pinia'
import { tasksApi } from '@/services/api'
import type { Task, TaskStats } from '@/types/task'

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

interface TasksState {
  tasks: Task[]
  stats: TaskStats | null
  isLoading: boolean
  toggleLoading: Set<string> // IDs de tareas que están siendo toggle
}

export const useTasksStore = defineStore('tasks', {
  // Estado inicial del store
  state: (): TasksState => ({
    tasks: [],
    stats: null,
    isLoading: false,
    toggleLoading: new Set(),
  }),

  getters: {
    completedTasks: (state) => state.tasks.filter((task) => task.is_completed),
    pendingTasks: (state) => state.tasks.filter((task) => !task.is_completed),
    tasksByPriority: (state) => (priority: 'low' | 'medium' | 'high') =>
      state.tasks.filter((task) => task.priority === priority),
    isToggling: (state) => (taskId: string) => state.toggleLoading.has(taskId),
  },

  actions: {
    async fetchTasks(filters?: {
      search?: string
      is_completed?: boolean
      priority?: 'low' | 'medium' | 'high'
    }) {
      this.isLoading = true
      try {
        const response = await tasksApi.getTasks(filters)
        this.tasks = response.data
        return response.data
      } catch (error) {
        console.error('Error fetching tasks:', error)
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async fetchStats() {
      try {
        const response = await tasksApi.getStats()
        this.stats = response.data
        return response.data
      } catch (error) {
        console.error('Error fetching stats:', error)
        throw error
      }
    },

    async searchTasks(query: string) {
      this.isLoading = true
      try {
        const response = await tasksApi.getTasks({ search: query })
        this.tasks = response.data
        return response.data
      } catch (error) {
        console.error('Error searching tasks:', error)
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async createTask(taskData: CreateTaskData) {
      try {
        const response = await tasksApi.createTask(taskData)
        this.tasks.push(response.data)
        return response.data
      } catch (error) {
        console.error('Error creating task:', error)
        throw error
      }
    },

    async updateTask(id: string, taskData: UpdateTaskData) {
      try {
        const response = await tasksApi.updateTask(id, taskData)
        const index = this.tasks.findIndex((task) => task.id === id)
        if (index !== -1) {
          this.tasks[index] = response.data
        }
        return response.data
      } catch (error) {
        console.error('Error updating task:', error)
        throw error
      }
    },

    async toggleTask(id: string) {
      try {
        // Agregar al loading state
        this.toggleLoading.add(id)

        // Llamar directamente al backend
        const response = await tasksApi.toggleTask(id)

        // Actualizar la tarea en el store con la respuesta del backend
        const index = this.tasks.findIndex((task) => task.id === id)
        if (index !== -1) {
          // Crear nuevo objeto para la tarea
          const updatedTask = { ...response.data }

          // Crear nuevo array con la tarea actualizada
          this.tasks = [...this.tasks.slice(0, index), updatedTask, ...this.tasks.slice(index + 1)]
        }

        // Actualizar estadísticas localmente
        this.updateStatsLocally()

        return response.data
      } catch (error) {
        console.error('Error toggling task:', error)
        throw error
      } finally {
        // Remover del loading state
        this.toggleLoading.delete(id)
      }
    },

    updateStatsLocally() {
      const total = this.tasks.length
      const completed = this.tasks.filter((task) => task.is_completed).length
      const pending = total - completed

      const high_priority = this.tasks.filter((task) => task.priority === 'high').length
      const medium_priority = this.tasks.filter((task) => task.priority === 'medium').length
      const low_priority = this.tasks.filter((task) => task.priority === 'low').length

      this.stats = {
        total,
        completed,
        pending,
        high_priority,
        medium_priority,
        low_priority,
        overdue_tasks: 0,
        upcoming_tasks: 0,
        completion_rate: total > 0 ? Math.round((completed / total) * 100) : 0,
      }
    },

    async deleteTask(id: string) {
      try {
        await tasksApi.deleteTask(id)
        this.tasks = this.tasks.filter((task) => task.id !== id)
      } catch (error) {
        console.error('Error deleting task:', error)
        throw error
      }
    },
  },
})
