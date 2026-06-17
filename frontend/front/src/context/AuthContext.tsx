import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { api, setAuthToken } from '../lib/api'
import type { ApiResource, AuthResponse, User } from '../types/api'
import { AuthContext, type AuthContextValue } from './auth-context'
import type { LoginPayload, RegisterPayload, ResetPasswordPayload } from './auth-context'

const TOKEN_KEY = 'novamind.auth.token'

function readToken(): string | null {
  return localStorage.getItem(TOKEN_KEY) ?? sessionStorage.getItem(TOKEN_KEY)
}

function persistToken(token: string, remember: boolean): void {
  localStorage.removeItem(TOKEN_KEY)
  sessionStorage.removeItem(TOKEN_KEY)

  if (remember) {
    localStorage.setItem(TOKEN_KEY, token)
    return
  }

  sessionStorage.setItem(TOKEN_KEY, token)
}

function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY)
  sessionStorage.removeItem(TOKEN_KEY)
  setAuthToken(null)
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isBooting, setIsBooting] = useState(true)

  const hydrate = useCallback(async () => {
    const token = readToken()

    if (!token) {
      setIsBooting(false)
      return
    }

    setAuthToken(token)

    try {
      const { data } = await api.get<ApiResource<User>>('/auth/me')
      setUser(data.data)
    } catch {
      clearToken()
      setUser(null)
    } finally {
      setIsBooting(false)
    }
  }, [])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void hydrate()
    }, 0)

    return () => window.clearTimeout(timer)
  }, [hydrate])

  const acceptAuthResponse = useCallback((auth: AuthResponse, remember: boolean) => {
    persistToken(auth.token, remember)
    setAuthToken(auth.token)
    setUser(auth.user)
  }, [])

  const login = useCallback(
    async (payload: LoginPayload) => {
      const { data } = await api.post<AuthResponse>('/auth/login', payload)
      acceptAuthResponse(data, payload.remember)
    },
    [acceptAuthResponse],
  )

  const register = useCallback(
    async (payload: RegisterPayload) => {
      const { data } = await api.post<AuthResponse>('/auth/register', payload)
      acceptAuthResponse(data, payload.remember)
    },
    [acceptAuthResponse],
  )

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout')
    } finally {
      clearToken()
      setUser(null)
    }
  }, [])

  const forgotPassword = useCallback(async (email: string) => {
    await api.post('/auth/forgot-password', { email })
  }, [])

  const resetPassword = useCallback(async (payload: ResetPasswordPayload) => {
    await api.post('/auth/reset-password', payload)
  }, [])

  const updateProfile = useCallback(async (payload: any) => {
    const { data } = await api.patch<ApiResource<User>>('/auth/profile', payload)
    setUser(data.data)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      forgotPassword,
      isAuthenticated: Boolean(user),
      isBooting,
      login,
      logout,
      register,
      resetPassword,
      updateProfile,
      user,
    }),
    [forgotPassword, isBooting, login, logout, register, resetPassword, updateProfile, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
