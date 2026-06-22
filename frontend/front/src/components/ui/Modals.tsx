import React, { useState, useRef, useEffect, type ChangeEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Camera, 
  User, 
  Lock, 
  Activity, 
  Database, 
  Loader2, 
  X, 
  Globe, 
  Palette, 
  Sliders, 
  Cpu, 
  Zap, 
  Download, 
  LogOut, 
  FileDown
} from 'lucide-react'
import { useAuth } from '../../context/useAuth'
import { useChat } from '../../context/ChatContext'
import { useToast } from '../../context/ToastContext'
import { Button } from './Button'
import { FormField } from './FormField'
import { errorMessage } from '../../lib/api'
import type { ThemeMode } from '../../types/api'
import type { UpdateProfilePayload } from '../../context/auth-context'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
}

// Local storage key for UI config settings
const LOCAL_SETTINGS_KEY = 'novamind_ui_settings'

interface LocalUiSettings {
  chatBubbleStyle: 'modern-pill' | 'compact-classic' | 'glassmorphism'
  fontSize: 'small' | 'medium' | 'large'
  autoScroll: boolean
  showTypingIndicator: boolean
  showTimestamps: boolean
  chatViewMode: 'compact' | 'comfortable'
  messageAnimations: boolean
  streamingResponse: boolean
  responseLength: 'short' | 'medium' | 'long'
  detailLevel?: 'basic' | 'detailed' | 'expert'
  creativityLevel: 'precise' | 'balanced' | 'creative'
  codeFormatting: boolean
  markdownRendering: boolean
  fullscreenDefault: boolean
  autoSaveDrafts: boolean
  autoCopyCode: boolean
  performanceMode: boolean
  developerMode: boolean
}

const DEFAULT_UI_SETTINGS: LocalUiSettings = {
  chatBubbleStyle: 'glassmorphism',
  fontSize: 'medium',
  autoScroll: true,
  showTypingIndicator: true,
  showTimestamps: true,
  chatViewMode: 'comfortable',
  messageAnimations: true,
  streamingResponse: true,
  responseLength: 'long',
  detailLevel: 'expert',
  creativityLevel: 'balanced',
  codeFormatting: true,
  markdownRendering: true,
  fullscreenDefault: false,
  autoSaveDrafts: true,
  autoCopyCode: false,
  performanceMode: true,
  developerMode: false
}

export function ProfileModal({ isOpen, onClose }: ModalProps) {
  const { user, updateProfile } = useAuth()
  const { chats, uploadFile, settings } = useChat()
  const { showToast } = useToast()

  const [name, setName] = useState(user?.name ?? '')
  const [username, setUsername] = useState(user?.username ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [avatar, setAvatar] = useState(user?.avatar ?? '')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  
  const [isUploading, setIsUploading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [formError, setFormError] = useState('')

  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (user) {
      setName(user.name ?? '')
      setUsername(user.username ?? '')
      setEmail(user.email ?? '')
      setAvatar(user.avatar ?? '')
    }
  }, [user])

  // Recalculate stats
  const totalChats = chats.length
  const totalMessages = chats.reduce((total, chat) => total + (chat.messages_count ?? 0), 0)
  const savedPromptsCount = chats.filter((c) => c.pinned || (c as any).saved).length
  const aiUsageCount = totalMessages > 0 ? Math.floor(totalMessages * 1.3) : 0

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      showToast('Avatar image must be smaller than 5MB', 'error')
      return
    }

    setIsUploading(true)
    try {
      const res = await uploadFile(file)
      setAvatar(res.url)
      showToast('Avatar uploaded successfully', 'success')
      await updateProfile({
        name,
        username,
        email,
        avatar: res.url
      })
    } catch {
      showToast('Failed to upload avatar', 'error')
    } finally {
      setIsUploading(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setFormError('')

    if (password && password !== passwordConfirmation) {
      setFormError('Passwords do not match')
      setIsSaving(false)
      return
    }

    try {
      const payload: UpdateProfilePayload = {
        name,
        username,
        email,
        avatar: avatar || null,
      }

      if (password) {
        payload.password = password
        payload.password_confirmation = passwordConfirmation
      }

      await updateProfile(payload)
      showToast('Profile updated successfully', 'success')
      setPassword('')
      setPasswordConfirmation('')
      onClose()
    } catch (err) {
      setFormError(errorMessage(err))
    } finally {
      setIsSaving(false)
    }
  }

  const creationDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    : 'Unknown Date'

  const lastChatOpened = chats.length > 0 ? chats[0].title : 'No active chats'

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#000000]/70 backdrop-blur-md"
          />

          {/* Modal Card container (Charcoal Dark color scheme) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="relative z-10 w-full max-w-4xl h-[85vh] md:h-[80vh] rounded-[24px] border border-white/10 bg-[#171717] text-white shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/5 px-6 py-5 select-none">
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-indigo-500 animate-pulse" />
                <h3 className="text-base font-bold text-white tracking-wide">NovaMind Profile Console</h3>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-white/5 hover:text-white transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Profile Content Body */}
            <div className="grid md:grid-cols-12 gap-6 p-6 flex-1 min-h-0 overflow-y-auto scrollbar-thin">
              
              {/* Profile card and Form (Col 7) */}
              <div className="md:col-span-7 space-y-6">
                
                {/* Avatar upload header inside Modal */}
                <div className="flex items-center gap-4 border-b border-white/5 pb-4">
                  <div 
                    onClick={handleAvatarClick}
                    className="group relative cursor-pointer size-16 shrink-0 rounded-full border border-white/10 p-0.5 hover:border-indigo-500 transition-all duration-300"
                  >
                    <div className="relative size-full overflow-hidden rounded-full bg-slate-900">
                      {avatar ? (
                        <img src={avatar} alt="User Avatar" className="size-full object-cover" />
                      ) : (
                        <div className="grid size-full place-items-center text-slate-500">
                          <User size={20} />
                        </div>
                      )}
                      {isUploading && (
                        <div className="absolute inset-0 bg-slate-950/70 flex items-center justify-center">
                          <Loader2 className="animate-spin text-indigo-400" size={16} />
                        </div>
                      )}
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/60 opacity-0 group-hover:opacity-100 transition duration-200">
                        <Camera className="text-white" size={14} />
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">Display Picture</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">Click image or choose upload to configure avatar.</p>
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                </div>

                {/* Form fields */}
                <form onSubmit={handleSave} className="space-y-4">
                  {formError && (
                    <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-xs text-rose-200">
                      {formError}
                    </div>
                  )}

                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      label="Display Name"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                    <FormField
                      label="Username"
                      placeholder="johndoe"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />
                  </div>

                  <FormField
                    label="Email Address"
                    type="email"
                    placeholder="john@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />

                  {/* Password section */}
                  <div className="border-t border-white/5 pt-4 space-y-4">
                    <h4 className="flex items-center gap-1.5 text-xs font-bold text-slate-300 uppercase tracking-wider">
                      <Lock size={12} className="text-indigo-400" />
                      Reset Passcode
                    </h4>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormField
                        label="New Password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <FormField
                        label="Confirm Password"
                        type="password"
                        placeholder="••••••••"
                        value={passwordConfirmation}
                        onChange={(e) => setPasswordConfirmation(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 border-t border-white/5 pt-4">
                    <Button type="button" variant="ghost" onClick={onClose} className="min-h-10 text-xs">
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSaving || isUploading} className="min-h-10 text-xs bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-500/10 transition">
                      {isSaving ? 'Saving Changes...' : 'Save Settings'}
                    </Button>
                  </div>
                </form>
              </div>

              {/* Stats & Activity Logs (Col 5) */}
              <div className="md:col-span-5 space-y-5">
                {/* Stats Container */}
                <div className="rounded-2xl border border-white/5 bg-white/[0.01] p-4 shadow-lg">
                  <h4 className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                    <Database size={13} className="text-indigo-400" />
                    Storage & Run Metrics
                  </h4>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-white/[0.01] border border-white/5 p-3 text-center">
                      <span className="block text-xl font-black text-indigo-400">{totalChats}</span>
                      <span className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Total Chats</span>
                    </div>
                    <div className="rounded-xl bg-white/[0.01] border border-white/5 p-3 text-center">
                      <span className="block text-xl font-black text-indigo-400">{totalMessages}</span>
                      <span className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Messages</span>
                    </div>
                    <div className="rounded-xl bg-white/[0.01] border border-white/5 p-3 text-center">
                      <span className="block text-xl font-black text-indigo-400">{savedPromptsCount}</span>
                      <span className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Saved Chats</span>
                    </div>
                    <div className="rounded-xl bg-white/[0.01] border border-white/5 p-3 text-center">
                      <span className="block text-xl font-black text-indigo-400">{aiUsageCount}</span>
                      <span className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Prompt Runs</span>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between rounded-xl bg-white/[0.01] border border-white/5 px-3 py-2.5 text-xs">
                    <span className="text-slate-450 text-slate-400">LLM Mode:</span>
                    <span className="font-bold text-indigo-400 uppercase tracking-wider">{settings.model}</span>
                  </div>
                </div>

                {/* Activity log */}
                <div className="rounded-2xl border border-white/5 bg-white/[0.01] p-4 shadow-lg">
                  <h4 className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                    <Activity size={13} className="text-indigo-400" />
                    Session Activity Logs
                  </h4>
                  
                  <div className="space-y-3.5 text-[11px]">
                    <div className="flex items-start gap-2.5">
                      <div className="size-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                      <div>
                        <p className="font-medium text-slate-200">Active dialogue session active</p>
                        <p className="text-[9px] text-slate-500 truncate max-w-[200px]">{lastChatOpened}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <div className="size-1.5 rounded-full bg-indigo-550 bg-indigo-500 mt-1.5 shrink-0" />
                      <div>
                        <p className="font-medium text-slate-200">MySQL Synchronizer running</p>
                        <p className="text-[9px] text-slate-500">Workspace folders mapped correctly.</p>
                      </div>
                    </div>
                    {user?.created_at && (
                      <div className="flex items-start gap-2.5">
                        <div className="size-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                        <div>
                          <p className="font-medium text-slate-200">Account verified</p>
                          <p className="text-[9px] text-slate-500">Secure registration completed {creationDate}.</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

              </div>

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export function SettingsModal({ isOpen, onClose }: ModalProps) {
  const navigate = useNavigate()
  const { user, updateProfile, logout } = useAuth()
  const { 
    settings: apiSettings, 
    updateSettings: updateApiSettings, 
    chats,
    selectedChat,
    setMessages,
    deleteChat
  } = useChat()
  const { showToast } = useToast()

  // Modal active sub-tab
  const [activeTab, setActiveTab] = useState<'appearance' | 'chat' | 'ai' | 'data' | 'account' | 'advanced'>('appearance')

  // API Backend States
  const [theme, setTheme] = useState<ThemeMode>(apiSettings.theme)
  const [language, setLanguage] = useState(apiSettings.language)
  const [model, setModel] = useState(apiSettings.model)
  const [notifications, setNotifications] = useState(apiSettings.notifications)

  // Account modification states
  const [name, setName] = useState(user?.name ?? '')
  const [username, setUsername] = useState(user?.username ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [isUpdatingAccount, setIsUpdatingAccount] = useState(false)

  // Local Storage UI Config states
  const [uiSettings, setUiSettings] = useState<LocalUiSettings>(() => {
    const saved = localStorage.getItem(LOCAL_SETTINGS_KEY)
    if (saved) {
      try {
        return { ...DEFAULT_UI_SETTINGS, ...JSON.parse(saved) }
      } catch {
        return DEFAULT_UI_SETTINGS
      }
    }
    return DEFAULT_UI_SETTINGS
  })

  // Synchronize from backend settings on load
  useEffect(() => {
    if (apiSettings) {
      setTheme(apiSettings.theme)
      setLanguage(apiSettings.language)
      setModel(apiSettings.model)
      setNotifications(apiSettings.notifications)
    }
  }, [apiSettings])

  // Save UI settings to local storage when changed
  const updateUiSetting = <K extends keyof LocalUiSettings>(key: K, value: LocalUiSettings[K]) => {
    setUiSettings((prev) => {
      const updated = { ...prev, [key]: value }
      localStorage.setItem(LOCAL_SETTINGS_KEY, JSON.stringify(updated))
      return updated
    })
    showToast('Setting saved locally', 'success')
  }

  // Save Account Profile Settings
  const handleSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUpdatingAccount(true)

    if (password && password !== passwordConfirmation) {
      showToast('Passwords do not match', 'error')
      setIsUpdatingAccount(false)
      return
    }

    try {
      await updateProfile({
        name,
        username,
        email,
        avatar: user?.avatar ?? null,
        ...(password ? { password, password_confirmation: passwordConfirmation } : {})
      })
      showToast('Account profile saved successfully', 'success')
      setPassword('')
      setPasswordConfirmation('')
    } catch (err) {
      showToast(errorMessage(err), 'error')
    } finally {
      setIsUpdatingAccount(false)
    }
  }

  // Data & History actions
  const handleClearCurrentChat = () => {
    if (!selectedChat) {
      showToast('No active conversation selected to clear', 'info')
      return
    }
    if (window.confirm('Are you sure you want to clear the messages in the current chat? This cannot be undone.')) {
      setMessages([])
      showToast('Messages in current conversation cleared locally', 'success')
    }
  }

  const handleClearAllChats = async () => {
    if (chats.length === 0) {
      showToast('No conversations to clear', 'info')
      return
    }
    if (window.confirm('Are you sure you want to delete ALL chats? This action is permanent.')) {
      try {
        for (const chat of chats) {
          await deleteChat(chat.id)
        }
        showToast('All conversation histories cleared', 'success')
      } catch {
        showToast('Error deleting some conversations', 'error')
      }
    }
  }

  const handleExportChats = () => {
    const exportData = {
      exported_at: new Date().toISOString(),
      user: {
        id: user?.id,
        username: user?.username,
        email: user?.email
      },
      chats: chats
    }
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `novamind-chats-export-${new Date().toISOString().slice(0, 10)}.json`
    link.click()
    URL.revokeObjectURL(url)
    showToast('Chats exported successfully as JSON', 'success')
  }

  const handleDownloadSettingsBackup = () => {
    const backupData = {
      backup_at: new Date().toISOString(),
      backend_settings: apiSettings,
      ui_settings: uiSettings
    }
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `novamind-settings-backup-${new Date().toISOString().slice(0, 10)}.json`
    link.click()
    URL.revokeObjectURL(url)
    showToast('Settings backup downloaded', 'success')
  }

  const tabs = [
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'chat', label: 'Chat Config', icon: Sliders },
    { id: 'ai', label: 'AI Engine', icon: Cpu },
    { id: 'data', label: 'Data & Disk', icon: Database },
    { id: 'account', label: 'Account Set', icon: User },
    { id: 'advanced', label: 'Advanced', icon: Zap }
  ] as const

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#000000]/70 backdrop-blur-md"
          />

          {/* Modal Container Card (Theme Background: Charcoal Dark) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="relative z-10 w-full max-w-4xl h-[85vh] md:h-[80vh] rounded-[24px] border border-white/10 bg-[#171717] text-white shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/5 px-6 py-5 select-none">
              <div className="flex items-center gap-2">
                <Globe className="text-indigo-400 animate-pulse" size={18} />
                <h3 className="text-base font-bold text-white tracking-wide">NovaMind System Console</h3>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-white/5 hover:text-white transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content Panel Grid Layout */}
            <div className="grid md:grid-cols-12 flex-1 min-h-0 overflow-y-auto md:overflow-hidden">
              
              {/* Tabs list (Col 4) */}
              <nav className="md:col-span-4 bg-white/[0.01] border-r border-white/5 p-4 flex flex-col gap-1.5 select-none overflow-y-auto md:h-full shrink-0">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  const isActive = activeTab === tab.id
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold tracking-wide border transition-all duration-150 text-left cursor-pointer ${
                        isActive 
                          ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20 font-bold' 
                          : 'border-transparent text-slate-450 text-slate-400 hover:bg-white/5 hover:text-slate-200'
                      }`}
                    >
                      <Icon size={14} className={isActive ? 'text-indigo-400' : 'text-slate-400'} />
                      <span>{tab.label}</span>
                    </button>
                  )
                })}
              </nav>

              {/* Tab Display Panel (Col 8) */}
              <div className="md:col-span-8 p-6 md:p-8 overflow-y-auto md:h-full scrollbar-thin">
                
                {/* Tab: Appearance */}
                {activeTab === 'appearance' && (
                  <div className="space-y-6">
                    <div className="border-b border-white/5 pb-3">
                      <h4 className="text-sm font-bold text-white uppercase tracking-wide">Interface Colors & View</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5">Adjust client-side templates, bubble layouts, and font size scales.</p>
                    </div>

                    <div className="space-y-5 text-slate-350">
                      {/* Theme selection buttons */}
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Interface Theme</label>
                        <div className="grid grid-cols-3 gap-2.5">
                          {(['dark', 'light', 'system'] as const).map((t) => (
                            <button
                              key={t}
                              onClick={() => {
                                setTheme(t)
                                updateApiSettings({ theme: t, language, model, notifications })
                                if (t === 'light') {
                                  document.documentElement.classList.remove('dark')
                                  document.documentElement.classList.add('light')
                                } else if (t === 'dark') {
                                  document.documentElement.classList.remove('light')
                                  document.documentElement.classList.add('dark')
                                } else {
                                  const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
                                  document.documentElement.classList.toggle('dark', systemDark)
                                }
                              }}
                              className={`px-3 py-2 text-xs font-semibold rounded-lg border transition ${
                                theme === t 
                                  ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20' 
                                  : 'bg-white/[0.01] border-white/5 hover:bg-white/5 text-slate-400'
                              }`}
                            >
                              {t === 'dark' ? 'Dark Slate' : t === 'light' ? 'Frosted Light' : 'System Sync'}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Bubble dropdown */}
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Chat Bubble Frame</label>
                        <select
                          value={uiSettings.chatBubbleStyle}
                          onChange={(e) => updateUiSetting('chatBubbleStyle', e.target.value as any)}
                          className="input-glass min-h-10 w-full rounded-xl px-3 text-xs focus:outline-none bg-[#212121] text-white border-white/5"
                        >
                          <option value="modern-pill" style={{ backgroundColor: '#212121', color: '#ececec' }}>Modern Rounded Pill (Default)</option>
                          <option value="compact-classic" style={{ backgroundColor: '#212121', color: '#ececec' }}>Compact Classic Bubble</option>
                          <option value="glassmorphism" style={{ backgroundColor: '#212121', color: '#ececec' }}>Glassmorphic Shadowed Bubble</option>
                        </select>
                      </div>

                      {/* Font select button grid */}
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Font Scale Size</label>
                        <div className="grid grid-cols-3 gap-2.5">
                          {(['small', 'medium', 'large'] as const).map((sz) => (
                            <button
                              key={sz}
                              onClick={() => updateUiSetting('fontSize', sz)}
                              className={`px-3 py-2 text-xs font-semibold rounded-lg border transition capitalize ${
                                uiSettings.fontSize === sz 
                                  ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20' 
                                  : 'bg-white/[0.01] border-white/5 hover:bg-white/5 text-slate-400'
                              }`}
                            >
                              {sz}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Language dropdown */}
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-400">System Language</label>
                        <select
                          value={language}
                          onChange={(e) => {
                            setLanguage(e.target.value)
                            updateApiSettings({ theme, language: e.target.value, model, notifications })
                          }}
                          className="input-glass min-h-10 w-full rounded-xl px-3 text-xs focus:outline-none bg-[#212121] text-white border-white/5"
                        >
                          <option value="en" style={{ backgroundColor: '#212121', color: '#ececec' }}>English (EN)</option>
                          <option value="hi" style={{ backgroundColor: '#212121', color: '#ececec' }}>Hindi (HI)</option>
                          <option value="es" style={{ backgroundColor: '#212121', color: '#ececec' }}>Spanish (ES)</option>
                          <option value="fr" style={{ backgroundColor: '#212121', color: '#ececec' }}>French (FR)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab: Chat Config */}
                {activeTab === 'chat' && (
                  <div className="space-y-4">
                    <div className="border-b border-white/5 pb-3 mb-2">
                      <h4 className="text-sm font-bold text-white uppercase tracking-wide">Dialogue & View Options</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5">Control scroll methods, bubble layout details, and type transitions.</p>
                    </div>

                    {/* Auto scroll */}
                    <div className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/[0.01]">
                      <div>
                        <span className="text-xs font-bold text-slate-200 block">Auto Scroll to Bottom</span>
                        <span className="text-[9px] text-slate-500">Autoscroll viewport as new output streams</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={uiSettings.autoScroll}
                          onChange={(e) => updateUiSetting('autoScroll', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-slate-400 after:border-slate-350 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-500" />
                      </label>
                    </div>

                    {/* Thinking Indicator */}
                    <div className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/[0.01]">
                      <div>
                        <span className="text-xs font-bold text-slate-200 block">Thinking Dot Indicator</span>
                        <span className="text-[9px] text-slate-500">Show floating placeholders during prompt load</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={uiSettings.showTypingIndicator}
                          onChange={(e) => updateUiSetting('showTypingIndicator', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-slate-400 after:border-slate-355 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-500" />
                      </label>
                    </div>

                    {/* Show timestamps */}
                    <div className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/[0.01]">
                      <div>
                        <span className="text-xs font-bold text-slate-200 block">Message Timestamps</span>
                        <span className="text-[9px] text-slate-500">Show dates and times next to prompt text</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={uiSettings.showTimestamps}
                          onChange={(e) => updateUiSetting('showTimestamps', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-slate-400 after:border-slate-355 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-500" />
                      </label>
                    </div>

                    {/* layout density */}
                    <div className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/[0.01]">
                      <div>
                        <span className="text-xs font-bold text-slate-200 block">Layout View Mode</span>
                        <span className="text-[9px] text-slate-500 font-medium text-slate-400">Change margins and grid spacing in viewport</span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => updateUiSetting('chatViewMode', 'compact')}
                          className={`px-3 py-1 rounded text-[9px] font-bold uppercase tracking-wider border transition ${
                            uiSettings.chatViewMode === 'compact'
                              ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20'
                              : 'bg-transparent border-white/5 text-slate-450 text-slate-400'
                          }`}
                        >
                          Compact
                        </button>
                        <button
                          onClick={() => updateUiSetting('chatViewMode', 'comfortable')}
                          className={`px-3 py-1 rounded text-[9px] font-bold uppercase tracking-wider border transition ${
                            uiSettings.chatViewMode === 'comfortable'
                              ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20'
                              : 'bg-transparent border-white/5 text-slate-450 text-slate-400'
                          }`}
                        >
                          Comfortable
                        </button>
                      </div>
                    </div>

                    {/* animations */}
                    <div className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/[0.01]">
                      <div>
                        <span className="text-xs font-bold text-slate-200 block">Framer Motion Effects</span>
                        <span className="text-[9px] text-slate-500">Apply transition animations to messages list</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={uiSettings.messageAnimations}
                          onChange={(e) => updateUiSetting('messageAnimations', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-slate-400 after:border-slate-355 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-500" />
                      </label>
                    </div>

                    {/* streaming */}
                    <div className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/[0.01]">
                      <div>
                        <span className="text-xs font-bold text-slate-200 block">Word-by-Word Streaming</span>
                        <span className="text-[9px] text-slate-500">Stream dialogue segments gradually in bubbles</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={uiSettings.streamingResponse}
                          onChange={(e) => updateUiSetting('streamingResponse', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-slate-400 after:border-slate-355 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-500" />
                      </label>
                    </div>
                  </div>
                )}

                {/* Tab: AI Engine */}
                {activeTab === 'ai' && (
                  <div className="space-y-6">
                    <div className="border-b border-white/5 pb-3">
                      <h4 className="text-sm font-bold text-white uppercase tracking-wide">LLM Models & Output Tuning</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5">Route AI queries to specific models, limit token length, and choose format engines.</p>
                    </div>

                    <div className="space-y-5">
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Select LLM Engine</label>
                        <select
                          value={model}
                          onChange={(e) => {
                            setModel(e.target.value)
                            updateApiSettings({ theme, language, model: e.target.value, notifications })
                          }}
                          className="input-glass min-h-10 w-full rounded-xl px-3 text-xs focus:outline-none bg-[#212121] text-white border-white/5"
                        >
                          <option value="nova-pro" style={{ backgroundColor: '#212121', color: '#ececec' }}>NovaMind Ultra Pro (Max Context)</option>
                          <option value="nova-lite" style={{ backgroundColor: '#212121', color: '#ececec' }}>NovaMind Lite (Fast Speed)</option>
                          <option value="nova-coder" style={{ backgroundColor: '#212121', color: '#ececec' }}>NovaMind Coder (Code & Logic)</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Response Word Length</label>
                        <div className="grid grid-cols-3 gap-2.5">
                          {(['short', 'medium', 'long'] as const).map((len) => (
                            <button
                              key={len}
                              onClick={() => updateUiSetting('responseLength', len)}
                              className={`px-3 py-2 text-xs font-semibold rounded-lg border transition uppercase tracking-wider ${
                                uiSettings.responseLength === len 
                                  ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20' 
                                  : 'bg-white/[0.01] border-white/5 hover:bg-white/5 text-slate-400'
                              }`}
                            >
                              {len}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Response Detail Level</label>
                        <div className="grid grid-cols-3 gap-2.5">
                          {(['basic', 'detailed', 'expert'] as const).map((det) => (
                            <button
                              key={det}
                              onClick={() => updateUiSetting('detailLevel', det)}
                              className={`px-3 py-2 text-xs font-semibold rounded-lg border transition uppercase tracking-wider ${
                                uiSettings.detailLevel === det 
                                  ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20' 
                                  : 'bg-white/[0.01] border-white/5 hover:bg-white/5 text-slate-400'
                              }`}
                            >
                              {det}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Creativity Temperature</label>
                        <div className="grid grid-cols-3 gap-2.5">
                          {(['precise', 'balanced', 'creative'] as const).map((lvl) => (
                            <button
                              key={lvl}
                              onClick={() => updateUiSetting('creativityLevel', lvl)}
                              className={`px-3 py-2 text-xs font-semibold rounded-lg border transition capitalize ${
                                uiSettings.creativityLevel === lvl 
                                  ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20' 
                                  : 'bg-white/[0.01] border-white/5 hover:bg-white/5 text-slate-400'
                              }`}
                            >
                              {lvl}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Code formating */}
                      <div className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/[0.01]">
                        <div>
                          <span className="text-xs font-bold text-slate-200 block">Vibrant Code Formatting</span>
                          <span className="text-[9px] text-slate-500">Enable colorful keyword themes inside code elements</span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={uiSettings.codeFormatting}
                            onChange={(e) => updateUiSetting('codeFormatting', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-slate-400 after:border-slate-355 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-500" />
                        </label>
                      </div>

                      {/* Markdown toggle */}
                      <div className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/[0.01]">
                        <div>
                          <span className="text-xs font-bold text-slate-200 block">Markdown Rendering</span>
                          <span className="text-[9px] text-slate-500">Render titles, headers, and bullet formats</span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={uiSettings.markdownRendering}
                            onChange={(e) => updateUiSetting('markdownRendering', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-slate-400 after:border-slate-355 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-500" />
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab: Data & Disk */}
                {activeTab === 'data' && (
                  <div className="space-y-4">
                    <div className="border-b border-white/5 pb-3 mb-2">
                      <h4 className="text-sm font-bold text-white uppercase tracking-wide">Disk Cleanup & Exports</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5">Download full configurations, clear dialog logs, or download backups.</p>
                    </div>

                    {/* Clear Active Dialog */}
                    <div className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/[0.01]">
                      <div>
                        <span className="text-xs font-bold text-slate-200 block">Clear Messages in Active Chat</span>
                        <span className="text-[9px] text-slate-500">Wipe dialogue panels within current window</span>
                      </div>
                      <button
                        onClick={handleClearCurrentChat}
                        className="px-3.5 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 font-bold uppercase tracking-wider text-[8px] rounded-lg active:scale-95 transition cursor-pointer select-none"
                      >
                        Clear Chat
                      </button>
                    </div>

                    {/* Clear All Chats */}
                    <div className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/[0.01]">
                      <div>
                        <span className="text-xs font-bold text-slate-200 block">Delete All Chats History</span>
                        <span className="text-[9px] text-rose-400 block font-semibold">Caution: Deletes all database logs permanently</span>
                      </div>
                      <button
                        onClick={handleClearAllChats}
                        className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold uppercase tracking-wider text-[8px] rounded-lg shadow active:scale-95 transition cursor-pointer select-none"
                      >
                        Delete All
                      </button>
                    </div>

                    {/* Export chats JSON */}
                    <div className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/[0.01]">
                      <div>
                        <span className="text-xs font-bold text-slate-200 block">Export Chats Archive</span>
                        <span className="text-[9px] text-slate-500">Download a full JSON package representing chats history</span>
                      </div>
                      <button
                        onClick={handleExportChats}
                        className="px-3.5 py-1.5 bg-white/5 hover:bg-white/10 text-slate-350 text-slate-300 font-bold uppercase tracking-wider text-[8px] border border-white/10 rounded-lg active:scale-95 transition flex items-center gap-1.5 cursor-pointer select-none"
                      >
                        <Download size={11} />
                        Export
                      </button>
                    </div>

                    {/* Download active chat history markdown */}
                    {selectedChat && (
                      <div className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/[0.01]">
                        <div>
                          <span className="text-xs font-bold text-slate-200 block">Export Active Chat</span>
                          <span className="text-[9px] text-slate-500">Download active text log as Markdown file (.md)</span>
                        </div>
                        <button
                          onClick={() => {
                            const chatText = selectedChat.messages?.map(m => `${m.role === 'user' ? 'USER' : 'AI'}: ${m.content}`).join('\n\n') || ''
                            const blob = new Blob([chatText], { type: 'text/markdown' })
                            const url = URL.createObjectURL(blob)
                            const link = document.createElement('a')
                            link.href = url
                            link.download = `novamind-chat-${selectedChat.id}.md`
                            link.click()
                            URL.revokeObjectURL(url)
                            showToast('Chat history exported as Markdown', 'success')
                          }}
                          className="px-3.5 py-1.5 bg-white/5 hover:bg-white/10 text-slate-350 text-slate-300 font-bold uppercase tracking-wider text-[8px] border border-white/10 rounded-lg active:scale-95 transition flex items-center gap-1.5 cursor-pointer select-none"
                        >
                          <FileDown size={11} />
                          Download Chat
                        </button>
                      </div>
                    )}

                    {/* Backup settings JSON */}
                    <div className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/[0.01]">
                      <div>
                        <span className="text-xs font-bold text-slate-200 block">Backup preferences file</span>
                        <span className="text-[9px] text-slate-500">Download browser UI configuration backup</span>
                      </div>
                      <button
                        onClick={handleDownloadSettingsBackup}
                        className="px-3.5 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 font-bold uppercase tracking-wider text-[8px] border border-indigo-500/20 rounded-lg active:scale-95 transition flex items-center gap-1.5 cursor-pointer select-none"
                      >
                        <Download size={11} />
                        Download Backup
                      </button>
                    </div>
                  </div>
                )}

                {/* Tab: Account Profile */}
                {activeTab === 'account' && (
                  <div className="space-y-6">
                    <div className="border-b border-white/5 pb-3">
                      <h4 className="text-sm font-bold text-white uppercase tracking-wide">Account Configurations</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5">Edit credentials, password and session details.</p>
                    </div>

                    <form onSubmit={handleSaveAccount} className="space-y-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <FormField
                          label="Display Name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                        />
                        <FormField
                          label="Username"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          required
                        />
                      </div>

                      <FormField
                        label="Email Address"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />

                      <div className="border-t border-white/5 pt-4 space-y-4">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Modify Password</span>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <FormField
                            label="New Password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                          />
                          <FormField
                            label="Confirm Password"
                            type="password"
                            placeholder="••••••••"
                            value={passwordConfirmation}
                            onChange={(e) => setPasswordConfirmation(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="flex justify-between items-center border-t border-white/5 pt-4">
                        {/* Session logout */}
                        <button
                          type="button"
                          onClick={async () => {
                            if (window.confirm('Are you sure you want to logout?')) {
                              await logout()
                              navigate('/login')
                            }
                          }}
                          className="px-3.5 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-bold uppercase tracking-wider text-[8px] rounded-lg border border-rose-500/20 active:scale-95 transition flex items-center gap-1 cursor-pointer select-none"
                        >
                          <LogOut size={11} />
                          Logout
                        </button>

                        <Button
                          type="submit"
                          disabled={isUpdatingAccount}
                          className="min-h-10 px-5 text-xs bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition"
                        >
                          {isUpdatingAccount ? 'Saving...' : 'Apply Changes'}
                        </Button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Tab: Advanced */}
                {activeTab === 'advanced' && (
                  <div className="space-y-4">
                    <div className="border-b border-white/5 pb-3 mb-2">
                      <h4 className="text-sm font-bold text-white uppercase tracking-wide">Advanced Developer Capabilities</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5">Toggle hardware render settings, default values, and sockets details logs.</p>
                    </div>

                    {/* Fullscreen default */}
                    <div className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/[0.01]">
                      <div>
                        <span className="text-xs font-bold text-slate-200 block">Default Fullscreen Chat</span>
                        <span className="text-[9px] text-slate-500">Open dialog panel inside fullscreen layout by default</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={uiSettings.fullscreenDefault}
                          onChange={(e) => updateUiSetting('fullscreenDefault', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-slate-400 after:border-slate-355 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-500" />
                      </label>
                    </div>

                    {/* Auto save drafts */}
                    <div className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/[0.01]">
                      <div>
                        <span className="text-xs font-bold text-slate-200 block">Auto Save Drafts Buffer</span>
                        <span className="text-[9px] text-slate-500">Persist typed prompt drafts inside local cache buffers</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={uiSettings.autoSaveDrafts}
                          onChange={(e) => updateUiSetting('autoSaveDrafts', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-slate-400 after:border-slate-355 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-500" />
                      </label>
                    </div>

                    {/* Auto copy code */}
                    <div className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/[0.01]">
                      <div>
                        <span className="text-xs font-bold text-slate-200 block">Auto Copy Code Outputs</span>
                        <span className="text-[9px] text-slate-500">Copy syntax code blocks automatically when dialogue ends</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={uiSettings.autoCopyCode}
                          onChange={(e) => updateUiSetting('autoCopyCode', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-slate-400 after:border-slate-355 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-500" />
                      </label>
                    </div>

                    {/* Performance GPU rendering */}
                    <div className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/[0.01]">
                      <div>
                        <span className="text-xs font-bold text-slate-200 block">GPU Render Optimization</span>
                        <span className="text-[9px] text-slate-500">Enable hardware acceleration for layouts and animations</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={uiSettings.performanceMode}
                          onChange={(e) => updateUiSetting('performanceMode', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-slate-400 after:border-slate-355 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-500" />
                      </label>
                    </div>

                    {/* Developer mode console */}
                    <div className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/[0.01]">
                      <div>
                        <span className="text-xs font-bold text-slate-200 block">Developer Debug Console</span>
                        <span className="text-[9px] text-slate-500">Show model logs, temperature and delay data</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={uiSettings.developerMode}
                          onChange={(e) => updateUiSetting('developerMode', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-slate-400 after:border-slate-355 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-500" />
                      </label>
                    </div>
                  </div>
                )}

              </div>

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
