import type { UserSettings } from '../types/api'

export const THEME_DEFAULTS = {
  user_bubble_color: '#2f2f2f',
  user_text_color: '#F7F7F8',
  ai_accent_color: '#10A37F',
  chat_background_color: '#000000',
  sidebar_color: '#000000',
  header_color: '#000000',
  primary_color: '#10A37F',
  font_size: 16,
  font_family: 'Inter',
  border_radius: 18,
  bubble_opacity: 0.96,
} as const

export const FONT_OPTIONS = ['Inter', 'System', 'Georgia', 'Monospace'] as const

const FONT_STACKS: Record<string, string> = {
  Inter: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  System: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  Georgia: 'Georgia, Cambria, "Times New Roman", serif',
  Monospace: '"Cascadia Code", "SFMono-Regular", Consolas, monospace',
}

function hexToRgba(hex: string, opacity: number): string {
  const normalized = hex.replace('#', '')
  const red = Number.parseInt(normalized.slice(0, 2), 16)
  const green = Number.parseInt(normalized.slice(2, 4), 16)
  const blue = Number.parseInt(normalized.slice(4, 6), 16)

  return `rgba(${red}, ${green}, ${blue}, ${opacity})`
}

export function applyThemeSettings(settings: Partial<UserSettings>): void {
  const root = document.documentElement
  const bubbleColor = settings.user_bubble_color ?? THEME_DEFAULTS.user_bubble_color
  const bubbleOpacity = settings.bubble_opacity ?? THEME_DEFAULTS.bubble_opacity
  const fontFamily = settings.font_family ?? THEME_DEFAULTS.font_family

  root.style.setProperty('--theme-user-bubble', hexToRgba(bubbleColor, bubbleOpacity))
  root.style.setProperty('--theme-user-bubble-solid', bubbleColor)
  root.style.setProperty('--theme-user-text', settings.user_text_color ?? THEME_DEFAULTS.user_text_color)
  root.style.setProperty('--theme-ai-accent', settings.ai_accent_color ?? THEME_DEFAULTS.ai_accent_color)
  root.style.setProperty('--theme-chat-bg', settings.chat_background_color ?? THEME_DEFAULTS.chat_background_color)
  root.style.setProperty('--theme-sidebar', settings.sidebar_color ?? THEME_DEFAULTS.sidebar_color)
  root.style.setProperty('--theme-header', settings.header_color ?? THEME_DEFAULTS.header_color)
  root.style.setProperty('--theme-primary', settings.primary_color ?? THEME_DEFAULTS.primary_color)
  root.style.setProperty('--theme-font-size', `${settings.font_size ?? THEME_DEFAULTS.font_size}px`)
  root.style.setProperty('--theme-font-family', FONT_STACKS[fontFamily] ?? FONT_STACKS.Inter)
  root.style.setProperty('--theme-radius', `${settings.border_radius ?? THEME_DEFAULTS.border_radius}px`)
}
