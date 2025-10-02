<template>
    <header class="app-header">
        <div class="header-content">
            <!-- Logo y título -->
            <div class="header-left">
                <h1 class="app-title">Todo Daily</h1>
            </div>

            <!-- Búsqueda -->
            <div class="header-center">
                <div class="search-box">
                    <input v-model="searchQuery" type="text" placeholder="🔍 Buscar tareas..." class="search-input"
                        @input="handleSearch" />
                    <button v-if="searchQuery" @click="clearSearch" class="clear-search-btn">✕</button>
                </div>
            </div>

            <!-- Acciones del usuario -->
            <div class="header-right">
                <!-- Información del usuario -->
                <div class="user-info">
                    <div class="user-avatar">👤</div>
                    <div class="user-text">
                        <span class="user-greeting">{{ userGreeting }}</span>

                    </div>
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
import { ref, watch, computed } from 'vue'
import { useAuthStore } from '@/stores/auth.store'


interface Props {
    searchQuery?: string
}

const props = withDefaults(defineProps<Props>(), {
    searchQuery: ''
})

const emit = defineEmits<{
    'search-change': [query: string]
    'search-clear': []
}>()

const authStore = useAuthStore()


const userGreeting = computed(() => {
    const user = authStore.currentUser
    if (user?.first_name) {

        if (user.last_name) {
            return `HOLA, ${user.first_name} ${user.last_name}`
        }

        return `Hola, ${user.first_name}`
    }

    return authStore.isLoading ? 'Cargando...' : 'Hola, Usuario'
})


const searchQuery = ref(props.searchQuery)


watch(() => props.searchQuery, (newValue) => {
    searchQuery.value = newValue
})


const handleSearch = () => {
    emit('search-change', searchQuery.value)
}

const clearSearch = () => {
    searchQuery.value = ''
    emit('search-clear')
}

const handleLogout = () => {

    localStorage.removeItem('authToken')


    authStore.token = null
    authStore.user = null


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
    display: grid;
    grid-template-columns: 1fr 2fr 1fr;
    align-items: center;
    gap: 2rem;
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

.header-center {
    display: flex;
    justify-content: center;
}

.search-box {
    position: relative;
    width: 100%;
    max-width: 400px;
}

.search-input {
    width: 100%;
    padding: 12px 16px 12px 40px;
    border: 2px solid #e5e7eb;
    border-radius: 10px;
    font-size: 14px;
    background: #f8fafc;
    transition: all 0.3s ease;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.search-input:focus {
    outline: none;
    border-color: #ff5757;
    background: white;
    box-shadow: 0 0 0 3px rgba(255, 87, 87, 0.1), 0 2px 8px rgba(0, 0, 0, 0.15);
    transform: translateY(-1px);
}

.search-input::placeholder {
    color: #9ca3af;
    font-weight: 400;
}

.clear-search-btn {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    background: #f3f4f6;
    border: none;
    border-radius: 50%;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: #6b7280;
    font-size: 10px;
    transition: all 0.2s;
}

.clear-search-btn:hover {
    background: #e5e7eb;
    color: #374151;
}



.header-right {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.user-info {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.user-avatar {
    width: 32px;
    height: 32px;
    background: #ff5757;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
    color: white;
    flex-shrink: 0;
}

.user-text {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
}

.user-greeting {
    font-size: 0.9rem;
    color: #374151;
    font-weight: 600;
    margin: 0;
}

.user-email {
    font-size: 0.75rem;
    color: #6b7280;
    margin: 0;
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
        grid-template-columns: auto 1fr auto;
        gap: 1rem;
    }

    .app-title {
        font-size: 1.5rem;
    }

    .search-input {
        padding: 10px 14px 10px 35px;
        font-size: 13px;
    }

    .header-right {
        gap: 0.5rem;
    }

    .user-text {
        display: none;
    }

    .user-avatar {
        width: 28px;
        height: 28px;
        font-size: 1rem;
    }

    .logout-button {
        padding: 0.5rem;
        font-size: 0.8rem;
    }
}

@media (max-width: 480px) {
    .header-content {
        grid-template-columns: 1fr;
        grid-template-rows: auto auto;
        gap: 1rem;
        text-align: center;
    }

    .header-left {
        align-items: center;
    }

    .header-center {
        order: 2;
    }

    .header-right {
        order: 1;
        justify-content: center;
    }
}
</style>