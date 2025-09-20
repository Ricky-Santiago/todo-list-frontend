<template>
    <header class="app-header">
        <div class="header-content">
            <!-- Logo y título -->
            <div class="header-left">
                <h1 class="app-title">Todo Daily</h1>
                <span class="app-subtitle">Organiza tu día</span>
            </div>

            <!-- Acciones del usuario -->
            <div class="header-right">
                <!-- Información del usuario -->
                <div class="user-info">
                    <span class="user-greeting">Hola, Usuario</span>
                </div>

                <!-- Botón de logout -->
                <button class="logout-button" @click="handleLogout" title="Cerrar Sesión">
                    🚪 Salir
                </button>
            </div>
        </div>
    </header>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/auth.store'

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
.app-header {
    background: #ffffff;
    color: #1f2937;
    padding: 1.5rem 0;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    border-bottom: 1px solid #f1f5f9;
}

.header-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.header-left {
    display: flex;
    flex-direction: column;
}

.app-title {
    font-size: 1.8rem;
    font-weight: 700;
    margin: 0;
    color: #ff5757;
}

.app-subtitle {
    font-size: 0.9rem;
    color: #64748b;
    margin-top: 2px;
}

.header-right {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.user-info {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
}

.user-greeting {
    font-size: 0.9rem;
    color: #374151;
}

.logout-button {
    padding: 0.5rem 1rem;
    background: #ff5757;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 0.9rem;
    transition: all 0.3s ease;
}

.logout-button:hover {
    background: #ff4444;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(255, 87, 87, 0.3);
}

@media (max-width: 768px) {
    .header-content {
        padding: 0 1rem;
    }

    .app-title {
        font-size: 1.5rem;
    }

    .header-right {
        gap: 0.5rem;
    }

    .user-greeting {
        display: none;
    }

    .logout-button {
        padding: 0.5rem;
        font-size: 0.8rem;
    }
}
</style>