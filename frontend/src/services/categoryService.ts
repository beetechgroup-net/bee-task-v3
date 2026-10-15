import { apiFetch } from '../lib/api'
import type { Category } from '../types/task'

export const categoryService = {
  async listCategories(orgId: number): Promise<Category[]> {
    return apiFetch<Category[]>(`/organizations/${orgId}/categories`)
  },

  async createCategory(orgId: number, data: { name: string; color?: string; icon?: string }): Promise<Category> {
    return apiFetch<Category>(`/organizations/${orgId}/categories`, {
      method: 'POST',
      body: data,
    })
  },

  async updateCategory(
    orgId: number,
    id: number,
    data: { name: string; color?: string; icon?: string }
  ): Promise<Category> {
    return apiFetch<Category>(`/organizations/${orgId}/categories/${id}`, {
      method: 'PUT',
      body: data,
    })
  },
}
