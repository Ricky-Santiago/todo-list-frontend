<template>
    <div class="register-container">
        <!--  Card contenedora -->
        <div class="register-card">
            <!--  Logo y título -->
            <div class="register-header">
                <h1>Todo Daily</h1>
                <p>Crea tu cuenta</p>
            </div>

            <!--  Formulario de registro -->
            <form @submit.prevent="handleRegister" class="register-form">
                <!--  Input Nombre -->
                <div class="form-group">
                    <label for="first_name">Nombre</label>
                    <div class="input-wrapper">
                        <input id="first_name" v-model="formData.first_name" type="text" placeholder="Tu nombre" :class="{
                            'error': errors.first_name,
                            'valid': formData.first_name && !errors.first_name && formData.first_name.trim().length >= 2
                        }" @input="validateField('first_name')" @blur="validateField('first_name')" />
                    </div>
                    <div class="error-space">
                        <span v-if="errors.first_name" class="error-message">{{ errors.first_name }}</span>
                    </div>
                </div>

                <!--  Input Apellido -->
                <div class="form-group">
                    <label for="last_name">Apellido</label>
                    <div class="input-wrapper">
                        <input id="last_name" v-model="formData.last_name" type="text" placeholder="Tu apellido" :class="{
                            'error': errors.last_name,
                            'valid': formData.last_name && !errors.last_name && formData.last_name.trim().length >= 2
                        }" @input="validateField('last_name')" @blur="validateField('last_name')" />
                    </div>
                    <div class="error-space">
                        <span v-if="errors.last_name" class="error-message">{{ errors.last_name }}</span>
                    </div>
                </div>

                <!--  Input Email -->
                <div class="form-group">
                    <label for="email">Email</label>
                    <div class="input-wrapper">
                        <input id="email" v-model="formData.email" type="email" placeholder="tu@email.com" :class="{
                            'error': errors.email,
                            'valid': formData.email && !errors.email && /\S+@\S+\.\S+/.test(formData.email)
                        }" @input="validateField('email')" @blur="validateField('email')" />
                    </div>
                    <div class="error-space">
                        <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
                    </div>
                </div>

                <!--  Input Password -->
                <div class="form-group">
                    <label for="password">Contraseña</label>
                    <div class="input-wrapper">
                        <input id="password" v-model="formData.password" type="password" placeholder="••••••••" :class="{
                            'error': errors.password,
                            'valid': formData.password && !errors.password && formData.password.length >= 8
                        }" @input="validateField('password')" @blur="validateField('password')" />
                    </div>
                    <div class="error-space">
                        <span v-if="errors.password" class="error-message">{{ errors.password }}</span>
                    </div>
                </div>

                <!--  Input Confirmar Password -->
                <div class="form-group">
                    <label for="password_confirmation">Confirmar Contraseña</label>
                    <div class="input-wrapper">
                        <input id="password_confirmation" v-model="formData.password_confirmation" type="password"
                            placeholder="••••••••" :class="{
                                'error': errors.password_confirmation,
                                'valid': formData.password_confirmation && !errors.password_confirmation && formData.password_confirmation === formData.password
                            }" @input="validateField('password_confirmation')"
                            @blur="validateField('password_confirmation')" />
                    </div>
                    <div class="error-space">
                        <span v-if="errors.password_confirmation" class="error-message">{{ errors.password_confirmation
                            }}</span>
                    </div>
                </div>

                <!--  Mensaje de error general -->
                <div class="general-error-space">
                    <div v-if="errorMessage" class="error-message general-error">
                        {{ errorMessage }}
                    </div>
                </div>

                <!--  Botón de submit -->
                <button type="submit" :disabled="isLoading" class="register-button">
                    <span v-if="isLoading">Creando cuenta...</span>
                    <span v-else>Crear Cuenta</span>
                </button>
            </form>

            <!--  Link a login -->
            <p class="login-link">
                ¿Ya tienes cuenta?
                <router-link to="/login">Inicia sesión aquí</router-link>
            </p>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import { useToastStore } from '@/stores/toast.store'


const router = useRouter()
const authStore = useAuthStore()
const toastStore = useToastStore()


const formData = reactive({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    password_confirmation: ''
})


const errors = reactive({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    password_confirmation: ''
})


const isLoading = ref(false)
const errorMessage = ref('')


const validateField = (field: string) => {
    errors[field as keyof typeof errors] = ''

    switch (field) {
        case 'first_name':
            if (!formData.first_name.trim()) {
                errors.first_name = 'El nombre es requerido'
            } else if (formData.first_name.length < 2) {
                errors.first_name = 'El nombre debe tener al menos 2 caracteres'
            }
            break

        case 'last_name':
            if (!formData.last_name.trim()) {
                errors.last_name = 'El apellido es requerido'
            } else if (formData.last_name.length < 2) {
                errors.last_name = 'El apellido debe tener al menos 2 caracteres'
            }
            break

        case 'email':
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            if (!formData.email) {
                errors.email = 'El email es requerido'
            } else if (!emailRegex.test(formData.email)) {
                errors.email = 'Ingresa un email válido'
            }
            break

        case 'password':
            if (!formData.password) {
                errors.password = 'La contraseña es requerida'
            } else if (formData.password.length < 6) {
                errors.password = 'La contraseña debe tener al menos 6 caracteres'
            }
            // Re-validar confirmación si ya fue ingresada
            if (formData.password_confirmation) {
                validateField('password_confirmation')
            }
            break

        case 'password_confirmation':
            if (!formData.password_confirmation) {
                errors.password_confirmation = 'Confirma tu contraseña'
            } else if (formData.password !== formData.password_confirmation) {
                errors.password_confirmation = 'Las contraseñas no coinciden'
            }
            break
    }
}


const validateForm = (): boolean => {
    validateField('first_name')
    validateField('last_name')
    validateField('email')
    validateField('password')
    validateField('password_confirmation')

    return !Object.values(errors).some(error => error !== '')
}


const handleRegister = async () => {
    console.log('🚀 Register: Form submitted')
    errorMessage.value = ''


    if (!validateForm()) {
        console.log('❌ Register: Form validation failed')
        return
    }

    isLoading.value = true

    try {
        console.log('📤 Register: Calling auth store register')


        await authStore.register({
            first_name: formData.first_name.trim(),
            last_name: formData.last_name.trim(),
            email: formData.email.trim(),
            password: formData.password
        })

        console.log('✅ Register: Success, redirecting to dashboard')


        toastStore.success(
            `¡Cuenta creada exitosamente! Bienvenido, ${formData.first_name}!`,
            '🎉 Registro exitoso'
        )

        await router.push('/dashboard')

    } catch (error) {
        console.error('❌ Register: Error occurred', error)


        let errorMsg = 'Error al crear la cuenta. Inténtalo de nuevo.'


        const apiError = error as {
            response?: {
                data?: { message?: string }
                status?: number
            }
        }

        if (apiError?.response?.data?.message) {
            errorMsg = apiError.response.data.message
        } else if (apiError?.response?.status === 409) {
            errorMsg = 'Ya existe una cuenta con este email'
        } else if (apiError?.response?.status === 400) {
            errorMsg = 'Datos inválidos. Revisa la información ingresada'
        } else if (!navigator.onLine) {
            errorMsg = 'Sin conexión a internet'
        }

        errorMessage.value = errorMsg
        toastStore.error(errorMsg, '❌ Error de registro')
        console.log('Error message set to:', errorMsg)

    } finally {
        isLoading.value = false
        console.log('Register attempt finished')
    }
}
</script>

<style scoped>
.register-container {
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

.register-container::before {
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

.register-card {
    background: #ffffff;
    padding: 3rem;
    border-radius: 16px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
    border: 1px solid #f1f5f9;
    width: 100%;
    max-width: 480px;
    position: relative;
    z-index: 1;
    margin: auto;
    min-height: auto;
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.register-header {
    text-align: center;
    margin-bottom: 2rem;
}

.register-header h1 {
    color: #ff5757;
    margin-bottom: 0.5rem;
    font-size: 2.2rem;
    font-weight: 700;
}

.register-header p {
    color: #64748b;
    margin: 0;
    font-size: 1rem;
    font-weight: 400;
}

.form-group {
    margin-bottom: 1.25rem;
    min-height: 85px;
}

.input-wrapper {
    position: relative;
}

.error-space {
    height: 8px;
    margin-top: 0.5rem;
    display: flex;
    align-items: flex-start;
}

label {
    display: block;
    margin-bottom: 0.5rem;
    color: #374151;
    font-weight: 600;
    font-size: 0.9rem;
}

input {
    width: 100%;
    padding: 14px 18px;
    border: 2px solid #e5e7eb;
    border-radius: 8px;
    font-size: 0.95rem;
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

input.valid {
    border-color: #10b981;
    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

.error-message {
    color: #ef4444;
    font-size: 0.8rem;
    line-height: 1.2;
    min-height: 16px;
    display: block;
    margin: 0;
}

.general-error-space {
    min-height: 10px;
    margin: 1rem 0;
    display: flex;
    align-items: flex-start;
    justify-content: center;
}

.general-error {
    text-align: center;
    margin: 0;
    padding: 0.75rem;
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.2);
    border-radius: 8px;
    color: #ef4444;
    font-weight: 500;
    width: 100%;
    font-size: 0.9rem;
}

.register-button {
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

.register-button::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s;
}

.register-button:hover::before {
    left: 100%;
}

.register-button:hover:not(:disabled) {
    background: #ff4444;
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(255, 87, 87, 0.3);
}

.register-button:disabled {
    background: #9ca3af;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
}

.login-link {
    text-align: center;
    margin-top: 1.5rem;
    color: #64748b;
    font-size: 0.95rem;
}

.login-link a {
    color: #ff5757;
    text-decoration: none;
    font-weight: 600;
    transition: color 0.3s ease;
}

.login-link a:hover {
    color: #ff4444;
    text-decoration: underline;
}


@media (max-width: 480px) {
    .register-card {
        padding: 2rem;
        margin: 10px;
        max-width: none;
    }

    .register-header h1 {
        font-size: 1.8rem;
    }

    .form-group {
        min-height: 80px;
    }

    input {
        padding: 12px 16px;
        font-size: 0.9rem;
    }
}
</style>