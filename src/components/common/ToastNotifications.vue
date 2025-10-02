<template>
    <Teleport to="body">
        <div class="toast-container">
            <TransitionGroup name="toast" tag="div">
                <div v-for="toast in toasts" :key="toast.id" :class="['toast', `toast--${toast.type}`]">
                    <div class="toast__icon">
                        <span v-if="toast.type === 'success'">✅</span>
                        <span v-else-if="toast.type === 'error'">❌</span>
                        <span v-else-if="toast.type === 'warning'">⚠️</span>
                        <span v-else>ℹ️</span>
                    </div>
                    <div class="toast__content">
                        <h4 v-if="toast.title" class="toast__title">{{ toast.title }}</h4>
                        <p class="toast__message">{{ toast.message }}</p>
                    </div>
                    <button class="toast__close" @click="removeToast(toast.id)" type="button">
                        ✕
                    </button>
                </div>
            </TransitionGroup>
        </div>
    </Teleport>
</template>

<script setup lang="ts">
import { useToastStore } from '@/stores/toast.store'

const toastStore = useToastStore()
const { toasts, removeToast } = toastStore
</script>

<style scoped>
.toast-container {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 9999;
    pointer-events: none;
    max-width: 400px;
}

.toast {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 16px;
    margin-bottom: 12px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
    border-left: 4px solid;
    pointer-events: auto;
    position: relative;
    min-width: 320px;
    max-width: 400px;
}

.toast--success {
    border-left-color: #10b981;
    background: linear-gradient(135deg, #ecfdf5 0%, #ffffff 100%);
}

.toast--error {
    border-left-color: #ef4444;
    background: linear-gradient(135deg, #fef2f2 0%, #ffffff 100%);
}

.toast--warning {
    border-left-color: #f59e0b;
    background: linear-gradient(135deg, #fffbeb 0%, #ffffff 100%);
}

.toast--info {
    border-left-color: #3b82f6;
    background: linear-gradient(135deg, #eff6ff 0%, #ffffff 100%);
}

.toast__icon {
    font-size: 20px;
    line-height: 1;
    flex-shrink: 0;
    margin-top: 2px;
}

.toast__content {
    flex: 1;
    min-width: 0;
}

.toast__title {
    margin: 0 0 4px 0;
    font-size: 14px;
    font-weight: 600;
    color: #1f2937;
}

.toast__message {
    margin: 0;
    font-size: 14px;
    line-height: 1.4;
    color: #6b7280;
}

.toast__close {
    position: absolute;
    top: 8px;
    right: 8px;
    background: none;
    border: none;
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;
    color: #9ca3af;
    font-size: 12px;
    transition: all 0.2s;
    flex-shrink: 0;
}

.toast__close:hover {
    background: rgba(0, 0, 0, 0.1);
    color: #6b7280;
}

/* Animaciones */
.toast-enter-active {
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.toast-leave-active {
    transition: all 0.3s ease-out;
}

.toast-enter-from {
    transform: translateX(100%);
    opacity: 0;
}

.toast-leave-to {
    transform: translateX(100%);
    opacity: 0;
}

.toast-move {
    transition: transform 0.3s ease;
}

@media (max-width: 480px) {
    .toast-container {
        top: 10px;
        right: 10px;
        left: 10px;
        max-width: none;
    }

    .toast {
        min-width: auto;
        max-width: none;
        margin-bottom: 8px;
    }
}
</style>