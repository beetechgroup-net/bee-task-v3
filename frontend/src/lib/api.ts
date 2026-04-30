const API_BASE_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? '/api'

function buildUrl(path: string) {
  return `${API_BASE_URL}${path}`
}

type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: BodyInit | Record<string, unknown> | null
}

export async function apiFetch<T>(path: string, options: RequestOptions = {}) {
  const { body, headers, ...rest } = options

  const response = await fetch(buildUrl(path), {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: body && typeof body === 'object' && !(body instanceof FormData)
      ? JSON.stringify(body)
      : body,
  })

  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || 'Nao foi possivel concluir a requisicao.')
  }

  return (await response.json()) as T
}
