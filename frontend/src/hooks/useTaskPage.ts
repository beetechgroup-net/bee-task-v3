import { useEffect, useRef, useState } from 'react'
import { taskService } from '../services/taskService'
import type { Project } from '../services/projectService'
import { projectService } from '../services/projectService'
import { categoryService } from '../services/categoryService'
import { organizationService } from '../services/organizationService'
import type { Category } from '../types/category'
import type { TaskAssignee, TaskResponse } from '../types/task'
import { DEFAULT_TASK_FILTERS, type TaskFilters } from '../components/taskFilters'
import { useAuth } from '../contexts/AuthContext'

interface UseTaskPageOptions {
  fetchProjects?: boolean
}

interface UseTaskPageResult {
  tasks: TaskResponse[]
  isLoading: boolean
  projects: Project[]
  categories: Category[]
  assignees: TaskAssignee[]
  filters: TaskFilters
  currentUserAssigneeId: number | null
  loadTasks: (filters: TaskFilters, silent?: boolean) => Promise<void>
  handleFiltersChange: (newFilters: TaskFilters) => void
}

function mergeProjects(existing: Project[], tasks: TaskResponse[]) {
  const byId = new Map(existing.map((project) => [project.id, project]))

  tasks.forEach((task) => {
    if (task.project) {
      byId.set(task.project.id, {
        id: task.project.id,
        name: task.project.name,
        color: task.project.color,
        icon: task.project.icon,
      })
    }
  })

  return Array.from(byId.values()).sort((a, b) => a.name.localeCompare(b.name))
}

function extractAssignees(tasks: TaskResponse[]) {
  const byId = new Map<number, TaskAssignee>()

  tasks.forEach((task) => {
    if (task.user) {
      byId.set(task.user.id, task.user)
    }
  })

  return Array.from(byId.values()).sort((a, b) => a.name.localeCompare(b.name))
}

export function useTaskPage({ fetchProjects = false }: UseTaskPageOptions = {}): UseTaskPageResult {
  const [tasks, setTasks] = useState<TaskResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [projects, setProjects] = useState<Project[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [assignees, setAssignees] = useState<TaskAssignee[]>([])
  const [filters, setFilters] = useState<TaskFilters>(DEFAULT_TASK_FILTERS)
  const [currentUserAssigneeId, setCurrentUserAssigneeId] = useState<number | null>(null)
  const { activeOrg, user } = useAuth()
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const loadTasks = async (currentFilters: TaskFilters, silent = false) => {
    if (!activeOrg) return
    if (!silent) setIsLoading(true)
    try {
      const response = await taskService.getTasks({
        organizationId: activeOrg.id,
        text: currentFilters.searchQuery || undefined,
        projectIds: currentFilters.projectIds.length > 0 ? currentFilters.projectIds : undefined,
        statuses: currentFilters.statuses.length > 0 ? currentFilters.statuses : undefined,
        categoryIds: currentFilters.categoryIds.length > 0 ? currentFilters.categoryIds : undefined,
        userIds: currentFilters.userIds.length > 0 ? currentFilters.userIds : undefined,
      })
      setTasks(response)
      setProjects((current) => mergeProjects(current, response))
      setAssignees((current) => {
        const byId = new Map(current.map((assignee) => [assignee.id, assignee]))
        extractAssignees(response).forEach((assignee) => byId.set(assignee.id, assignee))
        return Array.from(byId.values()).sort((a, b) => a.name.localeCompare(b.name))
      })
    } catch (error) {
      console.error('Erro ao carregar tarefas', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!activeOrg) return

    const init = async () => {
      setFilters(DEFAULT_TASK_FILTERS)
      setCategories([])

      const promises: Promise<any>[] = [organizationService.listMembers(activeOrg.id)]

      promises.push(categoryService.listByOrganization(activeOrg.id).then(setCategories).catch(() => {}))

      if (fetchProjects) {
        promises.push(projectService.listByOrganization(activeOrg.id).then(setProjects).catch(() => {}))
      }

      const [members] = await Promise.all(promises)

      const assigneesData = members.map((m: any) => ({
        id: m.userId,
        name: m.userName,
        email: m.userEmail,
        photo: m.userPhoto ?? null,
      }))
      setAssignees(assigneesData)

      const currentMember = members.find((m: any) => m.userEmail === user?.email)
      const userId = currentMember?.userId ?? null
      setCurrentUserAssigneeId(userId)

      const initialFilters = userId
        ? { ...DEFAULT_TASK_FILTERS, userIds: [userId] }
        : DEFAULT_TASK_FILTERS
      setFilters(initialFilters)
      void loadTasks(initialFilters)
    }

    void init()
  }, [activeOrg, user?.email, fetchProjects])

  const handleFiltersChange = (newFilters: TaskFilters) => {
    setFilters(newFilters)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      void loadTasks(newFilters)
    }, 300)
  }

  return {
    tasks,
    isLoading,
    projects,
    categories,
    assignees,
    filters,
    currentUserAssigneeId,
    loadTasks,
    handleFiltersChange,
  }
}
