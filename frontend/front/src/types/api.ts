export type MessageRole = 'system' | 'user' | 'assistant'
export type ThemeMode = 'dark' | 'light' | 'system'

export interface UiPreferences {
  chatBubbleStyle: 'modern-pill' | 'compact-classic' | 'glassmorphism'
  fontSize: 'small' | 'medium' | 'large'
  autoScroll: boolean
  showTypingIndicator: boolean
  showTimestamps: boolean
  chatViewMode: 'compact' | 'comfortable'
  messageAnimations: boolean
  streamingResponse: boolean
  responseLength: 'short' | 'medium' | 'long'
  detailLevel: 'basic' | 'detailed' | 'expert'
  creativityLevel: 'precise' | 'balanced' | 'creative'
  codeFormatting: boolean
  markdownRendering: boolean
  fullscreenDefault: boolean
  autoSaveDrafts: boolean
  autoCopyCode: boolean
  performanceMode: boolean
  developerMode: boolean
}

export interface UserSettings {
  id: number
  user_id: number
  theme: ThemeMode
  language: string
  model: string
  notifications: boolean
  user_bubble_color: string
  user_text_color: string
  ai_accent_color: string
  chat_background_color: string
  sidebar_color: string
  header_color: string
  primary_color: string
  font_size: number
  font_family: string
  border_radius: number
  bubble_opacity: number
  ui_preferences: Partial<UiPreferences>
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
