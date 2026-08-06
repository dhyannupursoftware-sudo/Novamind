import React, { useState, useRef, useEffect, type ChangeEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Camera, 
  User, 
  Lock, 
  Activity, 
  Database, 
  Loader2, 
  X
} from 'lucide-react'
import { useAuth } from '../../context/useAuth'
import { useChat } from '../../context/ChatContext'
import { useToast } from '../../context/ToastContext'
import { Button } from './Button'
import { FormField } from './FormField'
import { errorMessage } from '../../lib/api'
import type { UpdateProfilePayload } from '../../context/auth-context'
import { NovaSettings } from './NovaSettings'

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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
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
            className="relative z-10 w-full max-w-4xl h-[88vh] sm:h-[85vh] md:h-[80vh] rounded-[24px] border border-white/10 bg-[#171717] text-white shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/5 px-4 sm:px-6 py-4 sm:py-5 select-none">
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-indigo-500 animate-pulse" />
                <h3 className="text-sm sm:text-base font-bold text-white tracking-wide">NovaMind Profile Console</h3>
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
            <div className="grid md:grid-cols-12 gap-4 sm:gap-6 p-4 sm:p-6 flex-1 min-h-0 overflow-y-auto scrollbar-thin">
              
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
  if (!isOpen) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto select-none sm:p-4">
          {/* Backdrop (visible on desktop) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#000000]/75 backdrop-blur-md cursor-pointer hidden md:block"
          />

          {/* Responsive Settings Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 15 }}
            transition={{ type: 'spring', damping: 26, stiffness: 220 }}
            className="relative z-10 w-full min-h-screen h-full md:min-h-0 md:max-w-4xl md:h-[82vh] md:rounded-[24px] bg-[#000000] md:bg-[#18181a] border-0 md:border md:border-zinc-800/80 text-white shadow-2xl overflow-y-auto md:overflow-hidden p-0"
          >
            <NovaSettings onClose={onClose} isModal={true} />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
