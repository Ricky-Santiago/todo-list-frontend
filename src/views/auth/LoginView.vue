<template>
    <div class="login-container">
        <!-- 🎨 Card contenedora -->
        <div class="login-card">
            <!-- 📝 Logo y título -->
            <div class="login-header">
                <h1>Todo Daily</h1>
                <p>Ingresa a tu cuenta</p>
            </div>

            <!-- 📋 Formulario de login -->
            <form @submit.prevent="handleLogin" class="login-form">
                <!-- 📧 Input Email -->
                <div class="form-group">
                    <label for="email">Email</label>
                    <input id="email" v-model="formData.email" type="email" placeholder="tu@email.com"
                        :class="{ 'error': errors.email }" @blur="validateField('email')" />
                    <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
                </div>

                <!-- 🔐 Input Password -->
                <div class="form-group">
                    <label for="password">Contraseña</label>
                    <input id="password" v-model="formData.password" type="password" placeholder="••••••••"
                        :class="{ 'error': errors.password }" @blur="validateField('password')" />
                    <span v-if="errors.password" class="error-message">{{ errors.password }}</span>
                </div>

                <!-- ❌ Mensaje de error general -->
                <div v-if="errorMessage" class="error-message general-error">
                    {{ errorMessage }}
                </div>

                <!-- ✅ Botón de submit -->
                <button type="submit" :disabled="isLoading" class="login-button">
                    <span v-if="isLoading">Cargando...</span>
                    <span v-else>Iniciar Sesión</span>
                </button>
            </form>

            <!-- 🔗 Link a registro -->
            <p class="register-link">
                ¿No tienes cuenta?
                <router-link to="/register">Regístrate aquí</router-link>
            </p>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'

// 🎯 Inicialización
const router = useRouter()
const authStore = useAuthStore()

// 📊 Estado del formulario
const formData = reactive({
    email: '',
    password: ''
})

// ⚠️ Estado de errores y loading
const errors = reactive({
    email: '',
    password: ''
})
const errorMessage = ref('')
const isLoading = ref(false)

// 🔍 Validación de campos
const validateField = (field: keyof typeof formData) => {
    errors[field] = '' // Resetear error

    if (field === 'email') {
        if (!formData.email) {
            errors.email = 'El email es requerido'
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            errors.email = 'Email inválido'
        }
    }

    if (field === 'password') {
        if (!formData.password) {
            errors.password = 'La contraseña es requerida'
        } else if (formData.password.length < 6) {
            errors.password = 'Mínimo 6 caracteres'
        }
    }
}

// ✅ Validación completa del formulario
const validateForm = (): boolean => {
    validateField('email')
    validateField('password')

    return !errors.email && !errors.password && !!formData.email && !!formData.password
}

// 🚀 Manejar envío del formulario
const handleLogin = async () => {
    errorMessage.value = ''

    if (!validateForm()) {
        errorMessage.value = 'Por favor, completa todos los campos correctamente'
        return
    }

    isLoading.value = true

    try {
        // 📡 Llamar al store para hacer login
        await authStore.login(formData)

        // ✅ Redirigir al dashboard si es exitoso
        router.push('/dashboard')

    } catch (error) {
        // ❌ Manejar errores de la API
        const apiError = error as { response?: { data?: { message?: string } } }
        errorMessage.value = apiError.response?.data?.message || 'Error al iniciar sesión'
        console.error('Login error:', error)
    } finally {
        isLoading.value = false
    }
}
</script>

<style scoped>
.login-container {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 20px;
}

.login-card {
    background: white;
    padding: 2rem;
    border-radius: 12px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    width: 100%;
    max-width: 400px;
}

.login-header {
    text-align: center;
    margin-bottom: 2rem;
}

.login-header h1 {
    color: #333;
    margin-bottom: 0.5rem;
    font-size: 1.8rem;
}

.login-header p {
    color: #666;
    margin: 0;
}

.form-group {
    margin-bottom: 1.5rem;
}

label {
    display: block;
    margin-bottom: 0.5rem;
    color: #333;
    font-weight: 500;
}

input {
    width: 100%;
    padding: 12px;
    border: 2px solid #e1e5e9;
    border-radius: 8px;
    font-size: 1rem;
    transition: border-color 0.3s;
}

input:focus {
    outline: none;
    border-color: #667eea;
}

input.error {
    border-color: #e74c3c;
}

.error-message {
    color: #e74c3c;
    font-size: 0.875rem;
    margin-top: 0.25rem;
}

.general-error {
    text-align: center;
    margin: 1rem 0;
    padding: 0.5rem;
    background: #fee;
    border-radius: 4px;
}

.login-button {
    width: 100%;
    padding: 12px;
    background: #667eea;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.3s;
}

.login-button:hover:not(:disabled) {
    background: #5a67d8;
}

.login-button:disabled {
    background: #ccc;
    cursor: not-allowed;
}

.register-link {
    text-align: center;
    margin-top: 1.5rem;
    color: #666;
}

.register-link a {
    color: #667eea;
    text-decoration: none;
}

.register-link a:hover {
    text-decoration: underline;
}
</style>