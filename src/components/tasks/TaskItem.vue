<template>
    <div class="task-item" :class="{ completed: task.is_completed }">
        <!-- Header de la tarea -->
        <div class="task-header">
            <div class="task-priority" :class="task.priority">
                <span class="priority-indicator"></span>
                <span class="priority-text">{{ priorityLabels[task.priority] }}</span>
            </div>

            <div class="task-actions">
                <button @click="$emit('edit')" class="action-btn edit-btn" title="Editar">
                    ✏️
                </button>
                <button @click="$emit('delete')" class="action-btn delete-btn" title="Eliminar">
                    🗑️
                </button>
            </div>
        </div>

        <!-- Contenido de la tarea -->
        <div class="task-content">
            <h3 class="task-title" :class="{ completed: task.is_completed }">
                {{ task.title }}
            </h3>

            <p v-if="task.description" class="task-description">
                {{ task.description }}
            </p>

            <!-- Fecha límite -->
            <div v-if="task.due_date" class="task-due-date" :class="{ overdue: isOverdue }">
                <span class="due-date-icon">📅</span>
                <span>{{ formatDate(task.due_date) }}</span>
                <span v-if="isOverdue" class="overdue-label">¡Vencida!</span>
            </div>
        </div>

        <!-- Footer con checkbox -->
        <div class="task-footer">
            <label class="task-checkbox" :class="{ completed: task.is_completed }">
                <input type="checkbox" :checked="task.is_completed" @change="$emit('toggle')" />
                <span class="checkbox-custom"></span>
                <span class="checkbox-label">
                    {{ task.is_completed ? 'Completada' : 'Marcar como completada' }}
                </span>
            </label>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Task } from '@/types/task'

// Props
interface Props {
    task: Task
}

const props = defineProps<Props>()

// Emits
defineEmits<{
    edit: []
    delete: []
    toggle: []
}>()

// Labels para prioridades
const priorityLabels = {
    low: 'Baja',
    medium: 'Media',
    high: 'Alta'
}

// Verificar si la tarea está vencida
const isOverdue = computed(() => {
    if (!props.task.due_date || props.task.is_completed) return false
    return new Date(props.task.due_date) < new Date()
})

// Formatear fecha
const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    })
}
</script>

<style scoped>
.task-item {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 1.5rem;
    transition: all 0.3s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.task-item:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
}

.task-item.completed {
    opacity: 0.7;
    background: #f9fafb;
}

.task-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
}

.task-priority {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    font-weight: 500;
}

.priority-indicator {
    width: 8px;
    height: 8px;
    border-radius: 50%;
}

.task-priority.low .priority-indicator {
    background: #10b981;
}

.task-priority.medium .priority-indicator {
    background: #f59e0b;
}

.task-priority.high .priority-indicator {
    background: #ef4444;
}

.task-priority.low .priority-text {
    color: #059669;
}

.task-priority.medium .priority-text {
    color: #d97706;
}

.task-priority.high .priority-text {
    color: #dc2626;
}

.task-actions {
    display: flex;
    gap: 0.5rem;
}

.action-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0.25rem;
    border-radius: 4px;
    transition: background-color 0.2s;
}

.action-btn:hover {
    background: #f3f4f6;
}

.task-content {
    margin-bottom: 1rem;
}

.task-title {
    margin: 0 0 0.5rem 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: #1f2937;
    line-height: 1.4;
}

.task-title.completed {
    text-decoration: line-through;
    color: #6b7280;
}

.task-description {
    margin: 0;
    color: #6b7280;
    line-height: 1.5;
    font-size: 0.95rem;
}

.task-due-date {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: 0.75rem;
    font-size: 0.875rem;
    color: #6b7280;
}

.task-due-date.overdue {
    color: #dc2626;
}

.due-date-icon {
    font-size: 1rem;
}

.overdue-label {
    background: #fee2e2;
    color: #dc2626;
    padding: 0.125rem 0.5rem;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: 600;
}

.task-footer {
    border-top: 1px solid #f3f4f6;
    padding-top: 1rem;
}

.task-checkbox {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    cursor: pointer;
    font-size: 0.875rem;
}

.task-checkbox input[type="checkbox"] {
    display: none;
}

.checkbox-custom {
    width: 20px;
    height: 20px;
    border: 2px solid #d1d5db;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    background: white;
}

.task-checkbox input:checked+.checkbox-custom {
    background: #ff5757;
    border-color: #ff5757;
}

.task-checkbox input:checked+.checkbox-custom::after {
    content: '✓';
    color: white;
    font-size: 12px;
    font-weight: bold;
}

.checkbox-label {
    color: #374151;
    transition: color 0.2s;
}

.task-checkbox.completed .checkbox-label {
    color: #6b7280;
}
</style>