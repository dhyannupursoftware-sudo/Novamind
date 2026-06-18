import React, { useState, useRef, type ChangeEvent, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, 
  Camera, 
  User, 
  Lock, 
  Mail, 
  Activity, 
  Database, 
  Sparkles, 
  Calendar, 
  Loader2
} from 'lucide-react'
import { useAuth } from '../context/useAuth'
import { useChat } from '../context/ChatContext'
import { useToast } from '../context/ToastContext'
import { Button } from '../components/ui/Button'
import { FormField } from '../components/ui/FormField'
import { errorMessage } from '../lib/api'
import type { UpdateProfilePayload } from '../context/auth-context'

export function ProfilePage() {
  const navigate = useNavigate()
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

  // Sync state if user data loads late
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

  // Simulated AI usage count
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
      // Automatically save the profile with new avatar URL
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
    } catch (err) {
      setFormError(errorMessage(err))
    } finally {
      setIsSaving(false)
    }
  }

  // Format dates
  const creationDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString(undefined, {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      })
    : 'Unknown Date'

  const lastChatOpened = chats.length > 0 ? chats[0].title : 'No active chats'

  return (
    <main className="min-h-screen text-[#ececec] bg-[#171717] font-sans relative overflow-x-hidden p-6 md:p-10">
      {/* Background glow effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#8B5CF6]/5 blur-[120px] pointer-events-none" />

      <div className="max-w-5xl mx-auto space-y-8 relative z-10">
        
        {/* Navigation Back Button */}
        <button 
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2.5 px-4 py-2 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/5 hover:text-white transition duration-200 text-slate-400 font-semibold text-xs cursor-pointer select-none"
        >
          <ArrowLeft size={14} />
          <span>Back to Chat</span>
        </button>

        {/* Top Header Card (User Info with Avatar) */}
        <div className="glass rounded-[28px] p-6 md:p-8 flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8 border border-white/10 shadow-2xl relative overflow-hidden">
          
          {/* Subtle decoration lines inside the card */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-indigo-500/10 to-purple-500/0 rounded-full blur-2xl pointer-events-none" />

          {/* Large Avatar Picker */}
          <div className="relative group shrink-0">
            <div 
              onClick={handleAvatarClick}
              className="size-28 rounded-full border-2 border-indigo-500/30 p-1 cursor-pointer transition-all duration-300 hover:border-indigo-500 hover:scale-105"
            >
              <div className="relative size-full overflow-hidden rounded-full bg-slate-900 flex items-center justify-center">
                {avatar ? (
                  <img src={avatar} alt="User Avatar" className="size-full object-cover" />
                ) : (
                  <div className="text-slate-400">
                    <User size={42} />
                  </div>
                )}

                {isUploading && (
                  <div className="absolute inset-0 bg-slate-950/70 flex items-center justify-center">
                    <Loader2 className="animate-spin text-indigo-400" size={20} />
                  </div>
                )}

                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/60 opacity-0 group-hover:opacity-100 transition duration-200">
                  <Camera className="text-white" size={18} />
                </div>
              </div>
            </div>
            
            {/* Input Element */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
          </div>

          {/* Identity details */}
          <div className="text-center md:text-left space-y-2.5 flex-1">
            <div className="space-y-1">
              <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">
                {user?.name || 'User Profile'}
              </h1>
              <p className="text-xs font-semibold tracking-wider text-indigo-400 uppercase">
                @{user?.username || 'username'}
              </p>
            </div>
            
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-4 gap-y-2 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <Mail size={13} className="text-slate-500" />
                {user?.email}
              </span>
              <span className="hidden md:inline text-slate-700">•</span>
              <span className="flex items-center gap-1.5">
                <Calendar size={13} className="text-slate-500" />
                Member since {creationDate}
              </span>
            </div>

            <div className="pt-2 flex justify-center md:justify-start">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                <Sparkles size={11} className="animate-pulse" />
                NovaMind AI Premium
              </span>
            </div>
          </div>
        </div>

        {/* Content Section: Form & Statistics Cards */}
        <div className="grid md:grid-cols-12 gap-8">
          
          {/* Left Side: Edit Profile Forms (Col 7) */}
          <div className="md:col-span-7 space-y-6">
            <div className="glass rounded-[28px] p-6 border border-white/5 space-y-6">
              
              <div className="border-b border-white/5 pb-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <User size={16} className="text-indigo-400" />
                  Account Details
                </h3>
                <p className="text-[11px] text-slate-400 mt-1">
                  Update your display metadata and secure credentials instantly.
                </p>
              </div>

              <form onSubmit={handleSave} className="space-y-5">
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

                <div className="border-t border-white/5 pt-5 space-y-4">
                  <h4 className="flex items-center gap-1.5 text-xs font-bold text-slate-350 uppercase tracking-wider">
                    <Lock size={13} className="text-indigo-400" />
                    Security Credentials
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

                <div className="flex justify-end gap-3 border-t border-white/5 pt-5">
                  <Button 
                    type="submit" 
                    disabled={isSaving || isUploading} 
                    className="min-h-11 px-6 text-xs bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-500/20 transition-all active:scale-95 duration-200 cursor-pointer"
                  >
                    {isSaving ? 'Saving Changes...' : 'Save Settings'}
                  </Button>
                </div>
              </form>
            </div>
          </div>

          {/* Right Side: Statistics & Activities (Col 5) */}
          <div className="md:col-span-5 space-y-6">
            
            {/* Stats Cards grid */}
            <div className="glass rounded-[28px] p-6 border border-white/5 space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider block flex items-center gap-2 border-b border-white/5 pb-3">
                <Database size={14} className="text-indigo-400" />
                Workspace Usage
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl bg-white/[0.02] border border-white/5 p-4 text-center hover:bg-white/[0.04] transition duration-200">
                  <span className="block text-2xl font-black text-indigo-400">{totalChats}</span>
                  <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mt-1 block">Total Chats</span>
                </div>
                <div className="rounded-2xl bg-white/[0.02] border border-white/5 p-4 text-center hover:bg-white/[0.04] transition duration-200">
                  <span className="block text-2xl font-black text-cyan-400">{totalMessages}</span>
                  <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mt-1 block">Messages</span>
                </div>
                <div className="rounded-2xl bg-white/[0.02] border border-white/5 p-4 text-center hover:bg-white/[0.04] transition duration-200">
                  <span className="block text-2xl font-black text-emerald-450 text-emerald-400">{savedPromptsCount}</span>
                  <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mt-1 block">Saved Chats</span>
                </div>
                <div className="rounded-2xl bg-white/[0.02] border border-white/5 p-4 text-center hover:bg-white/[0.04] transition duration-200">
                  <span className="block text-2xl font-black text-pink-400">{aiUsageCount}</span>
                  <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mt-1 block">AI Prompt Runs</span>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-indigo-500/[0.03] border border-indigo-500/10 px-4 py-3 text-xs mt-2">
                <span className="text-slate-400">Current AI Model:</span>
                <span className="font-bold text-indigo-350 text-indigo-400 uppercase tracking-wider">{settings.model}</span>
              </div>
            </div>

            {/* Recent activity timeline */}
            <div className="glass rounded-[28px] p-6 border border-white/5 space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider block flex items-center gap-2 border-b border-white/5 pb-3">
                <Activity size={14} className="text-indigo-400" />
                Recent Activities
              </h3>

              <div className="space-y-4 text-xs">
                
                {/* Timeline 1 */}
                <div className="flex items-start gap-3 relative group">
                  <div className="size-2 rounded-full bg-indigo-400 mt-1.5 shrink-0 z-10 shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
                  <div className="flex-1 space-y-0.5">
                    <p className="font-medium text-slate-200">Workspace synchronized</p>
                    <p className="text-[10px] text-slate-400">MySQL Database connected securely.</p>
                    <span className="text-[9px] text-slate-500 block pt-0.5">Just now</span>
                  </div>
                </div>

                {/* Timeline 2 */}
                <div className="flex items-start gap-3 relative group">
                  <div className="size-2 rounded-full bg-[#8B5CF6] mt-1.5 shrink-0 z-10 shadow-[0_0_8px_rgba(139,92,246,0.5)]" />
                  <div className="flex-1 space-y-0.5">
                    <p className="font-medium text-slate-200">Last conversation active</p>
                    <p className="text-[10px] text-slate-400 truncate max-w-[250px]">{lastChatOpened}</p>
                    <span className="text-[9px] text-slate-500 block pt-0.5">Active Session</span>
                  </div>
                </div>

                {/* Timeline 3 */}
                <div className="flex items-start gap-3 relative group">
                  <div className="size-2 rounded-full bg-cyan-400 mt-1.5 shrink-0 z-10 shadow-[0_0_8px_rgba(103,232,249,0.5)]" />
                  <div className="flex-1 space-y-0.5">
                    <p className="font-medium text-slate-200">Secure auth session active</p>
                    <p className="text-[10px] text-slate-400">Validated via Laravel Sanctum authentication.</p>
                    <span className="text-[9px] text-slate-500 block pt-0.5">Active</span>
                  </div>
                </div>

              </div>
            </div>

          </div>

        </div>

      </div>
    </main>
  )
}
