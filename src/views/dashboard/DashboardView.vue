<template>
    <div class="dashboard-container">
        <!--  Header con logo, búsqueda y user -->
        <AppHeader :search-query="searchQuery" @search-change="onSearchChange" @search-clear="onSearchClear" />

        <div class="dashboard-content">
            <!--  Estadísticas -->
            <StatsCards :stats="stats" :loading="loadingStats" />

            <!--  Filtros y acciones -->
            <div class="dashboard-actions">
                <div class="filters-section">
                    <!-- Filtros por estado -->
                    <div class="filter-group">
                        <label class="filter-label">Estado:</label>
                        <div class="filters">
                            <button v-for="filter in statusFilters" :key="filter.value"
                                :class="{ active: activeFilter === filter.value }" @click="setFilter(filter.value)">
                                {{ filter.label }}
                            </button>
                        </div>
                    </div>

                    <!-- Filtros por prioridad -->
                    <div class="filter-group">
                        <label class="filter-label">Prioridad:</label>
                        <div class="filters">
                            <button v-for="priority in priorityFilters" :key="priority.value"
                                :class="{ active: activePriorityFilter === priority.value }"
                                @click="setPriorityFilter(priority.value)">
                                <span :class="priority.class">{{ priority.icon }}</span>
                                {{ priority.label }}
                            </button>
                        </div>
                    </div>

                    <!-- Filtros por fecha -->
                    <div class="filter-group">
                        <label class="filter-label">Fecha:</label>
                        <div class="filters">
                            <button v-for="dateFilter in dateFilters" :key="dateFilter.value"
                                :class="{ active: activeDateFilter === dateFilter.value }"
                                @click="setDateFilter(dateFilter.value)">
                                {{ dateFilter.icon }} {{ dateFilter.label }}
                            </button>
                        </div>
                    </div>
                </div>

                <button class="add-task-btn" @click="showNewTaskForm">
                    ➕ Nueva Tarea
                </button>
            </div>

            <!--  Lista de tareas -->
            <TaskList :tasks="filteredTasks" :loading="loadingTasks" @edit-task="editTask" @delete-task="deleteTask"
                @toggle-task="toggleTask" />

            <!--  Modal para crear/editar tarea -->
            <TaskForm v-if="showForm" :task="editingTask" @close="closeForm" @save="saveTask" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useTasksStore } from '@/stores/tasks.store'
import { useToastStore } from '@/stores/toast.store'
import AppHeader from '@/components/layout/AppHeader.vue'
import StatsCards from '@/components/tasks/StatsCards.vue'
import TaskList from '@/components/tasks/TaskList.vue'
import TaskForm from '@/components/tasks/TaskForm.vue'
import type { Task } from '@/types/task'


const tasksStore = useTasksStore()
const toastStore = useToastStore()

const loadingStats = ref(false)
const loadingTasks = ref(false)
const activeFilter = ref<'all' | 'completed' | 'pending'>('all')
const activePriorityFilter = ref<'all' | 'low' | 'medium' | 'high'>('all')
const activeDateFilter = ref<'all' | 'today' | 'week' | 'overdue' | 'upcoming'>('all')
const showForm = ref(false)
const editingTask = ref<Task | null>(null)
const searchQuery = ref('')
let searchTimeout: number | null = null


const statusFilters = [
    { value: 'all' as const, label: 'Todas' },
    { value: 'completed' as const, label: 'Completadas' },
    { value: 'pending' as const, label: 'Pendientes' }
]


const priorityFilters = [
    { value: 'all' as const, label: 'Todas', icon: '📋', class: 'priority-all' },
    { value: 'high' as const, label: 'Alta', icon: '🔴', class: 'priority-high' },
    { value: 'medium' as const, label: 'Media', icon: '🟡', class: 'priority-medium' },
    { value: 'low' as const, label: 'Baja', icon: '🟢', class: 'priority-low' }
]


const dateFilters = [
    { value: 'all' as const, label: 'Todas', icon: '📅' },
    { value: 'today' as const, label: 'Hoy', icon: '⏰' },
    { value: 'week' as const, label: 'Esta semana', icon: '📆' },
    { value: 'overdue' as const, label: 'Vencidas', icon: '🚨' },
    { value: 'upcoming' as const, label: 'Próximas', icon: '⏳' }
]


const stats = computed(() => tasksStore.stats)

const filteredTasks = computed(() => {
    const allTasks = tasksStore.tasks

    if (!allTasks || allTasks.length === 0) {
        return []
    }

    let result = allTasks


    if (activeFilter.value === 'completed') {
        result = result.filter(task => task.is_completed)
    } else if (activeFilter.value === 'pending') {
        result = result.filter(task => !task.is_completed)
    }


    if (activePriorityFilter.value !== 'all') {
        result = result.filter(task => task.priority === activePriorityFilter.value)
    }


    if (activeDateFilter.value !== 'all') {
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const weekFromNow = new Date(today)
        weekFromNow.setDate(today.getDate() + 7)

        result = result.filter(task => {
            if (!task.due_date) return activeDateFilter.value === 'upcoming'

            const dueDate = new Date(task.due_date)
            dueDate.setHours(0, 0, 0, 0)

            switch (activeDateFilter.value) {
                case 'today':
                    return dueDate.getTime() === today.getTime()
                case 'week':
                    return dueDate >= today && dueDate <= weekFromNow
                case 'overdue':
                    return dueDate < today && !task.is_completed
                case 'upcoming':
                    return dueDate > weekFromNow
                default:
                    return true
            }
        })
    }


    if (searchQuery.value && searchQuery.value.trim()) {
        const query = searchQuery.value.toLowerCase().trim()
        result = result.filter(task =>
            task.title.toLowerCase().includes(query)
        )
    }

    return result
})
const setFilter = (filter: 'all' | 'completed' | 'pending') => {
    activeFilter.value = filter
}

const setPriorityFilter = (priority: 'all' | 'low' | 'medium' | 'high') => {
    activePriorityFilter.value = priority
}

const setDateFilter = (dateFilter: 'all' | 'today' | 'week' | 'overdue' | 'upcoming') => {
    activeDateFilter.value = dateFilter
}

const onSearchChange = (query: string) => {
    searchQuery.value = query
    console.log('🔍 Search changed:', query)


    if (searchTimeout) {
        clearTimeout(searchTimeout)
    }


    searchTimeout = setTimeout(async () => {
        if (query.trim()) {
            try {
                loadingTasks.value = true
                await tasksStore.searchTasks(query.trim())
            } catch (error) {
                console.error('Error searching tasks:', error)
            } finally {
                loadingTasks.value = false
            }
        } else {

            await loadAllTasks()
        }
    }, 500) as unknown as number
}

const onSearchClear = async () => {
    searchQuery.value = ''
    console.log('🗑️ Search cleared from header')
    await loadAllTasks()
}


const loadAllTasks = async () => {
    try {
        loadingTasks.value = true
        await tasksStore.fetchTasks()
    } catch (error) {
        console.error('Error loading tasks:', error)
    } finally {
        loadingTasks.value = false
    }
}

const showTaskForm = (task?: Task) => {
    editingTask.value = task || null
    showForm.value = true
}

const showNewTaskForm = () => {
    showTaskForm()
}

const closeForm = () => {
    showForm.value = false
    editingTask.value = null
}

const saveTask = async (taskData: Partial<Task> & { title: string }) => {
    try {
        if (editingTask.value) {
            await tasksStore.updateTask(editingTask.value.id, taskData)
            toastStore.success('Tarea actualizada correctamente', '✏️ Tarea editada')
        } else {
            await tasksStore.createTask({
                title: taskData.title,
                description: taskData.description,
                priority: taskData.priority || 'medium',
                due_date: taskData.due_date
            })
            toastStore.success('Nueva tarea creada exitosamente', '➕ Tarea creada')
        }

        await tasksStore.fetchStats()
        closeForm()
    } catch (error) {
        console.error('Error saving task:', error)
        const action = editingTask.value ? 'actualizar' : 'crear'
        toastStore.error(`Error al ${action} la tarea`, '❌ Error')
    }
}

const editTask = (task: Task) => {
    showTaskForm(task)
}

const deleteTask = async (taskId: string) => {
    if (confirm('¿Estás seguro de eliminar esta tarea?')) {
        try {
            await tasksStore.deleteTask(taskId)
            await tasksStore.fetchStats()
            toastStore.success('Tarea eliminada correctamente', '🗑️ Tarea eliminada')
        } catch (error) {
            console.error('Error deleting task:', error)
            toastStore.error('Error al eliminar la tarea', '❌ Error')
        }
    }
}

const toggleTask = async (taskId: string) => {
    try {
        console.log('🔄 Dashboard: Starting toggle for task', taskId)


        const updatedTask = await tasksStore.toggleTask(taskId)


        const message = updatedTask.is_completed
            ? 'Tarea marcada como completada'
            : 'Tarea marcada como pendiente'
        const title = updatedTask.is_completed ? '✅ Completada' : '⏳ Pendiente'

        toastStore.success(message, title, 3000)

        console.log('✅ Dashboard: Toggle completed successfully')

    } catch (error) {
        console.error('❌ Dashboard: Error in toggle task', error)
        toastStore.error('Error al cambiar el estado de la tarea', '❌ Error')
    }
}


onMounted(async () => {

    const token = localStorage.getItem('authToken')
    if (!token || token.trim() === '') {
        console.log('🛑 Dashboard: No valid token found, redirecting to login')
        window.location.href = '/login'
        return
    }

    console.log('✅ Dashboard: Valid token found, loading data')
    loadingStats.value = true

    try {
        await Promise.all([
            tasksStore.fetchStats(),
            loadAllTasks()
        ])

    } catch (error) {
        console.error('Error loading dashboard:', error)

        const apiError = error as { response?: { status?: number } }
        if (apiError?.response?.status === 401) {
            console.log('🛑 Dashboard: 401 error, token might be invalid')
            localStorage.removeItem('authToken')
            window.location.href = '/login'
        }
    } finally {
        loadingStats.value = false
    }
})
</script>

<style scoped>
.dashboard-container {
    min-height: 100vh;
    background: #f8fafc;
}

.dashboard-content {
    max-width: none;
    width: 100%;
    padding: 2rem 4rem;
}

.dashboard-actions {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin: 2rem 0;
    gap: 2rem;
}

.filters-section {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    flex: 1;
}

.filter-group {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.filter-label {
    font-weight: 600;
    color: #374151;
    min-width: 80px;
    font-size: 0.875rem;
}

.filters {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
}

.filters button {
    padding: 0.5rem 1rem;
    border: 2px solid #e1e5e9;
    background: white;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.3s;
    font-size: 0.875rem;
    display: flex;
    align-items: center;
    gap: 0.25rem;
}

.filters button:hover {
    border-color: #ff5757;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.filters button.active {
    background: #ff5757;
    color: white;
    border-color: #ff5757;
}

.priority-all {
    color: #6b7280;
}

.priority-high {
    color: #dc2626;
}

.priority-medium {
    color: #f59e0b;
}

.priority-low {
    color: #16a34a;
}

.add-task-btn {
    padding: 0.75rem 1.5rem;
    background: #ff5757;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    transition: background 0.3s;
}

.add-task-btn:hover {
    background: #ff4444;
}

@media (max-width: 768px) {
    .dashboard-content {
        padding: 2rem 1rem;
    }

    .dashboard-actions {
        flex-direction: column;
        align-items: stretch;
        gap: 1.5rem;
    }

    .filter-group {
        flex-direction: column;
        align-items: stretch;
        gap: 0.5rem;
    }

    .filter-label {
        min-width: auto;
        text-align: center;
    }

    .filters {
        justify-content: center;
    }

    .filters button {
        padding: 0.75rem 1rem;
    }
}
</style>