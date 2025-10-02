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
                    <div class="input-wrapper">
                        <input id="title" v-model="formData.title" type="text"
                            placeholder="Escribe el título de la tarea" :class="{
                                error: errors.title,
                                valid: formData.title.trim().length >= 3 && !errors.title
                            }" required />
                        <div class="field-info">
                            <span v-if="errors.title" class="error-message">{{ errors.title }}</span>
                            <span v-if="formData.title" class="char-count"
                                :class="{ warning: formData.title.length > 80 }">
                                {{ formData.title.length }}/100 caracteres
                            </span>
                        </div>
                    </div>
                </div>

                <!-- Descripción -->
                <div class="form-group">
                    <label for="description">Descripción</label>
                    <textarea id="description" v-model="formData.description" placeholder="Describe la tarea (opcional)"
                        rows="3" :class="{ error: errors.description }"></textarea>
                    <span v-if="errors.description" class="error-message">{{ errors.description }}</span>
                    <span v-if="formData.description" class="char-count"
                        :class="{ warning: formData.description.length > 400 }">
                        {{ formData.description.length }}/500 caracteres
                    </span>
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
                    <input id="due_date" v-model="formData.due_date" type="date" :class="{ error: errors.due_date }" />
                    <span v-if="errors.due_date" class="error-message">{{ errors.due_date }}</span>
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
    title: '',
    description: '',
    due_date: ''
})


watch(() => props.task, (newTask) => {
    if (newTask) {
        formData.title = newTask.title
        formData.description = newTask.description || ''
        formData.priority = newTask.priority
        formData.due_date = newTask.due_date || ''
        formData.is_completed = newTask.is_completed
    } else {

        formData.title = ''
        formData.description = ''
        formData.priority = 'medium'
        formData.due_date = ''
        formData.is_completed = false
    }
}, { immediate: true })



const validateTitle = () => {
    if (!formData.title.trim()) {
        errors.title = 'El título es requerido'
    } else if (formData.title.trim().length < 3) {
        errors.title = 'El título debe tener al menos 3 caracteres'
    } else if (formData.title.length > 100) {
        errors.title = 'El título no puede exceder 100 caracteres'
    } else {
        errors.title = ''
    }
}


const validateDescription = () => {
    if (formData.description && formData.description.length > 500) {
        errors.description = 'La descripción no puede exceder 500 caracteres'
    } else {
        errors.description = ''
    }
}


const validateDueDate = () => {
    if (formData.due_date) {
        const selectedDate = new Date(formData.due_date)
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        if (selectedDate < today) {
            errors.due_date = 'La fecha límite no puede ser anterior a hoy'
        } else {
            errors.due_date = ''
        }
    } else {
        errors.due_date = ''
    }
}


const validateForm = (): boolean => {
    validateTitle()
    validateDescription()
    validateDueDate()

    return !errors.title && !errors.description && !errors.due_date
}


watch(() => formData.title, validateTitle)
watch(() => formData.description, validateDescription)
watch(() => formData.due_date, validateDueDate)


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

input.error,
textarea.error {
    border-color: #ef4444;
    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

input.valid {
    border-color: #10b981;
    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

.input-wrapper {
    position: relative;
}

.field-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 4px;
    min-height: 16px;
}

.error-message {
    color: #ef4444;
    font-size: 12px;
    font-weight: 500;
}

.char-count {
    color: #6b7280;
    font-size: 11px;
    font-weight: 500;
}

.char-count.warning {
    color: #f59e0b;
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