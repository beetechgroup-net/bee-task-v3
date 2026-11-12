import { apiFetch } from '../lib/api'

export interface UserNote {
  id?: number | null
  userId?: number | null
  content: string
  createdAt?: string | null
  updatedAt?: string | null
}

export const noteService = {
  async getNote(): Promise<UserNote> {
    return apiFetch<UserNote>('/notes')
  },

  async saveNote(content: string): Promise<UserNote> {
    return apiFetch<UserNote>('/notes', {
      method: 'PUT',
      body: { content },
    })
  },
}
