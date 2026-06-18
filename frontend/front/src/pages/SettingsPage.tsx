import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, 
  Palette, 
  Settings, 
  Cpu, 
  Database, 
  User, 
  Zap, 
  Download, 
  LogOut,
  Sliders,
  FileDown
} from 'lucide-react'
import { useAuth } from '../context/useAuth'
import { useChat } from '../context/ChatContext'
import { useToast } from '../context/ToastContext'
import { Button } from '../components/ui/Button'
import { FormField } from '../components/ui/FormField'
import { errorMessage } from '../lib/api'
import type { ThemeMode } from '../types/api'

// Define default UI settings key in LocalStorage
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
  responseLength: 'medium',
  creativityLevel: 'balanced',
  codeFormatting: true,
  markdownRendering: true,
  fullscreenDefault: false,
  autoSaveDrafts: true,
  autoCopyCode: false,
  performanceMode: true,
  developerMode: false
}

export function SettingsPage() {
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

  // Tab state
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

  // Auto Save API settings inline on selection change

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

  // Switch tabs mapping
  const tabs = [
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'chat', label: 'Chat Settings', icon: Sliders },
    { id: 'ai', label: 'AI Configuration', icon: Cpu },
    { id: 'data', label: 'Data & History', icon: Database },
    { id: 'account', label: 'Account Profile', icon: User },
    { id: 'advanced', label: 'Advanced', icon: Zap }
  ] as const

  return (
    <main className="min-h-screen text-[#ececec] bg-[#171717] font-sans relative overflow-x-hidden p-6 md:p-10">
      {/* Background glow animations */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#8B5CF6]/5 blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto space-y-8 relative z-10">
        
        {/* Navigation Back Button */}
        <button 
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2.5 px-4 py-2 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/5 hover:text-white transition duration-200 text-slate-400 font-semibold text-xs cursor-pointer select-none"
        >
          <ArrowLeft size={14} />
          <span>Back to Chat</span>
        </button>

        {/* Settings Title */}
        <div className="flex items-center gap-3 border-b border-white/5 pb-4 select-none">
          <Settings className="text-indigo-400 size-6 animate-spin-slow" />
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">System Configurations</h1>
        </div>

        {/* Grid layout (Left tabs menu, Right active tab panel) */}
        <div className="grid md:grid-cols-12 gap-8">
          
          {/* Tab buttons sidebar (Col 4) */}
          <nav className="md:col-span-4 flex flex-col gap-1.5 select-none">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-semibold tracking-wide border transition-all duration-200 text-left ${
                    isActive 
                      ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30 font-bold shadow-md shadow-indigo-500/[0.03]' 
                      : 'border-transparent text-slate-400 hover:bg-white/5 hover:text-slate-200'
                  }`}
                >
                  <Icon size={16} className={isActive ? 'text-indigo-400' : 'text-slate-400'} />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </nav>

          {/* Active Tab Panel (Col 8) */}
          <div className="md:col-span-8">
            <div className="glass rounded-[28px] p-6 md:p-8 border border-white/5 space-y-6">

              {/* SECTION 1: APPEARANCE */}
              {activeTab === 'appearance' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Palette size={16} className="text-indigo-400" />
                      Visual Appearance
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-1">Adjust theme layouts, sizes, and bubble frames.</p>
                  </div>

                  <div className="space-y-5">
                    {/* Theme Mode selection */}
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold text-slate-350 uppercase tracking-wider">Interface Color Theme</label>
                      <div className="grid grid-cols-3 gap-3">
                        {(['dark', 'light', 'system'] as const).map((t) => (
                          <button
                            key={t}
                            onClick={() => {
                              setTheme(t)
                              // Immediately auto-trigger API update on selection change
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
                            className={`px-4 py-3 text-xs font-semibold rounded-xl border transition ${
                              theme === t 
                                ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30' 
                                : 'bg-[#0F172A]/40 border-white/5 hover:bg-white/[0.03] text-slate-400'
                            }`}
                          >
                            {t === 'dark' ? 'Dark Slate' : t === 'light' ? 'Frosted Light' : 'System Sync'}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Chat Bubble Style dropdown */}
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold text-slate-350 uppercase tracking-wider">Chat Bubble Frame</label>
                      <select
                        value={uiSettings.chatBubbleStyle}
                        onChange={(e) => updateUiSetting('chatBubbleStyle', e.target.value as any)}
                        className="input-glass min-h-11 w-full rounded-xl px-3.5 text-xs focus:outline-none bg-slate-950 text-white"
                      >
                        <option value="modern-pill">Modern Rounded Pill (Default)</option>
                        <option value="compact-classic">Compact Classic Bubble</option>
                        <option value="glassmorphism">Glassmorphic Shadowed Bubble</option>
                      </select>
                    </div>

                    {/* Font Size select */}
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold text-slate-350 uppercase tracking-wider">Interface Typography Scale</label>
                      <div className="grid grid-cols-3 gap-3">
                        {(['small', 'medium', 'large'] as const).map((sz) => (
                          <button
                            key={sz}
                            onClick={() => updateUiSetting('fontSize', sz)}
                            className={`px-4 py-3 text-xs font-semibold rounded-xl border transition ${
                              uiSettings.fontSize === sz 
                                ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30' 
                                : 'bg-[#0F172A]/40 border-white/5 hover:bg-white/[0.03] text-slate-400'
                            }`}
                          >
                            {sz === 'small' ? 'Small (12px)' : sz === 'medium' ? 'Medium (14px)' : 'Large (16px)'}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Language dropdown */}
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold text-slate-350 uppercase tracking-wider">System Language</label>
                      <select
                        value={language}
                        onChange={(e) => {
                          setLanguage(e.target.value)
                          updateApiSettings({ theme, language: e.target.value, model, notifications })
                        }}
                        className="input-glass min-h-11 w-full rounded-xl px-3.5 text-xs focus:outline-none bg-slate-950 text-white"
                      >
                        <option value="en">English (EN)</option>
                        <option value="hi">Hindi (HI)</option>
                        <option value="es">Spanish (ES)</option>
                        <option value="fr">French (FR)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 2: CHAT SETTINGS */}
              {activeTab === 'chat' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Sliders size={16} className="text-indigo-400" />
                      Chat Experience
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-1">Configure layout, autoscroll behavior, and response types.</p>
                  </div>

                  <div className="space-y-4">
                    {/* Auto Scroll */}
                    <div className="flex items-center justify-between p-4 rounded-2xl border border-white/5 bg-[#0F172A]/40">
                      <div>
                        <span className="text-xs font-bold text-slate-200 block">Auto Scroll to Bottom</span>
                        <span className="text-[10px] text-slate-500">Scroll to bottom automatically on new messages</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={uiSettings.autoScroll}
                          onChange={(e) => updateUiSetting('autoScroll', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-10 h-6 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500" />
                      </label>
                    </div>

                    {/* Typing Indicator */}
                    <div className="flex items-center justify-between p-4 rounded-2xl border border-white/5 bg-[#0F172A]/40">
                      <div>
                        <span className="text-xs font-bold text-slate-200 block">AI Thinking Indicator</span>
                        <span className="text-[10px] text-slate-500">Show animation placeholder when model generates text</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={uiSettings.showTypingIndicator}
                          onChange={(e) => updateUiSetting('showTypingIndicator', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-10 h-6 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500" />
                      </label>
                    </div>

                    {/* Show Timestamps */}
                    <div className="flex items-center justify-between p-4 rounded-2xl border border-white/5 bg-[#0F172A]/40">
                      <div>
                        <span className="text-xs font-bold text-slate-200 block">Message Timestamps</span>
                        <span className="text-[10px] text-slate-500">Display dates and times for chat responses</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={uiSettings.showTimestamps}
                          onChange={(e) => updateUiSetting('showTimestamps', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-10 h-6 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500" />
                      </label>
                    </div>

                    {/* View mode Compact vs Comfortable */}
                    <div className="flex items-center justify-between p-4 rounded-2xl border border-white/5 bg-[#0F172A]/40">
                      <div>
                        <span className="text-xs font-bold text-slate-200 block">Layout View Mode</span>
                        <span className="text-[10px] text-slate-500">Switch spacing density of message history</span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => updateUiSetting('chatViewMode', 'compact')}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition ${
                            uiSettings.chatViewMode === 'compact'
                              ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30'
                              : 'bg-transparent border-white/5 text-slate-400'
                          }`}
                        >
                          Compact
                        </button>
                        <button
                          onClick={() => updateUiSetting('chatViewMode', 'comfortable')}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition ${
                            uiSettings.chatViewMode === 'comfortable'
                              ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30'
                              : 'bg-transparent border-white/5 text-slate-400'
                          }`}
                        >
                          Comfortable
                        </button>
                      </div>
                    </div>

                    {/* Message Animations toggle */}
                    <div className="flex items-center justify-between p-4 rounded-2xl border border-white/5 bg-[#0F172A]/40">
                      <div>
                        <span className="text-xs font-bold text-slate-200 block">Visual Animations</span>
                        <span className="text-[10px] text-slate-500">Toggle Framer Motion fade-ins on content rendering</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={uiSettings.messageAnimations}
                          onChange={(e) => updateUiSetting('messageAnimations', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-10 h-6 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500" />
                      </label>
                    </div>

                    {/* Streaming response */}
                    <div className="flex items-center justify-between p-4 rounded-2xl border border-white/5 bg-[#0F172A]/40">
                      <div>
                        <span className="text-xs font-bold text-slate-200 block">Streaming Response</span>
                        <span className="text-[10px] text-slate-500">Output AI content word-by-word progressively</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={uiSettings.streamingResponse}
                          onChange={(e) => updateUiSetting('streamingResponse', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-10 h-6 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500" />
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 3: AI CONFIGURATION */}
              {activeTab === 'ai' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Cpu size={16} className="text-indigo-400" />
                      AI Model Configuration
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-1">Configure LLM routing engines, response parameters, and formatting styles.</p>
                  </div>

                  <div className="space-y-5">
                    {/* Model Select */}
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold text-slate-350 uppercase tracking-wider">Active LLM Model</label>
                      <select
                        value={model}
                        onChange={(e) => {
                          setModel(e.target.value)
                          updateApiSettings({ theme, language, model: e.target.value, notifications })
                        }}
                        className="input-glass min-h-11 w-full rounded-xl px-3.5 text-xs focus:outline-none bg-slate-950 text-white"
                      >
                        <option value="nova-pro">NovaMind Ultra Pro (Max Context)</option>
                        <option value="nova-lite">NovaMind Lite (Fast Speed)</option>
                        <option value="nova-coder">NovaMind Coder (Code & Logic)</option>
                      </select>
                    </div>

                    {/* Response Length select */}
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold text-slate-350 uppercase tracking-wider">AI Content Length</label>
                      <div className="grid grid-cols-3 gap-3">
                        {(['short', 'medium', 'long'] as const).map((len) => (
                          <button
                            key={len}
                            onClick={() => updateUiSetting('responseLength', len)}
                            className={`px-4 py-3 text-xs font-semibold rounded-xl border transition uppercase tracking-wider ${
                              uiSettings.responseLength === len 
                                ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30' 
                                : 'bg-[#0F172A]/40 border-white/5 hover:bg-white/[0.03] text-slate-400'
                            }`}
                          >
                            {len}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Creativity Level */}
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold text-slate-350 uppercase tracking-wider">Creativity Temperature</label>
                      <div className="grid grid-cols-3 gap-3">
                        {(['precise', 'balanced', 'creative'] as const).map((lvl) => (
                          <button
                            key={lvl}
                            onClick={() => updateUiSetting('creativityLevel', lvl)}
                            className={`px-4 py-3 text-xs font-semibold rounded-xl border transition uppercase tracking-wider ${
                              uiSettings.creativityLevel === lvl 
                                ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30' 
                                : 'bg-[#0F172A]/40 border-white/5 hover:bg-white/[0.03] text-slate-400'
                            }`}
                          >
                            {lvl}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Code Formatting */}
                    <div className="flex items-center justify-between p-4 rounded-2xl border border-white/5 bg-[#0F172A]/40">
                      <div>
                        <span className="text-xs font-bold text-slate-200 block">Vibrant Code Formatting</span>
                        <span className="text-[10px] text-slate-500">Apply custom highlighted syntax styling to programming blocks</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={uiSettings.codeFormatting}
                          onChange={(e) => updateUiSetting('codeFormatting', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-10 h-6 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500" />
                      </label>
                    </div>

                    {/* Markdown rendering */}
                    <div className="flex items-center justify-between p-4 rounded-2xl border border-white/5 bg-[#0F172A]/40">
                      <div>
                        <span className="text-xs font-bold text-slate-200 block">HTML Markdown Engine</span>
                        <span className="text-[10px] text-slate-500">Translate markdown elements (headings, bold, lists) into UI components</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={uiSettings.markdownRendering}
                          onChange={(e) => updateUiSetting('markdownRendering', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-10 h-6 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500" />
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 4: DATA & HISTORY */}
              {activeTab === 'data' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Database size={16} className="text-indigo-400" />
                      Data Storage & Exports
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-1">Export database conversation packages, download history or clear disk spaces.</p>
                  </div>

                  <div className="space-y-4">
                    {/* Clear Current Chat */}
                    <div className="flex items-center justify-between p-4 rounded-2xl border border-white/5 bg-[#0F172A]/40">
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-slate-200 block">Clear Messages in Active Chat</span>
                        <span className="text-[10px] text-slate-500">Wipe dialogue history inside the selected workspace folder</span>
                      </div>
                      <button
                        onClick={handleClearCurrentChat}
                        className="px-3.5 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-bold uppercase tracking-wider text-[9px] rounded-xl border border-rose-500/20 active:scale-95 transition cursor-pointer select-none"
                      >
                        Clear Chat
                      </button>
                    </div>

                    {/* Clear All Chats */}
                    <div className="flex items-center justify-between p-4 rounded-2xl border border-white/5 bg-[#0F172A]/40">
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-slate-200 block">Clear All Workspace Conversations</span>
                        <span className="text-[10px] text-slate-500 font-medium text-rose-400">Warning: Deletes all chat items permanently from DB</span>
                      </div>
                      <button
                        onClick={handleClearAllChats}
                        className="px-3.5 py-2 bg-rose-550 bg-rose-600 hover:bg-rose-700 text-white font-bold uppercase tracking-wider text-[9px] rounded-xl shadow-lg active:scale-95 transition cursor-pointer select-none"
                      >
                        Delete All Chats
                      </button>
                    </div>

                    {/* Export Chats */}
                    <div className="flex items-center justify-between p-4 rounded-2xl border border-white/5 bg-[#0F172A]/40">
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-slate-200 block">Export All Chats Data</span>
                        <span className="text-[10px] text-slate-500">Download a full JSON package representing all messages and structures</span>
                      </div>
                      <button
                        onClick={handleExportChats}
                        className="px-3.5 py-2 bg-white/5 hover:bg-white/10 text-slate-300 font-bold uppercase tracking-wider text-[9px] rounded-xl border border-white/10 active:scale-95 transition flex items-center gap-1.5 cursor-pointer select-none"
                      >
                        <Download size={12} />
                        Export Chats
                      </button>
                    </div>

                    {/* Download Active Chat History */}
                    {selectedChat && (
                      <div className="flex items-center justify-between p-4 rounded-2xl border border-white/5 bg-[#0F172A]/40">
                        <div className="space-y-0.5">
                          <span className="text-xs font-bold text-slate-200 block">Download Active Conversation</span>
                          <span className="text-[10px] text-slate-500">Export dialogue log of current chat as a Markdown text package</span>
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
                          className="px-3.5 py-2 bg-white/5 hover:bg-white/10 text-slate-300 font-bold uppercase tracking-wider text-[9px] rounded-xl border border-white/10 active:scale-95 transition flex items-center gap-1.5 cursor-pointer select-none"
                        >
                          <FileDown size={12} />
                          Download Chat
                        </button>
                      </div>
                    )}

                    {/* Backup configurations */}
                    <div className="flex items-center justify-between p-4 rounded-2xl border border-white/5 bg-[#0F172A]/40">
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-slate-200 block">Backup Configuration File</span>
                        <span className="text-[10px] text-slate-500">Download current UI preferences and core variables as JSON</span>
                      </div>
                      <button
                        onClick={handleDownloadSettingsBackup}
                        className="px-3.5 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 font-bold uppercase tracking-wider text-[9px] rounded-xl border border-indigo-500/20 active:scale-95 transition flex items-center gap-1.5 cursor-pointer select-none"
                      >
                        <Download size={12} />
                        Download Backup
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 5: ACCOUNT */}
              {activeTab === 'account' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <User size={16} className="text-indigo-400" />
                      Account Settings
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-1">Configure profile display, login names, password and secure routes.</p>
                  </div>

                  <form onSubmit={handleSaveAccount} className="space-y-5">
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

                    <div className="border-t border-white/5 pt-5 space-y-4">
                      <span className="text-xs font-bold text-slate-350 uppercase tracking-wider block">Security Details</span>
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

                    <div className="flex justify-between items-center border-t border-white/5 pt-5">
                      {/* Logout All Devices */}
                      <button
                        type="button"
                        onClick={async () => {
                          if (window.confirm('Are you sure you want to logout?')) {
                            await logout()
                            navigate('/login')
                          }
                        }}
                        className="px-3.5 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-405 text-rose-400 font-bold uppercase tracking-wider text-[9px] rounded-xl border border-rose-500/20 active:scale-95 transition flex items-center gap-1.5 cursor-pointer select-none"
                      >
                        <LogOut size={12} />
                        Logout Session
                      </button>

                      <Button
                        type="submit"
                        disabled={isUpdatingAccount}
                        className="min-h-11 px-6 text-xs bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl shadow-lg transition duration-200 cursor-pointer"
                      >
                        {isUpdatingAccount ? 'Saving...' : 'Apply Changes'}
                      </Button>
                    </div>
                  </form>
                </div>
              )}

              {/* SECTION 6: ADVANCED */}
              {activeTab === 'advanced' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Zap size={16} className="text-indigo-400" />
                      Advanced Developer Settings
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-1">Unlock low-level performance options and developer capabilities.</p>
                  </div>

                  <div className="space-y-4">
                    {/* Fullscreen Default */}
                    <div className="flex items-center justify-between p-4 rounded-2xl border border-white/5 bg-[#0F172A]/40">
                      <div>
                        <span className="text-xs font-bold text-slate-200 block">Fullscreen Mode by Default</span>
                        <span className="text-[10px] text-slate-500">Initialize chat interface in maximized fullscreen layout mode</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={uiSettings.fullscreenDefault}
                          onChange={(e) => updateUiSetting('fullscreenDefault', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-10 h-6 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500" />
                      </label>
                    </div>

                    {/* Auto Save Drafts */}
                    <div className="flex items-center justify-between p-4 rounded-2xl border border-white/5 bg-[#0F172A]/40">
                      <div>
                        <span className="text-xs font-bold text-slate-200 block">Auto-save Draft Prompts</span>
                        <span className="text-[10px] text-slate-500">Temporarily persist typed prompt input drafts in local browser buffer</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={uiSettings.autoSaveDrafts}
                          onChange={(e) => updateUiSetting('autoSaveDrafts', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-10 h-6 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500" />
                      </label>
                    </div>

                    {/* Auto Copy Code Button */}
                    <div className="flex items-center justify-between p-4 rounded-2xl border border-white/5 bg-[#0F172A]/40">
                      <div>
                        <span className="text-xs font-bold text-slate-200 block">Auto-Copy Generated Code Blocks</span>
                        <span className="text-[10px] text-slate-500 font-medium text-indigo-400">Trigger automatic copy to clipboard when code responses finalize</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={uiSettings.autoCopyCode}
                          onChange={(e) => updateUiSetting('autoCopyCode', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-10 h-6 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500" />
                      </label>
                    </div>

                    {/* Performance Mode */}
                    <div className="flex items-center justify-between p-4 rounded-2xl border border-white/5 bg-[#0F172A]/40">
                      <div>
                        <span className="text-xs font-bold text-slate-200 block">Enhanced Performance Render Mode</span>
                        <span className="text-[10px] text-slate-500">Enable heavy GPU-backed CSS filters and DOM content optimizations</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={uiSettings.performanceMode}
                          onChange={(e) => updateUiSetting('performanceMode', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-10 h-6 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500" />
                      </label>
                    </div>

                    {/* Developer Mode */}
                    <div className="flex items-center justify-between p-4 rounded-2xl border border-white/5 bg-[#0F172A]/40">
                      <div>
                        <span className="text-xs font-bold text-slate-200 block">Developer Debug Console Mode</span>
                        <span className="text-[10px] text-slate-500">Log internal socket bindings, LLM temperatures, and network delays</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={uiSettings.developerMode}
                          onChange={(e) => updateUiSetting('developerMode', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-10 h-6 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500" />
                      </label>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>

      </div>
    </main>
  )
}
