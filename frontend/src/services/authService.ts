import { apiFetch } from '../lib/api'

export type LoginResponse = {
  name: string
  email: string
  photo: string
  jwt: string
  refreshToken: string
  expiresIn: number // seconds
  issuedAt: string // ISO date
  organizations: {
    name: string
    roles: string[]
  }[]
}

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    return apiFetch<LoginResponse>('/auth/login', {
      method: 'POST',
      body: { email, password },
    })
  },

  async register(name: string, email: string, password: string): Promise<{ id: number; name: string; email: string }> {
    return apiFetch<{ id: number; name: string; email: string }>('/auth/register', {
      method: 'POST',
      body: { name, email, password },
    })
  },

  async refresh(refreshToken: string): Promise<LoginResponse> {
    return apiFetch<LoginResponse>('/auth/refresh', {
      method: 'POST',
      body: { refreshToken },
    })
  },
}
