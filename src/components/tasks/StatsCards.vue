<template>
    <div class="stats-container">
        <!-- Loading state -->
        <div v-if="loading" class="loading-grid">
            <div v-for="i in 4" :key="i" class="stat-card loading">
                <div class="loading-shimmer"></div>
            </div>
        </div>

        <!-- Stats cards -->
        <div v-else class="stats-grid">
            <!-- Total de tareas -->
            <div class="stat-card total">
                <div class="stat-icon">📋</div>
                <div class="stat-content">
                    <h3 class="stat-number">{{ stats?.total || 0 }}</h3>
                    <p class="stat-label">Total de Tareas</p>
                </div>
            </div>

            <!-- Tareas completadas -->
            <div class="stat-card completed">
                <div class="stat-icon">✅</div>
                <div class="stat-content">
                    <h3 class="stat-number">{{ stats?.completed || 0 }}</h3>
                    <p class="stat-label">Completadas</p>
                </div>
            </div>

            <!-- Tareas pendientes -->
            <div class="stat-card pending">
                <div class="stat-icon">⏳</div>
                <div class="stat-content">
                    <h3 class="stat-number">{{ stats?.pending || 0 }}</h3>
                    <p class="stat-label">Pendientes</p>
                </div>
            </div>

            <!-- Progreso -->
            <div class="stat-card progress">
                <div class="stat-icon">📊</div>
                <div class="stat-content">
                    <h3 class="stat-number">{{ completionPercentage }}%</h3>
                    <p class="stat-label">Completado</p>
                    <div class="progress-bar">
                        <div class="progress-fill" :style="{ width: `${completionPercentage}%` }"></div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Stats adicionales -->
        <div v-if="!loading && stats" class="additional-stats">
            <div class="stat-row">
                <div class="stat-item">
                    <span class="stat-mini-icon">🔴</span>
                    <span class="stat-mini-label">Alta prioridad:</span>
                    <span class="stat-mini-value">{{ stats.high_priority || 0 }}</span>
                </div>

                <div class="stat-item">
                    <span class="stat-mini-icon">🟡</span>
                    <span class="stat-mini-label">Media prioridad:</span>
                    <span class="stat-mini-value">{{ stats.medium_priority || 0 }}</span>
                </div>

                <div class="stat-item">
                    <span class="stat-mini-icon">🟢</span>
                    <span class="stat-mini-label">Baja prioridad:</span>
                    <span class="stat-mini-value">{{ stats.low_priority || 0 }}</span>
                </div>
            </div>

            <div class="stat-row">
                <div class="stat-item">
                    <span class="stat-mini-icon">🚨</span>
                    <span class="stat-mini-label">Vencidas:</span>
                    <span class="stat-mini-value">{{ stats.overdue_tasks || 0 }}</span>
                </div>

                <div class="stat-item">
                    <span class="stat-mini-icon">📅</span>
                    <span class="stat-mini-label">Próximas:</span>
                    <span class="stat-mini-value">{{ stats.upcoming_tasks || 0 }}</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { TaskStats } from '@/types/task'

// Props
interface Props {
    stats: TaskStats | null
    loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
    loading: false
})

// Calcular porcentaje de completado
const completionPercentage = computed(() => {
    if (!props.stats || props.stats.total === 0) return 0
    return Math.round((props.stats.completed / props.stats.total) * 100)
})
</script>

<style scoped>
.stats-container {
    margin-bottom: 2rem;
}

.loading-grid,
.stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    margin-bottom: 1.5rem;
}

.stat-card {
    background: white;
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    border: 1px solid #e5e7eb;
    display: flex;
    align-items: center;
    gap: 1rem;
    transition: all 0.3s ease;
}

.stat-card:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
}

.stat-card.loading {
    height: 100px;
    position: relative;
    overflow: hidden;
}

.loading-shimmer {
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg,
            transparent,
            rgba(255, 255, 255, 0.8),
            transparent);
    animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
    0% {
        left: -100%;
    }

    100% {
        left: 100%;
    }
}

.stat-icon {
    font-size: 2.5rem;
    opacity: 0.8;
}

.stat-content {
    flex: 1;
}

.stat-number {
    font-size: 2rem;
    font-weight: 700;
    margin: 0 0 0.25rem 0;
    color: #1f2937;
}

.stat-label {
    margin: 0;
    color: #6b7280;
    font-size: 0.9rem;
    font-weight: 500;
}

.progress-bar {
    width: 100%;
    height: 6px;
    background: #e5e7eb;
    border-radius: 3px;
    margin-top: 0.5rem;
    overflow: hidden;
}

.progress-fill {
    height: 100%;
    background: #ff5757;
    transition: width 0.5s ease;
    border-radius: 3px;
}

/* Colores específicos por tipo */
.stat-card.total {
    border-left: 4px solid #ff5757;
}

.stat-card.completed {
    border-left: 4px solid #10b981;
}

.stat-card.pending {
    border-left: 4px solid #f59e0b;
}

.stat-card.progress {
    border-left: 4px solid #ff5757;
}

.additional-stats {
    background: white;
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    border: 1px solid #e5e7eb;
}

.stat-row {
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    margin-bottom: 1rem;
}

.stat-row:last-child {
    margin-bottom: 0;
}

.stat-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.9rem;
}

.stat-mini-icon {
    font-size: 1.1rem;
}

.stat-mini-label {
    color: #6b7280;
}

.stat-mini-value {
    font-weight: 600;
    color: #1f2937;
}

@media (max-width: 768px) {
    .stats-grid {
        grid-template-columns: repeat(2, 1fr);
    }

    .stat-card {
        padding: 1rem;
    }

    .stat-icon {
        font-size: 2rem;
    }

    .stat-number {
        font-size: 1.5rem;
    }

    .stat-row {
        flex-direction: column;
        gap: 1rem;
    }
}

@media (max-width: 480px) {
    .stats-grid {
        grid-template-columns: 1fr;
    }
}
</style>