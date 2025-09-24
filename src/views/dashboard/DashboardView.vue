<template>
    <div class="dashboard-container">
        <!--  Header con logo, búsqueda y user -->
        <AppHeader :search-query="searchQuery" @search-change="onSearchChange" @search-clear="onSearchClear" />

        <div class="dashboard-content">
            <!--  Estadísticas -->
            <StatsCards :stats="stats" :loading="loadingStats" />

            <!--  Filtros y acciones -->
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
import AppHeader from '@/components/layout/AppHeader.vue'
import StatsCards from '@/components/tasks/StatsCards.vue'
import TaskList from '@/components/tasks/TaskList.vue'
import TaskForm from '@/components/tasks/TaskForm.vue'
import type { Task } from '@/types/task'


const tasksStore = useTasksStore()


const loadingStats = ref(false)
const loadingTasks = ref(false)
const activeFilter = ref<'all' | 'completed' | 'pending'>('all')
const showForm = ref(false)
const editingTask = ref<Task | null>(null)
const searchQuery = ref('')
let searchTimeout: number | null = null


const filters = [
    { value: 'all' as const, label: 'Todas' },
    { value: 'completed' as const, label: 'Completadas' },
    { value: 'pending' as const, label: 'Pendientes' }
]


const stats = computed(() => tasksStore.stats)
const tasks = computed(() => tasksStore.tasks)

const filteredTasks = computed(() => {
    let filtered = tasks.value

    // Aplicar filtro por estado
    if (activeFilter.value === 'completed') {
        filtered = filtered.filter((t: Task) => t.is_completed)
    } else if (activeFilter.value === 'pending') {
        filtered = filtered.filter((t: Task) => !t.is_completed)
    }

    // Aplicar búsqueda por título
    if (searchQuery.value.trim()) {
        const query = searchQuery.value.toLowerCase().trim()
        filtered = filtered.filter((t: Task) =>
            t.title.toLowerCase().includes(query)
        )
    }

    return filtered
})


const setFilter = (filter: 'all' | 'completed' | 'pending') => {
    activeFilter.value = filter
}

const onSearchChange = (query: string) => {
    searchQuery.value = query
    console.log('🔍 Search changed:', query)

    // Limpiar timeout anterior
    if (searchTimeout) {
        clearTimeout(searchTimeout)
    }

    // Crear nuevo timeout para debounce (500ms)
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
            // Si no hay búsqueda, cargar todas las tareas
            await loadAllTasks()
        }
    }, 500) as unknown as number
}

const onSearchClear = async () => {
    searchQuery.value = ''
    console.log('🗑️ Search cleared from header')
    await loadAllTasks()
}

// Función auxiliar para cargar todas las tareas
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

    await tasksStore.fetchStats()
    closeForm()
}

const editTask = (task: Task) => {
    showTaskForm(task)
}

const deleteTask = async (taskId: string) => {
    if (confirm('¿Estás seguro de eliminar esta tarea?')) {
        await tasksStore.deleteTask(taskId)

        await tasksStore.fetchStats()
    }
}

const toggleTask = async (taskId: string) => {
    console.log('🔄 Dashboard: Toggling task', taskId)
    await tasksStore.toggleTask(taskId)
    console.log('✅ Dashboard: Toggle completed')

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
    .dashboard-content {
        padding: 2rem 1rem;
    }

    .dashboard-actions {
        flex-direction: column;
        align-items: stretch;
    }

    .filters {
        justify-content: center;
    }
}
</style>