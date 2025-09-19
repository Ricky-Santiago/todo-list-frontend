<template>
    <div class="dashboard-container">
        <header class="dashboard-header">
            <h1>Dashboard</h1>
            <button @click="handleLogout" class="logout-button">
                Cerrar Sesión
            </button>
        </header>
        <main class="dashboard-content">
            <p>Página del dashboard en construcción</p>
        </main>
    </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/auth.store'

// Store de autenticación
const authStore = useAuthStore()

// Función para manejar el logout
const handleLogout = () => {
    // Limpiar localStorage PRIMERO para que el router guard no bloquee
    localStorage.removeItem('authToken')

    // Limpiar estado del store
    authStore.token = null
    authStore.user = null

    // Forzar recarga completa de la página para ir al login
    window.location.href = '/login'
}
</script>

<style scoped>
.dashboard-container {
    min-height: 100vh;
    padding: 2rem;
}

.dashboard-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid #e1e5e9;
}

.dashboard-header h1 {
    color: #333;
    font-size: 2rem;
    margin: 0;
}

.logout-button {
    padding: 0.75rem 1.5rem;
    background: #dc3545;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.3s;
}

.logout-button:hover {
    background: #c82333;
}

.dashboard-content {
    text-align: center;
    color: #666;
}
</style>