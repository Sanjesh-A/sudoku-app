import { useAuth0 } from '@auth0/auth0-react'
import { useCallback } from 'react'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

if (!API_BASE_URL) {
  throw new Error('Missing VITE_API_BASE_URL in environment')
}

export class ApiError extends Error {
  readonly status: number
  readonly body: unknown
  constructor(message: string, status: number, body: unknown) {
    super(message)
    this.status = status
    this.body = body
    this.name = 'ApiError'
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'
  body?: unknown
}

/**
 * Returns a `fetch`-like function that automatically includes the access
 * token. Use the returned function in async storage operations.
 */
export function useApiClient() {
  const { getAccessTokenSilently } = useAuth0()

  return useCallback(
    async <T,>(path: string, options: RequestOptions = {}): Promise<T> => {
      const token = await getAccessTokenSilently()
      const response = await fetch(`${API_BASE_URL}${path}`, {
        method: options.method ?? 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
      })

      if (response.status === 204) {
        return undefined as T
      }

      const text = await response.text()
      const data = text.length > 0 ? JSON.parse(text) : null

      if (!response.ok) {
        throw new ApiError(
          `API request failed: ${response.status} ${response.statusText}`,
          response.status,
          data,
        )
      }

      return data as T
    },
    [getAccessTokenSilently],
  )
}