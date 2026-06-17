import { useState, useRef, type ChangeEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, Globe, Loader2, Lock, Sparkles, User, X } from 'lucide-react'
import { useAuth } from '../../context/useAuth'
import { useChat } from '../../context/ChatContext'
import { useToast } from '../../context/ToastContext'
import { Button } from './Button'
import { FormField } from './FormField'
import { errorMessage } from '../../lib/api'
import type { ThemeMode } from '../../types/api'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ProfileModal({ isOpen, onClose }: ModalProps) {
  const { user, updateProfile } = useAuth()
  const { uploadFile } = useChat()
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

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast('Avatar image must be smaller than 5MB', 'error')
      return
    }

    setIsUploading(true)
    try {
      const res = await uploadFile(file)
      setAvatar(res.url)
      showToast('Avatar uploaded successfully', 'success')
    } catch (err) {
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
      const payload: any = {
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
      
      // Clear password fields
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="glass relative z-10 w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-slate-900/90 text-white shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
              <div className="flex items-center gap-2">
                <User className="text-cyan-400" size={20} />
                <h3 className="text-lg font-semibold text-white">Your Profile</h3>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSave} className="p-6 space-y-6 max-h-[calc(100vh-12rem)] overflow-y-auto">
              {formError && (
                <div className="rounded-lg border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                  {formError}
                </div>
              )}

              {/* Avatar Picker */}
              <div className="flex flex-col items-center justify-center gap-3">
                <div 
                  onClick={handleAvatarClick}
                  className="group relative cursor-pointer overflow-hidden rounded-full border-2 border-dashed border-white/20 p-1 transition hover:border-cyan-400"
                >
                  <div className="relative size-24 overflow-hidden rounded-full bg-slate-800">
                    {avatar ? (
                      <img src={avatar} alt="Profile Avatar" className="size-full object-cover" />
                    ) : (
                      <div className="grid size-full place-items-center text-slate-400">
                        <User size={36} />
                      </div>
                    )}

                    {isUploading && (
                      <div className="absolute inset-0 grid place-items-center bg-slate-950/70">
                        <Loader2 className="animate-spin text-cyan-400" size={20} />
                      </div>
                    )}

                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/60 opacity-0 group-hover:opacity-100 transition duration-300">
                      <Camera className="text-white" size={18} />
                      <span className="mt-1 text-[10px] font-semibold text-white">Change</span>
                    </div>
                  </div>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
                <span className="text-xs text-slate-400">Allowed formats: PNG, JPG, GIF up to 5MB</span>
              </div>

              {/* Fields */}
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

              <div className="border-t border-white/10 pt-4">
                <h4 className="flex items-center gap-1.5 text-sm font-semibold text-slate-300">
                  <Lock size={15} className="text-cyan-400" />
                  Change Password (Optional)
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
                    label="Confirm New Password"
                    type="password"
                    placeholder="••••••••"
                    value={passwordConfirmation}
                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 border-t border-white/10 pt-4">
                <Button type="button" variant="ghost" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSaving || isUploading}>
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
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
    
    // Apply theme changes instantly to document body
    if (theme === 'light') {
      document.documentElement.classList.remove('dark')
      document.documentElement.classList.add('light')
    } else if (theme === 'dark') {
      document.documentElement.classList.remove('light')
      document.documentElement.classList.add('dark')
    } else {
      // System
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
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="glass relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-slate-900/90 text-white shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
              <div className="flex items-center gap-2">
                <Globe className="text-cyan-400" size={20} />
                <h3 className="text-lg font-semibold text-white">System Settings</h3>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSave} className="p-6 space-y-5">
              {/* Theme Selection */}
              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-300">Aesthetic Theme</span>
                <select
                  value={theme}
                  onChange={(e) => setTheme(e.target.value as ThemeMode)}
                  className="input-glass min-h-11 w-full rounded-lg px-3 text-sm focus:outline-none bg-slate-950 text-white border border-white/10 focus:border-cyan-400/50"
                >
                  <option value="dark">Dark Slate Glow</option>
                  <option value="light">Frosted Light</option>
                  <option value="system">Follow System</option>
                </select>
              </label>

              {/* Language Selection */}
              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-300">Speech & Interface Language</span>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="input-glass min-h-11 w-full rounded-lg px-3 text-sm focus:outline-none bg-slate-950 text-white border border-white/10 focus:border-cyan-400/50"
                >
                  <option value="en">English (EN)</option>
                  <option value="hi">Hindi (HI)</option>
                  <option value="es">Spanish (ES)</option>
                  <option value="fr">French (FR)</option>
                </select>
              </label>

              {/* LLM Model Selection */}
              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-300">LLM Processor Architecture</span>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="input-glass min-h-11 w-full rounded-lg px-3 text-sm focus:outline-none bg-slate-950 text-white border border-white/10 focus:border-cyan-400/50"
                >
                  <option value="nova-pro">NovaMind Ultra Pro (Max Context)</option>
                  <option value="nova-lite">NovaMind Lite (Fast Speed)</option>
                  <option value="nova-coder">NovaMind Coder (Code & Logic)</option>
                </select>
              </label>

              {/* Notification Settings */}
              <label className="flex items-center gap-3 cursor-pointer select-none pt-1">
                <input
                  type="checkbox"
                  checked={notifications}
                  onChange={(e) => setNotifications(e.target.checked)}
                  className="size-4 rounded border-white/10 bg-slate-950 text-cyan-400 focus:ring-0 focus:ring-offset-0 focus:outline-none cursor-pointer"
                />
                <span className="text-sm font-medium text-slate-300">Enable Push Notifications</span>
              </label>

              <div className="flex items-center gap-2 rounded-lg border border-cyan-500/20 bg-cyan-950/30 p-3 text-xs leading-5 text-cyan-200">
                <Sparkles size={16} className="shrink-0 text-cyan-400" />
                <span>Adjusting options updates settings for speech typing, push alerts, and LLM model routing.</span>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 border-t border-white/10 pt-4">
                <Button type="button" variant="ghost" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSavingSettings}>
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
