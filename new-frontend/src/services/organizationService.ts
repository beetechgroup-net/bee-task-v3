import { apiFetch } from '../lib/api'

export type CreateOrgResponse = {
  id: number
  name: string
  ownerId: number
}

export type SearchOrgOutput = {
  id: number
  name: string
}

export type JoinRequestOutput = {
  organizationId: number
  organizationName: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  createdAt: string
}

export const organizationService = {
  async create(name: string): Promise<CreateOrgResponse> {
    return apiFetch<CreateOrgResponse>('/organizations', {
      method: 'POST',
      body: { name },
    })
  },

  async search(query: string): Promise<SearchOrgOutput[]> {
    return apiFetch<SearchOrgOutput[]>(`/organizations/search?q=${encodeURIComponent(query)}`)
  },

  async requestJoin(organizationId: number): Promise<void> {
    return apiFetch<void>(`/organizations/${organizationId}/join`, {
      method: 'POST',
    })
  },

  async listMyRequests(): Promise<JoinRequestOutput[]> {
    return apiFetch<JoinRequestOutput[]>('/organizations/my-requests')
  },
}
