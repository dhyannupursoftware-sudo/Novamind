import axios, { AxiosError } from 'axios'
import type { ApiValidationError } from '../types/api'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'https://novamind-backend-mm0f.onrender.com',
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
    if (error instanceof Error && error.message) {
      return error.message
    }
    return 'Something went wrong. Please try again.'
  }

  const axiosError = error as AxiosError<ApiValidationError>

  if (!axiosError.response) {
    return 'Cannot connect to backend server. Please ensure Laravel backend is running.'
  }

  const payload = axiosError.response.data

  if (payload && typeof payload === 'object') {
    if (payload.errors && typeof payload.errors === 'object') {
      const errorValues = Object.values(payload.errors)
      if (errorValues.length > 0 && Array.isArray(errorValues[0]) && errorValues[0].length > 0) {
        return errorValues[0][0]
      }
    }

    if (payload.message && typeof payload.message === 'string') {
      return payload.message
    }
  }

  return axiosError.message || 'Something went wrong. Please try again.'
}
