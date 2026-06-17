import { useState, useRef, useEffect, useMemo, type FormEvent, type KeyboardEvent, type ChangeEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  AlertCircle,
  Bookmark,
  Calendar,
  Check,
  Edit2,
  FileText,
  Image as ImageIcon,
  Loader2,
  LogOut,
  Menu,
  MessageSquare,
  Mic,
  MicOff,
  Paperclip,
  Pin,
  Plus,
  Search,
  Send,
  Settings,
  Sparkles,
  Trash2,
  User,
  X,
} from 'lucide-react'
import { useAuth } from '../context/useAuth'
import { useChat, type ExtendedChat, type Attachment } from '../context/ChatContext'
import { useToast } from '../context/ToastContext'
import { Button } from '../components/ui/Button'
import { ProfileModal, SettingsModal } from '../components/ui/Modals'
import { BrandMark } from '../components/BrandMark'

// Date Group helper
function groupChatsByDate(chats: ExtendedChat[]) {
  const today: ExtendedChat[] = []
  const yesterday: ExtendedChat[] = []
  const last7Days: ExtendedChat[] = []
  const last30Days: ExtendedChat[] = []
  const older: ExtendedChat[] = []

  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const startOfYesterday = startOfToday - 24 * 60 * 60 * 1000
  const startOf7DaysAgo = startOfToday - 7 * 24 * 60 * 60 * 1000
  const startOf30DaysAgo = startOfToday - 30 * 24 * 60 * 60 * 1000

  chats.forEach((chat) => {
    const chatTime = chat.updated_at ? new Date(chat.updated_at).getTime() : new Date(chat.created_at ?? '').getTime()
    if (chatTime >= startOfToday) {
      today.push(chat)
    } else if (chatTime >= startOfYesterday) {
      yesterday.push(chat)
    } else if (chatTime >= startOf7DaysAgo) {
      last7Days.push(chat)
    } else if (chatTime >= startOf30DaysAgo) {
      last30Days.push(chat)
    } else {
      older.push(chat)
    }
  })

  return { today, yesterday, last7Days, last30Days, older }
}

const SUGGESTED_PROMPTS = [
  { text: 'Explain REST APIs vs GraphQL', category: 'Logic' },
  { text: 'Write a Laravel migration with composite indexes', category: 'Database' },
  { text: 'Design glassmorphic cards in Tailwind CSS', category: 'Aesthetics' },
  { text: 'Create a responsive React layout with Framer Motion', category: 'Animation' },
]

export function DashboardPage() {
  const { logout, user } = useAuth()
  const {
    chats,
    selectedChat,
    messages,
    isLoadingChats,
    isLoadingMessages,
    isSending,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    filterSavedOnly,
    setFilterSavedOnly,
    isProfileOpen,
    setIsProfileOpen,
    isSettingsOpen,
    setIsSettingsOpen,
    selectChat,
    createChat,
    renameChat,
    deleteChat,
    togglePinChat,
    toggleSaveChat,
    sendMessage,
    settings,
    uploadFile,
    isListening,
    toggleSpeechRecognition,
  } = useChat()

  const { showToast } = useToast()

  // Input area states
  interface PendingAttachment {
    id: string
    name: string
    type: string
    size: number
    file: File
  }

  const [prompt, setPrompt] = useState('')
  const [pendingAttachments, setPendingAttachments] = useState<PendingAttachment[]>([])
  const [isUploadingFiles, setIsUploadingFiles] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // In-chat message search
  const [messageSearchQuery, setMessageSearchQuery] = useState('')
  const [showInChatSearch, setShowInChatSearch] = useState(false)

  // In-place rename states
  const [renamingId, setRenamingId] = useState<number | null>(null)
  const [renameValue, setRenameValue] = useState('')

  // Refs
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const messageEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)

  // Auto resize prompt textarea
  useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return
    textarea.style.height = 'auto'
    textarea.style.height = `${Math.min(textarea.scrollHeight, 180)}px`
  }, [prompt])

  // Scroll to bottom on new messages
  const scrollToBottom = () => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isSending])

  // Filter messages based on in-chat search
  const filteredMessages = useMemo(() => {
    if (!messageSearchQuery.trim()) return messages
    return messages.filter((msg) =>
      msg.content.toLowerCase().includes(messageSearchQuery.toLowerCase())
    )
  }, [messages, messageSearchQuery])

  // Grouped chats history
  const groupedChats = useMemo(() => {
    return groupChatsByDate(chats)
  }, [chats])

  // Attachments handlers
  const triggerFileInput = (type: 'all' | 'image') => {
    if (type === 'image') {
      imageInputRef.current?.click()
    } else {
      fileInputRef.current?.click()
    }
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const newAttachments = Array.from(files).map((file: File) => ({
      id: Math.random().toString(36).substring(2, 9),
      name: file.name,
      type: file.type,
      size: file.size,
      file,
    }))

    setPendingAttachments((prev) => [...prev, ...newAttachments])
    e.target.value = '' // Clear input
  }

  const removePendingAttachment = (id: string) => {
    setPendingAttachments((prev) => prev.filter((item) => item.id !== id))
  }

  // Handle Voice Transcript Insertion
  const handleVoiceTranscript = (text: string) => {
    setPrompt((prev) => (prev ? prev + ' ' + text : text))
  }

  // Form Submit Handler
  const handleSend = async (e?: FormEvent) => {
    if (e) e.preventDefault()
    const text = prompt.trim()
    if (!text && pendingAttachments.length === 0) return
    if (isSending) return

    setPrompt('')
    setIsUploadingFiles(true)

    try {
      // 1. Upload files first if any
      const uploadedAttachments: Attachment[] = []
      for (const attachment of pendingAttachments) {
        const uploaded = await uploadFile(attachment.file)
        uploadedAttachments.push(uploaded)
      }

      setPendingAttachments([])
      setIsUploadingFiles(false)

      // 2. Send the message
      await sendMessage(text, uploadedAttachments)
    } catch (err) {
      showToast('Error sending message: files failed to upload.', 'error')
      setIsUploadingFiles(false)
    }
  }

  // Keyboard shortcut Enter to Send, Shift+Enter for new line
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      void handleSend()
    }
  }

  // Rename Start
  const startRenaming = (chat: ExtendedChat) => {
    setRenamingId(chat.id)
    setRenameValue(chat.title)
  }

  const saveRename = async (chatId: number) => {
    if (!renameValue.trim()) return
    await renameChat(chatId, renameValue.trim())
    setRenamingId(null)
  }

  // Formatting helpers
  const formatTime = (value: string | null): string => {
    if (!value) return ''
    return new Intl.DateTimeFormat(undefined, {
      hour: 'numeric',
      minute: '2-digit',
    }).format(new Date(value))
  }

  // Render a chat item
  const renderChatItem = (chat: ExtendedChat) => {
    const isSelected = selectedChat?.id === chat.id
    const isRenaming = renamingId === chat.id

    return (
      <div
        key={chat.id}
        className={`group relative flex items-center justify-between rounded-xl border p-2.5 transition duration-300 ${
          isSelected
            ? 'border-cyan-400/30 bg-cyan-400/10'
            : 'border-white/5 bg-white/5 hover:bg-white/10'
        }`}
      >
        {isRenaming ? (
          <div className="flex w-full items-center gap-1.5">
            <input
              type="text"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              className="w-full rounded bg-slate-950 px-2 py-1 text-xs text-white border border-white/10 focus:border-cyan-400/50 focus:outline-none"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') void saveRename(chat.id)
                if (e.key === 'Escape') setRenamingId(null)
              }}
            />
            <button
              onClick={() => void saveRename(chat.id)}
              className="rounded bg-cyan-400 p-1 text-slate-950 transition hover:bg-cyan-300"
            >
              <Check size={12} />
            </button>
            <button
              onClick={() => setRenamingId(null)}
              className="rounded bg-white/10 p-1 text-white transition hover:bg-white/20"
            >
              <X size={12} />
            </button>
          </div>
        ) : (
          <>
            <button
              type="button"
              onClick={() => {
                void selectChat(chat)
                setSidebarOpen(false)
              }}
              className="flex flex-1 items-start gap-2.5 text-left min-w-0"
            >
              <MessageSquare
                className={`mt-0.5 shrink-0 transition ${
                  isSelected ? 'text-cyan-400' : 'text-slate-400 group-hover:text-cyan-300'
                }`}
                size={16}
              />
              <div className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-slate-100 transition group-hover:text-white">
                  {chat.title}
                </span>
                <span className="text-[10px] text-slate-500">
                  {chat.messages_count ?? 0} messages
                </span>
              </div>
            </button>

            {/* Quick Actions (Pin / Save / More Options) */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition duration-300">
              <button
                type="button"
                onClick={() => void togglePinChat(chat)}
                title={chat.pinned ? 'Unpin Chat' : 'Pin Chat'}
                className={`rounded-md p-1.5 transition ${
                  chat.pinned ? 'text-amber-400 bg-amber-400/10' : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Pin size={12} />
              </button>
              <button
                type="button"
                onClick={() => void toggleSaveChat(chat)}
                title={chat.saved ? 'Unsave Chat' : 'Save Chat'}
                className={`rounded-md p-1.5 transition ${
                  chat.saved ? 'text-cyan-400 bg-cyan-400/10' : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Bookmark size={12} />
              </button>
              <button
                type="button"
                onClick={() => startRenaming(chat)}
                title="Rename Chat"
                className="rounded-md p-1.5 text-slate-400 hover:text-white hover:bg-white/5 transition"
              >
                <Edit2 size={12} />
              </button>
              <button
                type="button"
                onClick={() => void deleteChat(chat.id)}
                title="Delete Chat"
                className="rounded-md p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
              >
                <Trash2 size={12} />
              </button>
            </div>

            {/* Static Indicators when not hovered */}
            <div className="flex items-center gap-1 group-hover:hidden transition">
              {chat.pinned && <Pin size={11} className="text-amber-400" />}
              {chat.saved && <Bookmark size={11} className="text-cyan-400" />}
            </div>
          </>
        )}
      </div>
    )
  }

  // Total user interactions
  const totalMessages = useMemo(() => {
    return chats.reduce((total, chat) => total + (chat.messages_count ?? 0), 0)
  }, [chats])

  return (
    <main className="min-h-screen text-white bg-slate-950 p-2 sm:p-4 overflow-x-hidden">
      {/* Background Gradient Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] size-[50vw] rounded-full bg-cyan-500/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] size-[50vw] rounded-full bg-purple-500/10 blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto grid min-h-[calc(100vh-1rem)] sm:min-h-[calc(100vh-2rem)] max-w-[1550px] gap-3 lg:grid-cols-[290px_minmax(0,1fr)_310px]">
        
        {/* SIDEBAR CONTAINER */}
        <AnimatePresence>
          {(sidebarOpen || window.innerWidth >= 1024) && (
            <motion.aside
              initial={window.innerWidth < 1024 ? { x: -320, opacity: 0 } : false}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -320, opacity: 0 }}
              className={`glass flex flex-col rounded-2xl border border-white/10 bg-slate-900/80 p-4 shadow-2xl backdrop-blur-md z-40 ${
                window.innerWidth < 1024
                  ? 'fixed inset-y-4 left-4 w-[290px] h-[calc(100vh-2rem)]'
                  : 'h-full'
              }`}
            >
              {/* Header Logo */}
              <div className="flex items-center justify-between gap-3">
                <BrandMark />
                <button
                  aria-label="Close sidebar"
                  className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white transition lg:hidden"
                  onClick={() => setSidebarOpen(false)}
                  type="button"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 flex gap-2">
                <Button 
                  className="flex-1" 
                  icon={<Plus size={16} />} 
                  onClick={() => {
                    void createChat()
                    setSidebarOpen(false)
                  }} 
                  type="button"
                >
                  New chat
                </Button>
              </div>

              {/* Filtering / Sorting Controls */}
              <div className="mt-4 space-y-2">
                <label className="relative block">
                  <Search className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-500" size={15} />
                  <input
                    className="input-glass min-h-10 w-full rounded-lg pr-3 pl-9 text-xs placeholder:text-slate-500 focus:outline-none focus:border-cyan-400/40"
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search chats"
                    value={searchQuery}
                  />
                </label>

                <div className="flex items-center justify-between gap-1.5">
                  {/* Saved Chats Filter Tab */}
                  <button
                    onClick={() => setFilterSavedOnly(!filterSavedOnly)}
                    className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold border transition ${
                      filterSavedOnly
                        ? 'border-cyan-400 bg-cyan-400/10 text-cyan-200'
                        : 'border-white/5 bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Bookmark size={12} />
                    <span>Saved Chats</span>
                  </button>

                  {/* Sort Filter Selector */}
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-slate-500">Sort:</span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as 'date' | 'name')}
                      className="bg-transparent text-[11px] font-semibold text-slate-300 focus:outline-none cursor-pointer hover:text-white"
                    >
                      <option value="date" className="bg-slate-900 text-white">Date</option>
                      <option value="name" className="bg-slate-900 text-white">Name</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* CHATS HISTORY LIST */}
              <div className="mt-5 flex-1 space-y-4 overflow-y-auto pr-1 select-none scrollbar-thin">
                {isLoadingChats ? (
                  <div className="space-y-2 py-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-12 w-full animate-pulse rounded-xl bg-white/5" />
                    ))}
                  </div>
                ) : chats.length === 0 ? (
                  <div className="rounded-xl border border-white/5 bg-white/5 px-4 py-8 text-center">
                    <AlertCircle className="mx-auto text-slate-600 mb-2" size={20} />
                    <p className="text-xs text-slate-400 leading-5">No conversations found.</p>
                  </div>
                ) : (
                  <>
                    {/* Today */}
                    {groupedChats.today.length > 0 && (
                      <div className="space-y-1.5">
                        <h4 className="px-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                          <Calendar size={10} /> Today
                        </h4>
                        {groupedChats.today.map(renderChatItem)}
                      </div>
                    )}

                    {/* Yesterday */}
                    {groupedChats.yesterday.length > 0 && (
                      <div className="space-y-1.5">
                        <h4 className="px-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                          <Calendar size={10} /> Yesterday
                        </h4>
                        {groupedChats.yesterday.map(renderChatItem)}
                      </div>
                    )}

                    {/* Last 7 Days */}
                    {groupedChats.last7Days.length > 0 && (
                      <div className="space-y-1.5">
                        <h4 className="px-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                          <Calendar size={10} /> Last 7 Days
                        </h4>
                        {groupedChats.last7Days.map(renderChatItem)}
                      </div>
                    )}

                    {/* Last 30 Days */}
                    {groupedChats.last30Days.length > 0 && (
                      <div className="space-y-1.5">
                        <h4 className="px-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                          <Calendar size={10} /> Last 30 Days
                        </h4>
                        {groupedChats.last30Days.map(renderChatItem)}
                      </div>
                    )}

                    {/* Older */}
                    {groupedChats.older.length > 0 && (
                      <div className="space-y-1.5">
                        <h4 className="px-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                          <Calendar size={10} /> Older Conversations
                        </h4>
                        {groupedChats.older.map(renderChatItem)}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* FOOTER USER CARD */}
              <div className="mt-4 border-t border-white/10 pt-4 flex flex-col gap-3">
                <div 
                  onClick={() => setIsProfileOpen(true)}
                  className="flex items-center gap-2.5 rounded-xl border border-white/5 bg-white/5 p-2 hover:bg-white/10 cursor-pointer transition"
                >
                  <div className="size-9 overflow-hidden rounded-full bg-slate-800 border border-white/10">
                    {user?.avatar ? (
                      <img src={user.avatar} alt="User Avatar" className="size-full object-cover" />
                    ) : (
                      <div className="grid size-full place-items-center text-slate-300">
                        <User size={16} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-xs font-semibold text-white">{user?.name}</p>
                    <p className="truncate text-[10px] text-slate-500">@{user?.username}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setIsSettingsOpen(true)}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-white/5 bg-white/5 py-2 text-xs font-semibold text-slate-300 hover:bg-white/10 hover:text-white transition"
                  >
                    <Settings size={13} />
                    <span>Settings</span>
                  </button>
                  <button
                    onClick={() => void logout()}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-rose-500/20 bg-rose-500/10 py-2 text-xs font-semibold text-rose-300 hover:bg-rose-500/20 hover:text-rose-100 transition"
                  >
                    <LogOut size={13} />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* CHAT DISPLAY INTERFACE AREA */}
        <section className="glass flex flex-col rounded-2xl border border-white/10 bg-slate-900/60 shadow-2xl backdrop-blur-md overflow-hidden relative">
          
          {/* TOP NAVIGATION BAR */}
          <header className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3 bg-slate-900/80 backdrop-blur-md relative z-10">
            <div className="flex min-w-0 items-center gap-3">
              <button
                aria-label="Open sidebar"
                className="rounded-lg p-2 text-slate-300 hover:bg-white/10 hover:text-white transition lg:hidden"
                onClick={() => setSidebarOpen(true)}
                type="button"
              >
                <Menu size={18} />
              </button>
              
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="truncate text-sm font-semibold text-white">
                    {selectedChat?.title ?? 'NovaMind AI Studio'}
                  </p>
                  {selectedChat?.pinned && <Pin size={12} className="text-amber-400 shrink-0" />}
                  {selectedChat?.saved && <Bookmark size={12} className="text-cyan-400 shrink-0" />}
                </div>
                <p className="text-[10px] text-slate-500 leading-4">
                  {messages.length} messages · {settings.model}
                </p>
              </div>
            </div>

            {/* TOP BAR ACTIONS */}
            <div className="flex items-center gap-2">
              {/* Message Search Toggle */}
              {selectedChat && (
                <div className="relative flex items-center">
                  <AnimatePresence>
                    {showInChatSearch && (
                      <motion.input
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: 160, opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        placeholder="Search current chat..."
                        value={messageSearchQuery}
                        onChange={(e) => setMessageSearchQuery(e.target.value)}
                        className="rounded-lg bg-slate-950 border border-white/10 px-2.5 py-1 text-xs text-white focus:outline-none focus:border-cyan-400/40 mr-1.5"
                      />
                    )}
                  </AnimatePresence>
                  <button
                    onClick={() => {
                      setShowInChatSearch(!showInChatSearch)
                      if (showInChatSearch) setMessageSearchQuery('')
                    }}
                    title="Search Messages"
                    className={`rounded-lg p-1.5 transition ${
                      showInChatSearch ? 'bg-cyan-400/10 text-cyan-400' : 'text-slate-400 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {showInChatSearch ? <X size={15} /> : <Search size={15} />}
                  </button>
                </div>
              )}

              {/* Settings Action */}
              <button
                onClick={() => setIsSettingsOpen(true)}
                title="System Settings"
                className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition"
              >
                <Settings size={15} />
              </button>

              {/* Profile Action */}
              <button
                onClick={() => setIsProfileOpen(true)}
                title="Your Profile"
                className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition"
              >
                <User size={15} />
              </button>
            </div>
          </header>

          {/* MESSAGE AREA */}
          <div className="flex-1 overflow-y-auto px-4 py-5 scrollbar-thin flex flex-col gap-6">
            {isLoadingMessages ? (
              <div className="space-y-6 py-6">
                {[1, 2].map((i) => (
                  <div key={i} className={`flex gap-3 max-w-[75%] ${i % 2 === 0 ? 'ml-auto flex-row-reverse' : ''}`}>
                    <div className="size-8 animate-pulse rounded-full bg-white/5 shrink-0" />
                    <div className="space-y-2 w-full">
                      <div className="h-4 animate-pulse rounded bg-white/5 w-1/3" />
                      <div className="h-16 animate-pulse rounded-lg bg-white/5" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredMessages.length === 0 ? (
              /* EMPTY STATE */
              <div className="flex-1 grid place-items-center py-12 text-center select-none">
                <div className="max-w-md px-6">
                  {/* Holographic Glowing Sparkle */}
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 15, ease: 'linear' }}
                    className="mx-auto grid size-16 place-items-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.15)]"
                  >
                    <Sparkles size={30} />
                  </motion.div>
                  
                  <h2 className="mt-6 text-xl font-bold tracking-tight text-white sm:text-2xl">
                    Discover NovaMind AI
                  </h2>
                  <p className="mt-2 text-xs leading-relaxed text-slate-400">
                    Submit prompts, upload code templates, or files. NovaMind stores every conversation in your personal workspace database.
                  </p>

                  {/* Suggestion Prompts */}
                  <div className="grid gap-3.5 sm:grid-cols-2 mt-8">
                    {SUGGESTED_PROMPTS.map((promptItem, idx) => (
                      <button
                        key={idx}
                        onClick={() => setPrompt(promptItem.text)}
                        className="flex flex-col items-start gap-1 text-left rounded-xl border border-white/5 bg-white/5 p-3 hover:border-cyan-400/30 hover:bg-cyan-400/[0.03] transition duration-300"
                      >
                        <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                          {promptItem.category}
                        </span>
                        <span className="text-[11px] font-medium text-slate-200 line-clamp-2">
                          {promptItem.text}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* LIST OF MESSAGES */
              <div className="space-y-6">
                {filteredMessages.map((message) => {
                  const isUser = message.role === 'user'
                  return (
                    <motion.article
                      key={message.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex gap-3 max-w-[88%] sm:max-w-[78%] ${
                        isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'
                      }`}
                    >
                      {/* Avatar */}
                      <div className="size-8 rounded-full bg-slate-800 border border-white/10 overflow-hidden shrink-0 flex items-center justify-center">
                        {isUser ? (
                          user?.avatar ? (
                            <img src={user.avatar} alt="User" className="size-full object-cover" />
                          ) : (
                            <User size={14} className="text-slate-300" />
                          )
                        ) : (
                          <Sparkles size={14} className="text-cyan-400 animate-pulse" />
                        )}
                      </div>

                      {/* Content Card */}
                      <div
                        className={`rounded-xl border p-4 shadow-md ${
                          isUser
                            ? 'border-cyan-500/20 bg-gradient-to-br from-cyan-950/40 to-slate-900/60 text-cyan-50'
                            : 'border-white/5 bg-slate-900/50 text-slate-100'
                        }`}
                      >
                        {/* Meta */}
                        <div className="mb-2.5 flex items-center justify-between gap-6 text-[10px] text-slate-500 font-semibold">
                          <span className="uppercase tracking-wider">
                            {isUser ? user?.name : `NovaMind (${settings.model})`}
                          </span>
                          <span>{formatTime(message.created_at)}</span>
                        </div>

                        {/* Text Content */}
                        <p className="whitespace-pre-wrap text-xs sm:text-sm leading-relaxed font-normal">
                          {message.content}
                        </p>

                        {/* Attachments rendering */}
                        {message.attachments && message.attachments.length > 0 && (
                          <div className="mt-3.5 flex flex-wrap gap-2 pt-3 border-t border-white/5">
                            {message.attachments.map((file, idx) => {
                              const isImage = file.type.startsWith('image/')
                              return (
                                <a
                                  key={idx}
                                  href={file.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 rounded-lg border border-white/10 bg-slate-950/60 p-2 hover:bg-slate-950 transition max-w-[200px]"
                                >
                                  {isImage ? (
                                    <img src={file.url} alt={file.name} className="size-8 rounded object-cover" />
                                  ) : (
                                    <FileText size={16} className="text-cyan-400 shrink-0" />
                                  )}
                                  <div className="min-w-0 flex-1">
                                    <p className="truncate text-[10px] font-medium text-white">{file.name}</p>
                                    <p className="text-[8px] text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
                                  </div>
                                </a>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    </motion.article>
                  )
                })}
              </div>
            )}

            {/* TYPING SIMULATION INDICATOR */}
            {isSending && (
              <div className="flex gap-3 max-w-[70%]">
                <div className="size-8 rounded-full bg-slate-800 border border-white/10 overflow-hidden shrink-0 flex items-center justify-center">
                  <Sparkles size={14} className="text-cyan-400 animate-pulse" />
                </div>
                <div className="rounded-xl border border-white/5 bg-slate-900/50 p-4 flex items-center justify-center">
                  <div className="flex items-center gap-1.5">
                    <span className="size-1.5 animate-bounce rounded-full bg-cyan-400" style={{ animationDelay: '0ms' }} />
                    <span className="size-1.5 animate-bounce rounded-full bg-cyan-400" style={{ animationDelay: '150ms' }} />
                    <span className="size-1.5 animate-bounce rounded-full bg-cyan-400" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            {/* Scroll Anchor */}
            <div ref={messageEndRef} />
          </div>

          {/* INPUT FORM BLOCK */}
          <footer className="border-t border-white/10 p-3 sm:p-4 bg-slate-900/70 backdrop-blur-md">
            
            {/* Attachment pre-upload thumbnails bar */}
            {pendingAttachments.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-2 p-2 rounded-lg border border-white/5 bg-slate-950/40">
                {pendingAttachments.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-2 rounded-lg border border-white/10 bg-slate-900/80 p-1.5 pr-2.5 text-xs text-white max-w-[220px]"
                  >
                    {item.type.startsWith('image/') ? (
                      <ImageIcon size={14} className="text-emerald-400 shrink-0" />
                    ) : (
                      <Paperclip size={14} className="text-cyan-400 shrink-0" />
                    )}
                    <span className="truncate flex-1 font-medium text-[11px]">{item.name}</span>
                    <button
                      type="button"
                      onClick={() => removePendingAttachment(item.id)}
                      className="rounded hover:bg-white/10 p-0.5 text-slate-400 hover:text-white transition"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <form 
              onSubmit={handleSend}
              className="flex flex-col gap-2.5 rounded-xl border border-white/10 bg-white/5 p-2"
            >
              <textarea
                ref={textareaRef}
                rows={1}
                className="w-full resize-none bg-transparent px-3 py-2 text-xs sm:text-sm leading-relaxed text-white placeholder:text-slate-500 focus:outline-none scrollbar-none"
                placeholder={`Message NovaMind... (${settings.model})`}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isSending || isUploadingFiles}
              />

              <div className="flex items-center justify-between border-t border-white/5 pt-2 px-1">
                {/* Input Attachments Actions */}
                <div className="flex items-center gap-1">
                  
                  {/* File Upload Selector */}
                  <button
                    type="button"
                    onClick={() => triggerFileInput('all')}
                    disabled={isSending || isUploadingFiles}
                    title="Upload file/document"
                    className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white transition"
                  >
                    <Paperclip size={16} />
                  </button>

                  {/* Image Upload Selector */}
                  <button
                    type="button"
                    onClick={() => triggerFileInput('image')}
                    disabled={isSending || isUploadingFiles}
                    title="Upload image"
                    className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white transition"
                  >
                    <ImageIcon size={16} />
                  </button>

                  {/* Speech Dictation Button */}
                  <button
                    type="button"
                    onClick={() => toggleSpeechRecognition(handleVoiceTranscript)}
                    title={isListening ? 'Stop Voice Typing' : 'Voice Typing'}
                    className={`rounded-lg p-2 transition ${
                      isListening ? 'bg-red-500/20 text-red-400 animate-pulse' : 'text-slate-400 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    {isListening ? <MicOff size={16} /> : <Mic size={16} />}
                  </button>

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    multiple
                  />
                  <input
                    type="file"
                    ref={imageInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                    multiple
                  />
                </div>

                {/* Character Counter & Submit Actions */}
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-slate-500 font-semibold select-none">
                    {prompt.length} / 4000
                  </span>
                  
                  <Button
                    type="submit"
                    disabled={isSending || isUploadingFiles || (!prompt.trim() && pendingAttachments.length === 0)}
                    className="h-8 min-h-8 rounded-lg text-xs"
                    icon={isSending || isUploadingFiles ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                  >
                    {isSending ? 'Thinking' : isUploadingFiles ? 'Uploading' : 'Send'}
                  </Button>
                </div>
              </div>
            </form>
          </footer>
        </section>

        {/* WORKSPACE ANALYTICS PANEL */}
        <aside className="glass hidden flex-col gap-4 rounded-2xl border border-white/10 bg-slate-900/80 p-4 shadow-2xl backdrop-blur-md lg:flex h-full select-none">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Active Workspace</p>
              <h2 className="text-base font-bold text-white leading-5">{user?.name}</h2>
            </div>
            <div className="grid size-9 place-items-center rounded-xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-400">
              <Sparkles size={16} />
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="rounded-xl border border-white/5 bg-white/[0.03] p-3 text-center transition hover:bg-white/5 duration-300">
              <p className="text-xl font-black text-cyan-400">{chats.length}</p>
              <p className="text-[10px] font-medium text-slate-500">Chats Created</p>
            </div>
            <div className="rounded-xl border border-white/5 bg-white/[0.03] p-3 text-center transition hover:bg-white/5 duration-300">
              <p className="text-xl font-black text-purple-400">{totalMessages}</p>
              <p className="text-[10px] font-medium text-slate-500">Messages Stored</p>
            </div>
          </div>

          {/* Active Settings Panel preview */}
          <div className="rounded-xl border border-white/5 bg-white/[0.03] p-4 space-y-3.5">
            <h3 className="text-xs font-bold text-white border-b border-white/5 pb-2">Active Configurations</h3>
            
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Model:</span>
                <span className="font-semibold text-cyan-300 uppercase">{settings.model}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Language:</span>
                <span className="font-semibold text-slate-200 uppercase">{settings.language}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Theme:</span>
                <span className="font-semibold text-slate-200 uppercase">{settings.theme}</span>
              </div>
            </div>

            <Button
              className="w-full text-xs h-9 min-h-9"
              variant="secondary"
              onClick={() => setIsSettingsOpen(true)}
              icon={<Settings size={13} />}
            >
              Modify Settings
            </Button>
          </div>

          {/* Database protection note */}
          <div className="rounded-xl border border-emerald-500/10 bg-emerald-950/20 p-4 text-[11px] leading-relaxed text-emerald-200">
            <h4 className="font-bold text-emerald-300 mb-1 flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
              API Sandbox Synced
            </h4>
            NovaMind uses a SQLite/MySQL schema, routing file attachments and chat nodes through Sanctum-protected models.
          </div>
        </aside>
      </div>

      {/* SYSTEM MODALS CONTAINER */}
      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </main>
  )
}
