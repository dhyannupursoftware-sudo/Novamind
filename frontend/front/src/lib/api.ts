import axios, { AxiosError } from 'axios'
import type { ApiValidationError } from '../types/api'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
})

export function setAuthToken(token: string | null): void {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`
    return
  }

  delete api.defaults.headers.common.Authorization
}

export function errorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiValidationError>(error)) {
    return 'Something went wrong. Please try again.'
  }

  const axiosError = error as AxiosError<ApiValidationError>
  const payload = axiosError.response?.data
  const firstError = payload?.errors ? Object.values(payload.errors)[0]?.[0] : null

  return firstError ?? payload?.message ?? 'Something went wrong. Please try again.'
}
