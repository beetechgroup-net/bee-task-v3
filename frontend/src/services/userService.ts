import { apiFetch } from '../lib/api'

export interface UpdateProfilePayload {
  name: string
  email: string
}

export interface UpdateProfileResult {
  name: string
  email: string
  photo: string
}

export const userService = {
  updateProfile: async (payload: UpdateProfilePayload): Promise<UpdateProfileResult> => {
    return apiFetch<UpdateProfileResult>('/auth/profile', {
      method: 'PUT',
      body: payload,
    })
  },
}
