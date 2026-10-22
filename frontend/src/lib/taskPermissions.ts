import type { Task } from '../types/task'
import type { LoginResponse, OrganizationMembership } from '../services/authService'

/**
 * Checks whether the current user is allowed to delete a task:
 * - Must be an ADMIN or OWNER of the organization to which the task belongs, OR
 * - Must be the owner/creator of the task.
 */
export function canDeleteTask(
  task: Task,
  user: LoginResponse | null,
  activeOrg: OrganizationMembership | null
): boolean {
  if (!user) return false

  // 1. Is the user the creator or owner of the task?
  const isCreator = Boolean(
    (task.createdBy?.email && task.createdBy.email.toLowerCase() === user.email.toLowerCase()) ||
    (task.user?.email && task.user.email.toLowerCase() === user.email.toLowerCase())
  )

  if (isCreator) return true

  // 2. Is the user an admin or owner of the active organization?
  const isOrgAdmin = Boolean(
    activeOrg?.roles?.some((role) => role === 'ADMIN' || role === 'OWNER')
  )

  return isOrgAdmin
}
