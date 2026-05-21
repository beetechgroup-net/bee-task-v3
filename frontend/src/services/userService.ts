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

export interface UploadPhotoResult {
  photoUrl: string
}

export const userService = {
  updateProfile: async (payload: UpdateProfilePayload): Promise<UpdateProfileResult> => {
    return apiFetch<UpdateProfileResult>('/auth/profile', {
      method: 'PUT',
      body: payload,
    })
  },

  uploadPhoto: async (file: File): Promise<UploadPhotoResult> => {
    const form = new FormData()
    form.append('photo', file)
    return apiFetch<UploadPhotoResult>('/auth/profile/photo', {
      method: 'POST',
      body: form,
    })
  },
}
