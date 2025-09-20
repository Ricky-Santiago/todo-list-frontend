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
                    <div class="input-wrapper">
                        <input id="email" v-model="formData.email" type="email" placeholder="tu@email.com"
                            :class="{ 'error': errors.email }" @blur="validateField('email')" />
                    </div>
                    <div class="error-space">
                        <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
                    </div>
                </div>

                <!-- 🔐 Input Password -->
                <div class="form-group">
                    <label for="password">Contraseña</label>
                    <div class="input-wrapper">
                        <input id="password" v-model="formData.password" type="password" placeholder="••••••••"
                            :class="{ 'error': errors.password }" @blur="validateField('password')" />
                    </div>
                    <div class="error-space">
                        <span v-if="errors.password" class="error-message">{{ errors.password }}</span>
                    </div>
                </div>

                <!-- ❌ Mensaje de error general -->
                <div class="general-error-space">
                    <div v-if="errorMessage" class="error-message general-error">
                        {{ errorMessage }}
                    </div>
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
const handleLogin = async (event?: Event) => {
    // Asegurar que el formulario no se envíe por defecto
    if (event) {
        event.preventDefault()
    }

    console.log('Login attempt started') // Debug log
    errorMessage.value = ''

    if (!validateForm()) {
        errorMessage.value = 'Por favor, completa todos los campos correctamente'
        console.log('Validation failed', errors) // Debug log
        return
    }

    isLoading.value = true

    try {
        console.log('Calling authStore.login with:', formData) // Debug log
        // 📡 Llamar al store para hacer login
        const response = await authStore.login(formData)
        console.log('Login successful:', response) // Debug log

        // ✅ Redirigir al dashboard si es exitoso
        router.push('/dashboard')

    } catch (error) {
        console.error('Login error caught:', error) // Debug log

        // ❌ Manejar errores de la API de forma más robusta
        let errorMsg = 'Error al iniciar sesión'

        if (error && typeof error === 'object') {
            const apiError = error as {
                response?: {
                    data?: {
                        message?: string
                        error?: string
                    }
                    status?: number
                }
                message?: string
            }

            // Verificar diferentes estructuras de error
            if (apiError.response?.data?.message) {
                errorMsg = apiError.response.data.message
            } else if (apiError.response?.data?.error) {
                errorMsg = apiError.response.data.error
            } else if (apiError.message) {
                errorMsg = apiError.message
            } else if (apiError.response?.status === 401) {
                errorMsg = 'Credenciales inválidas'
            } else if (apiError.response?.status && apiError.response.status >= 500) {
                errorMsg = 'Error del servidor. Inténtalo más tarde'
            } else if (!navigator.onLine) {
                errorMsg = 'Sin conexión a internet'
            }
        }

        errorMessage.value = errorMsg
        console.log('Error message set to:', errorMsg) // Debug log

    } finally {
        isLoading.value = false
        console.log('Login attempt finished') // Debug log
    }
}
</script>

<style scoped>
.login-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    display: grid;
    place-items: center;
    background: #f8fafc;
    padding: 20px;
    box-sizing: border-box;
    overflow: auto;
}

.login-container::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at 30% 20%, rgba(255, 87, 87, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 70% 80%, rgba(255, 87, 87, 0.05) 0%, transparent 50%);
    pointer-events: none;
}

.login-card {
    background: #ffffff;
    padding: 3rem;
    border-radius: 16px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
    border: 1px solid #f1f5f9;
    width: 100%;
    max-width: 420px;
    position: relative;
    z-index: 1;
    margin: auto;
    min-height: 580px;
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.login-header {
    text-align: center;
    margin-bottom: 2.5rem;
}

.login-header h1 {
    color: #ff5757;
    margin-bottom: 0.5rem;
    font-size: 2.2rem;
    font-weight: 700;
}

.login-header p {
    color: #64748b;
    margin: 0;
    font-size: 1rem;
    font-weight: 400;
}

.form-group {
    margin-bottom: 1.5rem;
    min-height: 108px;
    /* Reservar espacio para label + input + error message */
}

.input-wrapper {
    position: relative;
}

.error-space {
    height: 8px;
    /* Espacio reservado para mensajes de error */
    margin-top: 0.5rem;
    display: flex;
    align-items: flex-start;
}

label {
    display: block;
    margin-bottom: 0.75rem;
    color: #374151;
    font-weight: 600;
    font-size: 0.95rem;
}

input {
    width: 100%;
    padding: 16px 20px;
    border: 2px solid #e5e7eb;
    border-radius: 8px;
    font-size: 1rem;
    transition: all 0.3s ease;
    background: #ffffff;
    color: #1f2937;
}

input:focus {
    outline: none;
    border-color: #ff5757;
    box-shadow: 0 0 0 3px rgba(255, 87, 87, 0.1);
    transform: translateY(-1px);
}

input.error {
    border-color: #ef4444;
    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.error-message {
    color: #ef4444;
    font-size: 0.875rem;
    line-height: 1.2;
    min-height: 21px;
    /* Altura mínima para mantener espacio */
    display: block;
    margin: 0;
}

.general-error-space {
    min-height: 10px;
    /* Espacio reservado para error general */
    margin: 1.5rem 0;
    display: flex;
    align-items: flex-start;
    justify-content: center;
}

.general-error {
    text-align: center;
    margin: 0;
    padding: 1rem;
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.2);
    border-radius: 8px;
    color: #ef4444;
    font-weight: 500;
    width: 100%;
}

.login-button {
    width: 100%;
    padding: 16px;
    background: #ff5757;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 1.1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
}

.login-button::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s;
}

.login-button:hover::before {
    left: 100%;
}

.login-button:hover:not(:disabled) {
    background: #ff4444;
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(255, 87, 87, 0.3);
}

.login-button:disabled {
    background: #9ca3af;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
}

.register-link {
    text-align: center;
    margin-top: 1rem;
    color: #64748b;
    font-size: 0.95rem;
}

.register-link a {
    color: #ff5757;
    text-decoration: none;
    font-weight: 600;
    transition: color 0.3s ease;
}

.register-link a:hover {
    color: #ff4444;
    text-decoration: underline;
}

/* Responsive design */
@media (max-width: 480px) {
    .login-card {
        padding: 2rem;
        margin: 10px;
    }

    .login-header h1 {
        font-size: 1.8rem;
    }
}
</style>