import { createContext } from 'react'
import type { User } from '../types/api'

export interface LoginPayload {
  login: string
  password: string
  remember: boolean
}

export interface RegisterPayload {
  name: string
  username: string
  email: string
  password: string
  password_confirmation: string
  remember: boolean
}

export interface ResetPasswordPayload {
  token: string
  email: string
  password: string
  password_confirmation: string
}

export interface UpdateProfilePayload {
  name: string
  username: string
  email: string
  avatar: string | null
  password?: string
  password_confirmation?: string
}

export interface AuthContextValue {
  forgotPassword: (email: string) => Promise<void>
  isAuthenticated: boolean
  isBooting: boolean
  login: (payload: LoginPayload) => Promise<void>
  logout: () => Promise<void>
  register: (payload: RegisterPayload) => Promise<void>
  resetPassword: (payload: ResetPasswordPayload) => Promise<void>
  updateProfile: (payload: UpdateProfilePayload) => Promise<void>
  user: User | null
}

export const AuthContext = createContext<AuthContextValue | null>(null)
