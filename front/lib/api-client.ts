const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api'

type ApiErrorBody = {
  detail?: string | Array<{ msg?: string; loc?: Array<string | number> }>
  message?: string
  errors?: Record<string, string[]>
}

function errorMessage(body: ApiErrorBody, status: number): string {
  if (typeof body.detail === 'string') return body.detail
  if (Array.isArray(body.detail)) {
    return body.detail
      .map(item => `${item.loc?.at(-1) ?? 'champ'} : ${item.msg ?? 'valeur invalide'}`)
      .join(', ')
  }
  if (body.errors) {
    const fields = Object.entries(body.errors)
      .flatMap(([field, messages]) => messages.map(message => `${field} : ${message}`))
    if (fields.length) return fields.join(', ')
  }
  return body.message ?? `Erreur HTTP ${status}`
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('eduos_token') : null

  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData
  const headers: HeadersInit = {
    ...(!isFormData ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers ?? {}),
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
    cache: 'no-store',
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as ApiErrorBody
    if (res.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('eduos_user')
      localStorage.removeItem('eduos_token')
      window.dispatchEvent(new Event('eduos:unauthorized'))
    }
    throw new Error(errorMessage(body, res.status))
  }

  // 204 No Content
  if (res.status === 204) return undefined as unknown as T

  return res.json() as Promise<T>
}

export const api = {
  get<T>(path: string): Promise<T> {
    return request<T>(path, { method: 'GET' })
  },

  post<T>(path: string, body: unknown): Promise<T> {
    return request<T>(path, { method: 'POST', body: JSON.stringify(body) })
  },

  uploadFile<T>(
    path: string,
    file: File,
    metadata: Record<string, string | boolean>,
    onProgress?: (loaded: number, total: number) => void,
  ): Promise<T> {
    const query = new URLSearchParams()
    Object.entries(metadata).forEach(([key, value]) => query.set(key, String(value)))
    return new Promise<T>((resolve, reject) => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('eduos_token') : null
      const xhr = new XMLHttpRequest()
      xhr.open('POST', `${BASE_URL}${path}?${query.toString()}`)
      xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream')
      xhr.setRequestHeader('X-File-Name', encodeURIComponent(file.name))
      xhr.setRequestHeader('X-File-Size', String(file.size))
      if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`)
      xhr.upload.onprogress = event => {
        if (event.lengthComputable) onProgress?.(event.loaded, event.total)
      }
      xhr.onerror = () => reject(new Error('Connexion interrompue pendant l’envoi du fichier.'))
      xhr.onload = () => {
        let body: ApiErrorBody = {}
        try { body = JSON.parse(xhr.responseText) as ApiErrorBody }
        catch { /* La réponse vide sera gérée selon son statut HTTP. */ }
        if (xhr.status < 200 || xhr.status >= 300) {
          if (xhr.status === 401 && typeof window !== 'undefined') {
            localStorage.removeItem('eduos_user')
            localStorage.removeItem('eduos_token')
            window.dispatchEvent(new Event('eduos:unauthorized'))
          }
          reject(new Error(errorMessage(body, xhr.status)))
          return
        }
        resolve(body as T)
      }
      xhr.send(file)
    })
  },

  async download(path: string): Promise<Blob> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('eduos_token') : null
    const res = await fetch(`${BASE_URL}${path}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      cache: 'no-store',
    })
    if (!res.ok) {
      const body = await res.json().catch(() => ({})) as ApiErrorBody
      throw new Error(errorMessage(body, res.status))
    }
    return res.blob()
  },

  put<T>(path: string, body: unknown): Promise<T> {
    return request<T>(path, { method: 'PUT', body: JSON.stringify(body) })
  },

  patch<T>(path: string, body: unknown): Promise<T> {
    return request<T>(path, { method: 'PATCH', body: JSON.stringify(body) })
  },

  delete<T>(path: string): Promise<T> {
    return request<T>(path, { method: 'DELETE' })
  },
}
