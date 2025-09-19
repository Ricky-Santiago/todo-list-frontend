export interface Task {
  id: string
  title: string
  description?: string
  is_completed: boolean
  priority: 'low' | 'medium' | 'high'
  due_date?: string
  user_id: string
  created_at: string
  updated_at: string
}

export interface TaskStats {
  total: number
  completed: number
  pending: number
  high_priority: number
  medium_priority: number
  low_priority: number
  upcoming_tasks: number
  overdue_tasks: number
  completion_rate: number
}
