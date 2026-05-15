const API_BASE_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:8080'

function buildUrl(path: string) {
  return `${API_BASE_URL}${path}`
}

type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: any
  skipAuth?: boolean
}

export async function apiFetch<T>(path: string, options: RequestOptions = {}) {
  const { body, headers, skipAuth, ...rest } = options

  let authHeader = {}
  if (!skipAuth) {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      const userData = JSON.parse(storedUser)
      authHeader = { 'Authorization': `Bearer ${userData.jwt}` }
    }
  }

  const response = await fetch(buildUrl(path), {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...authHeader,
      ...headers,
    },
    body: body !== undefined && body !== null && !(body instanceof FormData)
      ? JSON.stringify(body)
      : body,
  })

  const text = await response.text()
  if (!response.ok) {
    throw new Error(text || 'Nao foi possivel concluir a requisicao.')
  }

  return text ? (JSON.parse(text) as T) : (undefined as T)
}
