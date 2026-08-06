import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Smile,
  BookOpen,
  Grid,
  Sparkles,
  Crosshair,
  Heart,
  Sun,
  Palette,
  Settings,
  Bell,
  Mic,
  ShieldCheck,
  Shield,
  HardDrive,
  Database,
  Pencil,
  ChevronRight,
  Check,
  LogOut,
  RefreshCw,
  X,
  CreditCard,
  Keyboard,
  User,
  Smartphone,
  Lock,
  Globe,
  AlertTriangle,
  Monitor,
  Briefcase,
  Mail,
  Phone,
  Bug,
  Info
} from 'lucide-react'
import { useAuth } from '../../context/useAuth'
import { useChat } from '../../context/ChatContext'
import { useToast } from '../../context/ToastContext'
import { errorMessage } from '../../lib/api'
import type { ThemeMode } from '../../types/api'

interface NovaSettingsProps {
  onClose?: () => void
  isModal?: boolean
}

type DesktopTabType =
  | 'notifications'
  | 'storage'
  | 'safety'
  | 'parental'
  | 'account'
  | 'general'
  | 'personalization'
  | 'plugins'
  | 'voice'
  | 'billing'
  | 'data'
  | 'security'
  | 'trusted'
  | 'keyboard'

type SubViewType =
  | 'main'
  | 'personalization'
  | 'memory'
  | 'plugins'
  | 'remote'
  | 'workspace'
  | 'subscription'
  | 'trusted'
  | 'parental'
  | 'email'
  | 'phone'
  | 'appearance'
  | 'accent'
  | 'general'
  | 'notifications'
  | 'voice'
  | 'safety'
  | 'security'
  | 'storage'
  | 'data'
  | 'bug'
  | 'about'
  | 'account'

const BUBBLE_COLOR_PRESETS = [
  { name: 'Default Dark', value: 'default', color: 'bg-[#262626]', border: 'border-zinc-700' },
  { name: 'Electric Blue', value: '#2563eb', color: 'bg-[#2563eb]', border: 'border-blue-500' },
  { name: 'Indigo Purple', value: '#4f46e5', color: 'bg-[#4f46e5]', border: 'border-indigo-500' },
  { name: 'Emerald Green', value: '#16a34a', color: 'bg-[#16a34a]', border: 'border-green-500' },
  { name: 'Crimson Red', value: '#dc2626', color: 'bg-[#dc2626]', border: 'border-red-500' },
  { name: 'Sunset Orange', value: '#ea580c', color: 'bg-[#ea580c]', border: 'border-orange-500' },
  { name: 'Vivid Pink', value: '#db2777', color: 'bg-[#db2777]', border: 'border-pink-500' },
  { name: 'Cyan Teal', value: '#0891b2', color: 'bg-[#0891b2]', border: 'border-cyan-500' },
  { name: 'Slate Gray', value: '#4b5563', color: 'bg-[#4b5563]', border: 'border-gray-500' },
  { name: 'Midnight Black', value: '#09090b', color: 'bg-[#09090b]', border: 'border-zinc-600' }
]

export function NovaSettings({ onClose }: NovaSettingsProps) {
  const navigate = useNavigate()
  const { user, updateProfile, logout } = useAuth()
  const {
    settings: apiSettings,
    updateSettings: updateApiSettings,
    chats,
    selectedChat,
    setMessages,
    deleteChat,
    uiSettings,
    updateUiSetting
  } = useChat()
  const { showToast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // State for Desktop Tab & Mobile SubView
  const [desktopTab, setDesktopTab] = useState<DesktopTabType>('notifications')
  const [subView, setSubView] = useState<SubViewType>('main')

  // Theme & Settings States
  const [theme, setTheme] = useState<ThemeMode>(apiSettings.theme)
  const [language, setLanguage] = useState(apiSettings.language)
  const [model, setModel] = useState(apiSettings.model)
  const [notifications, setNotifications] = useState(apiSettings.notifications)



  // Profile Edit States
  const [name, setName] = useState(user?.name ?? '')
  const [username, setUsername] = useState(user?.username ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [phone, setPhone] = useState('+917096440393')
  const [region, setRegion] = useState('IN')
  const [timeZone, setTimeZone] = useState('Asia/Kolkata')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [isUpdatingAccount, setIsUpdatingAccount] = useState(false)

  // 😊 Personalization State
  const [persState, setPersState] = useState({
    displayName: user?.name || 'Patel Dhyan',
    aiName: 'NovaMind',
    responseStyle: 'professional',
    learningMode: 'step-by-step',
    programmingLang: 'typescript',
    aiPersonality: 'analytical',
    responseLength: 'balanced',
    conversationTone: 'neutral',
    interests: 'Web Development, AI Assistant Architecture, UI/UX Design'
  })

  // 🧠 Memory State
  const [memState, setMemState] = useState({
    memoryEnabled: true,
    rememberName: true,
    rememberPreferences: true,
    rememberProgress: true,
    rememberTopics: true
  })
  const [memoriesList, setMemoriesList] = useState([
    { id: '1', text: 'User is building NovaMind AI chatbot with Laravel + React' },
    { id: '2', text: 'Prefers TailwindCSS and clean TypeScript code' },
    { id: '3', text: 'Prefers Dark Mode UI styling and compact bubble previews' }
  ])

  // 🔌 Plugins State
  const [pluginsState, setPluginsState] = useState({
    webSearch: true,
    codeInterpreter: true,
    dalleImage: true,
    pdfAnalysis: true,
    autoUpdate: true,
    permission: 'ask'
  })

  // 🖥 Remote Control State
  const [remoteState, setRemoteState] = useState({
    remoteAccess: true,
    authMode: 'prompt',
    secPin: true
  })

  // 🏢 Workspace State
  const [workspaceState, setWorkspaceState] = useState({
    name: 'NovaMind Dev Team',
    role: 'Owner / Administrator',
    sharedChats: true,
    inviteEmail: ''
  })

  // 📧 Email State
  const [emailState, setEmailState] = useState({
    primaryEmail: user?.email || 'dhyan.nupursoftware@gmail.com',
    recoveryEmail: 'recovery.dhyan@gmail.com',
    privacy: true,
    isVerified: true
  })

  // 📱 Phone State
  const [phoneState, setPhoneState] = useState({
    primaryPhone: '+91 70964 40393',
    recoveryPhone: '+91 98765 43210',
    smsNotifications: true,
    otpSecurity: true,
    isVerified: true
  })

  // ⚙ General State
  const [generalState, setGeneralState] = useState({
    homeScreen: 'chat',
    autoSave: true,
    autoScroll: true,
    streaming: true,
    markdown: true,
    codeHighlight: true,
    dateTimeFormat: '12h',
    searchEngine: 'google'
  })

  // 🔔 Notifications State
  const [notifState, setNotifState] = useState({
    master: true,
    push: true,
    email: false,
    desktop: true,
    sound: true,
    newMessage: true,
    aiResponse: true,
    mentionNotif: true,
    dailyReminder: false,
    weeklySummary: true,
    productUpdates: false,
    securityAlerts: true
  })

  // 🎤 Voice State
  const [voiceInput, setVoiceInput] = useState(true)
  const [voiceOutput, setVoiceOutput] = useState(true)
  const [voiceAccent, setVoiceAccent] = useState('Breezy')
  const [voiceLang, setVoiceLang] = useState('auto')
  const [noiseReduction, setNoiseReduction] = useState(true)

  // 💾 Storage State
  const [autoDeletePeriod, setAutoDeletePeriod] = useState<'never' | '30days' | '90days' | '1year'>('never')
  const [mediaQuality, setMediaQuality] = useState<'original' | 'compressed' | 'low'>('compressed')
  const [storageStats, setStorageStats] = useState({
    chatHistoryMB: 8.7,
    uploadedFilesMB: 14.2,
    attachedImagesMB: 9.8,
    documentsMB: 4.5,
    cacheMB: 24.5,
    totalLimitGB: 5.0
  })

  // 🛡 Safety & Privacy State
  const [safetyState, setSafetyState] = useState({
    twoFactor: false,
    privacyMode: false,
    hideChatPreview: false,
    aiTrainingPermission: false,
    blockOffensive: true,
    dataEncryption: true,
    sessionTimeout: '30m',
    blockSuspiciousLogins: true
  })
  const [activeDevices, setActiveDevices] = useState([
    { id: '1', device: 'Chrome 127.0 (Windows 11)', ip: '103.21.126.4', location: 'New Delhi, India', isCurrent: true, time: 'Active Now' },
    { id: '2', device: 'Mobile Safari (iOS 17.5)', ip: '103.21.126.4', location: 'New Delhi, India', isCurrent: false, time: '2 hours ago' }
  ])

  // 👨‍👩‍👧 Parental Controls State
  const [parentalState, setParentalState] = useState({
    enabled: false,
    safeSearch: true,
    adultFilter: true,
    sensitiveFilter: true,
    restrictedAi: true,
    dailyLimit: '2h',
    screenTimeLimit: false,
    bedtimeLock: false,
    activityReports: true
  })
  const [parentPin, setParentPin] = useState('1234')

  // 🐞 Report Bug State
  const [bugState, setBugState] = useState({
    type: 'ui',
    description: '',
    includeDeviceInfo: true
  })

  // Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean
    title: string
    message: string
    requireTextMatch?: boolean
    onConfirm: () => void
  }>({
    isOpen: false,
    title: '',
    message: '',
    requireTextMatch: false,
    onConfirm: () => {}
  })
  const [confirmInputText, setConfirmInputText] = useState('')

  // Sync settings when loaded
  useEffect(() => {
    if (apiSettings) {
      setTheme(apiSettings.theme)
      setLanguage(apiSettings.language)
      setModel(apiSettings.model)
      setNotifications(apiSettings.notifications)
    }
  }, [apiSettings])

  useEffect(() => {
    if (user) {
      setName(user.name ?? '')
      setUsername(user.username ?? '')
      setEmail(user.email ?? '')
    }
  }, [user])

  const handleBackHeaderClick = () => {
    if (subView !== 'main') {
      setSubView('main')
    } else {
      if (onClose) {
        onClose()
      } else {
        navigate('/dashboard')
      }
    }
  }

  const handleToggleNotif = (key: keyof typeof notifState) => {
    const updated = { ...notifState, [key]: !notifState[key] }
    setNotifState(updated)
    showToast(`Notification setting saved automatically`, 'success')
  }

  const handleToggleSafety = (key: keyof typeof safetyState) => {
    const updated = { ...safetyState, [key]: !safetyState[key] }
    setSafetyState(updated as any)
    showToast(`Privacy preference updated`, 'success')
  }

  const handleToggleParental = (key: keyof typeof parentalState) => {
    const updated = { ...parentalState, [key]: !parentalState[key] }
    setParentalState(updated as any)
    showToast(`Parental control setting saved`, 'success')
  }

  const handleAvatarFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const reader = new FileReader()
      reader.onloadend = async () => {
        const base64Data = reader.result as string
        await updateProfile({
          name: name || user?.name || '',
          username: username || user?.username || '',
          email: email || user?.email || '',
          avatar: base64Data
        })
        showToast('Profile photo updated successfully', 'success')
      }
      reader.readAsDataURL(file)
    } catch {
      showToast('Failed to upload profile photo', 'error')
    }
  }

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
      showToast('Account details updated successfully', 'success')
      setPassword('')
      setPasswordConfirmation('')
    } catch (err) {
      showToast(errorMessage(err), 'error')
    } finally {
      setIsUpdatingAccount(false)
    }
  }

  const handleClearCache = () => {
    const freed = storageStats.cacheMB
    setStorageStats((prev) => ({ ...prev, cacheMB: 0 }))
    showToast(`Cache cleared successfully (${freed} MB freed)`, 'success')
  }

  const handleClearTempFiles = () => {
    const freed = storageStats.attachedImagesMB
    setStorageStats((prev) => ({ ...prev, attachedImagesMB: 0 }))
    showToast(`Temporary files deleted (${freed} MB freed)`, 'success')
  }

  const handleClearCurrentChat = () => {
    if (!selectedChat) {
      showToast('No active chat to clear', 'info')
      return
    }
    setConfirmModal({
      isOpen: true,
      title: 'Clear Active Chat?',
      message: 'Are you sure you want to clear all messages in this conversation?',
      onConfirm: () => {
        setMessages([])
        showToast('Active conversation cleared', 'success')
      }
    })
  }

  const handleClearAllChats = () => {
    if (chats.length === 0) {
      showToast('No chat history to clear', 'info')
      return
    }
    setConfirmModal({
      isOpen: true,
      title: 'Delete All Chat History?',
      message: `Are you sure you want to permanently delete all ${chats.length} chat conversations? This action cannot be undone.`,
      onConfirm: async () => {
        try {
          for (const chat of chats) {
            await deleteChat(chat.id)
          }
          setStorageStats((prev) => ({ ...prev, chatHistoryMB: 0 }))
          showToast('All chat histories deleted', 'success')
        } catch {
          showToast('Failed to clear some conversations', 'error')
        }
      }
    })
  }

  const handleRevokeDevice = (deviceId: string) => {
    setActiveDevices((prev) => prev.filter((d) => d.id !== deviceId))
    showToast('Device access revoked successfully', 'success')
  }

  const handleLogoutAllDevices = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Sign Out All Devices?',
      message: 'You will be logged out from all active web and mobile browser sessions except this device.',
      onConfirm: () => {
        setActiveDevices((prev) => prev.filter((d) => d.isCurrent))
        showToast('Signed out from all other devices', 'success')
      }
    })
  }

  const handleDeleteAccount = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Account Permanently?',
      message: 'This will permanently delete your account, saved preferences, custom instructions, and all chat records.',
      requireTextMatch: true,
      onConfirm: () => {
        logout()
        if (onClose) onClose()
        navigate('/login')
        showToast('Account deleted permanently', 'info')
      }
    })
  }

  const handleExportChats = () => {
    const exportData = {
      exported_at: new Date().toISOString(),
      user: { id: user?.id, username: user?.username, email: user?.email },
      chats: chats
    }
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `novamind-chats-export-${new Date().toISOString().slice(0, 10)}.json`
    link.click()
    URL.revokeObjectURL(url)
    showToast('Exported chat history', 'success')
  }

  const handleDownloadSettingsBackup = () => {
    const backupData = {
      backup_at: new Date().toISOString(),
      backend_settings: apiSettings,
      ui_settings: uiSettings,
      notifications: notifState,
      safety: safetyState
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

  const activeColorObj = BUBBLE_COLOR_PRESETS.find(
    (c) => (uiSettings.userBubbleColor || 'default') === c.value
  )
  const activeColorName = activeColorObj
    ? activeColorObj.name
    : uiSettings.userBubbleColor?.startsWith('#')
    ? 'Custom Hex'
    : 'Default'

  const desktopSidebarTabs = [
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'storage', label: 'Storage', icon: HardDrive },
    { id: 'safety', label: 'Safety & Privacy', icon: ShieldCheck },
    { id: 'parental', label: 'Parental controls', icon: Heart },
    { id: 'account', label: 'Account', icon: User },
    { id: 'general', label: 'General', icon: Settings },
    { id: 'personalization', label: 'Personalization', icon: Sparkles },
    { id: 'plugins', label: 'Plugins', icon: Grid },
    { id: 'voice', label: 'Voice', icon: Mic },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'data', label: 'Data controls', icon: Database },
    { id: 'security', label: 'Security and login', icon: Shield },
    { id: 'trusted', label: 'Trusted contact', icon: Crosshair },
    { id: 'keyboard', label: 'Keyboard', icon: Keyboard }
  ] as const

  const totalUsedMB = storageStats.chatHistoryMB + storageStats.uploadedFilesMB + storageStats.attachedImagesMB + storageStats.documentsMB + storageStats.cacheMB
  const storagePercent = ((totalUsedMB / (storageStats.totalLimitGB * 1024)) * 100).toFixed(1)

  // Reusable Switch Toggle Component
  const RenderSwitchRow = ({
    title,
    desc,
    checked,
    onChange,
    disabled = false
  }: {
    title: string
    desc: string
    checked: boolean
    onChange: () => void
    disabled?: boolean
  }) => (
    <div className="flex items-center justify-between py-2.5 px-3 bg-[#1c1c1e] hover:bg-[#222225] rounded-xl border border-zinc-800/60 transition">
      <div className="space-y-0.5 max-w-[80%]">
        <span className="text-xs font-semibold text-zinc-100 block">{title}</span>
        <p className="text-[11px] text-zinc-400 leading-snug">{desc}</p>
      </div>
      <button
        type="button"
        disabled={disabled}
        onClick={onChange}
        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
          checked ? 'bg-blue-600' : 'bg-zinc-700'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <span
          className={`pointer-events-none inline-block size-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
            checked ? 'translate-x-4' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  )

  // SECTION CONTENT RENDERERS
  const renderNotificationsContent = () => (
    <div className="space-y-5 animate-fadeIn">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Bell className="text-blue-400" size={22} /> Notifications & Alerts
        </h2>
        <p className="text-xs text-zinc-400 mt-1">Manage how and when you receive notifications across push, email, and desktop alerts.</p>
      </div>

      <div className="space-y-2.5">
        <RenderSwitchRow
          title="Enable Notifications"
          desc="Master toggle for all push, email, and desktop alerts from NovaMind AI."
          checked={notifState.master}
          onChange={() => handleToggleNotif('master')}
        />
        <RenderSwitchRow
          title="Push Notifications"
          desc="Receive instant push notifications on mobile and web browser."
          checked={notifState.push && notifState.master}
          disabled={!notifState.master}
          onChange={() => handleToggleNotif('push')}
        />
        <RenderSwitchRow
          title="Desktop Notifications"
          desc="Display desktop banner alerts when NovaMind is open in background tabs."
          checked={notifState.desktop && notifState.master}
          disabled={!notifState.master}
          onChange={() => handleToggleNotif('desktop')}
        />
        <RenderSwitchRow
          title="Sound Effects"
          desc="Play subtle audio chimes when responses complete or messages arrive."
          checked={notifState.sound && notifState.master}
          disabled={!notifState.master}
          onChange={() => handleToggleNotif('sound')}
        />
        <RenderSwitchRow
          title="New Message Alerts"
          desc="Notify when incoming prompt responses or code snippets finish generating."
          checked={notifState.newMessage && notifState.master}
          disabled={!notifState.master}
          onChange={() => handleToggleNotif('newMessage')}
        />
        <RenderSwitchRow
          title="AI Response Notifications"
          desc="Get notified when complex long-running AI analysis tasks complete."
          checked={notifState.aiResponse && notifState.master}
          disabled={!notifState.master}
          onChange={() => handleToggleNotif('aiResponse')}
        />
        <RenderSwitchRow
          title="Mention Notifications"
          desc="Alert when mentioned in shared team workspace conversations."
          checked={notifState.mentionNotif && notifState.master}
          disabled={!notifState.master}
          onChange={() => handleToggleNotif('mentionNotif')}
        />
        <RenderSwitchRow
          title="Daily Learning Reminder"
          desc="Receive daily suggestions to explore new AI prompts and tools."
          checked={notifState.dailyReminder && notifState.master}
          disabled={!notifState.master}
          onChange={() => handleToggleNotif('dailyReminder')}
        />
        <RenderSwitchRow
          title="Weekly Progress Summary"
          desc="Receive a weekly email digesting chat usage and productivity stats."
          checked={notifState.weeklySummary && notifState.master}
          disabled={!notifState.master}
          onChange={() => handleToggleNotif('weeklySummary')}
        />
        <RenderSwitchRow
          title="Email Notifications"
          desc="Receive email copies of conversation archives and major updates."
          checked={notifState.email && notifState.master}
          disabled={!notifState.master}
          onChange={() => handleToggleNotif('email')}
        />
        <RenderSwitchRow
          title="Product Updates & Features"
          desc="Stay informed about new model releases and extension plugins."
          checked={notifState.productUpdates && notifState.master}
          disabled={!notifState.master}
          onChange={() => handleToggleNotif('productUpdates')}
        />
        <RenderSwitchRow
          title="Security Alerts"
          desc="Instant alerts for logins from new devices or password modifications."
          checked={notifState.securityAlerts}
          onChange={() => handleToggleNotif('securityAlerts')}
        />
      </div>
    </div>
  )

  const renderStorageContent = () => (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <HardDrive className="text-emerald-400" size={22} /> Storage Usage & Files
        </h2>
        <p className="text-xs text-zinc-400 mt-1">View storage statistics, manage uploaded media, documents, and clear cache.</p>
      </div>

      {/* Progress Card */}
      <div className="bg-[#1c1c1e] rounded-2xl border border-zinc-800 p-4 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-zinc-200 uppercase tracking-wide">Storage Usage Breakdown</span>
          <span className="font-mono text-emerald-400 font-semibold">{totalUsedMB.toFixed(1)} MB / {storageStats.totalLimitGB}.0 GB ({storagePercent}%)</span>
        </div>
        <div className="w-full bg-[#121214] rounded-full h-3 overflow-hidden flex">
          <div className="bg-blue-500 h-full" style={{ width: `${(storageStats.chatHistoryMB / 100) * 10}%` }} title="Chat Storage" />
          <div className="bg-purple-500 h-full" style={{ width: `${(storageStats.uploadedFilesMB / 100) * 10}%` }} title="Uploaded Files" />
          <div className="bg-amber-500 h-full" style={{ width: `${(storageStats.attachedImagesMB / 100) * 10}%` }} title="Images" />
          <div className="bg-emerald-500 h-full" style={{ width: `${(storageStats.documentsMB / 100) * 10}%` }} title="Documents" />
          <div className="bg-cyan-500 h-full" style={{ width: `${(storageStats.cacheMB / 100) * 10}%` }} title="Cache Size" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 text-[11px] text-zinc-400 border-t border-zinc-800/80">
          <div className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-blue-500" /> History: {storageStats.chatHistoryMB} MB</div>
          <div className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-purple-500" /> Files: {storageStats.uploadedFilesMB} MB</div>
          <div className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-amber-500" /> Images: {storageStats.attachedImagesMB} MB</div>
          <div className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-emerald-500" /> Docs: {storageStats.documentsMB} MB</div>
          <div className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-cyan-500" /> Cache: {storageStats.cacheMB} MB</div>
        </div>
      </div>

      {/* Auto Delete & Quality Dropdowns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-[#1c1c1e] rounded-xl border border-zinc-800 p-3.5 space-y-2">
          <label className="text-xs font-bold text-zinc-300 block">Auto Delete Old Chats</label>
          <p className="text-[11px] text-zinc-400">Automatically remove inactive conversations older than duration.</p>
          <select
            value={autoDeletePeriod}
            onChange={(e) => {
              setAutoDeletePeriod(e.target.value as any)
              showToast('Auto-delete preference saved', 'success')
            }}
            className="w-full bg-[#121214] border border-zinc-700/60 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
          >
            <option value="never">Never (Keep Forever)</option>
            <option value="30days">After 30 Days</option>
            <option value="90days">After 90 Days</option>
            <option value="1year">After 1 Year</option>
          </select>
        </div>

        <div className="bg-[#1c1c1e] rounded-xl border border-zinc-800 p-3.5 space-y-2">
          <label className="text-xs font-bold text-zinc-300 block">Media Storage Quality</label>
          <p className="text-[11px] text-zinc-400">Compression mode for generated & uploaded images.</p>
          <select
            value={mediaQuality}
            onChange={(e) => {
              setMediaQuality(e.target.value as any)
              showToast('Media quality updated', 'success')
            }}
            className="w-full bg-[#121214] border border-zinc-700/60 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
          >
            <option value="compressed">Compressed (Recommended - Saves Space)</option>
            <option value="original">Original Full Resolution</option>
            <option value="low">Low Resolution (Fastest Loading)</option>
          </select>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="bg-[#1c1c1e] rounded-2xl border border-zinc-800 p-4 space-y-3">
        <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">Storage Actions</span>

        <div className="flex items-center justify-between p-3 bg-[#121214] rounded-xl border border-zinc-800">
          <div>
            <span className="text-xs font-medium text-zinc-200 block">Clear Temporary Cache ({storageStats.cacheMB} MB)</span>
            <span className="text-[11px] text-zinc-400">Remove cached responses and assets without deleting chat logs.</span>
          </div>
          <button
            type="button"
            onClick={handleClearCache}
            className="px-3.5 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 text-xs font-bold rounded-lg border border-blue-500/30 transition cursor-pointer"
          >
            Clear Cache
          </button>
        </div>

        <div className="flex items-center justify-between p-3 bg-[#121214] rounded-xl border border-zinc-800">
          <div>
            <span className="text-xs font-medium text-zinc-200 block">Delete Temporary Files ({storageStats.attachedImagesMB} MB)</span>
            <span className="text-[11px] text-zinc-400">Clear temporary preview images and uploaded attachments.</span>
          </div>
          <button
            type="button"
            onClick={handleClearTempFiles}
            className="px-3.5 py-1.5 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 text-xs font-bold rounded-lg border border-amber-500/30 transition cursor-pointer"
          >
            Delete Files
          </button>
        </div>

        <div className="flex items-center justify-between p-3 bg-[#121214] rounded-xl border border-zinc-800">
          <div>
            <span className="text-xs font-medium text-zinc-200 block">Export Chats & Media</span>
            <span className="text-[11px] text-zinc-400">Download complete chat history archive as JSON file.</span>
          </div>
          <button
            type="button"
            onClick={handleExportChats}
            className="px-3.5 py-1.5 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 text-xs font-bold rounded-lg border border-purple-500/30 transition cursor-pointer"
          >
            Export Chats
          </button>
        </div>

        <div className="flex items-center justify-between p-3 bg-[#121214] rounded-xl border border-zinc-800">
          <div>
            <span className="text-xs font-medium text-zinc-200 block">Backup Settings & Configurations</span>
            <span className="text-[11px] text-zinc-400">Download backup file of system preferences and UI themes.</span>
          </div>
          <button
            type="button"
            onClick={handleDownloadSettingsBackup}
            className="px-3.5 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 text-xs font-bold rounded-lg border border-indigo-500/30 transition cursor-pointer"
          >
            Download Data
          </button>
        </div>

        <div className="flex items-center justify-between p-3 bg-[#121214] rounded-xl border border-zinc-800">
          <div>
            <span className="text-xs font-medium text-zinc-200 block">Clear Active Conversation</span>
            <span className="text-[11px] text-zinc-400">Erase messages in current conversation without deleting chat log.</span>
          </div>
          <button
            type="button"
            onClick={handleClearCurrentChat}
            className="px-3.5 py-1.5 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 text-xs font-bold rounded-lg border border-amber-500/30 transition cursor-pointer"
          >
            Clear Active Chat
          </button>
        </div>

        <div className="flex items-center justify-between p-3 bg-red-500/10 rounded-xl border border-red-500/20">
          <div>
            <span className="text-xs font-medium text-red-300 block">Delete ALL Chat History</span>
            <span className="text-[11px] text-red-400/80">Permanently delete all conversations and message records.</span>
          </div>
          <button
            type="button"
            onClick={handleClearAllChats}
            className="px-3.5 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-lg transition cursor-pointer"
          >
            Delete All History
          </button>
        </div>
      </div>
    </div>
  )

  const renderSafetyContent = () => (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <ShieldCheck className="text-purple-400" size={22} /> Safety & Content Filtering
        </h2>
        <p className="text-xs text-zinc-400 mt-1">Control your privacy settings, safe search filters, AI data training permissions, and content restrictions.</p>
      </div>

      <div className="space-y-2.5">
        <RenderSwitchRow
          title="Privacy Mode"
          desc="Conceal prompt history titles and user names from main screen previews."
          checked={safetyState.privacyMode}
          onChange={() => handleToggleSafety('privacyMode')}
        />
        <RenderSwitchRow
          title="Safe Search Filter"
          desc="Strictly filter web search results and external web page links."
          checked={parentalState.safeSearch}
          onChange={() => setParentalState({ ...parentalState, safeSearch: !parentalState.safeSearch })}
        />
        <RenderSwitchRow
          title="Sensitive Content Filter"
          desc="Restrict responses related to violence, weapons, self-harm, or sensitive advice."
          checked={parentalState.sensitiveFilter}
          onChange={() => setParentalState({ ...parentalState, sensitiveFilter: !parentalState.sensitiveFilter })}
        />
        <RenderSwitchRow
          title="AI Model Training Permission"
          desc="Allow anonymized chat logs to be used to train and refine AI response quality."
          checked={safetyState.aiTrainingPermission}
          onChange={() => handleToggleSafety('aiTrainingPermission')}
        />
        <RenderSwitchRow
          title="Hide Chat Preview"
          desc="Hide detailed message preview text in push and lock-screen notifications."
          checked={safetyState.hideChatPreview}
          onChange={() => handleToggleSafety('hideChatPreview')}
        />
        <RenderSwitchRow
          title="Block Offensive Content"
          desc="Automatically block offensive language, profanity, and inappropriate media."
          checked={safetyState.blockOffensive}
          onChange={() => handleToggleSafety('blockOffensive')}
        />
        <RenderSwitchRow
          title="Block Suspicious Login Attempts"
          desc="Automatically block unauthorized login attempts from unexpected IP ranges."
          checked={safetyState.blockSuspiciousLogins}
          onChange={() => handleToggleSafety('blockSuspiciousLogins')}
        />
      </div>

      {/* Encryption & Timeout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-[#1c1c1e] rounded-xl border border-zinc-800 p-4 space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
            <Lock size={16} /> Data Encryption (Active)
          </div>
          <p className="text-[11px] text-zinc-400 leading-relaxed">
            All user prompts, API keys, and responses are encrypted using <strong>AES-256 GCM</strong> at rest and in transit.
          </p>
        </div>

        <div className="bg-[#1c1c1e] rounded-xl border border-zinc-800 p-4 space-y-2">
          <label className="text-xs font-bold text-zinc-300 block">Privacy & Security Settings</label>
          <p className="text-[11px] text-zinc-400">Lock app session after specified inactivity duration.</p>
          <select
            value={safetyState.sessionTimeout}
            onChange={(e) => {
              setSafetyState({ ...safetyState, sessionTimeout: e.target.value })
              showToast('Session timeout updated', 'success')
            }}
            className="w-full bg-[#121214] border border-zinc-700/60 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
          >
            <option value="15m">15 Minutes</option>
            <option value="30m">30 Minutes (Recommended)</option>
            <option value="1h">1 Hour</option>
            <option value="12h">12 Hours</option>
            <option value="never">Never</option>
          </select>
        </div>
      </div>
    </div>
  )

  const renderSecurityContent = () => (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Shield className="text-emerald-400" size={22} /> Security & Authentication
        </h2>
        <p className="text-xs text-zinc-400 mt-1">Manage password changes, 2FA security, session timeouts, biometric login, and active login sessions.</p>
      </div>

      <div className="space-y-2.5">
        <RenderSwitchRow
          title="Two-Factor Authentication (2FA)"
          desc="Add an extra layer of security requiring an authenticator app code at login."
          checked={safetyState.twoFactor}
          onChange={() => handleToggleSafety('twoFactor')}
        />
        <RenderSwitchRow
          title="Biometric Login (Touch ID / Face ID)"
          desc="Allow instant biometric verification on supported mobile and laptop devices."
          checked={true}
          onChange={() => showToast('Biometric authentication toggled', 'success')}
        />
      </div>

      {/* Change Password Form */}
      <form onSubmit={handleSaveAccount} className="bg-[#1c1c1e] rounded-2xl border border-zinc-800 p-4 space-y-3">
        <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">Change Account Password</span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] font-medium text-zinc-400 block mb-1">New Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#121214] border border-zinc-700/60 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              placeholder="Enter new password"
            />
          </div>
          <div>
            <label className="text-[11px] font-medium text-zinc-400 block mb-1">Confirm Password</label>
            <input
              type="password"
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              className="w-full bg-[#121214] border border-zinc-700/60 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              placeholder="Confirm new password"
            />
          </div>
        </div>
        <div className="flex justify-end pt-1">
          <button
            type="submit"
            disabled={isUpdatingAccount}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition cursor-pointer"
          >
            Update Password
          </button>
        </div>
      </form>

      {/* Active Devices List */}
      <div className="bg-[#1c1c1e] rounded-2xl border border-zinc-800 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Active Device Sessions ({activeDevices.length})</span>
          <button
            type="button"
            onClick={handleLogoutAllDevices}
            className="text-xs text-red-400 hover:text-red-300 font-semibold cursor-pointer"
          >
            Logout All Devices
          </button>
        </div>

        <div className="space-y-2">
          {activeDevices.map((dev) => (
            <div key={dev.id} className="flex items-center justify-between p-3 bg-[#121214] rounded-xl border border-zinc-800">
              <div className="flex items-center gap-3">
                <Smartphone size={18} className={dev.isCurrent ? 'text-emerald-400' : 'text-zinc-400'} />
                <div>
                  <span className="text-xs font-semibold text-zinc-200 flex items-center gap-2">
                    {dev.device} {dev.isCurrent && <span className="bg-emerald-500/20 text-emerald-300 text-[10px] px-2 py-0.5 rounded-full border border-emerald-500/30">Current</span>}
                  </span>
                  <span className="text-[11px] text-zinc-400 block">{dev.location} • {dev.ip} • {dev.time}</span>
                </div>
              </div>
              {!dev.isCurrent && (
                <button
                  type="button"
                  onClick={() => handleRevokeDevice(dev.id)}
                  className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium rounded-lg transition cursor-pointer"
                >
                  Revoke
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderParentalContent = () => (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Heart className="text-rose-400" size={22} /> Parental Controls & Child Safety
        </h2>
        <p className="text-xs text-zinc-400 mt-1">Manage child safety, content restrictions, screen time limits, and bedtime locks.</p>
      </div>

      <div className="space-y-2.5">
        <RenderSwitchRow
          title="Enable Parental Controls"
          desc="Master switch to enforce age-appropriate content restrictions and screen time."
          checked={parentalState.enabled}
          onChange={() => handleToggleParental('enabled')}
        />
        <RenderSwitchRow
          title="Safe Search Filter"
          desc="Strictly filter web search results and external web page content."
          checked={parentalState.safeSearch && parentalState.enabled}
          disabled={!parentalState.enabled}
          onChange={() => handleToggleParental('safeSearch')}
        />
        <RenderSwitchRow
          title="Content Restrictions (Adult Filter)"
          desc="Block explicit language, mature topics, and adult imagery."
          checked={parentalState.adultFilter && parentalState.enabled}
          disabled={!parentalState.enabled}
          onChange={() => handleToggleParental('adultFilter')}
        />
        <RenderSwitchRow
          title="Restricted Topics & Sensitive Filter"
          desc="Restrict responses related to violence, weapons, self-harm, or legal advice."
          checked={parentalState.sensitiveFilter && parentalState.enabled}
          disabled={!parentalState.enabled}
          onChange={() => handleToggleParental('sensitiveFilter')}
        />
        <RenderSwitchRow
          title="Screen Time Limit Alert"
          desc="Display warning banners when approaching daily usage limits."
          checked={parentalState.screenTimeLimit && parentalState.enabled}
          disabled={!parentalState.enabled}
          onChange={() => handleToggleParental('screenTimeLimit')}
        />
        <RenderSwitchRow
          title="Bedtime Lock (10:00 PM - 06:00 AM)"
          desc="Automatically lock access to chat during night bedtime hours."
          checked={parentalState.bedtimeLock && parentalState.enabled}
          disabled={!parentalState.enabled}
          onChange={() => handleToggleParental('bedtimeLock')}
        />
        <RenderSwitchRow
          title="Weekly Activity Report"
          desc="Send weekly usage summary reports to the parent email address."
          checked={parentalState.activityReports && parentalState.enabled}
          disabled={!parentalState.enabled}
          onChange={() => handleToggleParental('activityReports')}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-[#1c1c1e] rounded-xl border border-zinc-800 p-4 space-y-2">
          <label className="text-xs font-bold text-zinc-300 block">Daily Usage Limit</label>
          <select
            value={parentalState.dailyLimit}
            onChange={(e) => {
              setParentalState({ ...parentalState, dailyLimit: e.target.value })
              showToast('Daily usage limit saved', 'success')
            }}
            disabled={!parentalState.enabled}
            className="w-full bg-[#121214] border border-zinc-700/60 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 disabled:opacity-50"
          >
            <option value="1h">1 Hour per day</option>
            <option value="2h">2 Hours per day</option>
            <option value="4h">4 Hours per day</option>
            <option value="unlimited">Unlimited Usage</option>
          </select>
        </div>

        <div className="bg-[#1c1c1e] rounded-xl border border-zinc-800 p-4 space-y-2">
          <label className="text-xs font-bold text-zinc-300 block">Parent Security PIN</label>
          <div className="flex gap-2">
            <input
              type="password"
              maxLength={4}
              value={parentPin}
              onChange={(e) => setParentPin(e.target.value)}
              className="w-full bg-[#121214] border border-zinc-700/60 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              placeholder="4-digit PIN"
            />
            <button
              type="button"
              onClick={() => showToast('Parent PIN saved', 'success')}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition cursor-pointer shrink-0"
            >
              Save PIN
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  const renderAccountContent = () => (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <User className="text-amber-400" size={22} /> Account Information & Preferences
        </h2>
        <p className="text-xs text-zinc-400 mt-1">Manage your personal profile, credentials, connected accounts, and preferences.</p>
      </div>

      {/* Profile Photo Header */}
      <div className="bg-[#1c1c1e] rounded-2xl border border-zinc-800 p-4 flex items-center gap-4">
        <div className="relative group">
          <div className="size-20 rounded-full overflow-hidden bg-zinc-800 border-2 border-zinc-700 shadow-md flex items-center justify-center">
            {user?.avatar ? (
              <img src={user.avatar} alt="Profile" className="size-full object-cover" />
            ) : (
              <div className="size-full bg-gradient-to-br from-indigo-500/30 to-purple-600/30 flex items-center justify-center text-2xl font-bold text-zinc-200">
                {user?.name?.[0]?.toUpperCase() ?? 'P'}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-0 right-0 size-7 rounded-full bg-blue-600 hover:bg-blue-500 border-2 border-[#1c1c1e] text-white flex items-center justify-center transition cursor-pointer shadow-md"
            title="Change photo"
          >
            <Pencil size={12} />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarFileSelect}
          />
        </div>

        <div>
          <h3 className="text-base font-bold text-white">{user?.name || 'Patel Dhyan'}</h3>
          <p className="text-xs text-zinc-400">{user?.email || 'dhyan.nupursoftware@gmail.com'}</p>
          <div className="flex gap-2 mt-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[11px] font-semibold rounded-lg transition cursor-pointer"
            >
              Upload Photo
            </button>
          </div>
        </div>
      </div>

      {/* Account Info Form */}
      <form onSubmit={handleSaveAccount} className="bg-[#1c1c1e] rounded-2xl border border-zinc-800 p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#121214] border border-zinc-700/60 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-[#121214] border border-zinc-700/60 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#121214] border border-zinc-700/60 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-1">Phone Number</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-[#121214] border border-zinc-700/60 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Region & Time Zone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-1">Region / Country</label>
            <select
              value={region}
              onChange={(e) => {
                setRegion(e.target.value)
                showToast('Region preference saved', 'success')
              }}
              className="w-full bg-[#121214] border border-zinc-700/60 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
            >
              <option value="IN">India (IN)</option>
              <option value="US">United States (US)</option>
              <option value="UK">United Kingdom (UK)</option>
              <option value="CA">Canada (CA)</option>
              <option value="DE">Germany (DE)</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-1">Time Zone</label>
            <select
              value={timeZone}
              onChange={(e) => {
                setTimeZone(e.target.value)
                showToast('Time zone saved', 'success')
              }}
              className="w-full bg-[#121214] border border-zinc-700/60 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
            >
              <option value="Asia/Kolkata">(GMT+05:30) India Standard Time (Asia/Kolkata)</option>
              <option value="America/New_York">(GMT-05:00) Eastern Time (New York)</option>
              <option value="Europe/London">(GMT+00:00) Greenwich Mean Time (London)</option>
              <option value="UTC">UTC (Universal Coordinated Time)</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-end pt-2">
          <button
            type="submit"
            disabled={isUpdatingAccount}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition cursor-pointer disabled:opacity-50 flex items-center gap-2 shadow-md"
          >
            {isUpdatingAccount && <RefreshCw size={14} className="animate-spin" />} Save Account Details
          </button>
        </div>
      </form>

      {/* Connected Accounts */}
      <div className="bg-[#1c1c1e] rounded-2xl border border-zinc-800 p-4 space-y-3">
        <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">Connected Accounts</span>
        <div className="space-y-2">
          <div className="flex items-center justify-between p-3 bg-[#121214] rounded-xl border border-zinc-800">
            <div className="flex items-center gap-3">
              <Globe size={18} className="text-blue-400" />
              <div>
                <span className="text-xs font-semibold text-zinc-200 block">Google Account</span>
                <span className="text-[11px] text-zinc-400">dhyan.nupursoftware@gmail.com</span>
              </div>
            </div>
            <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">Connected</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-[#121214] rounded-xl border border-zinc-800">
            <div className="flex items-center gap-3">
              <Shield size={18} className="text-purple-400" />
              <div>
                <span className="text-xs font-semibold text-zinc-200 block">GitHub Account</span>
                <span className="text-[11px] text-zinc-400">dhyannupursoftware-sudo</span>
              </div>
            </div>
            <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">Connected</span>
          </div>
        </div>
      </div>

      {/* Account Lifecycle / Danger Zone */}
      <div className="bg-[#1c1c1e] rounded-2xl border border-zinc-800 p-4 space-y-3">
        <span className="text-xs font-bold text-red-400 uppercase tracking-wider block">Danger Zone</span>

        <div className="flex items-center justify-between p-3 bg-[#121214] rounded-xl border border-zinc-800">
          <div>
            <span className="text-xs font-semibold text-zinc-200 block">Sign Out</span>
            <span className="text-[11px] text-zinc-400">Log out of your current session on this device.</span>
          </div>
          <button
            type="button"
            onClick={() => {
              logout()
              if (onClose) onClose()
              navigate('/login')
            }}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5"
          >
            <LogOut size={14} /> Sign Out
          </button>
        </div>

        <div className="flex items-center justify-between p-3 bg-red-500/10 rounded-xl border border-red-500/20">
          <div>
            <span className="text-xs font-semibold text-red-300 block">Delete Account Permanently</span>
            <span className="text-[11px] text-red-400/80">Erase all account data, prompt logs, and subscriptions.</span>
          </div>
          <button
            type="button"
            onClick={handleDeleteAccount}
            className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-md"
          >
            Delete Account
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="size-full text-white font-sans select-none antialiased">
      {/* ========================================================================= */}
      {/* DESKTOP / LAPTOP LAYOUT - Visible md:flex                                 */}
      {/* ========================================================================= */}
      <div className="hidden md:flex size-full bg-[#18181a] text-white overflow-hidden rounded-[24px]">
        {/* Left Sidebar Menu */}
        <div className="w-64 bg-[#18181a] border-r border-zinc-800/60 p-3.5 flex flex-col shrink-0 overflow-y-auto scrollbar-none">
          {/* Top Close Button */}
          <div className="mb-2">
            <button
              type="button"
              onClick={onClose || (() => navigate('/dashboard'))}
              className="size-9 rounded-xl bg-[#242427] hover:bg-[#2c2c30] text-zinc-300 flex items-center justify-center transition cursor-pointer"
              title="Close"
            >
              <X size={18} />
            </button>
          </div>

          {/* Sidebar Items */}
          <nav className="space-y-1">
            {desktopSidebarTabs.map((tab) => {
              const Icon = tab.icon
              const isActive = desktopTab === tab.id
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setDesktopTab(tab.id as DesktopTabType)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition cursor-pointer text-left ${
                    isActive
                      ? 'bg-[#28282b] text-white font-semibold shadow-sm'
                      : 'text-zinc-400 hover:bg-[#212124] hover:text-zinc-200'
                  }`}
                >
                  <Icon size={17} className={isActive ? 'text-white' : 'text-zinc-400'} />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </nav>
        </div>

        {/* Right Content Panel */}
        <div className="flex-1 bg-[#212124] p-7 overflow-y-auto scrollbar-thin relative flex flex-col justify-between">
          <div>
            {desktopTab === 'notifications' && renderNotificationsContent()}
            {desktopTab === 'storage' && renderStorageContent()}
            {desktopTab === 'safety' && renderSafetyContent()}
            {desktopTab === 'parental' && renderParentalContent()}
            {desktopTab === 'account' && renderAccountContent()}

            {/* DESKTOP TAB: GENERAL */}
            {desktopTab === 'general' && (
              <div className="space-y-6 animate-fadeIn">
                <div>
                  <h2 className="text-xl font-bold text-white">General</h2>
                  <p className="text-xs text-zinc-400 mt-1">Configure language, typography scale, theme mode, and bubble formats.</p>
                </div>

                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">Theme Mode</label>
                    <div className="grid grid-cols-3 gap-3">
                      {(['dark', 'light', 'system'] as const).map((t) => (
                        <button
                          key={t}
                          type="button"
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
                            showToast(`Theme updated to ${t}`, 'success')
                          }}
                          className={`py-3 px-4 text-xs font-semibold rounded-xl border transition cursor-pointer ${
                            theme === t
                              ? 'bg-blue-600/20 border-blue-500 text-white font-bold'
                              : 'bg-[#18181a] border-zinc-800 text-zinc-400 hover:text-zinc-200'
                          }`}
                        >
                          {t === 'dark' ? 'Dark Mode' : t === 'light' ? 'Light Mode' : 'System Default'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">System Language</label>
                    <select
                      value={language}
                      onChange={(e) => {
                        setLanguage(e.target.value)
                        updateApiSettings({ theme, language: e.target.value, model, notifications })
                        showToast('Language updated', 'success')
                      }}
                      className="w-full bg-[#18181a] border border-zinc-700/60 rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 focus:outline-none focus:border-blue-500"
                    >
                      <option value="en">English (EN)</option>
                      <option value="hi">Hindi (HI)</option>
                      <option value="es">Spanish (ES)</option>
                      <option value="fr">French (FR)</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">Typography Scale</label>
                    <div className="grid grid-cols-3 gap-3">
                      {(['small', 'medium', 'large'] as const).map((sz) => (
                        <button
                          key={sz}
                          type="button"
                          onClick={() => updateUiSetting('fontSize', sz)}
                          className={`py-2.5 text-xs font-semibold rounded-xl border transition cursor-pointer ${
                            uiSettings.fontSize === sz
                              ? 'bg-blue-600/20 border-blue-500 text-white font-bold'
                              : 'bg-[#18181a] border-zinc-800 text-zinc-400 hover:text-zinc-200'
                          }`}
                        >
                          {sz === 'small' ? 'Small (12px)' : sz === 'medium' ? 'Medium (14px)' : 'Large (16px)'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* DESKTOP TAB: PERSONALIZATION & ACCENT COLOR */}
            {desktopTab === 'personalization' && (
              <div className="space-y-6 animate-fadeIn">
                <div>
                  <h2 className="text-xl font-bold text-white">Personalization & Accent Colors</h2>
                  <p className="text-xs text-zinc-400 mt-1">Configure AI behavior, response style, and user chat bubble colors.</p>
                </div>

                <div className="bg-[#18181a] rounded-2xl border border-zinc-800 p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-200 uppercase tracking-wider">User Chat Bubble Accent Color</span>
                    <span className="text-xs text-blue-400 font-semibold">{activeColorName}</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                    {BUBBLE_COLOR_PRESETS.map((preset) => {
                      const isSelected = (uiSettings.userBubbleColor || 'default') === preset.value
                      return (
                        <button
                          key={preset.value}
                          type="button"
                          onClick={() => {
                            updateUiSetting('userBubbleColor', preset.value)
                            showToast(`Bubble color updated to ${preset.name}`, 'success')
                          }}
                          className={`flex items-center gap-2 p-2.5 rounded-xl border transition cursor-pointer ${
                            isSelected
                              ? 'bg-blue-600/20 border-blue-500 text-white font-bold'
                              : 'bg-[#212124] border-zinc-800 text-zinc-400 hover:bg-zinc-800'
                          }`}
                        >
                          <span className={`size-3.5 rounded-full ${preset.color} shrink-0`} />
                          <span className="text-[11px] truncate">{preset.name}</span>
                        </button>
                      )
                    })}
                  </div>

                  <div className="pt-2 border-t border-zinc-800/80">
                    <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block mb-2">Live Bubble Preview</span>
                    <div className="flex justify-end">
                      <div
                        className="max-w-[75%] rounded-2xl px-4 py-2 text-xs text-white shadow-md transition-all duration-300"
                        style={{
                          backgroundColor:
                            uiSettings.userBubbleColor && uiSettings.userBubbleColor !== 'default'
                              ? uiSettings.userBubbleColor
                              : '#2563eb'
                        }}
                      >
                        Hello! This is a live preview of your custom chat bubble color.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* DESKTOP TAB: BILLING */}
            {desktopTab === 'billing' && (
              <div className="space-y-6 animate-fadeIn">
                <div>
                  <h2 className="text-xl font-bold text-white">Billing & Subscription</h2>
                  <p className="text-xs text-zinc-400 mt-1">Manage active workspace plan, billing history, and payment details.</p>
                </div>

                <div className="bg-[#18181a] rounded-2xl border border-zinc-800 p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
                    <div>
                      <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">Current Plan</span>
                      <h3 className="text-lg font-bold text-emerald-400 flex items-center gap-2 mt-0.5">
                        <Sparkles size={18} /> NovaMind Plus Tier (Active)
                      </h3>
                    </div>
                    <span className="text-xs font-mono text-zinc-300 bg-[#28282b] px-3 py-1.5 rounded-full border border-zinc-700">
                      $20.00 / month
                    </span>
                  </div>

                  <div className="space-y-2 text-xs text-zinc-300">
                    <p className="flex items-center gap-2">
                      <Check size={14} className="text-emerald-400" /> Unlimited access to Gemini 1.5 Pro & Flash engines
                    </p>
                    <p className="flex items-center gap-2">
                      <Check size={14} className="text-emerald-400" /> High-speed streaming response pipeline
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* DESKTOP TAB: DATA CONTROLS */}
            {desktopTab === 'data' && renderStorageContent()}

            {/* DESKTOP TAB: SECURITY */}
            {desktopTab === 'security' && renderSecurityContent()}

            {/* DESKTOP TAB: KEYBOARD */}
            {desktopTab === 'keyboard' && (
              <div className="space-y-6 animate-fadeIn">
                <div>
                  <h2 className="text-xl font-bold text-white">Keyboard Shortcuts</h2>
                  <p className="text-xs text-zinc-400 mt-2 max-w-md leading-relaxed">
                    View active key combinations for rapid composition and window management.
                  </p>
                </div>

                <div className="space-y-4 pt-2">
                  <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Composer</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-1">
                      <span className="text-xs font-medium text-zinc-200">Send message or stop answering</span>
                      <span className="text-xs font-mono text-zinc-400 bg-[#2b2b2e] px-2 py-1 rounded-md border border-zinc-700/50">↵</span>
                    </div>
                    <div className="flex items-center justify-between py-1">
                      <span className="text-xs font-medium text-zinc-200">Open new chat</span>
                      <span className="text-xs font-mono text-zinc-400 bg-[#2b2b2e] px-2.5 py-1 rounded-md border border-zinc-700/50">Ctrl + Shift + O</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* DESKTOP TAB: PLUGINS, VOICE, TRUSTED */}
            {['plugins', 'voice', 'trusted'].includes(desktopTab) && (
              <div className="space-y-6 animate-fadeIn">
                <div>
                  <h2 className="text-xl font-bold text-white capitalize">{desktopTab}</h2>
                  <p className="text-xs text-zinc-400 mt-1">Configure preferences and system options for {desktopTab}.</p>
                </div>

                <div className="bg-[#18181a] rounded-2xl border border-zinc-800 p-5 space-y-4">
                  {desktopTab === 'plugins' && (
                    <div className="space-y-3">
                      <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">Integrations & Extension Plugins</span>
                      <div className="space-y-2">
                        {Object.entries(pluginsState).map(([key, enabled]) => (
                          <div key={key} className="flex items-center justify-between p-3 bg-[#212124] rounded-xl border border-zinc-800">
                            <span className="text-xs font-medium text-zinc-200 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                            <input
                              type="checkbox"
                              checked={Boolean(enabled)}
                              onChange={(e) => setPluginsState({ ...pluginsState, [key]: e.target.checked })}
                              className="size-4 accent-blue-600 rounded cursor-pointer"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {desktopTab === 'voice' && (
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-2">Speech Voice Accent</label>
                        <select
                          value={voiceAccent}
                          onChange={(e) => setVoiceAccent(e.target.value)}
                          className="w-full bg-[#212124] border border-zinc-700/60 rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 focus:outline-none focus:border-blue-500"
                        >
                          <option value="Breezy">Breezy (Natural & Friendly)</option>
                          <option value="Calm">Calm (Deep & Relaxed)</option>
                          <option value="Professional">Professional (Clear & Authoritative)</option>
                          <option value="Cove">Cove (Warm & Conversational)</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {desktopTab === 'trusted' && (
                    <div className="space-y-4">
                      <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">Emergency Phone Contact</label>
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-[#212124] border border-zinc-700/60 rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MOBILE LAYOUT - Visible md:hidden                                         */}
      {/* ========================================================================= */}
      <div className="block md:hidden size-full min-h-screen overflow-y-auto overflow-x-hidden bg-[#000000] px-4 pt-1 pb-20 text-white antialiased touch-pan-y scrollbar-none">
        {/* Top Back Button */}
        <div className="flex items-center justify-between pb-1 pt-[max(0.25rem,env(safe-area-inset-top))]">
          <button
            type="button"
            onClick={handleBackHeaderClick}
            className="size-10 rounded-full bg-[#242426] hover:bg-[#2c2c2e] active:scale-95 text-zinc-200 flex items-center justify-center transition-all cursor-pointer shadow-sm"
            title={subView !== 'main' ? 'Back' : 'Close'}
          >
            <ArrowLeft size={19} className="text-zinc-200" />
          </button>
          {subView !== 'main' && (
            <span className="text-sm font-semibold text-zinc-100 capitalize">
              {subView}
            </span>
          )}
          <div className="w-10" />
        </div>

        {/* SUB-VIEW 1: MAIN LIST */}
        {subView === 'main' && (
          <div className="space-y-4 pb-[max(3rem,env(safe-area-inset-bottom))] animate-fadeIn">
            {/* User Profile Info Header */}
            <div className="flex flex-col items-center justify-center pt-0 pb-4">
              <div className="relative group">
                <div className="size-24 rounded-full overflow-hidden bg-zinc-800 border-2 border-zinc-700/80 shadow-md flex items-center justify-center">
                  {user?.avatar ? (
                    <img src={user.avatar} alt="Profile" className="size-full object-cover" />
                  ) : (
                    <div className="size-full bg-gradient-to-br from-indigo-500/30 to-purple-600/30 flex items-center justify-center text-2xl font-bold text-zinc-200">
                      {user?.name?.[0]?.toUpperCase() ?? 'P'}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setSubView('account')}
                  className="absolute bottom-0 right-0 size-8 rounded-full bg-[#2c2c2e] hover:bg-zinc-700 border-2 border-[#121214] text-zinc-200 flex items-center justify-center transition cursor-pointer shadow-md"
                  title="Edit profile"
                >
                  <Pencil size={13} />
                </button>
              </div>
              <h2 className="mt-2.5 text-lg font-bold tracking-tight text-white">
                {user?.name || 'Patel Dhyan'}
              </h2>
            </div>

            {/* GROUP 1: My Nova */}
            <div>
              <div className="px-2 mb-2 text-xs font-normal text-zinc-400 tracking-wide">
                My Nova
              </div>
              <div className="bg-[#1c1c1e] rounded-[22px] border border-zinc-800/40 overflow-hidden divide-y divide-zinc-800/40 shadow-sm">
                <button
                  type="button"
                  onClick={() => setSubView('personalization')}
                  className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-white/[0.03] transition text-left cursor-pointer"
                >
                  <div className="flex items-center gap-3.5">
                    <Smile size={20} className="text-zinc-300 shrink-0" />
                    <span className="text-sm font-medium text-zinc-100">Personalization</span>
                  </div>
                  <ChevronRight size={16} className="text-zinc-500" />
                </button>

                <button
                  type="button"
                  onClick={() => setSubView('memory')}
                  className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-white/[0.03] transition text-left cursor-pointer"
                >
                  <div className="flex items-center gap-3.5">
                    <BookOpen size={20} className="text-zinc-300 shrink-0" />
                    <span className="text-sm font-medium text-zinc-100">Memory</span>
                  </div>
                  <ChevronRight size={16} className="text-zinc-500" />
                </button>

                <button
                  type="button"
                  onClick={() => setSubView('plugins')}
                  className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-white/[0.03] transition text-left cursor-pointer"
                >
                  <div className="flex items-center gap-3.5">
                    <Grid size={20} className="text-zinc-300 shrink-0" />
                    <span className="text-sm font-medium text-zinc-100">Plugins</span>
                  </div>
                  <ChevronRight size={16} className="text-zinc-500" />
                </button>

                <button
                  type="button"
                  onClick={() => setSubView('remote')}
                  className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-white/[0.03] transition text-left cursor-pointer"
                >
                  <div className="flex items-center gap-3.5">
                    <Monitor size={20} className="text-zinc-300 shrink-0" />
                    <span className="text-sm font-medium text-zinc-100">Remote control</span>
                  </div>
                  <ChevronRight size={16} className="text-zinc-500" />
                </button>
              </div>
            </div>

            {/* GROUP 2: Account */}
            <div>
              <div className="px-2 mb-2 text-xs font-normal text-zinc-400 tracking-wide">
                Account
              </div>
              <div className="bg-[#1c1c1e] rounded-[22px] border border-zinc-800/40 overflow-hidden divide-y divide-zinc-800/40 shadow-sm">
                <button
                  type="button"
                  onClick={() => setSubView('account')}
                  className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-white/[0.03] transition text-left cursor-pointer"
                >
                  <div className="flex items-center gap-3.5">
                    <User size={20} className="text-amber-400 shrink-0" />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-zinc-100">Account Details</span>
                      <span className="text-xs text-zinc-400 mt-0.5">{user?.email || 'dhyan.nupursoftware@gmail.com'}</span>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-zinc-500" />
                </button>

                <button
                  type="button"
                  onClick={() => setSubView('parental')}
                  className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-white/[0.03] transition text-left cursor-pointer"
                >
                  <div className="flex items-center gap-3.5">
                    <Heart size={20} className="text-rose-400 shrink-0" />
                    <span className="text-sm font-medium text-zinc-100">Parental Controls</span>
                  </div>
                  <ChevronRight size={16} className="text-zinc-500" />
                </button>
              </div>
            </div>

            {/* GROUP 3: App Preferences */}
            <div>
              <div className="px-2 mb-2 text-xs font-normal text-zinc-400 tracking-wide">
                Preferences
              </div>
              <div className="bg-[#1c1c1e] rounded-[22px] border border-zinc-800/40 overflow-hidden divide-y divide-zinc-800/40 shadow-sm">
                <button
                  type="button"
                  onClick={() => setSubView('appearance')}
                  className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-white/[0.03] transition text-left cursor-pointer"
                >
                  <div className="flex items-center gap-3.5">
                    <Sun size={20} className="text-amber-400 shrink-0" />
                    <span className="text-sm font-medium text-zinc-100">Appearance</span>
                  </div>
                  <ChevronRight size={16} className="text-zinc-500" />
                </button>

                <button
                  type="button"
                  onClick={() => setSubView('accent')}
                  className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-white/[0.03] transition text-left cursor-pointer"
                >
                  <div className="flex items-center gap-3.5">
                    <Palette size={20} className="text-pink-400 shrink-0" />
                    <span className="text-sm font-medium text-zinc-100">Accent Color</span>
                  </div>
                  <ChevronRight size={16} className="text-zinc-500" />
                </button>

                <button
                  type="button"
                  onClick={() => setSubView('general')}
                  className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-white/[0.03] transition text-left cursor-pointer"
                >
                  <div className="flex items-center gap-3.5">
                    <Settings size={20} className="text-purple-400 shrink-0" />
                    <span className="text-sm font-medium text-zinc-100">General</span>
                  </div>
                  <ChevronRight size={16} className="text-zinc-500" />
                </button>

                <button
                  type="button"
                  onClick={() => setSubView('notifications')}
                  className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-white/[0.03] transition text-left cursor-pointer"
                >
                  <div className="flex items-center gap-3.5">
                    <Bell size={20} className="text-blue-400 shrink-0" />
                    <span className="text-sm font-medium text-zinc-100">Notifications</span>
                  </div>
                  <ChevronRight size={16} className="text-zinc-500" />
                </button>

                <button
                  type="button"
                  onClick={() => setSubView('voice')}
                  className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-white/[0.03] transition text-left cursor-pointer"
                >
                  <div className="flex items-center gap-3.5">
                    <Mic size={20} className="text-emerald-400 shrink-0" />
                    <span className="text-sm font-medium text-zinc-100">Voice</span>
                  </div>
                  <ChevronRight size={16} className="text-zinc-500" />
                </button>
              </div>
            </div>

            {/* GROUP 4: Security, Safety & Storage */}
            <div>
              <div className="px-2 mb-2 text-xs font-normal text-zinc-400 tracking-wide">
                Security & Data
              </div>
              <div className="bg-[#1c1c1e] rounded-[22px] border border-zinc-800/40 overflow-hidden divide-y divide-zinc-800/40 shadow-sm">
                <button
                  type="button"
                  onClick={() => setSubView('safety')}
                  className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-white/[0.03] transition text-left cursor-pointer"
                >
                  <div className="flex items-center gap-3.5">
                    <ShieldCheck size={20} className="text-purple-400 shrink-0" />
                    <span className="text-sm font-medium text-zinc-100">Safety & Content Filtering</span>
                  </div>
                  <ChevronRight size={16} className="text-zinc-500" />
                </button>

                <button
                  type="button"
                  onClick={() => setSubView('security')}
                  className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-white/[0.03] transition text-left cursor-pointer"
                >
                  <div className="flex items-center gap-3.5">
                    <Shield size={20} className="text-emerald-400 shrink-0" />
                    <span className="text-sm font-medium text-zinc-100">Security & Login</span>
                  </div>
                  <ChevronRight size={16} className="text-zinc-500" />
                </button>

                <button
                  type="button"
                  onClick={() => setSubView('storage')}
                  className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-white/[0.03] transition text-left cursor-pointer"
                >
                  <div className="flex items-center gap-3.5">
                    <HardDrive size={20} className="text-blue-400 shrink-0" />
                    <span className="text-sm font-medium text-zinc-100">Storage Usage</span>
                  </div>
                  <ChevronRight size={16} className="text-zinc-500" />
                </button>

                <button
                  type="button"
                  onClick={() => setSubView('data')}
                  className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-white/[0.03] transition text-left cursor-pointer"
                >
                  <div className="flex items-center gap-3.5">
                    <Database size={20} className="text-cyan-400 shrink-0" />
                    <span className="text-sm font-medium text-zinc-100">Data Controls</span>
                  </div>
                  <ChevronRight size={16} className="text-zinc-500" />
                </button>
              </div>
            </div>

            {/* GROUP 5: Support & Info */}
            <div className="bg-[#1c1c1e] rounded-[22px] border border-zinc-800/40 overflow-hidden divide-y divide-zinc-800/40 shadow-sm">
              <button
                type="button"
                onClick={() => setSubView('bug')}
                className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-white/[0.03] transition text-left cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <Bug size={20} className="text-amber-400 shrink-0" />
                  <span className="text-sm font-medium text-zinc-100">Report Bug</span>
                </div>
                <ChevronRight size={16} className="text-zinc-500" />
              </button>

              <button
                type="button"
                onClick={() => setSubView('about')}
                className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-white/[0.03] transition text-left cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <Info size={20} className="text-blue-400 shrink-0" />
                  <span className="text-sm font-medium text-zinc-100">About NovaMind</span>
                </div>
                <ChevronRight size={16} className="text-zinc-500" />
              </button>
            </div>

            {/* GROUP 6: DEDICATED LOG OUT BUTTON AT VERY BOTTOM OF MOBILE MAIN MENU */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Are you sure you want to log out?')) {
                    logout()
                    if (onClose) onClose()
                    navigate('/login')
                  }
                }}
                className="w-full flex items-center justify-between px-4 py-3.5 bg-red-500/10 hover:bg-red-500/20 active:scale-[0.99] text-red-400 border border-red-500/25 rounded-[22px] shadow-sm transition cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <LogOut size={20} className="text-red-400 shrink-0" />
                  <span className="text-sm font-bold">Log Out</span>
                </div>
                <ChevronRight size={16} className="text-red-400/60" />
              </button>
            </div>
          </div>
        )}

        {/* MOBILE SUB-VIEW DETAILS */}
        {subView === 'personalization' && (
          <div className="space-y-6 animate-fadeIn pb-6">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Smile className="text-amber-400" size={20} /> Personalization & AI Tone
              </h3>
              <p className="text-xs text-zinc-400">Customize display names, response style, learning mode, and AI persona.</p>
            </div>

            <div className="bg-[#1c1c1e] rounded-2xl border border-zinc-800/80 p-4 space-y-4">
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">Display Name</label>
                <input
                  type="text"
                  value={persState.displayName}
                  onChange={(e) => setPersState({ ...persState, displayName: e.target.value })}
                  className="w-full bg-[#121214] border border-zinc-700/60 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">Preferred AI Assistant Name</label>
                <input
                  type="text"
                  value={persState.aiName}
                  onChange={(e) => setPersState({ ...persState, aiName: e.target.value })}
                  className="w-full bg-[#121214] border border-zinc-700/60 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">Preferred Response Style</label>
                <select
                  value={persState.responseStyle}
                  onChange={(e) => setPersState({ ...persState, responseStyle: e.target.value })}
                  className="w-full bg-[#121214] border border-zinc-700/60 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="professional">Professional & Technical</option>
                  <option value="friendly">Friendly & Conversational</option>
                  <option value="teacher">Teacher (Step-by-Step Guidance)</option>
                  <option value="casual">Casual & Direct</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">Response Length Preference</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['short', 'balanced', 'detailed'] as const).map((len) => (
                    <button
                      key={len}
                      type="button"
                      onClick={() => setPersState({ ...persState, responseLength: len })}
                      className={`py-2 text-xs font-semibold rounded-xl border transition cursor-pointer ${
                        persState.responseLength === len
                          ? 'bg-blue-600/20 border-blue-500 text-white'
                          : 'bg-[#121214] border-zinc-800 text-zinc-400'
                      }`}
                    >
                      {len === 'short' ? 'Short' : len === 'balanced' ? 'Balanced' : 'Detailed'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">Preferred Programming Language</label>
                <select
                  value={persState.programmingLang}
                  onChange={(e) => setPersState({ ...persState, programmingLang: e.target.value })}
                  className="w-full bg-[#121214] border border-zinc-700/60 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="typescript">TypeScript / React</option>
                  <option value="python">Python</option>
                  <option value="php">PHP / Laravel</option>
                  <option value="go">Go</option>
                  <option value="rust">Rust</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">Interests & Domain Focus</label>
                <textarea
                  rows={2}
                  value={persState.interests}
                  onChange={(e) => setPersState({ ...persState, interests: e.target.value })}
                  className="w-full bg-[#121214] border border-zinc-700/60 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                  placeholder="Enter topics, tools, or frameworks..."
                />
              </div>

              <button
                type="button"
                onClick={() => showToast('Personalization preferences saved', 'success')}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Save Personalization Preferences
              </button>
            </div>
          </div>
        )}

        {subView === 'memory' && (
          <div className="space-y-6 animate-fadeIn pb-6">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <BookOpen className="text-blue-400" size={20} /> Memory & Retention
              </h3>
              <p className="text-xs text-zinc-400">Control what NovaMind remembers across conversation sessions.</p>
            </div>

            <div className="space-y-2.5">
              <RenderSwitchRow
                title="Memory Enabled"
                desc="Master switch allowing AI to retain key facts and preferences across chats."
                checked={memState.memoryEnabled}
                onChange={() => setMemState({ ...memState, memoryEnabled: !memState.memoryEnabled })}
              />
              <RenderSwitchRow
                title="Remember My Name & Role"
                desc="Remember your identity and primary role."
                checked={memState.rememberName && memState.memoryEnabled}
                disabled={!memState.memoryEnabled}
                onChange={() => setMemState({ ...memState, rememberName: !memState.rememberName })}
              />
              <RenderSwitchRow
                title="Remember Technical Preferences"
                desc="Remember preferred stack, coding styles, and libraries."
                checked={memState.rememberPreferences && memState.memoryEnabled}
                disabled={!memState.memoryEnabled}
                onChange={() => setMemState({ ...memState, rememberPreferences: !memState.rememberPreferences })}
              />
              <RenderSwitchRow
                title="Remember Learning Progress"
                desc="Keep track of ongoing topics and tutorials."
                checked={memState.rememberProgress && memState.memoryEnabled}
                disabled={!memState.memoryEnabled}
                onChange={() => setMemState({ ...memState, rememberProgress: !memState.rememberProgress })}
              />
            </div>

            {/* Saved Memories List Card */}
            <div className="bg-[#1c1c1e] rounded-2xl border border-zinc-800 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Saved Memories ({memoriesList.length})</span>
                <span className="text-[11px] text-blue-400 font-semibold">18 / 100 Used</span>
              </div>

              <div className="space-y-2">
                {memoriesList.map((mem) => (
                  <div key={mem.id} className="flex items-center justify-between p-3 bg-[#121214] rounded-xl border border-zinc-800">
                    <span className="text-xs text-zinc-200 pr-2">{mem.text}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setMemoriesList(memoriesList.filter((m) => m.id !== mem.id))
                        showToast('Memory item deleted', 'info')
                      }}
                      className="size-7 rounded-lg bg-zinc-800 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 flex items-center justify-center transition cursor-pointer shrink-0"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => {
                  setConfirmModal({
                    isOpen: true,
                    title: 'Forget All Memories?',
                    message: 'This will permanently erase all saved context and memory entries across your account.',
                    onConfirm: () => {
                      setMemoriesList([])
                      showToast('All saved memories erased', 'success')
                    }
                  })
                }}
                className="w-full py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Forget All Memories
              </button>
            </div>
          </div>
        )}

        {subView === 'plugins' && (
          <div className="space-y-6 animate-fadeIn pb-6">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Grid className="text-indigo-400" size={20} /> Installed Plugins & Extensions
              </h3>
              <p className="text-xs text-zinc-400">Manage external tool integrations, code execution sandboxes, and search tools.</p>
            </div>

            <div className="space-y-2.5">
              <RenderSwitchRow
                title="Google / DuckDuckGo Web Search"
                desc="Allow AI to search external web pages for real-time live info."
                checked={pluginsState.webSearch}
                onChange={() => setPluginsState({ ...pluginsState, webSearch: !pluginsState.webSearch })}
              />
              <RenderSwitchRow
                title="Code Interpreter Sandbox"
                desc="Execute Python scripts and data visualization calculations in a safe sandbox."
                checked={pluginsState.codeInterpreter}
                onChange={() => setPluginsState({ ...pluginsState, codeInterpreter: !pluginsState.codeInterpreter })}
              />
              <RenderSwitchRow
                title="DALL-E & Media Image Generator"
                desc="Generate custom high-resolution illustrations directly in chat."
                checked={pluginsState.dalleImage}
                onChange={() => setPluginsState({ ...pluginsState, dalleImage: !pluginsState.dalleImage })}
              />
              <RenderSwitchRow
                title="PDF & Document Analyzer"
                desc="Parse uploaded PDF, DOCX, and TXT files for semantic search."
                checked={pluginsState.pdfAnalysis}
                onChange={() => setPluginsState({ ...pluginsState, pdfAnalysis: !pluginsState.pdfAnalysis })}
              />
            </div>

            <div className="bg-[#1c1c1e] rounded-2xl border border-zinc-800 p-4 space-y-3">
              <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">Plugin Settings</span>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-400 block">Plugin Execution Authorization</label>
                <select
                  value={pluginsState.permission}
                  onChange={(e) => setPluginsState({ ...pluginsState, permission: e.target.value })}
                  className="w-full bg-[#121214] border border-zinc-700/60 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="ask">Ask Confirmation Before Executing Tools</option>
                  <option value="auto">Auto-Approve Verified Official Plugins</option>
                </select>
              </div>

              <button
                type="button"
                onClick={() => showToast('Opening plugin store catalog...', 'info')}
                className="w-full py-2.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Browse & Install New Plugins
              </button>
            </div>
          </div>
        )}

        {subView === 'remote' && (
          <div className="space-y-6 animate-fadeIn pb-6">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Monitor className="text-cyan-400" size={20} /> Remote Control & Agent Sessions
              </h3>
              <p className="text-xs text-zinc-400">Control connected subagents, remote browser windows, and API sessions.</p>
            </div>

            <div className="space-y-2.5">
              <RenderSwitchRow
                title="Enable Remote Access"
                desc="Allow authorized external agent tools to interface with workspace."
                checked={remoteState.remoteAccess}
                onChange={() => setRemoteState({ ...remoteState, remoteAccess: !remoteState.remoteAccess })}
              />
              <RenderSwitchRow
                title="Require 2FA Security PIN"
                desc="Require parent/admin 4-digit PIN before running terminal subagents."
                checked={remoteState.secPin}
                onChange={() => setRemoteState({ ...remoteState, secPin: !remoteState.secPin })}
              />
            </div>

            <div className="bg-[#1c1c1e] rounded-2xl border border-zinc-800 p-4 space-y-3">
              <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">Connected Agent Sessions</span>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-[#121214] rounded-xl border border-zinc-800">
                  <div>
                    <span className="text-xs font-semibold text-zinc-200 block">Antigravity VS Code Subagent</span>
                    <span className="text-[11px] text-emerald-400 font-mono">Localhost:5173 • Active Now</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => showToast('Session re-verified', 'success')}
                    className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium rounded-lg"
                  >
                    Active
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {subView === 'workspace' && (
          <div className="space-y-6 animate-fadeIn pb-6">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Briefcase className="text-amber-400" size={20} /> Workspace & Team Settings
              </h3>
              <p className="text-xs text-zinc-400">Manage shared team conversations, member roles, and workspace properties.</p>
            </div>

            <div className="bg-[#1c1c1e] rounded-2xl border border-zinc-800 p-4 space-y-4">
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">Workspace Name</label>
                <input
                  type="text"
                  value={workspaceState.name}
                  onChange={(e) => setWorkspaceState({ ...workspaceState, name: e.target.value })}
                  className="w-full bg-[#121214] border border-zinc-700/60 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">Invite Team Member</label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={workspaceState.inviteEmail}
                    onChange={(e) => setWorkspaceState({ ...workspaceState, inviteEmail: e.target.value })}
                    placeholder="colleague@example.com"
                    className="w-full bg-[#121214] border border-zinc-700/60 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (workspaceState.inviteEmail) {
                        showToast(`Invitation sent to ${workspaceState.inviteEmail}`, 'success')
                        setWorkspaceState({ ...workspaceState, inviteEmail: '' })
                      }
                    }}
                    className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shrink-0 cursor-pointer"
                  >
                    Invite
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {subView === 'subscription' && (
          <div className="space-y-6 animate-fadeIn pb-6">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="text-emerald-400" size={20} /> Subscription & Plus Plan
              </h3>
              <p className="text-xs text-zinc-400">Unlock high-speed responses, advanced AI models, and priority support.</p>
            </div>

            <div className="bg-gradient-to-br from-indigo-900/40 via-[#1c1c1e] to-purple-900/40 rounded-2xl border border-indigo-500/30 p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div>
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">Active Tier</span>
                  <h4 className="text-base font-bold text-emerald-400">NovaMind Plus ($20/mo)</h4>
                </div>
                <span className="text-xs font-mono text-emerald-300 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">Active</span>
              </div>

              <div className="space-y-2 text-xs text-zinc-300">
                <p className="flex items-center gap-2"><Check size={14} className="text-emerald-400" /> Unlimited access to Gemini 1.5 Pro & Flash engines</p>
                <p className="flex items-center gap-2"><Check size={14} className="text-emerald-400" /> Zero-latency streaming response pipeline</p>
                <p className="flex items-center gap-2"><Check size={14} className="text-emerald-400" /> 5x higher prompt quota & PDF document analysis</p>
              </div>

              <button
                type="button"
                onClick={() => showToast('Subscription active & up to date', 'info')}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-md"
              >
                Manage Payment Method & Billing
              </button>
            </div>
          </div>
        )}

        {subView === 'email' && (
          <div className="space-y-6 animate-fadeIn pb-6">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Mail className="text-blue-400" size={20} /> Email Preferences & Privacy
              </h3>
              <p className="text-xs text-zinc-400">Manage primary email address, recovery account, and email notification privacy.</p>
            </div>

            <div className="bg-[#1c1c1e] rounded-2xl border border-zinc-800 p-4 space-y-4">
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">Primary Email</label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={emailState.primaryEmail}
                    onChange={(e) => setEmailState({ ...emailState, primaryEmail: e.target.value })}
                    className="w-full bg-[#121214] border border-zinc-700/60 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                  <span className="px-2.5 py-2 bg-emerald-500/10 text-emerald-400 text-xs font-semibold rounded-xl border border-emerald-500/20 shrink-0">Verified</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">Recovery Email</label>
                <input
                  type="email"
                  value={emailState.recoveryEmail}
                  onChange={(e) => setEmailState({ ...emailState, recoveryEmail: e.target.value })}
                  className="w-full bg-[#121214] border border-zinc-700/60 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <RenderSwitchRow
                title="Email Privacy Protection"
                desc="Hide email address from shared workspace team members."
                checked={emailState.privacy}
                onChange={() => setEmailState({ ...emailState, privacy: !emailState.privacy })}
              />

              <button
                type="button"
                onClick={() => showToast('Email settings updated', 'success')}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Save Email Preferences
              </button>
            </div>
          </div>
        )}

        {subView === 'phone' && (
          <div className="space-y-6 animate-fadeIn pb-6">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Phone className="text-emerald-400" size={20} /> Phone Number & SMS Security
              </h3>
              <p className="text-xs text-zinc-400">Manage phone verification, SMS alerts, and OTP authentication.</p>
            </div>

            <div className="bg-[#1c1c1e] rounded-2xl border border-zinc-800 p-4 space-y-4">
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">Primary Phone Number</label>
                <input
                  type="text"
                  value={phoneState.primaryPhone}
                  onChange={(e) => setPhoneState({ ...phoneState, primaryPhone: e.target.value })}
                  className="w-full bg-[#121214] border border-zinc-700/60 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <RenderSwitchRow
                title="SMS Login OTP Security"
                desc="Send one-time password SMS code during login from unrecognized devices."
                checked={phoneState.otpSecurity}
                onChange={() => setPhoneState({ ...phoneState, otpSecurity: !phoneState.otpSecurity })}
              />

              <button
                type="button"
                onClick={() => showToast('Phone settings saved', 'success')}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Save Phone Preferences
              </button>
            </div>
          </div>
        )}

        {subView === 'trusted' && (
          <div className="space-y-6 animate-fadeIn pb-6">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Crosshair className="text-purple-400" size={20} /> Trusted Contacts & Emergency Backup
              </h3>
              <p className="text-xs text-zinc-400">Add trusted contacts for emergency recovery and security notifications.</p>
            </div>

            <div className="bg-[#1c1c1e] rounded-2xl border border-zinc-800 p-4 space-y-3">
              <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">Verified Trusted Contacts</span>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-[#121214] rounded-xl border border-zinc-800">
                  <div>
                    <span className="text-xs font-semibold text-zinc-200 block">Dhyan Patel (Primary Contact)</span>
                    <span className="text-[11px] text-zinc-400">+91 70964 40393 • Emergency Account Recovery</span>
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">Verified</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => showToast('Trusted contact form opened', 'info')}
                className="w-full py-2.5 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Add New Trusted Contact
              </button>
            </div>
          </div>
        )}

        {subView === 'general' && (
          <div className="space-y-6 animate-fadeIn pb-6">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Settings className="text-purple-400" size={20} /> General Preferences
              </h3>
              <p className="text-xs text-zinc-400">Configure language, home screen, streaming options, and search engines.</p>
            </div>

            <div className="space-y-2.5">
              <RenderSwitchRow
                title="Auto Save Chats"
                desc="Automatically record conversation history in local database."
                checked={generalState.autoSave}
                onChange={() => setGeneralState({ ...generalState, autoSave: !generalState.autoSave })}
              />
              <RenderSwitchRow
                title="Auto Scroll During Response"
                desc="Smoothly scroll to latest generated message token."
                checked={generalState.autoScroll}
                onChange={() => setGeneralState({ ...generalState, autoScroll: !generalState.autoScroll })}
              />
              <RenderSwitchRow
                title="Streaming Text Responses"
                desc="Stream AI response text character by character in real time."
                checked={generalState.streaming}
                onChange={() => setGeneralState({ ...generalState, streaming: !generalState.streaming })}
              />
              <RenderSwitchRow
                title="Markdown Rendering & LaTeX"
                desc="Render math equations, tables, and formatted text blocks."
                checked={generalState.markdown}
                onChange={() => setGeneralState({ ...generalState, markdown: !generalState.markdown })}
              />
              <RenderSwitchRow
                title="Code Highlighting & Copy"
                desc="Syntax color highlighting for code blocks."
                checked={generalState.codeHighlight}
                onChange={() => setGeneralState({ ...generalState, codeHighlight: !generalState.codeHighlight })}
              />
            </div>

            <div className="bg-[#1c1c1e] rounded-2xl border border-zinc-800 p-4 space-y-3">
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">Default Search Engine</label>
                <select
                  value={generalState.searchEngine}
                  onChange={(e) => {
                    setGeneralState({ ...generalState, searchEngine: e.target.value })
                    showToast('Default search engine updated', 'success')
                  }}
                  className="w-full bg-[#121214] border border-zinc-700/60 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="google">Google Search (Live Info)</option>
                  <option value="duckduckgo">DuckDuckGo (Privacy Focused)</option>
                  <option value="tavily">Tavily AI Search Engine</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {subView === 'notifications' && renderNotificationsContent()}
        {subView === 'storage' && renderStorageContent()}
        {subView === 'safety' && renderSafetyContent()}
        {subView === 'security' && renderSecurityContent()}
        {subView === 'parental' && renderParentalContent()}
        {subView === 'account' && renderAccountContent()}

        {subView === 'voice' && (
          <div className="space-y-6 animate-fadeIn pb-6">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Mic className="text-emerald-400" size={20} /> Voice Input & Read Aloud
              </h3>
              <p className="text-xs text-zinc-400">Configure speech synthesis accents, speaking speed, and microphone dictation.</p>
            </div>

            <div className="space-y-2.5">
              <RenderSwitchRow
                title="Voice Input (Microphone Dictation)"
                desc="Enable dictation button in chat composer."
                checked={voiceInput}
                onChange={() => setVoiceInput(!voiceInput)}
              />
              <RenderSwitchRow
                title="Auto Read Responses Out Loud"
                desc="Automatically read AI responses out loud upon completion."
                checked={voiceOutput}
                onChange={() => setVoiceOutput(!voiceOutput)}
              />
              <RenderSwitchRow
                title="Microphone Noise Reduction"
                desc="Filter ambient background noise during voice dictation."
                checked={noiseReduction}
                onChange={() => setNoiseReduction(!noiseReduction)}
              />
            </div>

            <div className="bg-[#1c1c1e] rounded-2xl border border-zinc-800 p-4 space-y-3">
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">Preferred Speech Voice Accent</label>
                <select
                  value={voiceAccent}
                  onChange={(e) => setVoiceAccent(e.target.value)}
                  className="w-full bg-[#121214] border border-zinc-700/60 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="Breezy">Breezy (Natural & Friendly)</option>
                  <option value="Calm">Calm (Deep & Relaxed)</option>
                  <option value="Professional">Professional (Clear & Authoritative)</option>
                  <option value="Cove">Cove (Warm & Conversational)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">Voice Language Detection</label>
                <select
                  value={voiceLang}
                  onChange={(e) => {
                    setVoiceLang(e.target.value)
                    showToast('Voice language updated', 'success')
                  }}
                  className="w-full bg-[#121214] border border-zinc-700/60 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="auto">Auto-Detect System Language</option>
                  <option value="en">English (US)</option>
                  <option value="hi">Hindi (IN)</option>
                  <option value="es">Spanish (ES)</option>
                </select>
              </div>

              <button
                type="button"
                onClick={() => showToast('Testing speech synthesis voice...', 'info')}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Test Voice Synthesis Audio
              </button>
            </div>
          </div>
        )}

        {subView === 'data' && renderStorageContent()}

        {subView === 'bug' && (
          <div className="space-y-6 animate-fadeIn pb-6">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Bug className="text-amber-400" size={20} /> Report a Bug & Feedback
              </h3>
              <p className="text-xs text-zinc-400">Submit diagnostic bug reports directly to the NovaMind engineering team.</p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                showToast('Bug report submitted! Ticket #8492 created.', 'success')
                setSubView('main')
              }}
              className="bg-[#1c1c1e] rounded-2xl border border-zinc-800 p-4 space-y-4"
            >
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">Issue Category</label>
                <select
                  value={bugState.type}
                  onChange={(e) => setBugState({ ...bugState, type: e.target.value })}
                  className="w-full bg-[#121214] border border-zinc-700/60 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="ui">UI & Display Layout Error</option>
                  <option value="model">AI Model Response Failure</option>
                  <option value="network">Network Connection Timeout</option>
                  <option value="performance">Performance & Memory Lag</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">Describe the Problem</label>
                <textarea
                  rows={4}
                  required
                  value={bugState.description}
                  onChange={(e) => setBugState({ ...bugState, description: e.target.value })}
                  className="w-full bg-[#121214] border border-zinc-700/60 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-blue-500"
                  placeholder="Provide details or steps to reproduce the issue..."
                />
              </div>

              <RenderSwitchRow
                title="Include System Diagnostic Logs"
                desc="Attach browser OS version (Windows 11 Chrome) and app version (v2.4.0)."
                checked={bugState.includeDeviceInfo}
                onChange={() => setBugState({ ...bugState, includeDeviceInfo: !bugState.includeDeviceInfo })}
              />

              <button
                type="submit"
                className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-md"
              >
                Submit Bug Report
              </button>
            </form>
          </div>
        )}

        {subView === 'about' && (
          <div className="space-y-6 animate-fadeIn pb-6">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Info className="text-blue-400" size={20} /> About NovaMind AI
              </h3>
              <p className="text-xs text-zinc-400">View app version, release notes, and legal documentation.</p>
            </div>

            <div className="bg-[#1c1c1e] rounded-2xl border border-zinc-800 p-4 space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div>
                  <span className="text-xs font-bold text-white block">NovaMind AI Assistant</span>
                  <span className="text-[11px] text-zinc-400 font-mono">Version 2.4.0 (Build #8492)</span>
                </div>
                <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">Up to Date</span>
              </div>

              <div className="space-y-2 text-xs text-zinc-300">
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Engineered with DeepMind streaming technology, Gemini 1.5 Pro models, and custom agent workspace architectures.
                </p>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={() => showToast('Terms of Service opened', 'info')}
                  className="w-full p-2.5 bg-[#121214] hover:bg-zinc-800 text-zinc-200 text-xs font-semibold rounded-xl border border-zinc-800 flex items-center justify-between"
                >
                  <span>Terms of Service</span>
                  <ChevronRight size={16} className="text-zinc-500" />
                </button>
                <button
                  type="button"
                  onClick={() => showToast('Privacy Policy opened', 'info')}
                  className="w-full p-2.5 bg-[#121214] hover:bg-zinc-800 text-zinc-200 text-xs font-semibold rounded-xl border border-zinc-800 flex items-center justify-between"
                >
                  <span>Privacy Policy & Security Standard</span>
                  <ChevronRight size={16} className="text-zinc-500" />
                </button>
              </div>
            </div>
          </div>
        )}

        {subView === 'appearance' && (
          <div className="space-y-6 animate-fadeIn pb-6">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Sun className="text-amber-400" size={20} /> Appearance
              </h3>
              <p className="text-xs text-zinc-400">Choose how NovaMind looks on your device.</p>
            </div>

            <div className="bg-[#1c1c1e] rounded-2xl border border-zinc-800/80 overflow-hidden divide-y divide-zinc-800/60">
              {[
                { id: 'dark', label: 'Dark Mode', desc: 'Sleek dark background for reduced eye strain' },
                { id: 'light', label: 'Light Mode', desc: 'Clean bright layout' },
                { id: 'system', label: 'System (Default)', desc: 'Match your operating system preferences' }
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    const t = item.id as ThemeMode
                    setTheme(t)
                    updateApiSettings({ theme: t, language, model, notifications })
                    showToast(`Theme changed to ${item.label}`, 'success')
                  }}
                  className="w-full flex items-center justify-between px-4 py-4 hover:bg-white/[0.03] transition text-left cursor-pointer"
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-zinc-100">{item.label}</span>
                    <span className="text-xs text-zinc-400 mt-0.5">{item.desc}</span>
                  </div>
                  {theme === item.id && <Check size={18} className="text-blue-400 shrink-0" />}
                </button>
              ))}
            </div>
          </div>
        )}

        {subView === 'accent' && (
          <div className="space-y-6 animate-fadeIn pb-6">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Palette className="text-blue-400" size={20} /> Accent & Bubble Color
              </h3>
              <p className="text-xs text-zinc-400">Customize the color for user chat bubbles.</p>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {BUBBLE_COLOR_PRESETS.map((preset) => {
                const isSelected = (uiSettings.userBubbleColor || 'default') === preset.value
                return (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => {
                      updateUiSetting('userBubbleColor', preset.value)
                      showToast(`Bubble color updated to ${preset.name}`, 'success')
                    }}
                    className={`flex items-center gap-2.5 p-3 rounded-xl border transition cursor-pointer ${
                      isSelected ? 'bg-blue-600/20 border-blue-500 text-white font-bold' : 'bg-[#1c1c1e] border-zinc-800 text-zinc-400'
                    }`}
                  >
                    <span className={`size-3.5 rounded-full ${preset.color} shrink-0`} />
                    <span className="text-xs truncate">{preset.name}</span>
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* CONFIRMATION DIALOG MODAL                                                */}
      {/* ========================================================================= */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#1c1c1e] border border-zinc-800 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-red-400">
              <div className="size-10 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20 shrink-0">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">{confirmModal.title}</h3>
                <p className="text-xs text-zinc-400 mt-0.5">{confirmModal.message}</p>
              </div>
            </div>

            {confirmModal.requireTextMatch && (
              <div className="space-y-1.5 pt-1">
                <label className="text-xs text-zinc-300 block">Type <span className="font-bold text-red-400">DELETE</span> to confirm:</label>
                <input
                  type="text"
                  value={confirmInputText}
                  onChange={(e) => setConfirmInputText(e.target.value)}
                  className="w-full bg-[#121214] border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                  placeholder="DELETE"
                />
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: () => {} })}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={confirmModal.requireTextMatch && confirmInputText !== 'DELETE'}
                onClick={() => {
                  confirmModal.onConfirm()
                  setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: () => {} })
                  setConfirmInputText('')
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-md"
              >
                Confirm Action
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
