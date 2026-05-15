import { apiFetch } from '../lib/api'
import type { Category, CategoryPayload } from '../types/category'

export const categoryService = {
  listByOrganization: async (orgId: number): Promise<Category[]> => {
    return apiFetch<Category[]>(`/organizations/${orgId}/categories`)
  },

  create: async (orgId: number, payload: CategoryPayload): Promise<Category> => {
    return apiFetch<Category>(`/organizations/${orgId}/categories`, {
      method: 'POST',
      body: payload,
    })
  },

  update: async (orgId: number, categoryId: number, payload: CategoryPayload): Promise<Category> => {
    return apiFetch<Category>(`/organizations/${orgId}/categories/${categoryId}`, {
      method: 'PUT',
      body: payload,
    })
  },
}
