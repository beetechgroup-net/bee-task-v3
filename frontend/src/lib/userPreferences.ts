import { authService } from '../services/authService'
import type { TaskStatus } from '../types/task'

export type DashboardWidgetId =
  | 'kpis'
  | 'focus_session'
  | 'work_goal'
  | 'recent_tasks'
  | 'quick_shortcuts'

export interface DashboardCardConfig {
  id: DashboardWidgetId
  title: string
  description: string
  visible: boolean
}

export type BiMetricType =
  | 'HOURS_TRACKED'
  | 'TASK_COUNT'
  | 'COMPLETION_RATE'
  | 'PROJECT_BREAKDOWN'
  | 'STATUS_DISTRIBUTION'
  | 'WORK_GOAL'
  | 'ACTIVE_TIMER'
  | 'TOP_TASKS'

export type BiPeriodFilter = 'ALL' | 'TODAY' | 'WEEK' | 'MONTH'

export type BiCardScope = 'INHERIT' | 'MINE' | 'TEAM'

export interface DashboardV2Card {
  id: string
  title: string
  metricType: BiMetricType
  period: BiPeriodFilter
  projectId?: number
  categoryId?: number
  statusFilter?: 'ALL' | 'COMPLETED' | 'IN_PROGRESS' | 'NOT_STARTED'
  colorTheme?: 'brand' | 'accent' | 'emerald' | 'indigo' | 'rose' | 'cyan'
  scope?: BiCardScope
}

export const DEFAULT_V2_CARDS: DashboardV2Card[] = [
  {
    id: 'card-hours-week',
    title: 'Horas Dedicadas (Semana)',
    metricType: 'HOURS_TRACKED',
    period: 'WEEK',
    colorTheme: 'brand',
  },
  {
    id: 'card-completion-rate',
    title: 'Taxa de Entrega',
    metricType: 'COMPLETION_RATE',
    period: 'ALL',
    colorTheme: 'emerald',
  },
  {
    id: 'card-tasks-status',
    title: 'Status das Demandas',
    metricType: 'STATUS_DISTRIBUTION',
    period: 'ALL',
    colorTheme: 'accent',
  },
  {
    id: 'card-project-breakdown',
    title: 'Horas por Projeto',
    metricType: 'PROJECT_BREAKDOWN',
    period: 'ALL',
    colorTheme: 'indigo',
  },
  {
    id: 'card-work-goal',
    title: 'Meta de Jornada',
    metricType: 'WORK_GOAL',
    period: 'TODAY',
    colorTheme: 'brand',
  },
  {
    id: 'card-active-timer',
    title: 'Cronômetro em Foco',
    metricType: 'ACTIVE_TIMER',
    period: 'TODAY',
    colorTheme: 'cyan',
  },
]

export interface UserPreferences {
  dashboard?: {
    cards: DashboardCardConfig[]
  }
  dashboardV2?: {
    cards: DashboardV2Card[]
  }
  workGoal?: {
    period: 'DAILY' | 'WEEKLY' | 'MONTHLY'
    targetHours: number
  }
  kanban?: {
    hiddenColumns?: TaskStatus[]
  }
}

export const DEFAULT_DASHBOARD_CARDS: DashboardCardConfig[] = [
  {
    id: 'kpis',
    title: 'Indicadores Principais (KPIs)',
    description: 'Métricas de tarefas em andamento, concluídas, tempo e projetos.',
    visible: true,
  },
  {
    id: 'focus_session',
    title: 'Sessão em Foco',
    description: 'Cronômetro em tempo real para foco imediato na tarefa selecionada.',
    visible: true,
  },
  {
    id: 'work_goal',
    title: 'Meta de Horas (Jornada)',
    description: 'Progresso em tempo real da meta configurada (diária, semanal ou mensal).',
    visible: true,
  },
  {
    id: 'recent_tasks',
    title: 'Tarefas Recentes da Equipe',
    description: 'Lista das atividades mais recentes com play/pause e status rápido.',
    visible: true,
  },
  {
    id: 'quick_shortcuts',
    title: 'Acesso Rápido ao Workspace',
    description: 'Atalhos diretos para Projetos e Analytics do workspace.',
    visible: true,
  },
]

const PREF_STORAGE_PREFIX = 'beetask_user_preferences_'

export function getLocalPreferences(userEmail?: string): UserPreferences {
  if (!userEmail) {
    return { dashboard: { cards: [...DEFAULT_DASHBOARD_CARDS] } }
  }

  try {
    const raw = localStorage.getItem(`${PREF_STORAGE_PREFIX}${userEmail}`)
    if (raw) {
      const parsed = JSON.parse(raw) as UserPreferences
      return ensureValidPreferences(parsed)
    }
  } catch (err) {
    console.error('Failed to parse local preferences:', err)
  }

  return { dashboard: { cards: [...DEFAULT_DASHBOARD_CARDS] } }
}

function ensureValidPreferences(prefs: UserPreferences): UserPreferences {
  const result: UserPreferences = { ...prefs }

  if (!result.dashboard?.cards || !Array.isArray(result.dashboard.cards)) {
    result.dashboard = { cards: [...DEFAULT_DASHBOARD_CARDS] }
  } else {
    // Ensure all default cards exist in user cards list
    const existingIds = new Set(result.dashboard.cards.map((c) => c.id))
    const missing = DEFAULT_DASHBOARD_CARDS.filter((c) => !existingIds.has(c.id))
    if (missing.length > 0) {
      result.dashboard.cards = [...result.dashboard.cards, ...missing]
    }
  }

  if (!result.dashboardV2?.cards || !Array.isArray(result.dashboardV2.cards)) {
    result.dashboardV2 = { cards: [...DEFAULT_V2_CARDS] }
  }

  return result
}

export function saveLocalPreferences(userEmail: string, prefs: UserPreferences) {
  try {
    localStorage.setItem(`${PREF_STORAGE_PREFIX}${userEmail}`, JSON.stringify(prefs))
    window.dispatchEvent(
      new CustomEvent('beetask_preferences_changed', {
        detail: prefs,
      })
    )
  } catch (err) {
    console.error('Failed to save preferences locally:', err)
  }
}

/**
 * Loads preferences from backend, caches in localStorage, and returns them.
 */
export async function syncPreferencesFromBackend(userEmail?: string): Promise<UserPreferences> {
  const local = getLocalPreferences(userEmail)
  if (!userEmail) return local

  try {
    const res = await authService.getPreferences()
    if (res?.preferences) {
      const serverPrefs = JSON.parse(res.preferences) as UserPreferences
      const validated = ensureValidPreferences(serverPrefs)
      saveLocalPreferences(userEmail, validated)
      return validated
    } else {
      // Backend doesn't have preferences yet, persist local default to backend
      await authService.updatePreferences(JSON.stringify(local))
    }
  } catch (err) {
    console.warn('Could not sync preferences from backend, using local:', err)
  }

  return local
}

/**
 * Saves preferences both locally and to the backend database.
 */
export async function savePreferencesToBackend(
  userEmail: string,
  prefs: UserPreferences
): Promise<UserPreferences> {
  const validated = ensureValidPreferences(prefs)
  saveLocalPreferences(userEmail, validated)

  try {
    await authService.updatePreferences(JSON.stringify(validated))
  } catch (err) {
    console.error('Failed to sync preferences to backend:', err)
  }

  return validated
}
