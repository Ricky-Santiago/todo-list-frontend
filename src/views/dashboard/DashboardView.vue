<template>
    <div class="dashboard-container">
        <!-- 🎯 Header con logo y user -->
        <AppHeader />

        <div class="dashboard-content">
            <!-- 📊 Estadísticas -->
            <StatsCards :stats="stats" :loading="loadingStats" />

            <!-- 🎯 Filtros y acciones -->
            <div class="dashboard-actions">
                <div class="filters">
                    <button v-for="filter in filters" :key="filter.value"
                        :class="{ active: activeFilter === filter.value }" @click="setFilter(filter.value)">
                        {{ filter.label }}
                    </button>
                </div>

                <button class="add-task-btn" @click="showNewTaskForm">
                    ➕ Nueva Tarea
                </button>
            </div>

            <!-- 📝 Lista de tareas -->
            <TaskList :tasks="filteredTasks" :loading="loadingTasks" @edit-task="editTask" @delete-task="deleteTask"
                @toggle-task="toggleTask" />

            <!-- 🎯 Modal para crear/editar tarea -->
            <TaskForm v-if="showForm" :task="editingTask" @close="closeForm" @save="saveTask" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useTasksStore } from '@/stores/tasks.store'
import AppHeader from '@/components/layout/AppHeader.vue'
import StatsCards from '@/components/tasks/StatsCards.vue'
import TaskList from '@/components/tasks/TaskList.vue'
import TaskForm from '@/components/tasks/TaskForm.vue'
import type { Task } from '@/types/task'

// 🎯 Stores
const tasksStore = useTasksStore()

// 📊 Estado
const loadingStats = ref(false)
const loadingTasks = ref(false)
const activeFilter = ref<'all' | 'completed' | 'pending'>('all')
const showForm = ref(false)
const editingTask = ref<Task | null>(null)

// 🎯 Filtros disponibles
const filters = [
    { value: 'all' as const, label: 'Todas' },
    { value: 'completed' as const, label: 'Completadas' },
    { value: 'pending' as const, label: 'Pendientes' }
]

// 📊 Computed properties
const stats = computed(() => tasksStore.stats)
const tasks = computed(() => tasksStore.tasks)

const filteredTasks = computed(() => {
    if (activeFilter.value === 'all') return tasks.value
    if (activeFilter.value === 'completed') return tasks.value.filter((t: Task) => t.is_completed)
    return tasks.value.filter((t: Task) => !t.is_completed)
})

// 🚀 Acciones
const setFilter = (filter: 'all' | 'completed' | 'pending') => {
    activeFilter.value = filter
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
    if (editingTask.value) {
        await tasksStore.updateTask(editingTask.value.id, taskData)
    } else {
        await tasksStore.createTask({
            title: taskData.title,
            description: taskData.description,
            priority: taskData.priority || 'medium',
            due_date: taskData.due_date
        })
    }
    // Actualizar estadísticas después de guardar
    await tasksStore.fetchStats()
    closeForm()
}

const editTask = (task: Task) => {
    showTaskForm(task)
}

const deleteTask = async (taskId: string) => {
    if (confirm('¿Estás seguro de eliminar esta tarea?')) {
        await tasksStore.deleteTask(taskId)
        // Actualizar estadísticas después de eliminar
        await tasksStore.fetchStats()
    }
}

const toggleTask = async (taskId: string) => {
    console.log('🔄 Dashboard: Toggling task', taskId)
    await tasksStore.toggleTask(taskId)
    console.log('✅ Dashboard: Toggle completed')
    // No necesitamos fetchStats() porque updateStatsLocally() ya lo hace
}

// 📡 Cargar datos al montar el componente
onMounted(async () => {
    // 🔒 Verificación de seguridad adicional
    const token = localStorage.getItem('authToken')
    if (!token || token.trim() === '') {
        console.log('🛑 Dashboard: No valid token found, redirecting to login')
        window.location.href = '/login'
        return
    }

    console.log('✅ Dashboard: Valid token found, loading data')
    loadingStats.value = true
    loadingTasks.value = true

    try {
        await Promise.all([
            tasksStore.fetchStats(),
            tasksStore.fetchTasks()
        ])
    } catch (error) {
        console.error('Error loading dashboard:', error)
        // Si hay error cargando datos, podría ser token inválido
        const apiError = error as { response?: { status?: number } }
        if (apiError?.response?.status === 401) {
            console.log('🛑 Dashboard: 401 error, token might be invalid')
            localStorage.removeItem('authToken')
            window.location.href = '/login'
        }
    } finally {
        loadingStats.value = false
        loadingTasks.value = false
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
    align-items: center;
    margin: 2rem 0;
    gap: 1rem;
}

.filters {
    display: flex;
    gap: 0.5rem;
}

.filters button {
    padding: 0.5rem 1rem;
    border: 2px solid #e1e5e9;
    background: white;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.3s;
}

.filters button.active {
    background: #ff5757;
    color: white;
    border-color: #ff5757;
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
    .dashboard-actions {
        flex-direction: column;
        align-items: stretch;
    }

    .filters {
        justify-content: center;
    }
}
</style>