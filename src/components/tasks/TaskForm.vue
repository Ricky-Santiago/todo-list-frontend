<template>
    <div class="modal-overlay" @click="closeModal">
        <div class="task-form-modal" @click.stop>
            <div class="modal-header">
                <h2>{{ task ? 'Editar Tarea' : 'Nueva Tarea' }}</h2>
                <button class="close-btn" @click="closeModal">✕</button>
            </div>

            <form @submit.prevent="submitForm" class="task-form">
                <!-- Título -->
                <div class="form-group">
                    <label for="title">Título *</label>
                    <input id="title" v-model="formData.title" type="text" placeholder="Escribe el título de la tarea"
                        :class="{ error: errors.title }" required />
                    <span v-if="errors.title" class="error-message">{{ errors.title }}</span>
                </div>

                <!-- Descripción -->
                <div class="form-group">
                    <label for="description">Descripción</label>
                    <textarea id="description" v-model="formData.description" placeholder="Describe la tarea (opcional)"
                        rows="3"></textarea>
                </div>

                <!-- Prioridad -->
                <div class="form-group">
                    <label for="priority">Prioridad</label>
                    <select id="priority" v-model="formData.priority">
                        <option value="low">Baja</option>
                        <option value="medium">Media</option>
                        <option value="high">Alta</option>
                    </select>
                </div>

                <!-- Fecha límite -->
                <div class="form-group">
                    <label for="due_date">Fecha límite</label>
                    <input id="due_date" v-model="formData.due_date" type="date" />
                </div>

                <!-- Estado (solo para editar) -->
                <div v-if="task" class="form-group">
                    <label class="checkbox-label">
                        <input v-model="formData.is_completed" type="checkbox" />
                        Tarea completada
                    </label>
                </div>

                <!-- Botones -->
                <div class="form-actions">
                    <button type="button" class="btn-cancel" @click="closeModal">
                        Cancelar
                    </button>
                    <button type="submit" class="btn-save" :disabled="!formData.title.trim()">
                        {{ task ? 'Actualizar' : 'Crear' }} Tarea
                    </button>
                </div>
            </form>
        </div>
    </div>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'
import type { Task } from '@/types/task'


interface Props {
    task?: Task | null
}

const props = withDefaults(defineProps<Props>(), {
    task: null
})


const emit = defineEmits<{
    close: []
    save: [taskData: Partial<Task> & { title: string }]
}>()


const formData = reactive({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    due_date: '',
    is_completed: false
})

const errors = reactive({
    title: ''
})


watch(() => props.task, (newTask) => {
    if (newTask) {
        formData.title = newTask.title
        formData.description = newTask.description || ''
        formData.priority = newTask.priority
        formData.due_date = newTask.due_date || ''
        formData.is_completed = newTask.is_completed
    } else {
        // Reset form para nueva tarea
        formData.title = ''
        formData.description = ''
        formData.priority = 'medium'
        formData.due_date = ''
        formData.is_completed = false
    }
}, { immediate: true })


const validateForm = (): boolean => {
    errors.title = ''

    if (!formData.title.trim()) {
        errors.title = 'El título es requerido'
        return false
    }

    return true
}


const submitForm = () => {
    if (!validateForm()) return

    emit('save', {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        priority: formData.priority,
        due_date: formData.due_date || undefined,
        is_completed: formData.is_completed
    })
}


const closeModal = () => {
    emit('close')
}
</script>

<style scoped>
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 20px;
}

.task-form-modal {
    background: white;
    border-radius: 12px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
    width: 100%;
    max-width: 500px;
    max-height: 90vh;
    overflow-y: auto;
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24px;
    border-bottom: 1px solid #e5e7eb;
}

.modal-header h2 {
    margin: 0;
    color: #1f2937;
    font-size: 1.5rem;
}

.close-btn {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: #6b7280;
    padding: 4px;
    border-radius: 4px;
    transition: background-color 0.2s;
}

.close-btn:hover {
    background-color: #f3f4f6;
}

.task-form {
    padding: 24px;
}

.form-group {
    margin-bottom: 20px;
}

label {
    display: block;
    margin-bottom: 8px;
    font-weight: 600;
    color: #374151;
}

.checkbox-label {
    display: flex;
    align-items: center;
    cursor: pointer;
}

.checkbox-label input {
    margin-right: 8px;
    margin-bottom: 0;
}

input[type="text"],
input[type="date"],
textarea,
select {
    width: 100%;
    padding: 12px;
    border: 2px solid #e5e7eb;
    border-radius: 8px;
    font-size: 14px;
    transition: border-color 0.2s;
}

input[type="text"]:focus,
input[type="date"]:focus,
textarea:focus,
select:focus {
    outline: none;
    border-color: #ff5757;
    box-shadow: 0 0 0 3px rgba(255, 87, 87, 0.1);
}

input.error {
    border-color: #ef4444;
}

.error-message {
    color: #ef4444;
    font-size: 12px;
    margin-top: 4px;
    display: block;
}

textarea {
    resize: vertical;
    min-height: 60px;
}

.form-actions {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
    margin-top: 24px;
    padding-top: 20px;
    border-top: 1px solid #e5e7eb;
}

.btn-cancel,
.btn-save {
    padding: 12px 24px;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
}

.btn-cancel {
    background: #f3f4f6;
    color: #6b7280;
}

.btn-cancel:hover {
    background: #e5e7eb;
}

.btn-save {
    background: #ff5757;
    color: white;
}

.btn-save:hover:not(:disabled) {
    background: #ff4444;
}

.btn-save:disabled {
    background: #d1d5db;
    cursor: not-allowed;
}
</style>