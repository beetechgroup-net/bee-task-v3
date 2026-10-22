import { apiFetch } from '../lib/api'

export type OrganizationMembership = {
  id: number
  name: string
  roles: string[]
}

export type LoginResponse = {
  name: string
  email: string
  photo: string
  jwt: string
  refreshToken: string
  expiresIn: number // seconds
  issuedAt: string // ISO date
  organizations: OrganizationMembership[]
  preferences?: string | null
}

export type CreateAccountResponse = {
  id: number
  name: string
  email: string
}

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    return apiFetch<LoginResponse>('/auth/login', {
      method: 'POST',
      body: { email, password },
      skipAuth: true,
    })
  },

  async register(name: string, email: string, password: string): Promise<CreateAccountResponse> {
    return apiFetch<CreateAccountResponse>('/auth/register', {
      method: 'POST',
      body: { name, email, password },
      skipAuth: true,
    })
  },

  async refresh(refreshToken: string): Promise<LoginResponse> {
    return apiFetch<LoginResponse>('/auth/refresh', {
      method: 'POST',
      body: { refreshToken },
      skipAuth: true,
    })
  },

  async me(): Promise<LoginResponse> {
    return apiFetch<LoginResponse>('/auth/me')
  },

  async getPreferences(): Promise<{ preferences: string | null }> {
    return apiFetch<{ preferences: string | null }>('/auth/preferences')
  },

  async updatePreferences(preferences: string): Promise<{ preferences: string }> {
    return apiFetch<{ preferences: string }>('/auth/preferences', {
      method: 'PUT',
      body: { preferences },
    })
  },

  async uploadPhoto(file: File): Promise<{ photoUrl: string }> {
    const formData = new FormData()
    formData.append('photo', file)
    return apiFetch<{ photoUrl: string }>('/auth/profile/photo', {
      method: 'POST',
      body: formData,
    })
  },

  async updateProfile(name: string, email: string): Promise<{ name: string; email: string; photo: string }> {
    return apiFetch<{ name: string; email: string; photo: string }>('/auth/profile', {
      method: 'PUT',
      body: { name, email },
    })
  },
}
