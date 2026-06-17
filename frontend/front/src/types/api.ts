export type MessageRole = 'system' | 'user' | 'assistant'
export type ThemeMode = 'dark' | 'light' | 'system'

export interface UserSettings {
  id: number
  user_id: number
  theme: ThemeMode
  language: string
  model: string
  updated_at: string | null
}

export interface User {
  id: number
  name: string
  username: string
  email: string
  avatar: string | null
  created_at: string | null
  settings?: UserSettings | null
}

export interface Message {
  id: number
  chat_id: number
  role: MessageRole
  content: string
  created_at: string | null
  updated_at: string | null
}

export interface Chat {
  id: number
  user_id: number
  title: string
  pinned: boolean
  created_at: string | null
  updated_at: string | null
  messages_count?: number
  messages?: Message[]
}

export interface AuthResponse {
  user: User
  token: string
  token_type: 'Bearer'
  expires_at: string
}

export interface ApiResource<T> {
  data: T
}

export interface PaginatedResponse<T> {
  data: T[]
  links?: Record<string, string | null>
  meta?: Record<string, unknown>
}

export interface ApiValidationError {
  message?: string
  errors?: Record<string, string[]>
}
