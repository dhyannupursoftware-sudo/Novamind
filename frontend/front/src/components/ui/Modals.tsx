import { useState, useRef, type ChangeEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, Globe, Loader2, Lock, Sparkles, User, X, Activity, Database } from 'lucide-react'
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

  // Recalculate workspace stats
  const totalChats = chats.length
  const totalMessages = chats.reduce((total, chat) => total + (chat.messages_count ?? 0), 0)

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
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 30 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="glass relative z-10 w-full max-w-2xl overflow-hidden rounded-[24px] border border-white/10 bg-[#1E293B]/90 text-white shadow-[0_0_50px_rgba(99,102,241,0.15)]"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-cyan-400 animate-pulse" />
                <h3 className="text-lg font-bold tracking-tight text-white">NovaMind Account Profile</h3>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Grid Layout (Left: Form, Right: Activity & Stats) */}
            <div className="grid md:grid-cols-12 gap-6 p-6 max-h-[calc(100vh-12rem)] overflow-y-auto scrollbar-thin">
              
              {/* Left Column: Editor (Col 7) */}
              <form onSubmit={handleSave} className="md:col-span-7 space-y-5">
                {formError && (
                  <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-xs text-rose-200">
                    {formError}
                  </div>
                )}

                {/* Avatar Picker */}
                <div className="flex items-center gap-4 border-b border-white/5 pb-4">
                  <div 
                    onClick={handleAvatarClick}
                    className="group relative cursor-pointer overflow-hidden rounded-full border border-white/15 p-0.5 transition hover:border-[#6366F1]"
                  >
                    <div className="relative size-16 overflow-hidden rounded-full bg-slate-900">
                      {avatar ? (
                        <img src={avatar} alt="Profile Avatar" className="size-full object-cover" />
                      ) : (
                        <div className="grid size-full place-items-center text-slate-400">
                          <User size={24} />
                        </div>
                      )}

                      {isUploading && (
                        <div className="absolute inset-0 grid place-items-center bg-slate-950/70">
                          <Loader2 className="animate-spin text-cyan-400" size={16} />
                        </div>
                      )}

                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/60 opacity-0 group-hover:opacity-100 transition duration-300">
                        <Camera className="text-white" size={14} />
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">User Avatar</h4>
                    <button 
                      type="button"
                      onClick={handleAvatarClick} 
                      className="mt-1 text-xs font-semibold text-[#6366F1] hover:text-[#8B5CF6] transition"
                    >
                      Upload New Image
                    </button>
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                </div>

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

                <div className="border-t border-white/5 pt-4">
                  <h4 className="flex items-center gap-1.5 text-xs font-bold text-slate-300 uppercase tracking-wider">
                    <Lock size={12} className="text-[#6366F1]" />
                    Change Account Password
                  </h4>
                  <div className="grid gap-4 sm:grid-cols-2 mt-3">
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
                  <Button type="submit" disabled={isSaving || isUploading} className="min-h-10 text-xs">
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </form>

              {/* Right Column: Statistics & Logs (Col 5) */}
              <div className="md:col-span-5 space-y-6">
                
                {/* Account Stats Card */}
                <div className="rounded-2xl border border-white/5 bg-slate-900/60 p-4 shadow-lg">
                  <h4 className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                    <Database size={13} className="text-cyan-400" />
                    Account Statistics
                  </h4>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-white/[0.02] border border-white/5 p-3 text-center">
                      <span className="block text-xl font-black text-[#6366F1]">{totalChats}</span>
                      <span className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Total Chats</span>
                    </div>
                    <div className="rounded-xl bg-white/[0.02] border border-white/5 p-3 text-center">
                      <span className="block text-xl font-black text-[#8B5CF6]">{totalMessages}</span>
                      <span className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Messages</span>
                    </div>
                  </div>

                  <div className="mt-3.5 flex items-center justify-between rounded-xl bg-[#6366F1]/5 border border-[#6366F1]/20 px-3 py-2 text-xs">
                    <span className="text-slate-400">Current AI Model:</span>
                    <span className="font-bold text-cyan-300 uppercase tracking-wider">{settings.model}</span>
                  </div>
                </div>

                {/* Recent Activity Card */}
                <div className="rounded-2xl border border-white/5 bg-slate-900/60 p-4 shadow-lg">
                  <h4 className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                    <Activity size={13} className="text-[#8B5CF6]" />
                    Recent Activity Logs
                  </h4>
                  
                  <div className="space-y-3 text-xs">
                    <div className="flex items-start gap-2.5">
                      <div className="size-1.5 rounded-full bg-[#6366F1] mt-1.5" />
                      <div>
                        <p className="font-medium text-slate-200">Active session initiated</p>
                        <span className="text-[9px] text-slate-500">{new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                    {user?.created_at && (
                      <div className="flex items-start gap-2.5">
                        <div className="size-1.5 rounded-full bg-[#8B5CF6] mt-1.5" />
                        <div>
                          <p className="font-medium text-slate-200">Account registered securely</p>
                          <span className="text-[9px] text-slate-500">{new Date(user.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                      </div>
                    )}
                    <div className="flex items-start gap-2.5">
                      <div className="size-1.5 rounded-full bg-cyan-400 mt-1.5" />
                      <div>
                        <p className="font-medium text-slate-200">Local workspace synchronized</p>
                        <span className="text-[9px] text-slate-500">Database connection: MySQL</span>
                      </div>
                    </div>
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
  const { settings, updateSettings, isSavingSettings } = useChat()

  const [theme, setTheme] = useState<ThemeMode>(settings.theme)
  const [language, setLanguage] = useState(settings.language)
  const [model, setModel] = useState(settings.model)
  const [notifications, setNotifications] = useState(settings.notifications)

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    await updateSettings({ theme, language, model, notifications })
    
    if (theme === 'light') {
      document.documentElement.classList.remove('dark')
      document.documentElement.classList.add('light')
    } else if (theme === 'dark') {
      document.documentElement.classList.remove('light')
      document.documentElement.classList.add('dark')
    } else {
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      document.documentElement.classList.toggle('dark', systemDark)
    }

    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 30 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="glass relative z-10 w-full max-w-lg overflow-hidden rounded-[24px] border border-white/10 bg-[#1E293B]/90 text-white shadow-[0_0_50px_rgba(99,102,241,0.15)]"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
              <div className="flex items-center gap-2">
                <Globe className="text-[#6366F1]" size={20} />
                <h3 className="text-lg font-bold tracking-tight text-white">NovaMind System Settings</h3>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Cards Grid Layout */}
            <form onSubmit={handleSave} className="p-6 space-y-4 max-h-[calc(100vh-12rem)] overflow-y-auto scrollbar-thin">
              
              <div className="grid gap-4 sm:grid-cols-2">
                
                {/* Theme Card */}
                <div className="rounded-2xl border border-white/5 bg-[#0F172A]/40 p-4 space-y-2.5">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Appearance</span>
                  <select
                    value={theme}
                    onChange={(e) => setTheme(e.target.value as ThemeMode)}
                    className="input-glass min-h-11 w-full rounded-xl px-3 text-xs focus:outline-none bg-slate-950 text-white border border-white/10 focus:border-[#6366F1]"
                  >
                    <option value="dark">Dark Slate Glow</option>
                    <option value="light">Frosted Light</option>
                    <option value="system">Follow System</option>
                  </select>
                </div>

                {/* Language Card */}
                <div className="rounded-2xl border border-white/5 bg-[#0F172A]/40 p-4 space-y-2.5">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Language Dialect</span>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="input-glass min-h-11 w-full rounded-xl px-3 text-xs focus:outline-none bg-slate-950 text-white border border-white/10 focus:border-[#6366F1]"
                  >
                    <option value="en">English (EN)</option>
                    <option value="hi">Hindi (HI)</option>
                    <option value="es">Spanish (ES)</option>
                    <option value="fr">French (FR)</option>
                  </select>
                </div>

                {/* Model Card */}
                <div className="rounded-2xl border border-white/5 bg-[#0F172A]/40 p-4 space-y-2.5 sm:col-span-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">AI LLM Model Engine</span>
                  <select
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="input-glass min-h-11 w-full rounded-xl px-3 text-xs focus:outline-none bg-slate-950 text-white border border-white/10 focus:border-[#6366F1]"
                  >
                    <option value="nova-pro">NovaMind Ultra Pro (Max Context)</option>
                    <option value="nova-lite">NovaMind Lite (Fast Speed)</option>
                    <option value="nova-coder">NovaMind Coder (Code & Logic)</option>
                  </select>
                </div>

                {/* Notifications Card */}
                <div className="rounded-2xl border border-white/5 bg-[#0F172A]/40 p-4 sm:col-span-2 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">System Notifications</span>
                    <span className="text-[10px] text-slate-500">Receive desktop alerts and updates</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifications}
                      onChange={(e) => setNotifications(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-6 bg-slate-800 rounded-full peer peer-focus:ring-0 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#6366F1] peer-checked:after:bg-white" />
                  </label>
                </div>

              </div>

              <div className="flex items-center gap-2 rounded-xl border border-[#6366F1]/20 bg-[#6366F1]/5 p-3 text-[11px] leading-relaxed text-slate-300">
                <Sparkles size={16} className="shrink-0 text-cyan-400" />
                <span>Adjusting options updates configurations for speech typing, push alerts, and local model routing instantly.</span>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 border-t border-white/5 pt-4">
                <Button type="button" variant="ghost" onClick={onClose} className="min-h-10 text-xs">
                  Cancel
                </Button>
                <Button type="submit" disabled={isSavingSettings} className="min-h-10 text-xs bg-gradient-to-r from-[#6366F1] to-[#8B5CF6]">
                  {isSavingSettings ? 'Saving...' : 'Apply & Save'}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
