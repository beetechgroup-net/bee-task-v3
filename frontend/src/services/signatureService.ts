import { apiFetch } from '../lib/api'

export type UserSignature = {
  id: number
  name: string
  signatureType: 'UPLOAD' | 'DRAW' | 'TEMPLATE'
  imageUrl: string
  isDefault: boolean
  createdAt: string
}

export const signatureService = {
  async listSignatures(): Promise<UserSignature[]> {
    return apiFetch<UserSignature[]>('/auth/profile/signatures')
  },

  async createSignature(formData: FormData): Promise<UserSignature> {
    return apiFetch<UserSignature>('/auth/profile/signatures', {
      method: 'POST',
      body: formData,
    })
  },

  async setDefault(id: number): Promise<UserSignature> {
    return apiFetch<UserSignature>(`/auth/profile/signatures/${id}/default`, {
      method: 'PUT',
    })
  },

  async deleteSignature(id: number): Promise<void> {
    return apiFetch<void>(`/auth/profile/signatures/${id}`, {
      method: 'DELETE',
    })
  },
}
