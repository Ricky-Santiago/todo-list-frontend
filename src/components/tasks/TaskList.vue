<template>
    <div class="task-list">
        <!-- Loading state -->
        <div v-if="loading" class="loading-state">
            <div class="loading-spinner"></div>
            <p>Cargando tareas...</p>
        </div>

        <!-- Empty state -->
        <div v-else-if="tasks.length === 0" class="empty-state">
            <div class="empty-icon">📝</div>
            <h3>No hay tareas</h3>
            <p>¡Agrega tu primera tarea para comenzar!</p>
        </div>

        <!-- Lista de tareas -->
        <div v-else class="tasks-grid">
            <TaskItem v-for="task in tasks" :key="task.id" :task="task" @edit="$emit('edit-task', task)"
                @delete="$emit('delete-task', task.id)" @toggle="$emit('toggle-task', task.id)" />
        </div>
    </div>
</template>

<script setup lang="ts">
import TaskItem from './TaskItem.vue'
import type { Task } from '@/types/task'

// Props
interface Props {
    tasks: Task[]
    loading?: boolean
}

withDefaults(defineProps<Props>(), {
    loading: false
})

// Emits
defineEmits<{
    'edit-task': [task: Task]
    'delete-task': [taskId: string]
    'toggle-task': [taskId: string]
}>()
</script>

<style scoped>
.task-list {
    min-height: 300px;
}

.loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem 2rem;
    color: #6b7280;
}

.loading-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid #e5e7eb;
    border-top: 3px solid #ff5757;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 1rem;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}

.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem 2rem;
    text-align: center;
    color: #6b7280;
}

.empty-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
}

.empty-state h3 {
    margin: 0 0 0.5rem 0;
    color: #374151;
    font-size: 1.5rem;
}

.empty-state p {
    margin: 0;
    font-size: 1rem;
}

.tasks-grid {
    display: grid;
    gap: 1rem;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
}

@media (max-width: 768px) {
    .tasks-grid {
        grid-template-columns: 1fr;
    }

    .loading-state,
    .empty-state {
        padding: 2rem 1rem;
    }
}
</style>