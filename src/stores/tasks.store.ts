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
}

export const useTasksStore = defineStore('tasks', {
  // Estado inicial del store
  state: (): TasksState => ({
    tasks: [],
    stats: null,
    isLoading: false,
  }),

  getters: {
    completedTasks: (state) => state.tasks.filter((task) => task.is_completed),
    pendingTasks: (state) => state.tasks.filter((task) => !task.is_completed),
    tasksByPriority: (state) => (priority: 'low' | 'medium' | 'high') =>
      state.tasks.filter((task) => task.priority === priority),
  },

  actions: {
    async fetchTasks() {
      this.isLoading = true
      try {
        const response = await tasksApi.getTasks()
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
        console.log('🔄 Store: Toggling task', id)

        const index = this.tasks.findIndex((task) => task.id === id)
        if (index === -1) {
          console.error('❌ Task not found:', id)
          throw new Error(`Task ${id} not found`)
        }

        const currentTask = this.tasks[index]
        this.tasks[index] = {
          ...currentTask,
          is_completed: !currentTask.is_completed,
        }

        console.log('✅ Store: Task toggled successfully', this.tasks[index])

        this.updateStatsLocally()

        return this.tasks[index]
      } catch (error) {
        console.error('❌ Store: Error toggling task', error)
        throw error
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

      console.log('📊 Stats updated locally:', this.stats)
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
