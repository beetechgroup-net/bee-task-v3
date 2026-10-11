const API_BASE_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:8081'

function buildUrl(path: string) {
  return `${API_BASE_URL}${path}`
}

type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown
  skipAuth?: boolean
}

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, headers, skipAuth, ...rest } = options

  let authHeader: Record<string, string> = {}
  if (!skipAuth) {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser)
        if (userData?.jwt) {
          authHeader = { Authorization: `Bearer ${userData.jwt}` }
        }
      } catch {
        // Ignora erro de parsing
      }
    }
  }

  const isFormData = body instanceof FormData
  const defaultHeaders: Record<string, string> = isFormData ? {} : { 'Content-Type': 'application/json' }

  const response = await fetch(buildUrl(path), {
    ...rest,
    headers: {
      ...defaultHeaders,
      ...authHeader,
      ...((headers as Record<string, string>) || {}),
    },
    body: isFormData ? body : (body !== undefined && body !== null ? JSON.stringify(body) : undefined),
  })

  const text = await response.text()
  if (!response.ok) {
    let errorMessage = text || 'Não foi possível concluir a requisição.'
    try {
      const parsed = JSON.parse(text)
      if (parsed.message) errorMessage = parsed.message
      if (parsed.error) errorMessage = parsed.error
    } catch {
      // Usar texto puro
    }
    throw new Error(errorMessage)
  }

  return text ? (JSON.parse(text) as T) : (undefined as T)
}
