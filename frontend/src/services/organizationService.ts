import { apiFetch } from '../lib/api'

export interface Organization {
  id: number
  name: string
}

export interface JoinRequest {
  userId: number
  name: string
  email: string
  photo?: string
}

export const organizationService = {
  create: async (name: string): Promise<Organization> => {
    return apiFetch('/organizations', {
      method: 'POST',
      body: { name },
    })
  },

  search: async (query: string): Promise<Organization[]> => {
    return apiFetch<Organization[]>(`/organizations/search?q=${query}`)
  },

  requestJoin: async (id: number): Promise<void> => {
    return apiFetch(`/organizations/${id}/join`, { method: 'POST' })
  },

  listPendingRequests: async (organizationId: number): Promise<JoinRequest[]> => {
    return apiFetch<JoinRequest[]>(`/organizations/${organizationId}/requests`)
  },

  approveRequest: async (organizationId: number, userId: number): Promise<void> => {
    return apiFetch(`/organizations/${organizationId}/requests/${userId}/approve`, { method: 'PATCH' })
  },

  rejectRequest: async (organizationId: number, userId: number): Promise<void> => {
    return apiFetch(`/organizations/${organizationId}/requests/${userId}/reject`, { method: 'PATCH' })
  }
}
