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
}
