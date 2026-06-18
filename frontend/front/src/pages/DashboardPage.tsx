import { useState, useRef, useEffect, useMemo, type FormEvent, type KeyboardEvent, type ChangeEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bookmark,
  Check,
  ChevronDown,
  Edit2,
  FileText,
  Image as ImageIcon,
  Loader2,
  LogOut,
  Menu,
  MessageSquare,
  Mic,
  Paperclip,
  Pin,
  Plus,
  Search,
  Settings,
  Sparkles,
  Trash2,
  User,
  Volume2,
  VolumeX,
  X,
  PanelLeftClose,
  PanelLeft,
  Folder,
  Library as LibraryIcon,
  Grid,
  MoreHorizontal,
  ArrowUp,
  HelpCircle,
  Maximize2,
  Minimize2,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  FileDown,
  Edit3,
  Copy
} from 'lucide-react'
import { MarkdownRenderer } from '../components/ui/MarkdownRenderer'
import { useAuth } from '../context/useAuth'
import { useChat, type ExtendedChat, type Attachment, type ExtendedMessage } from '../context/ChatContext'
import { useToast } from '../context/ToastContext'
import { ProfileModal, SettingsModal } from '../components/ui/Modals'

export function DashboardPage() {
  const { logout, user } = useAuth()
  const {
    chats,
    selectedChat,
    messages,
    isLoadingChats,
    isLoadingMessages,
    isSending,
    isThinking,
    searchQuery,
    setSearchQuery,
    selectChat,
    createChat,
    renameChat,
    deleteChat,
    togglePinChat,
    sendMessage,
    setMessages,
    uploadFile,
    isListening,
    toggleSpeechRecognition,
    speakingMessageId,
    speakText,
  } = useChat()

  const { showToast } = useToast()

  // Responsiveness States
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024)
  const [isTablet, setIsTablet] = useState(window.innerWidth >= 768 && window.innerWidth < 1024)

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth
      setIsDesktop(w >= 1024)
      setIsTablet(w >= 768 && w < 1024)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Layout Controls
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
  const [mobileProfileDropdownOpen, setMobileProfileDropdownOpen] = useState(false)
  const [activeMenuChatId, setActiveMenuChatId] = useState<number | null>(null)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  // Input states
  const [prompt, setPrompt] = useState('')
  const [pendingAttachments, setPendingAttachments] = useState<{ id: string; name: string; type: string; size: number; file: File }[]>([])
  const [isUploadingFiles, setIsUploadingFiles] = useState(false)
  const [showScrollFAB, setShowScrollFAB] = useState(false)

  // In-place rename
  const [renamingId, setRenamingId] = useState<number | null>(null)
  const [renameValue, setRenameValue] = useState('')

  // Fullscreen, prompt editing, and rating states
  const [isFullscreen, setIsFullscreen] = useState(() => {
    const saved = localStorage.getItem('novamind_ui_settings')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        return !!parsed.fullscreenDefault
      } catch {
        return false
      }
    }
    return false
  })
  const [editingMessageId, setEditingMessageId] = useState<number | null>(null)
  const [editContent, setEditContent] = useState('')
  const [likes, setLikes] = useState<Record<number, boolean>>({})
  const [dislikes, setDislikes] = useState<Record<number, boolean>>({})
  const [openDownloadId, setOpenDownloadId] = useState<number | null>(null)

  // Listen for ESC key to exit fullscreen
  useEffect(() => {
    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsFullscreen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const toggleLike = (msgId: number) => {
    setLikes((prev) => ({ ...prev, [msgId]: !prev[msgId] }))
    setDislikes((prev) => ({ ...prev, [msgId]: false }))
  }

  const toggleDislike = (msgId: number) => {
    setDislikes((prev) => ({ ...prev, [msgId]: !prev[msgId] }))
    setLikes((prev) => ({ ...prev, [msgId]: false }))
  }

  const handleCopyResponse = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      showToast('Response copied to clipboard', 'success')
    } catch {
      showToast('Failed to copy response', 'error')
    }
  }

  const handleRegenerate = async (msg: ExtendedMessage) => {
    const msgIndex = messages.findIndex((m) => m.id === msg.id)
    if (msgIndex <= 0) return

    const prevUserMsg = messages[msgIndex - 1]
    if (prevUserMsg && prevUserMsg.role === 'user') {
      // Remove this assistant message locally first to give instant feedback
      setMessages((prev) => prev.filter((m) => m.id !== msg.id))
      await sendMessage(prevUserMsg.content, prevUserMsg.attachments ?? [])
    }
  }

  const handleEditPrompt = (msg: ExtendedMessage) => {
    const msgIndex = messages.findIndex((m) => m.id === msg.id)
    if (msgIndex <= 0) return

    const prevUserMsg = messages[msgIndex - 1]
    if (prevUserMsg && prevUserMsg.role === 'user') {
      setEditingMessageId(prevUserMsg.id)
      setEditContent(prevUserMsg.content)
    }
  }

  const handleSaveEditPrompt = async (msgId: number) => {
    if (!editContent.trim()) return
    setEditingMessageId(null)
    const msgIndex = messages.findIndex((m) => m.id === msgId)
    if (msgIndex === -1) return

    await sendMessage(editContent.trim())
  }

  const downloadTXT = (text: string) => {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'novamind-ai-response.txt'
    link.click()
    URL.revokeObjectURL(url)
  }

  const downloadMD = (text: string) => {
    const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'novamind-ai-response.md'
    link.click()
    URL.revokeObjectURL(url)
  }

  const downloadPDF = async (text: string) => {
    try {
      const { jsPDF } = await import('jspdf')
      const doc = new jsPDF()
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(11)
      const pageLines = doc.splitTextToSize(text, 180)
      let y = 15
      const pageHeight = doc.internal.pageSize.height
      for (let i = 0; i < pageLines.length; i++) {
        if (y > pageHeight - 15) {
          doc.addPage()
          y = 15
        }
        doc.text(pageLines[i], 15, y)
        y += 6
      }
      doc.save('novamind-ai-response.pdf')
    } catch (err) {
      console.error('Failed to download PDF:', err)
      showToast('Failed to export PDF', 'error')
    }
  }

  // Refs
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const messageEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)

  // Scroll handler for FAB
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget
    const threshold = 150
    const isScrollUp = target.scrollHeight - target.scrollTop - target.clientHeight > threshold
    setShowScrollFAB(isScrollUp)
  }

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

  // Filter messages based on search query
  const [messageSearchQuery] = useState('')
  const filteredMessages = useMemo(() => {
    if (!messageSearchQuery.trim()) return messages
    return messages.filter((msg) =>
      msg.content.toLowerCase().includes(messageSearchQuery.toLowerCase())
    )
  }, [messages, messageSearchQuery])

  // Grouped chats history
  const pinnedChats = useMemo(() => {
    return chats.filter((chat) => chat.pinned)
  }, [chats])

  const recentChats = useMemo(() => {
    return chats.filter((chat) => !chat.pinned)
  }, [chats])

  // File Upload Handlers
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
    e.target.value = '' 
  }

  const removePendingAttachment = (id: string) => {
    setPendingAttachments((prev) => prev.filter((item) => item.id !== id))
  }

  // Voice dictation transcription handler
  const handleVoiceTranscript = (text: string) => {
    setPrompt((prev) => (prev ? prev + ' ' + text : text))
  }

  // Send message
  const handleSend = async (e?: FormEvent) => {
    if (e) e.preventDefault()
    const text = prompt.trim()
    if (!text && pendingAttachments.length === 0) return
    if (isSending) return

    setPrompt('')
    setIsUploadingFiles(true)

    try {
      const uploadedAttachments: Attachment[] = []
      for (const attachment of pendingAttachments) {
        const uploaded = await uploadFile(attachment.file)
        uploadedAttachments.push(uploaded)
      }

      setPendingAttachments([])
      setIsUploadingFiles(false)
      await sendMessage(text, uploadedAttachments)
    } catch {
      showToast('Error sending message: files failed to upload.', 'error')
      setIsUploadingFiles(false)
    }
  }

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

  // Date Formatting
  const formatTime = (value: string | null): string => {
    if (!value) return ''
    return new Intl.DateTimeFormat(undefined, {
      hour: 'numeric',
      minute: '2-digit',
    }).format(new Date(value))
  }

  // Sidebar chat history item renderer
  const renderSidebarChatItem = (chat: ExtendedChat) => {
    const isSelected = selectedChat?.id === chat.id
    const isRenaming = renamingId === chat.id

    return (
      <div
        key={chat.id}
        className={`group relative flex items-center justify-between rounded-lg px-3 py-2.5 transition duration-150 ${
          isSelected
            ? 'bg-white/10 text-white font-medium shadow-sm'
            : 'text-slate-350 hover:bg-white/5 hover:text-white'
        }`}
      >
        {isRenaming ? (
          <div className="flex w-full items-center gap-1.5 z-10">
            <input
              type="text"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              className="w-full rounded bg-slate-950 px-2 py-0.5 text-xs text-white border border-white/10 focus:border-indigo-500 focus:outline-none"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') void saveRename(chat.id)
                if (e.key === 'Escape') setRenamingId(null)
              }}
            />
            <button
              onClick={() => void saveRename(chat.id)}
              className="rounded bg-indigo-505 bg-indigo-500 p-0.5 text-white transition hover:bg-indigo-600"
            >
              <Check size={11} />
            </button>
            <button
              onClick={() => setRenamingId(null)}
              className="rounded bg-white/10 p-0.5 text-white transition hover:bg-white/20"
            >
              <X size={11} />
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
              className="flex flex-1 items-center gap-2.5 text-left min-w-0 animate-none"
            >
              <MessageSquare
                className={`shrink-0 ${isSelected ? 'text-white' : 'text-slate-400 group-hover:text-white'}`}
                size={14}
              />
              {!sidebarCollapsed && (
                <div className="min-w-0 flex-1">
                  <span className="block truncate text-xs">
                    {chat.title}
                  </span>
                </div>
              )}
            </button>

            {/* Hover Actions: Show ONLY the Three-Dots Menu icon */}
            {!sidebarCollapsed && (
              <div className="relative flex items-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setActiveMenuChatId(activeMenuChatId === chat.id ? null : chat.id)
                  }}
                  className="rounded p-1 text-slate-400 hover:text-white transition shrink-0"
                  title="More actions"
                >
                  <MoreHorizontal size={14} />
                </button>

                <AnimatePresence>
                  {activeMenuChatId === chat.id && (
                    <>
                      <div 
                        className="fixed inset-0 z-40" 
                        onClick={(e) => {
                          e.stopPropagation()
                          setActiveMenuChatId(null)
                        }}
                      />
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 5 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 5 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-1 z-50 w-36 rounded-lg border border-white/10 bg-[#212121] p-1 shadow-xl text-left"
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setActiveMenuChatId(null)
                            void togglePinChat(chat)
                          }}
                          className="w-full flex items-center gap-1.5 px-2 py-1.5 rounded hover:bg-white/5 text-[11px] text-slate-200 transition"
                        >
                          <Pin size={10} />
                          {chat.pinned ? 'Unpin Chat' : 'Pin Chat'}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setActiveMenuChatId(null)
                            startRenaming(chat)
                          }}
                          className="w-full flex items-center gap-1.5 px-2 py-1.5 rounded hover:bg-white/5 text-[11px] text-slate-200 transition"
                        >
                          <Edit2 size={10} />
                          Rename Chat
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setActiveMenuChatId(null)
                            showToast('Chat archived successfully!', 'success')
                          }}
                          className="w-full flex items-center gap-1.5 px-2 py-1.5 rounded hover:bg-white/5 text-[11px] text-slate-200 transition"
                        >
                          <Bookmark size={10} />
                          Archive Chat
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setActiveMenuChatId(null)
                            const link = `${window.location.origin}/dashboard?chat=${chat.id}`
                            void navigator.clipboard.writeText(link)
                            showToast('Link copied to clipboard!', 'success')
                          }}
                          className="w-full flex items-center gap-1.5 px-2 py-1.5 rounded hover:bg-white/5 text-[11px] text-slate-200 transition"
                        >
                          <FileText size={10} />
                          Copy Link
                        </button>
                        <div className="h-px bg-white/5 my-0.5" />
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setActiveMenuChatId(null)
                            void deleteChat(chat.id)
                          }}
                          className="w-full flex items-center gap-1.5 px-2 py-1.5 rounded hover:bg-rose-500/10 text-[11px] text-rose-400 transition"
                        >
                          <Trash2 size={10} />
                          Delete Chat
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Static Indicators when not hovered */}
            {!sidebarCollapsed && (
              <div className="flex items-center gap-0.5 group-hover:hidden transition">
                {chat.pinned && <Pin size={10} className="text-amber-400" />}
              </div>
            )}
          </>
        )}
      </div>
    )
  }

  return (
    <main className="min-h-screen text-[#ececec] bg-[#171717] font-sans relative overflow-x-hidden">
      <div className="relative z-10 flex min-h-screen">
        
        {/* FIXED LEFT SIDEBAR (Desktop / Tablet) */}
        <aside
          className={`fixed top-0 left-0 h-screen bg-[#0d0d0d] border-r border-white/[0.05] z-30 transition-all duration-300 select-none flex-col ${
            isFullscreen ? 'hidden' : 'hidden md:flex'
          } ${
            sidebarCollapsed ? 'w-[75px]' : 'w-[280px]'
          }`}
        >
          {/* Top Header Section */}
          <div className="h-[60px] flex items-center justify-between px-3.5 border-b border-white/[0.05]">
            {!sidebarCollapsed ? (
              <>
                <div className="flex items-center gap-2 overflow-hidden select-none">
                  <img src="/favicon.svg" alt="NovaMind Logo" className="size-6" />
                  <span className="text-sm font-semibold tracking-wide text-white">
                    NovaMind AI
                  </span>
                </div>
                <button
                  onClick={() => setSidebarCollapsed(true)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-white/5 hover:text-white transition animate-none"
                  title="Collapse Sidebar"
                >
                  <PanelLeftClose size={16} />
                </button>
              </>
            ) : (
              <div className="relative w-full h-9 flex items-center justify-center group">
                {/* Logo (shown by default, hidden on hover) */}
                <div className="group-hover:opacity-0 group-hover:scale-75 transition-all duration-200">
                  <img src="/favicon.svg" alt="NovaMind Logo" className="size-6" />
                </div>
                {/* Expand button (hidden by default, shown on hover) */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200">
                  <button
                    onClick={() => setSidebarCollapsed(false)}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-white/5 hover:text-white transition animate-none"
                    title="Expand Sidebar"
                  >
                    <PanelLeft size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Main Navigation Items */}
          <div className="px-2 pt-2 space-y-0.5">
            {/* New chat */}
            <button
              onClick={() => void createChat()}
              className="w-full flex items-center justify-between gap-2.5 px-3 py-2.5 rounded-lg text-xs font-semibold text-slate-200 hover:bg-white/5 transition duration-150"
            >
              <div className="flex items-center gap-2.5">
                <Plus size={16} className="text-slate-400" />
                {!sidebarCollapsed && <span>New chat</span>}
              </div>
            </button>

            {/* Library */}
            <button
              onClick={() => showToast('Library feature coming soon!', 'info')}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-semibold text-slate-200 hover:bg-white/5 transition duration-150"
            >
              <LibraryIcon size={16} className="text-slate-400" />
              {!sidebarCollapsed && <span>Library</span>}
            </button>

            {/* Projects */}
            <div className="w-full flex items-center justify-between rounded-lg hover:bg-white/5 transition duration-150">
              <button
                onClick={() => showToast('Projects folder coming soon!', 'info')}
                className="flex-1 flex items-center gap-2.5 px-3 py-2.5 text-xs font-semibold text-slate-200 text-left"
              >
                <Folder size={16} className="text-slate-400" />
                {!sidebarCollapsed && <span>Projects</span>}
              </button>
              {!sidebarCollapsed && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    void createChat()
                  }}
                  className="p-1 text-slate-400 hover:text-white mr-2"
                  title="Create chat in projects"
                >
                  <Plus size={14} />
                </button>
              )}
            </div>

            {/* Apps */}
            <button
              onClick={() => showToast('Apps store coming soon!', 'info')}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-semibold text-slate-200 hover:bg-white/5 transition duration-150"
            >
              <Grid size={16} className="text-slate-400" />
              {!sidebarCollapsed && <span>Apps</span>}
            </button>

            {/* More */}
            <button
              onClick={() => showToast('More options coming soon!', 'info')}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-semibold text-slate-200 hover:bg-white/5 transition duration-150"
            >
              <MoreHorizontal size={16} className="text-slate-400" />
              {!sidebarCollapsed && <span>More</span>}
            </button>
          </div>

          {/* Search bar inside sidebar when expanded */}
          {!sidebarCollapsed && searchQuery.trim() && (
            <div className="px-3 pb-2 pt-4">
              <div className="relative">
                <Search className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-500" size={13} />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-glass min-h-9 w-full rounded-xl pr-3 pl-8 text-xs placeholder:text-slate-500 focus:outline-none"
                  placeholder="Filter chats..."
                />
              </div>
            </div>
          )}

          {/* Chat History Group list (scrolls internally) */}
          <div className="flex-1 overflow-y-auto px-2 py-4 space-y-4 scrollbar-thin select-none">
            {isLoadingChats ? (
              <div className="space-y-2 py-4 px-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-9 w-full animate-pulse rounded-lg bg-white/5" />
                ))}
              </div>
            ) : chats.length === 0 ? (
              !sidebarCollapsed && (
                <p className="text-[10px] text-slate-600 text-center py-6">No chats recorded.</p>
              )
            ) : (
              <>
                {/* Pinned Chats */}
                {pinnedChats.length > 0 && (
                  <div className="space-y-0.5">
                    {!sidebarCollapsed && (
                      <h4 className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">Pinned</h4>
                    )}
                    {pinnedChats.map(renderSidebarChatItem)}
                  </div>
                )}

                {/* Recent Chats */}
                {recentChats.length > 0 && (
                  <div className="space-y-0.5">
                    {!sidebarCollapsed && (
                      <h4 className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">Recents</h4>
                    )}
                    {recentChats.map(renderSidebarChatItem)}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Bottom Sidebar actions */}
          <div className="p-2 border-t border-white/[0.05] bg-transparent flex flex-col gap-2 relative">
            {/* Interactive Profile Dropdown Popover */}
            <AnimatePresence>
              {profileDropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setProfileDropdownOpen(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute bottom-full left-2 right-2 mb-2 z-50 rounded-2xl border border-white/10 bg-[#212121] p-1.5 shadow-2xl"
                  >
                    <button
                      onClick={() => {
                        setIsProfileOpen(true)
                        setProfileDropdownOpen(false)
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium text-slate-200 hover:bg-white/5 transition text-left animate-none"
                    >
                      <User size={14} className="text-slate-400" />
                      Profile
                    </button>
                    <button
                      onClick={() => {
                        setIsSettingsOpen(true)
                        setProfileDropdownOpen(false)
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium text-slate-200 hover:bg-white/5 transition text-left animate-none"
                    >
                      <Settings size={14} className="text-slate-400" />
                      Settings
                    </button>
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false)
                        showToast('For help, contact support@novamind.ai', 'info')
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium text-slate-200 hover:bg-white/5 transition text-left animate-none"
                    >
                      <HelpCircle size={14} className="text-slate-400" />
                      Help
                    </button>
                    <div className="h-px bg-white/5 my-1" />
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false)
                        void logout()
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium text-rose-450 text-rose-400 transition text-left animate-none"
                    >
                      <LogOut size={14} />
                      Logout
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>

            {/* Profile trigger card with background glow and hover effects */}
            <div 
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center gap-2.5 p-2 rounded-xl border border-transparent hover:border-indigo-500/20 hover:bg-indigo-500/[0.03] hover:shadow-[0_0_12px_rgba(99,102,241,0.08)] cursor-pointer transition-all duration-300 select-none group"
            >
              <div className="size-8 overflow-hidden rounded-full bg-slate-800 shrink-0 border border-white/10 group-hover:border-indigo-500/30 transition-colors duration-300">
                {user?.avatar ? (
                  <img src={user.avatar} alt="User Avatar" className="size-full object-cover" />
                ) : (
                  <div className="grid size-full place-items-center text-slate-350 group-hover:text-indigo-300 transition-colors duration-300">
                    <User size={13} />
                  </div>
                )}
              </div>
              {!sidebarCollapsed && (
                <div className="flex-1 min-w-0 flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-slate-200 group-hover:text-white transition-colors duration-300">{user?.name}</p>
                    <p className="truncate text-[9px] text-slate-500 group-hover:text-indigo-400/70 transition-colors duration-300">Go</p>
                  </div>
                  <MoreHorizontal size={14} className="text-slate-400 group-hover:text-white transition-colors duration-300 shrink-0" />
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* MOBILE SIDEBAR DRAWER overlay */}
        <AnimatePresence>
          {sidebarOpen && (
            <div className="fixed inset-0 z-50 md:hidden flex">
              {/* Drawer Overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSidebarOpen(false)}
                className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
              />

              {/* Drawer Container (matches desktop sidebar layout) */}
              <motion.aside
                initial={{ x: -280 }}
                animate={{ x: 0 }}
                exit={{ x: -280 }}
                transition={{ type: 'tween', duration: 0.3 }}
                className="relative z-10 w-[280px] h-full bg-[#0d0d0d] border-r border-white/5 flex flex-col shadow-2xl"
              >
                {/* Mobile Drawer Header */}
                <div className="h-[60px] flex items-center justify-between px-3.5 border-b border-white/[0.05]">
                  <div className="flex items-center gap-2 select-none">
                    <img src="/favicon.svg" alt="NovaMind Logo" className="size-6" />
                    <span className="text-sm font-semibold tracking-wide text-white">
                      NovaMind AI
                    </span>
                  </div>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-white/5 hover:text-white transition"
                    title="Close sidebar"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Mobile Drawer Main Navigation Items */}
                <div className="px-2 pt-2 space-y-0.5">
                  {/* New chat */}
                  <button
                    onClick={() => {
                      void createChat()
                      setSidebarOpen(false)
                    }}
                    className="w-full flex items-center justify-between gap-2.5 px-3 py-2.5 rounded-lg text-xs font-semibold text-slate-200 hover:bg-white/5 transition duration-150"
                  >
                    <div className="flex items-center gap-2.5">
                      <Plus size={16} className="text-slate-400" />
                      <span>New chat</span>
                    </div>
                  </button>

                  {/* Library */}
                  <button
                    onClick={() => {
                      showToast('Library feature coming soon!', 'info')
                      setSidebarOpen(false)
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-semibold text-slate-200 hover:bg-white/5 transition duration-150"
                  >
                    <LibraryIcon size={16} className="text-slate-400" />
                    <span>Library</span>
                  </button>

                  {/* Projects */}
                  <div className="w-full flex items-center justify-between rounded-lg hover:bg-white/5 transition duration-150">
                    <button
                      onClick={() => {
                        showToast('Projects folder coming soon!', 'info')
                        setSidebarOpen(false)
                      }}
                      className="flex-1 flex items-center gap-2.5 px-3 py-2.5 text-xs font-semibold text-slate-200 text-left"
                    >
                      <Folder size={16} className="text-slate-400" />
                      <span>Projects</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        void createChat()
                        setSidebarOpen(false)
                      }}
                      className="p-1 text-slate-400 hover:text-white mr-2"
                      title="Create chat in projects"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  {/* Apps */}
                  <button
                    onClick={() => {
                      showToast('Apps store coming soon!', 'info')
                      setSidebarOpen(false)
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-semibold text-slate-200 hover:bg-white/5 transition duration-150"
                  >
                    <Grid size={16} className="text-slate-400" />
                    <span>Apps</span>
                  </button>

                  {/* More */}
                  <button
                    onClick={() => {
                      showToast('More options coming soon!', 'info')
                      setSidebarOpen(false)
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-semibold text-slate-200 hover:bg-white/5 transition duration-150"
                  >
                    <MoreHorizontal size={16} className="text-slate-400" />
                    <span>More</span>
                  </button>
                </div>

                {/* Search query box when active */}
                {searchQuery.trim() && (
                  <div className="px-3 pb-2 pt-4">
                    <div className="relative">
                      <Search className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-500" size={13} />
                      <input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="input-glass min-h-9 w-full rounded-xl pr-3 pl-8 text-xs placeholder:text-slate-500 focus:outline-none"
                        placeholder="Filter chats..."
                      />
                    </div>
                  </div>
                )}

                {/* Chat History Group list (scrolls internally) */}
                <div className="flex-1 overflow-y-auto px-2 py-4 space-y-4 scrollbar-thin select-none">
                  {isLoadingChats ? (
                    <div className="space-y-2 py-4 px-2">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="h-9 w-full animate-pulse rounded-lg bg-white/5" />
                      ))}
                    </div>
                  ) : chats.length === 0 ? (
                    <p className="text-[10px] text-slate-600 text-center py-6">No chats recorded.</p>
                  ) : (
                    <>
                      {/* Pinned Chats */}
                      {pinnedChats.length > 0 && (
                        <div className="space-y-0.5">
                          <h4 className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">Pinned</h4>
                          {pinnedChats.map(renderSidebarChatItem)}
                        </div>
                      )}

                      {/* Recent Chats */}
                      {recentChats.length > 0 && (
                        <div className="space-y-0.5">
                          <h4 className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">Recents</h4>
                          {recentChats.map(renderSidebarChatItem)}
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Mobile Drawer Footer User Panel */}
                <div className="p-2 border-t border-white/[0.05] bg-transparent flex flex-col gap-2 relative">
                  {/* Interactive Profile Dropdown Popover */}
                  <AnimatePresence>
                    {mobileProfileDropdownOpen && (
                      <>
                        <div 
                          className="fixed inset-0 z-40" 
                          onClick={() => setMobileProfileDropdownOpen(false)}
                        />
                        <motion.div
                          initial={{ opacity: 0, y: 8, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 8, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                          className="absolute bottom-full left-2 right-2 mb-2 z-50 rounded-2xl border border-white/10 bg-[#212121] p-1.5 shadow-2xl"
                        >
                          <button
                            onClick={() => {
                              setIsProfileOpen(true)
                              setSidebarOpen(false)
                              setMobileProfileDropdownOpen(false)
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium text-slate-200 hover:bg-white/5 transition text-left animate-none"
                          >
                            <User size={14} className="text-slate-400" />
                            Profile
                          </button>
                          <button
                            onClick={() => {
                              setIsSettingsOpen(true)
                              setSidebarOpen(false)
                              setMobileProfileDropdownOpen(false)
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium text-slate-200 hover:bg-white/5 transition text-left animate-none"
                          >
                            <Settings size={14} className="text-slate-400" />
                            Settings
                          </button>
                          <button
                            onClick={() => {
                              setMobileProfileDropdownOpen(false)
                              setSidebarOpen(false)
                              showToast('For help, contact support@novamind.ai', 'info')
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium text-slate-200 hover:bg-white/5 transition text-left animate-none"
                          >
                            <HelpCircle size={14} className="text-slate-400" />
                            Help
                          </button>
                          <div className="h-px bg-white/5 my-1" />
                          <button
                            onClick={() => {
                              setMobileProfileDropdownOpen(false)
                              setSidebarOpen(false)
                              void logout()
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium text-rose-400 hover:bg-rose-500/10 transition text-left animate-none"
                          >
                            <LogOut size={14} />
                            Logout
                          </button>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>

                  <div 
                    onClick={() => setMobileProfileDropdownOpen(!mobileProfileDropdownOpen)}
                    className="flex items-center gap-2.5 p-2 rounded-xl border border-transparent hover:border-indigo-500/20 hover:bg-indigo-500/[0.03] hover:shadow-[0_0_12px_rgba(99,102,241,0.08)] cursor-pointer transition-all duration-300 select-none group"
                  >
                    <div className="size-8 overflow-hidden rounded-full bg-slate-800 shrink-0 border border-white/10 group-hover:border-indigo-500/30 transition-colors duration-300">
                      {user?.avatar ? (
                        <img src={user.avatar} alt="User Avatar" className="size-full object-cover" />
                      ) : (
                        <div className="grid size-full place-items-center text-slate-350 group-hover:text-indigo-300 transition-colors duration-300">
                          <User size={13} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 flex items-center justify-between">
                      <div>
                        <p className="truncate text-xs font-semibold text-slate-200 group-hover:text-white transition-colors duration-300">{user?.name}</p>
                        <p className="truncate text-[9px] text-slate-500 group-hover:text-indigo-400/70 transition-colors duration-300">Go</p>
                      </div>
                      <MoreHorizontal size={14} className="text-slate-400 group-hover:text-white transition-colors duration-300 shrink-0" />
                    </div>
                  </div>
                </div>
              </motion.aside>
            </div>
          )}
        </AnimatePresence>

        {/* MAIN PANEL CONTENT VIEWPORT */}
        <div 
          className="flex-1 flex flex-col min-h-screen transition-all duration-300 bg-[#171717] min-w-0"
          style={{
            paddingLeft: isFullscreen
              ? '0px'
              : (isDesktop || isTablet
                ? (sidebarCollapsed ? '75px' : '280px') 
                : '0px')
          }}
        >
          
          {/* STICKY TOP NAVIGATION BAR */}
          <header className="h-[60px] sticky top-0 bg-[#171717]/85 backdrop-blur-md px-6 flex items-center justify-between z-20 select-none border-b border-white/[0.03]">
            <div className="flex items-center gap-3">
              {/* Sidebar mobile toggle trigger */}
              {!isFullscreen && (
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="rounded-lg p-2 text-slate-300 hover:bg-white/5 hover:text-white transition md:hidden mr-1 shrink-0"
                  title="Open menu"
                >
                  <Menu size={18} />
                </button>
              )}

              {/* Favicon Logo & Name */}
              <div className="flex items-center gap-2 select-none">
                <img src="/favicon.svg" alt="NovaMind Logo" className="size-6 shrink-0" />
                <span className="text-sm font-semibold tracking-wide text-white">
                  NovaMind AI
                </span>
              </div>
            </div>

            {/* Expand / Fullscreen Chat Mode Button */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="rounded-lg px-3 py-1.5 text-slate-300 hover:bg-white/5 hover:text-white border border-white/5 hover:border-white/10 rounded-xl transition shrink-0 flex items-center gap-1.5 text-xs font-semibold select-none"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Chat'}
            >
              {isFullscreen ? (
                <>
                  <Minimize2 size={14} className="text-indigo-400" />
                  <span className="hidden sm:inline">Exit Fullscreen</span>
                </>
              ) : (
                <>
                  <Maximize2 size={14} />
                  <span className="hidden sm:inline">Fullscreen</span>
                </>
              )}
            </button>
          </header>

          {/* CHAT MESSAGES PANEL */}
          <div 
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto scrollbar-thin px-4 py-6 pb-36 flex flex-col gap-6 bg-[#171717]"
          >
            <div className="w-full max-w-[768px] mx-auto flex-1 flex flex-col justify-between">
              
              {isLoadingMessages ? (
                <div className="space-y-6 py-6 flex-1">
                  {[1, 2].map((i) => (
                    <div key={i} className={`flex gap-3 max-w-[70%] ${i % 2 === 0 ? 'ml-auto flex-row-reverse' : ''}`}>
                      <div className="size-8 animate-pulse rounded-full bg-white/5 shrink-0" />
                      <div className="space-y-2 w-full">
                        <div className="h-4 animate-pulse rounded bg-white/5 w-1/3" />
                        <div className="h-20 animate-pulse rounded-2xl bg-white/5" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredMessages.length === 0 ? (
                
                /* EMPTY STATE INTRO CARD: Personalized User Welcome Greeting */
                <div className="flex-1 flex flex-col items-center justify-center py-20 text-center select-none px-4">
                  <div className="max-w-md space-y-4">
                    <motion.div 
                      animate={{ rotate: [0, 5, -5, 0] }}
                      transition={{ repeat: Infinity, duration: 8, ease: 'linear' }}
                      className="mx-auto grid size-12 place-items-center rounded-xl border border-transparent bg-indigo-500/10 text-[#6366F1]"
                    >
                      <Sparkles size={24} />
                    </motion.div>
                    
                    <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                      Hello, {user?.name || user?.username || 'User'}
                    </h1>
                    <p className="text-sm text-slate-400 font-medium max-w-sm mx-auto leading-relaxed">
                      How can I help you today? Ask me anything about coding, database design, or general reasoning.
                    </p>
                  </div>
                </div>

              ) : (
                
                /* CHAT MESSAGES LIST */
                <div className="space-y-6">
                  {filteredMessages.map((message: ExtendedMessage) => {
                    const isUser = message.role === 'user'
                    return (
                      <motion.article
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`w-full ${isUser ? 'flex flex-col items-end' : 'flex gap-4'}`}
                      >
                        {isUser ? (
                          /* User Prompt Bubble */
                          <div 
                            className="w-full max-w-[80%] bg-[#2f2f2f] text-[#ececec] rounded-2xl px-4 py-3 shadow-md space-y-2 relative group border border-white/5"
                            style={{ contentVisibility: 'auto', containIntrinsicSize: '100px' }}
                          >
                            {editingMessageId === message.id ? (
                              <div className="space-y-2.5">
                                <textarea
                                  value={editContent}
                                  onChange={(e) => setEditContent(e.target.value)}
                                  className="w-full min-h-[80px] bg-slate-900 text-white rounded-lg p-2.5 text-sm focus:outline-none border border-indigo-500/40"
                                  autoFocus
                                />
                                <div className="flex justify-end gap-2 text-xs">
                                  <button
                                    onClick={() => setEditingMessageId(null)}
                                    className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 font-medium transition"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    onClick={() => handleSaveEditPrompt(message.id)}
                                    className="px-3 py-1.5 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white font-medium transition"
                                  >
                                    Save & Submit
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <>
                                {/* Actions/Details Header */}
                                <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium select-none">
                                  <button
                                    onClick={() => {
                                      setEditingMessageId(message.id)
                                      setEditContent(message.content)
                                    }}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 text-indigo-400 hover:underline hover:text-indigo-300 text-left font-semibold"
                                  >
                                    Edit
                                  </button>
                                  <div className="opacity-0 group-hover:opacity-100 transition duration-150 flex items-center gap-2">
                                    <span>{formatTime(message.created_at)}</span>
                                  </div>
                                </div>
                                {/* Content */}
                                <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-100">
                                  {message.content}
                                </p>
                              </>
                            )}
                          </div>
                        ) : (
                          /* Assistant Response (Plain backdrop) */
                          <>
                            {/* AI Avatar */}
                            <div className="size-8 rounded-full bg-slate-900 border border-white/10 overflow-hidden shrink-0 flex items-center justify-center select-none">
                              <Sparkles size={14} className="text-indigo-400 animate-pulse" />
                            </div>

                            {/* Content Block */}
                            <div 
                              className="flex-1 space-y-3 max-w-[850px] group relative"
                              style={{ contentVisibility: 'auto', containIntrinsicSize: '150px' }}
                            >
                              {/* Metadata */}
                              <div className="flex items-center justify-between text-[10px] font-semibold text-slate-500 select-none">
                                <span className="uppercase tracking-wider">NovaMind AI</span>
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => speakText(message.id, message.content)}
                                    className={`rounded p-0.5 transition hover:bg-white/5 ${
                                      speakingMessageId === message.id ? 'text-cyan-400' : 'text-slate-400 hover:text-white'
                                    }`}
                                    title="Listen to response"
                                  >
                                    {speakingMessageId === message.id ? <VolumeX size={12} /> : <Volume2 size={12} />}
                                  </button>
                                  <span>{formatTime(message.created_at)}</span>
                                </div>
                              </div>

                              {/* Message Body with Markdown support */}
                              <div className="text-sm sm:text-base text-[#ececec] font-normal leading-[1.8] tracking-wide select-text">
                                <MarkdownRenderer content={message.content} />
                              </div>

                              {/* Attachments preview */}
                              {message.attachments && message.attachments.length > 0 && (
                                <div className="mt-3 flex flex-wrap gap-2 pt-2 border-t border-white/5">
                                  {message.attachments.map((file: Attachment, index: number) => {
                                    const isImg = file.type.startsWith('image/')
                                    return (
                                      <a
                                        key={index}
                                        href={file.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 rounded-lg border border-white/10 bg-slate-950/60 p-1.5 pr-2.5 hover:bg-slate-950 transition max-w-[190px]"
                                      >
                                        {isImg ? (
                                          <img src={file.url} alt={file.name} className="size-8 rounded object-cover" />
                                        ) : (
                                          <FileText size={15} className="text-cyan-400 shrink-0" />
                                        )}
                                        <div className="min-w-0 flex-1">
                                          <p className="truncate text-[9px] font-semibold text-white">{file.name}</p>
                                          <p className="text-[8px] text-slate-555 text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
                                        </div>
                                      </a>
                                    )
                                  })}
                                </div>
                              )}

                              {/* Actions toolbar on Hover */}
                              <div className="flex items-center gap-1.5 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-slate-400 select-none">
                                <button
                                  onClick={() => toggleLike(message.id)}
                                  className={`p-1.5 rounded-lg hover:bg-white/5 hover:text-white transition duration-155 active:scale-90 ${
                                    likes[message.id] ? 'text-indigo-400 bg-indigo-500/10' : ''
                                  }`}
                                  title="Like"
                                >
                                  <ThumbsUp size={13} />
                                </button>
                                <button
                                  onClick={() => toggleDislike(message.id)}
                                  className={`p-1.5 rounded-lg hover:bg-white/5 hover:text-white transition duration-155 active:scale-90 ${
                                    dislikes[message.id] ? 'text-rose-400 bg-rose-500/10' : ''
                                  }`}
                                  title="Dislike"
                                >
                                  <ThumbsDown size={13} />
                                </button>
                                <button
                                  onClick={() => handleCopyResponse(message.content)}
                                  className="p-1.5 rounded-lg hover:bg-white/5 hover:text-white transition duration-155 active:scale-95"
                                  title="Copy Response"
                                >
                                  <Copy size={13} />
                                </button>
                                <button
                                  onClick={() => handleRegenerate(message)}
                                  className="p-1.5 rounded-lg hover:bg-white/5 hover:text-white transition duration-155 active:scale-95"
                                  title="Regenerate Response"
                                >
                                  <RefreshCw size={13} />
                                </button>
                                <button
                                  onClick={() => handleEditPrompt(message)}
                                  className="p-1.5 rounded-lg hover:bg-white/5 hover:text-white transition duration-155 active:scale-95"
                                  title="Edit Prompt"
                                >
                                  <Edit3 size={13} />
                                </button>

                                {/* Download options dropdown */}
                                <div className="relative">
                                  <button
                                    onClick={() => setOpenDownloadId(openDownloadId === message.id ? null : message.id)}
                                    className="p-1.5 rounded-lg hover:bg-white/5 hover:text-white transition duration-155 active:scale-95 flex items-center gap-1"
                                    title="Download Response"
                                  >
                                    <FileDown size={13} />
                                  </button>

                                  {openDownloadId === message.id && (
                                    <>
                                      <div className="fixed inset-0 z-40" onClick={() => setOpenDownloadId(null)} />
                                      <div className="absolute left-0 bottom-full mb-1.5 z-50 w-36 rounded-xl border border-white/10 bg-[#212121] p-1 shadow-2xl text-left">
                                        <button
                                          onClick={() => {
                                            downloadTXT(message.content)
                                            setOpenDownloadId(null)
                                          }}
                                          className="w-full text-left px-3 py-2 text-xs rounded-lg hover:bg-white/5 hover:text-white transition font-medium"
                                        >
                                          Text file (.txt)
                                        </button>
                                        <button
                                          onClick={() => {
                                            downloadMD(message.content)
                                            setOpenDownloadId(null)
                                          }}
                                          className="w-full text-left px-3 py-2 text-xs rounded-lg hover:bg-white/5 hover:text-white transition font-medium"
                                        >
                                          Markdown (.md)
                                        </button>
                                        <button
                                          onClick={() => {
                                            downloadPDF(message.content)
                                            setOpenDownloadId(null)
                                          }}
                                          className="w-full text-left px-3 py-2 text-xs rounded-lg hover:bg-white/5 hover:text-white transition font-medium"
                                        >
                                          PDF Document (.pdf)
                                        </button>
                                      </div>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          </>
                        )}
                      </motion.article>
                    )
                  })}
                </div>

              )}

              {/* Typing/Thinking indicators */}
              {isThinking && (
                <div className="flex gap-4 mt-4 select-none animate-fade-in">
                  <div className="size-8 rounded-full bg-slate-900 border border-white/10 overflow-hidden shrink-0 flex items-center justify-center">
                    <Sparkles size={14} className="text-indigo-400 animate-pulse" />
                  </div>
                  <div className="flex-1 space-y-1.5 py-1">
                    <div className="flex items-center gap-1 text-[10px] font-semibold text-slate-500 uppercase tracking-wider animate-pulse">
                      NovaMind AI
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <span>NovaMind AI is thinking</span>
                      <span className="flex items-center gap-1.5">
                        <span className="size-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="size-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="size-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </span>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Scroll bottom anchor */}
            <div ref={messageEndRef} />
            
            {/* Scroll FAB */}
            <AnimatePresence>
              {showScrollFAB && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={scrollToBottom}
                  type="button"
                  className="fixed bottom-28 right-6 z-30 flex size-9 items-center justify-center rounded-full border border-white/10 bg-[#212121] text-slate-400 hover:bg-[#2f2f2f] hover:text-white shadow-xl transition duration-150 pointer-events-auto cursor-pointer"
                >
                  <ChevronDown size={18} />
                </motion.button>
              )}
            </AnimatePresence>
          </div>



          {/* FIXED BOTTOM INPUT PANEL */}
          <footer 
            className="fixed bottom-0 right-0 p-4 bg-gradient-to-t from-[#171717] via-[#171717]/95 to-transparent z-15 transition-all duration-300"
            style={{
              left: isFullscreen
                ? '0px'
                : (isDesktop || isTablet
                  ? (sidebarCollapsed ? '75px' : '280px') 
                  : '0px')
            }}
          >
            <div className="w-full max-w-[768px] mx-auto">
              
              {/* Pre-upload attachment file tags */}
              {pendingAttachments.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-2 p-2 rounded-xl border border-white/5 bg-slate-950/40">
                  {pendingAttachments.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-2 rounded-lg border border-white/10 bg-[#212121] p-1.5 pr-2 text-xs text-white max-w-[200px]"
                    >
                      {item.type.startsWith('image/') ? (
                        <ImageIcon size={14} className="text-emerald-400 shrink-0" />
                      ) : (
                        <Paperclip size={14} className="text-indigo-400 shrink-0" />
                      )}
                      <span className="truncate flex-1 font-semibold text-[10px]">{item.name}</span>
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

              {/* Pill-shaped ChatGPT input form container */}
              <div className="relative rounded-[26px] bg-[#2f2f2f] px-3.5 py-1.5 shadow-xl border border-white/5">
                <form
                  onSubmit={handleSend}
                  className="flex items-center gap-2 min-h-[48px]"
                >
                  {/* Plus button inside circular frame on the left */}
                  <button
                    type="button"
                    onClick={() => triggerFileInput('all')}
                    disabled={isSending || isUploadingFiles}
                    className="size-7 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition flex items-center justify-center shrink-0"
                    title="Attach files"
                  >
                    <Plus size={16} />
                  </button>

                  {/* Hidden inputs */}
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" multiple />
                  <input type="file" ref={imageInputRef} onChange={handleFileChange} accept="image/*" className="hidden" multiple />

                  {/* Input TextArea */}
                  <textarea
                    ref={textareaRef}
                    rows={1}
                    className="flex-1 resize-none bg-transparent py-2.5 px-1 text-sm leading-relaxed text-[#ececec] placeholder-[#9b9b9b] focus:outline-none scrollbar-none"
                    placeholder="Ask anything"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isSending || isUploadingFiles}
                  />

                  {/* Actions on the right inside input box */}
                  <div className="flex items-center gap-2 shrink-0">
                    {/* Voice mic */}
                    <button
                      type="button"
                      onClick={() => toggleSpeechRecognition(handleVoiceTranscript)}
                      className={`rounded-full p-2 transition shrink-0 ${isListening ? 'bg-red-500/20 text-red-400 animate-pulse' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
                      title="Voice dictation"
                    >
                      <Mic size={16} />
                    </button>

                    {/* Send Button */}
                    <button
                      type="submit"
                      disabled={isSending || isUploadingFiles || (!prompt.trim() && pendingAttachments.length === 0)}
                      className="size-8 rounded-full flex items-center justify-center bg-blue-600 hover:bg-blue-500 text-white hover:scale-105 transition-all duration-150 disabled:opacity-30 disabled:scale-100 disabled:cursor-not-allowed shadow"
                    >
                      {isSending || isUploadingFiles ? (
                        <Loader2 size={14} className="animate-spin text-white" />
                      ) : (
                        <ArrowUp size={16} className="text-white" />
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* Disclaimer */}
              <div className="mt-2 text-center select-none">
                <p className="text-[10px] text-slate-500 font-medium">
                  NovaMind can make mistakes. Check important info.
                </p>
              </div>

            </div>
          </footer>

        </div>

      </div>

      {/* Dynamic Profile and Settings as popups (modals) */}
      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </main>
  )
}
