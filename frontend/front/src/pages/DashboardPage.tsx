import { useState, useRef, useEffect, useMemo, type FormEvent, type ChangeEvent } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Share,
  Pencil,
  Archive,
  ChevronRight,
  Check,
  ChevronDown,
  ChevronUp,
  FileText,
  LogOut,
  MessageSquare,
  Pin,
  Plus,
  Search,
  Settings,
  Sparkles,
  Trash2,
  User,
  X,
  PanelLeftClose,
  PanelLeft,
  Folder,
  Library as LibraryIcon,
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
  Copy,
  ZoomIn,
  ZoomOut,
  Play,
  SquarePen,
  Upload,
  Clock,
  AtSign
} from 'lucide-react'
import { parseFileContent } from '../lib/fileParser'
import { MarkdownRenderer } from '../components/ui/MarkdownRenderer'
import { useAuth } from '../context/useAuth'
import { useChat, type ExtendedChat, type Attachment, type ExtendedMessage } from '../context/ChatContext'
import { useToast } from '../context/ToastContext'
import { ProfileModal, SettingsModal } from '../components/ui/Modals'
import { CodePreviewModal } from '../components/CodePreviewModal'
import { PromptLibraryModal } from '../components/PromptLibraryModal'
import { CommandPalette } from '../components/CommandPalette'
import { exportChatToMarkdown } from '../lib/ChatExportService'
import { QuestionNavShortcut } from '../components/QuestionNavShortcut'
import { ModelSelector, AI_MODELS, type AIModel } from '../components/ModelSelector'
import { ArtifactsDrawer } from '../components/ArtifactsDrawer'
import { ChatMessageComposer } from '../components/ChatMessageComposer'
import { UserMessageBubble } from '../components/UserMessageBubble'

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
    selectChat,
    createChat,
    renameChat,
    deleteChat,
    duplicateChat,
    togglePinChat,
    sendMessage,
    stopGeneration,
    setMessages,
    uploadFile,
    isListening,
    toggleSpeechRecognition,
    uiSettings,
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
  const [isPinnedExpanded, setIsPinnedExpanded] = useState(true)
  const [isRecentExpanded, setIsRecentExpanded] = useState(true)

  // Body scroll lock effect for mobile sidebar drawer
  useEffect(() => {
    if (sidebarOpen && !isDesktop && !isTablet) {
      document.body.classList.add('body-scroll-lock')
    } else {
      document.body.classList.remove('body-scroll-lock')
    }
    return () => {
      document.body.classList.remove('body-scroll-lock')
    }
  }, [sidebarOpen, isDesktop, isTablet])
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
  const [mobileProfileDropdownOpen, setMobileProfileDropdownOpen] = useState(false)
  const [activeMenuChatId, setActiveMenuChatId] = useState<number | null>(null)
  const [menuOpenUpward, setMenuOpenUpward] = useState(false)
  const [menuCoords, setMenuCoords] = useState<{ top: number; left: number } | null>(null)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isPromptLibraryOpen, setIsPromptLibraryOpen] = useState(false)
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false)
  const [selectedModel, setSelectedModel] = useState<AIModel>(AI_MODELS[0])
  const [artifactsDrawerState, setArtifactsDrawerState] = useState<{
    isOpen: boolean
    code: string
    language: string
  }>({
    isOpen: false,
    code: '',
    language: '',
  })
  const [codePreviewState, setCodePreviewState] = useState<{ isOpen: boolean; code: string; language: string }>({
    isOpen: false,
    code: '',
    language: '',
  })

  // Global Code Preview opener & Artifacts Drawer opener
  useEffect(() => {
    ; (window as any).__openCodePreview = (code: string, language: string) => {
      setArtifactsDrawerState({ isOpen: true, code, language })
      setCodePreviewState({ isOpen: true, code, language })
    }
  }, [])

  // Ctrl + K listener for Command Palette
  useEffect(() => {
    const handleGlobalKeyDown = (e: globalThis.KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setIsCommandPaletteOpen((prev) => !prev)
      }
    }
    window.addEventListener('keydown', handleGlobalKeyDown)
    return () => window.removeEventListener('keydown', handleGlobalKeyDown)
  }, [])

  // Input states
  const [prompt, setPrompt] = useState('')
  const [pendingAttachments, setPendingAttachments] = useState<{ id: string; name: string; type: string; size: number; file: File; previewUrl?: string }[]>([])
  const [isUploadingFiles, setIsUploadingFiles] = useState(false)
  const [showScrollBottom, setShowScrollBottom] = useState(false)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const lastScrollTopRef = useRef(0)
  const [sidebarSearchQuery, setSidebarSearchQuery] = useState('')

  // New Modal and Actions states for Multimodal System
  const [activeImageViewerUrl, setActiveImageViewerUrl] = useState<string | null>(null)
  const [activeImageViewerName, setActiveImageViewerName] = useState<string | null>(null)
  const [activeVideoPlayerUrl, setActiveVideoPlayerUrl] = useState<string | null>(null)
  const [activeVideoPlayerName, setActiveVideoPlayerName] = useState<string | null>(null)
  const [zoomScale, setZoomScale] = useState<number>(1)
  const [imageFullscreen, setImageFullscreen] = useState<boolean>(false)
  const [deletedAttachmentUrls, setDeletedAttachmentUrls] = useState<string[]>([])

  // Reset local deleted attachment URLs filter when active chat changes
  useEffect(() => {
    setDeletedAttachmentUrls([])
  }, [selectedChat?.id])

  const handleCopyLink = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url)
      showToast('Link copied to clipboard!', 'success')
    } catch {
      showToast('Failed to copy link', 'error')
    }
  }

  const handleDownloadAttachment = (url: string, name: string) => {
    const link = document.createElement('a')
    link.href = url
    link.download = name
    link.target = '_blank'
    link.click()
  }

  const handleDeleteAttachment = (url: string) => {
    setDeletedAttachmentUrls((prev) => [...prev, url])
    showToast('Attachment deleted from view', 'success')
  }

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

  // Fullscreen Handler & Sync
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => { })
      setIsFullscreen(true)
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => { })
      }
      setIsFullscreen(false)
    }
  }

  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setIsFullscreen(false)
      } else {
        setIsFullscreen(true)
      }
    }
    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (document.fullscreenElement && document.exitFullscreen) {
          document.exitFullscreen().catch(() => { })
        }
        setIsFullscreen(false)
      }
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
      window.removeEventListener('keydown', handleKeyDown)
    }
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
  const chatViewportRef = useRef<HTMLDivElement>(null)

  // Directional scroll handler for FAB scroll buttons
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget
    const scrollTop = target.scrollTop
    const scrollHeight = target.scrollHeight
    const clientHeight = target.clientHeight

    // Check if scrollable
    if (scrollHeight <= clientHeight + 10) {
      setShowScrollTop(false)
      setShowScrollBottom(false)
      return
    }

    // Check boundaries (at top or at bottom)
    const isAtTop = scrollTop <= 40
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 40

    if (isAtTop || isAtBottom) {
      setShowScrollTop(false)
      setShowScrollBottom(false)
      lastScrollTopRef.current = scrollTop
      return
    }

    const scrollDelta = scrollTop - lastScrollTopRef.current

    // Only trigger if user scrolled at least 5px to avoid jitter
    if (Math.abs(scrollDelta) > 5) {
      if (scrollDelta > 0) {
        // User scrolling DOWN (top to bottom) -> Show ONLY Scroll to Bottom button
        setShowScrollBottom(true)
        setShowScrollTop(false)
      } else {
        // User scrolling UP (bottom to top) -> Show ONLY Scroll to Top button
        setShowScrollTop(true)
        setShowScrollBottom(false)
      }
      lastScrollTopRef.current = scrollTop
    }
  }

  // Scroll to bottom helper
  const scrollToBottom = () => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    setShowScrollBottom(false)
  }

  // Scroll to top helper
  const scrollToTop = () => {
    chatViewportRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
    setShowScrollTop(false)
  }

  // Scroll new user question smoothly near top of chat viewport
  const prevMessagesCountRef = useRef(messages.length)
  const lastScrolledUserMsgIdRef = useRef<string | number | null>(null)

  useEffect(() => {
    if (messages.length > prevMessagesCountRef.current) {
      const userMessages = messages.filter((m) => m.role === 'user')
      const latestUserMsg = userMessages[userMessages.length - 1]

      if (latestUserMsg && latestUserMsg.id !== lastScrolledUserMsgIdRef.current) {
        lastScrolledUserMsgIdRef.current = latestUserMsg.id

        requestAnimationFrame(() => {
          setTimeout(() => {
            const el = document.getElementById(`msg-${latestUserMsg.id}`)
            const container = chatViewportRef.current
            if (el && container) {
              const targetTop = Math.max(0, el.offsetTop - 76)
              container.scrollTo({
                top: targetTop,
                behavior: 'smooth'
              })
            }
          }, 60)
        })
      }
    }
    prevMessagesCountRef.current = messages.length
  }, [messages])

  // Filter messages based on search query
  const [messageSearchQuery] = useState('')
  const filteredMessages = useMemo(() => {
    if (!messageSearchQuery.trim()) return messages
    return messages.filter((msg) =>
      msg.content.toLowerCase().includes(messageSearchQuery.toLowerCase())
    )
  }, [messages, messageSearchQuery])

  // Search Chats: Instant filtering locally by Title or Message Contents
  const filteredChats = useMemo(() => {
    if (!sidebarSearchQuery.trim()) return chats
    const q = sidebarSearchQuery.toLowerCase()
    return chats.filter((chat) =>
      chat.title.toLowerCase().includes(q) ||
      chat.messages?.some((m) => m.content.toLowerCase().includes(q))
    )
  }, [chats, sidebarSearchQuery])

  // Grouped chats history
  const pinnedChats = useMemo(() => {
    return filteredChats.filter((chat) => chat.pinned)
  }, [filteredChats])

  const groupedUnpinnedChats = useMemo(() => {
    const unpinned = filteredChats.filter((chat) => !chat.pinned)
    const groups: Record<string, ExtendedChat[]> = {
      'Today': [],
      'Yesterday': [],
      'Last 7 Days': [],
      'Last 30 Days': [],
      'Older': []
    }

    const now = new Date()
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
    const oneDay = 24 * 60 * 60 * 1000
    const startOfYesterday = startOfToday - oneDay
    const sevenDaysAgo = startOfToday - 7 * oneDay
    const thirtyDaysAgo = startOfToday - 30 * oneDay

    unpinned.forEach((chat) => {
      const updatedTime = chat.updated_at
        ? new Date(chat.updated_at).getTime()
        : (chat.created_at ? new Date(chat.created_at).getTime() : 0)

      if (updatedTime >= startOfToday) {
        groups['Today'].push(chat)
      } else if (updatedTime >= startOfYesterday) {
        groups['Yesterday'].push(chat)
      } else if (updatedTime >= sevenDaysAgo) {
        groups['Last 7 Days'].push(chat)
      } else if (updatedTime >= thirtyDaysAgo) {
        groups['Last 30 Days'].push(chat)
      } else {
        groups['Older'].push(chat)
      }
    })

    return [
      { label: 'Today', chats: groups['Today'] },
      { label: 'Yesterday', chats: groups['Yesterday'] },
      { label: 'Last 7 Days', chats: groups['Last 7 Days'] },
      { label: 'Last 30 Days', chats: groups['Last 30 Days'] },
      { label: 'Older', chats: groups['Older'] }
    ].filter(group => group.chats.length > 0)
  }, [filteredChats])

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

    const newAttachments = Array.from(files).map((file: File) => {
      const isImg = file.type.startsWith('image/')
      return {
        id: Math.random().toString(36).substring(2, 9),
        name: file.name,
        type: file.type,
        size: file.size,
        file,
        previewUrl: isImg ? URL.createObjectURL(file) : undefined
      }
    })

    setPendingAttachments((prev) => [...prev, ...newAttachments])
    e.target.value = ''
  }

  const removePendingAttachment = (id: string) => {
    setPendingAttachments((prev) => {
      const target = prev.find((item) => item.id === id)
      if (target?.previewUrl) {
        URL.revokeObjectURL(target.previewUrl)
      }
      return prev.filter((item) => item.id !== id)
    })
  }

  // Send message
  const handleSend = async (e?: FormEvent) => {
    if (e) e.preventDefault()
    const text = prompt.trim()
    if (!text && pendingAttachments.length === 0) return
    if (isSending) return

    setPrompt('')
    setIsUploadingFiles(true)

    // Keep a reference of attachments to clean up local object URLs afterwards
    const attachmentsToRevoke = [...pendingAttachments]

    try {
      // Parse file contents first and wrap them in file_content tags
      let finalPrompt = text
      for (const item of pendingAttachments) {
        try {
          const parsedText = await parseFileContent(item.file)
          if (parsedText) {
            const isVideo = item.type.startsWith('video/')
            finalPrompt = `<file_content name="${item.name}"${isVideo ? ' meta="true"' : ''}>\n${parsedText}\n</file_content>\n\n` + finalPrompt
          }
        } catch (err) {
          console.error(`Failed to parse file ${item.name}:`, err)
        }
      }

      const uploadedAttachments: Attachment[] = []
      for (const attachment of pendingAttachments) {
        const uploaded = await uploadFile(attachment.file)
        uploadedAttachments.push(uploaded)
      }

      setPendingAttachments([])
      attachmentsToRevoke.forEach((item) => {
        if (item.previewUrl) {
          URL.revokeObjectURL(item.previewUrl)
        }
      })
      setIsUploadingFiles(false)
      await sendMessage(finalPrompt, uploadedAttachments)
    } catch {
      showToast('Error sending message: files failed to upload.', 'error')
      setIsUploadingFiles(false)
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



  // Keyboard Shortcuts Bindings
  useEffect(() => {
    const handleKeyDownShortcuts = (e: globalThis.KeyboardEvent) => {
      // Toggle Sidebar: Ctrl + Shift + O
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'o') {
        e.preventDefault()
        setSidebarCollapsed(prev => !prev)
      }
      // Create New Chat: Ctrl + N
      if (e.ctrlKey && !e.shiftKey && e.key.toLowerCase() === 'n') {
        const target = e.target as HTMLElement
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
          e.preventDefault()
          void createChat()
        }
      }
      // Search Chats: Ctrl + K
      if (e.ctrlKey && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        const searchInput = document.getElementById('sidebar-search-input')
        const searchInputMobile = document.getElementById('sidebar-search-input-mobile')
        if (searchInput) {
          searchInput.focus()
        } else if (searchInputMobile) {
          searchInputMobile.focus()
        }
      }
      // Focus Chat Input: Ctrl + /
      if (e.ctrlKey && e.key === '/') {
        e.preventDefault()
        if (textareaRef.current) {
          textareaRef.current.focus()
        }
      }
      // Close Sidebar (Mobile): Esc
      if (e.key === 'Escape') {
        if (!isDesktop && !isTablet) {
          setSidebarOpen(false)
        }
      }
      // Delete Selected Chat: Delete
      if (e.key === 'Delete') {
        const target = e.target as HTMLElement
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
          if (selectedChat) {
            e.preventDefault()
            if (window.confirm(`Are you sure you want to delete "${selectedChat.title}"?`)) {
              void deleteChat(selectedChat.id)
            }
          }
        }
      }
      // Rename Selected Chat: F2
      if (e.key === 'F2') {
        const target = e.target as HTMLElement
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
          if (selectedChat) {
            e.preventDefault()
            startRenaming(selectedChat)
          }
        }
      }
    }

    window.addEventListener('keydown', handleKeyDownShortcuts)
    return () => window.removeEventListener('keydown', handleKeyDownShortcuts)
  }, [createChat, deleteChat, selectedChat, isDesktop, isTablet])

  useEffect(() => {
    if (activeMenuChatId === null) return
    const handleEscape = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveMenuChatId(null)
        setMenuCoords(null)
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [activeMenuChatId])

  // Sidebar chat history item renderer
  const renderSidebarChatItem = (chat: ExtendedChat) => {
    const isSelected = selectedChat?.id === chat.id
    const isRenaming = renamingId === chat.id

    return (
      <div
        key={chat.id}
        className={`group relative flex items-center justify-between rounded-xl px-2.5 py-2 transition duration-150 cursor-pointer ${isSelected
          ? 'bg-[#212121] text-white font-medium shadow-sm'
          : 'text-[#ececec] hover:bg-[#212121]/60 hover:text-white'
          }`}
      >
        {isRenaming ? (
          <div className="flex w-full items-center gap-1.5 z-10">
            <input
              type="text"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              className="w-full rounded-lg bg-[#0d0d0d] px-2.5 py-1 text-sm text-white border border-white/15 focus:border-indigo-500 focus:outline-none"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') void saveRename(chat.id)
                if (e.key === 'Escape') setRenamingId(null)
              }}
            />
            <button
              onClick={() => void saveRename(chat.id)}
              className="rounded bg-indigo-500 p-1 text-white transition hover:bg-indigo-600 shrink-0"
            >
              <Check size={12} />
            </button>
            <button
              onClick={() => setRenamingId(null)}
              className="rounded bg-white/10 p-1 text-white transition hover:bg-white/20 shrink-0"
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
              className={`flex flex-1 items-center gap-2.5 text-left min-w-0 animate-none ${isSelected ? 'text-white font-medium' : 'text-[#ececec] hover:text-white'
                }`}
            >
              {chat.pinned && (
                <MessageSquare
                  className={`shrink-0 ${isSelected ? 'text-white' : 'text-slate-200 group-hover:text-white'}`}
                  size={17}
                />
              )}
              {!sidebarCollapsed && (
                <div className="min-w-0 flex-1 flex items-center justify-between">
                  <span className="block truncate text-[14px] font-normal leading-snug flex-1">
                    {chat.title}
                  </span>
                </div>
              )}
            </button>

            {/* Hover Actions: Show Pin (if pinned) and Three-Dots Menu icon */}
            {!sidebarCollapsed && (
              <div className={`relative flex items-center gap-1 transition-opacity duration-200 ${activeMenuChatId === chat.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                }`}>
                {chat.pinned && (
                  <Pin size={14} className="text-slate-400 shrink-0" />
                )}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    if (activeMenuChatId === chat.id) {
                      setActiveMenuChatId(null)
                      setMenuCoords(null)
                    } else {
                      const rect = e.currentTarget.getBoundingClientRect()
                      const spaceBelow = window.innerHeight - rect.bottom
                      const menuHeight = 268
                      const menuWidth = 230

                      let top = rect.bottom + 6 // mt-1.5 offset
                      let left = rect.right - menuWidth // align right side of menu to right side of button

                      if (spaceBelow < menuHeight + 12) {
                        top = rect.top - menuHeight - 6 // mb-1.5 offset
                        setMenuOpenUpward(true)
                      } else {
                        setMenuOpenUpward(false)
                      }

                      if (left < 12) {
                        left = 12
                      }
                      if (left + menuWidth > window.innerWidth - 12) {
                        left = window.innerWidth - menuWidth - 12
                      }
                      if (top < 12) {
                        top = 12
                      }
                      if (top + menuHeight > window.innerHeight - 12) {
                        top = window.innerHeight - menuHeight - 12
                      }

                      setMenuCoords({ top, left })
                      setActiveMenuChatId(chat.id)
                    }
                  }}
                  className="rounded p-1 text-slate-400 hover:text-white transition shrink-0"
                  title="More actions"
                >
                  <MoreHorizontal size={14} />
                </button>

                {createPortal(
                  <AnimatePresence>
                    {activeMenuChatId === chat.id && menuCoords && (
                      <>
                        <div
                          className="fixed inset-0 z-[9998]"
                          onClick={(e) => {
                            e.stopPropagation()
                            setActiveMenuChatId(null)
                            setMenuCoords(null)
                          }}
                        />
                        <motion.div
                          initial={{ opacity: 0, scale: 0.96, y: menuOpenUpward ? -5 : 5 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.96, y: menuOpenUpward ? -5 : 5 }}
                          transition={{ duration: 0.15, ease: 'easeOut' }}
                          style={{
                            boxShadow: '0 12px 32px rgba(0,0,0,0.45)',
                            position: 'fixed',
                            top: `${menuCoords.top}px`,
                            left: `${menuCoords.left}px`,
                            zIndex: 9999
                          }}
                          className="w-[230px] rounded-[20px] border border-white/5 bg-[#2f2f2f] p-2 text-left overflow-hidden"
                        >
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setActiveMenuChatId(null)
                              setMenuCoords(null)
                              const link = `${window.location.origin}/dashboard?chat=${chat.id}`
                              void navigator.clipboard.writeText(link)
                              showToast('Link copied to clipboard!', 'success')
                            }}
                            className="w-full h-[42px] flex items-center gap-3 px-[10px] rounded-[10px] hover:bg-white/[0.08] text-[15px] font-medium text-slate-200 transition duration-150 ease-in-out text-left select-none"
                          >
                            <Share size={18} />
                            Share
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setActiveMenuChatId(null)
                              setMenuCoords(null)
                              startRenaming(chat)
                            }}
                            className="w-full h-[42px] flex items-center gap-3 px-[10px] rounded-[10px] hover:bg-white/[0.08] text-[15px] font-medium text-slate-200 transition duration-150 ease-in-out text-left select-none"
                          >
                            <Pencil size={18} />
                            Rename
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setActiveMenuChatId(null)
                              setMenuCoords(null)
                              void duplicateChat(chat)
                            }}
                            className="w-full h-[42px] flex items-center justify-between gap-3 px-[10px] rounded-[10px] hover:bg-white/[0.08] text-[15px] font-medium text-slate-200 transition duration-150 ease-in-out text-left select-none"
                          >
                            <div className="flex items-center gap-3">
                              <Folder size={18} />
                              <span>Move to project</span>
                            </div>
                            <ChevronRight size={14} className="text-white/40 shrink-0 ml-auto" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setActiveMenuChatId(null)
                              setMenuCoords(null)
                              void togglePinChat(chat)
                            }}
                            className="w-full h-[42px] flex items-center gap-3 px-[10px] rounded-[10px] hover:bg-white/[0.08] text-[15px] font-medium text-slate-200 transition duration-150 ease-in-out text-left select-none"
                          >
                            <Pin size={18} />
                            {chat.pinned ? 'Unpin chat' : 'Pin chat'}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setActiveMenuChatId(null)
                              setMenuCoords(null)
                              showToast('Chat archived successfully!', 'success')
                            }}
                            className="w-full h-[42px] flex items-center gap-3 px-[10px] rounded-[10px] hover:bg-white/[0.08] text-[15px] font-medium text-slate-200 transition duration-150 ease-in-out text-left select-none"
                          >
                            <Archive size={18} />
                            Archive
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setActiveMenuChatId(null)
                              setMenuCoords(null)
                              void deleteChat(chat.id)
                            }}
                            className="w-full h-[42px] flex items-center gap-3 px-[10px] rounded-[10px] hover:bg-white/[0.08] text-[15px] font-medium text-[#ef5656] transition duration-150 ease-in-out text-left select-none"
                          >
                            <Trash2 size={18} />
                            Delete
                          </button>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>,
                  document.body
                )}
              </div>
            )}

            {/* Static Indicators when not hovered */}
            {!sidebarCollapsed && (
              <div className="flex items-center gap-0.5 group-hover:hidden transition">
                {chat.pinned && <Pin size={12} className="text-slate-400" />}
              </div>
            )}
          </>
        )}
      </div>
    )
  }

  return (
    <main className="min-h-screen text-[#ececec] chat-bg font-sans relative overflow-x-hidden">
      <div className="relative z-10 flex min-h-screen">

        {/* FIXED LEFT SIDEBAR (Desktop / Tablet) */}
        <aside
          className={`fixed top-0 left-0 h-screen sidebar-bg border-r border-white/[0.05] z-30 transition-all duration-300 select-none flex flex-col ${isFullscreen ? 'hidden' : 'hidden md:flex'
            } ${sidebarCollapsed ? 'w-[64px]' : (isTablet ? 'w-[240px]' : 'w-[260px]')
            }`}
        >
          {/* Top Header Section (Sticky) */}
          <div className="h-[56px] flex items-center justify-between px-3.5 border-b border-white/[0.05] flex-shrink-0 sticky top-0 z-10 sidebar-bg">
            {!sidebarCollapsed ? (
              <>
                <div
                  onClick={() => void createChat()}
                  className="flex items-center gap-2 overflow-hidden select-none shrink-0 cursor-pointer"
                >
                  <img src="/favicon.svg" alt="NovaMind Logo" className="size-6 shrink-0" />
                  <span className="text-sm font-bold tracking-wide brand-gradient truncate">
                    NovaMind AI
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => document.getElementById('sidebar-search-input')?.focus()}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-white/5 hover:text-white transition shrink-0"
                    title="Search chats"
                  >
                    <Search size={16} />
                  </button>
                  <button
                    onClick={() => setSidebarCollapsed(true)}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-white/5 hover:text-white transition shrink-0"
                    title="Collapse Sidebar"
                  >
                    <PanelLeftClose size={16} />
                  </button>
                </div>
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

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto min-h-0 select-none overscroll-y-contain px-2 py-3 space-y-4">
            {/* Main Navigation Items */}
            <div className="space-y-1">
              {/* New chat */}
              <button
                onClick={() => void createChat()}
                className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center p-2' : 'justify-between px-3 py-2.5'} rounded-xl bg-transparent hover:bg-[#212121]/60 text-[14px] font-medium text-white transition duration-150 cursor-pointer`}
                title="New chat"
              >
                <div className="flex items-center gap-3">
                  <SquarePen size={19} className="text-white shrink-0" />
                  {!sidebarCollapsed && <span>New chat</span>}
                </div>
              </button>

              {sidebarCollapsed ? (
                <>
                  {/* Search Icon in Collapsed Rail */}
                  <button
                    onClick={() => {
                      setSidebarCollapsed(false)
                      setTimeout(() => document.getElementById('sidebar-search-input')?.focus(), 150)
                    }}
                    className="w-full flex items-center justify-center p-2 rounded-xl hover:bg-[#212121]/60 text-[#ececec] hover:text-white transition duration-150 cursor-pointer"
                    title="Search chats"
                  >
                    <Search size={19} className="shrink-0" />
                  </button>

                  {/* Pinned Icon in Collapsed Rail */}
                  <button
                    onClick={() => setSidebarCollapsed(false)}
                    className="w-full flex items-center justify-center p-2 rounded-xl hover:bg-[#212121]/60 text-[#ececec] hover:text-white transition duration-150 cursor-pointer"
                    title="Pinned chats"
                  >
                    <Pin size={19} className="shrink-0" />
                  </button>
                </>
              ) : (
                <>
                  {/* Library */}
                  <button
                    onClick={() => showToast('Library feature coming soon!', 'info')}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-[14px] font-normal text-[#ececec] hover:bg-[#212121]/60 hover:text-white transition duration-150"
                  >
                    <LibraryIcon size={18} className="text-[#ececec] shrink-0" />
                    <span>Library</span>
                  </button>

                  {/* Projects */}
                  <div className="w-full flex items-center justify-between rounded-xl hover:bg-[#212121]/60 transition duration-150 text-[#ececec] hover:text-white">
                    <button
                      onClick={() => showToast('Projects folder coming soon!', 'info')}
                      className="flex-1 flex items-center gap-3 px-3 py-2 text-[14px] font-normal text-[#ececec] text-left"
                    >
                      <Folder size={18} className="text-[#ececec] shrink-0" />
                      <span>Projects</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        void createChat()
                      }}
                      className="p-1 text-slate-400 hover:text-white mr-2"
                      title="Create chat in projects"
                    >
                      <Plus size={15} />
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Search Input Box */}
            {!sidebarCollapsed && (
              <div className="px-1 pb-1 pt-1">
                <div className="relative">
                  <Search className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-500" size={14} />
                  <input
                    id="sidebar-search-input"
                    value={sidebarSearchQuery}
                    onChange={(e) => setSidebarSearchQuery(e.target.value)}
                    className="input-glass min-h-[34px] w-full rounded-xl pr-3 pl-8 text-[13px] placeholder:text-slate-400 focus:outline-none"
                    placeholder="Search chats..."
                  />
                  {sidebarSearchQuery && (
                    <button
                      onClick={() => setSidebarSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Chat History Group list (Pinned & Recents) */}
            <div className="space-y-4">
              {isLoadingChats ? (
                <div className="space-y-2 px-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-9 w-full animate-pulse rounded-lg bg-white/5" />
                  ))}
                </div>
              ) : filteredChats.length === 0 ? (
                !sidebarCollapsed && (
                  <p className="text-[12px] text-slate-500 text-center py-6">No chats recorded.</p>
                )
              ) : (
                <>
                  {/* Pinned Chats */}
                  {pinnedChats.length > 0 && (
                    <div className="space-y-0.5">
                      {!sidebarCollapsed && (
                        <button
                          type="button"
                          onClick={() => setIsPinnedExpanded((prev) => !prev)}
                          className="w-full flex items-center justify-between px-3 pt-2 pb-1 text-[13.5px] font-semibold text-white select-none hover:text-slate-200 transition cursor-pointer"
                        >
                          <span>Pinned</span>
                          <ChevronDown
                            size={14}
                            className={`text-slate-400 shrink-0 transition-transform duration-200 ${isPinnedExpanded ? 'rotate-0' : '-rotate-90'
                              }`}
                          />
                        </button>
                      )}
                      {(isPinnedExpanded || sidebarCollapsed) && pinnedChats.map(renderSidebarChatItem)}
                    </div>
                  )}

                  {/* Grouped Unpinned Chats (Recents) */}
                  {!sidebarCollapsed && groupedUnpinnedChats.length > 0 && (
                    <div className="space-y-1">
                      <button
                        type="button"
                        onClick={() => setIsRecentExpanded((prev) => !prev)}
                        className="w-full flex items-center justify-between px-3 pt-2 pb-1 text-[13.5px] font-semibold text-white select-none hover:text-slate-200 transition cursor-pointer"
                      >
                        <span>Recents</span>
                        <ChevronDown
                          size={14}
                          className={`text-slate-400 shrink-0 transition-transform duration-200 ${isRecentExpanded ? 'rotate-0' : '-rotate-90'
                            }`}
                        />
                      </button>
                      {isRecentExpanded && (
                        <div className="space-y-3">
                          {groupedUnpinnedChats.map((group) => (
                            <div key={group.label} className="space-y-0.5">
                              {group.chats.map(renderSidebarChatItem)}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Bottom Sidebar actions */}
          <div className="p-2 border-t border-white/[0.05] bg-transparent flex flex-col gap-2 relative flex-shrink-0">
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
                transition={{ duration: 0.2 }}
                onClick={() => setSidebarOpen(false)}
                className="fixed inset-0 bg-black/70 pointer-events-auto"
              />

              {/* Drawer Container (GPU hardware accelerated matching ChatGPT mobile app screenshot) */}
              <motion.aside
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 26, stiffness: 300, mass: 0.8 }}
                className="relative z-10 w-[82vw] max-w-[320px] h-full bg-[#0d0d0d] text-white border-r border-white/10 flex flex-col shadow-2xl transform-gpu will-change-transform"
              >
                {/* Mobile Drawer Header (Sticky Top matching screenshot) */}
                <div className="h-[64px] flex items-center justify-between px-4 pt-3 pb-1 shrink-0 bg-[#0d0d0d]">
                  <h2 className="text-xl font-bold tracking-tight text-white font-sans">
                    NovaMind AI
                  </h2>
                  <button
                    onClick={() => {
                      const input = document.getElementById('sidebar-search-input-mobile')
                      input?.focus()
                    }}
                    className="size-10 rounded-full bg-white/10 hover:bg-white/15 active:scale-95 transition flex items-center justify-center text-white cursor-pointer"
                    title="Search chats"
                  >
                    <Search size={20} />
                  </button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto min-h-0 select-none px-3 py-2 space-y-4">
                  {/* Main Nav Items Matching Screenshot: Library, Projects, Scheduled, Plugins, More */}
                  <div className="space-y-1">
                    {/* Library */}
                    <button
                      onClick={() => {
                        showToast('Library feature coming soon!', 'info')
                        setSidebarOpen(false)
                      }}
                      className="w-full flex items-center gap-4 px-3 py-2.5 rounded-xl text-[15px] font-medium text-slate-100 hover:bg-white/10 transition text-left cursor-pointer"
                    >
                      <LibraryIcon size={20} className="text-slate-200 shrink-0" />
                      <span>Library</span>
                    </button>

                    {/* Projects */}
                    <button
                      onClick={() => {
                        showToast('Projects folder coming soon!', 'info')
                        setSidebarOpen(false)
                      }}
                      className="w-full flex items-center gap-4 px-3 py-2.5 rounded-xl text-[15px] font-medium text-slate-100 hover:bg-white/10 transition text-left cursor-pointer"
                    >
                      <Folder size={20} className="text-slate-200 shrink-0" />
                      <span>Projects</span>
                    </button>

                    {/* Scheduled */}
                    <button
                      onClick={() => {
                        showToast('Scheduled tasks coming soon!', 'info')
                        setSidebarOpen(false)
                      }}
                      className="w-full flex items-center gap-4 px-3 py-2.5 rounded-xl text-[15px] font-medium text-slate-100 hover:bg-white/10 transition text-left cursor-pointer"
                    >
                      <Clock size={20} className="text-slate-200 shrink-0" />
                      <span>Scheduled</span>
                    </button>

                    {/* Plugins */}
                    <button
                      onClick={() => {
                        showToast('Plugins store coming soon!', 'info')
                        setSidebarOpen(false)
                      }}
                      className="w-full flex items-center gap-4 px-3 py-2.5 rounded-xl text-[15px] font-medium text-slate-100 hover:bg-white/10 transition text-left cursor-pointer"
                    >
                      <AtSign size={20} className="text-slate-200 shrink-0" />
                      <span>Plugins</span>
                    </button>

                    {/* More */}
                    <button
                      onClick={() => {
                        setIsSettingsOpen(true)
                        setSidebarOpen(false)
                      }}
                      className="w-full flex items-center gap-4 px-3 py-2.5 rounded-xl text-[15px] font-medium text-slate-100 hover:bg-white/10 transition text-left cursor-pointer"
                    >
                      <MoreHorizontal size={20} className="text-slate-200 shrink-0" />
                      <span>More</span>
                    </button>
                  </div>

                  {/* Search Input Box */}
                  <div className="px-1 py-1">
                    <div className="relative">
                      <Search className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" size={15} />
                      <input
                        id="sidebar-search-input-mobile"
                        value={sidebarSearchQuery}
                        onChange={(e) => setSidebarSearchQuery(e.target.value)}
                        className="w-full min-h-[36px] bg-[#1a1a1a] border border-white/10 rounded-xl pr-3 pl-9 text-xs text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500/50"
                        placeholder="Search chats..."
                      />
                      {sidebarSearchQuery && (
                        <button
                          onClick={() => setSidebarSearchQuery('')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                        >
                          <X size={13} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Chat History List (Pinned & Recents) */}
                  <div className="space-y-4 pt-1">
                    {isLoadingChats ? (
                      <div className="space-y-2 px-2">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="h-9 w-full animate-pulse rounded-lg bg-white/5" />
                        ))}
                      </div>
                    ) : filteredChats.length === 0 ? (
                      <p className="text-xs text-slate-500 text-center py-6">No chats recorded.</p>
                    ) : (
                      <>
                        {/* Pinned Section */}
                        {pinnedChats.length > 0 && (
                          <div className="space-y-1">
                            <button
                              type="button"
                              onClick={() => setIsPinnedExpanded((prev) => !prev)}
                              className="w-full flex items-center justify-between px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider select-none hover:text-white transition cursor-pointer"
                            >
                              <span>Pinned</span>
                              <ChevronDown
                                size={14}
                                className={`text-slate-400 shrink-0 transition-transform duration-200 ${isPinnedExpanded ? 'rotate-0' : '-rotate-90'
                                  }`}
                              />
                            </button>
                            {isPinnedExpanded && pinnedChats.map(renderSidebarChatItem)}
                          </div>
                        )}

                        {/* Recents Section */}
                        {groupedUnpinnedChats.length > 0 && (
                          <div className="space-y-1">
                            <button
                              type="button"
                              onClick={() => setIsRecentExpanded((prev) => !prev)}
                              className="w-full flex items-center justify-between px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider select-none hover:text-white transition cursor-pointer"
                            >
                              <span>Recents</span>
                              <ChevronDown
                                size={14}
                                className={`text-slate-400 shrink-0 transition-transform duration-200 ${isRecentExpanded ? 'rotate-0' : '-rotate-90'
                                  }`}
                              />
                            </button>
                            {isRecentExpanded && (
                              <div className="space-y-3">
                                {groupedUnpinnedChats.map((group) => (
                                  <div key={group.label} className="space-y-0.5">
                                    {group.chats.map(renderSidebarChatItem)}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Mobile Drawer Footer User Panel (Transparent, no border, no container box) */}
                <div className="p-3 bg-transparent border-none flex items-center justify-between relative shrink-0">
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
                          className="absolute bottom-full left-3 right-3 mb-2 z-50 rounded-2xl border border-white/10 bg-[#1e1e1e] p-1.5 shadow-2xl"
                        >
                          <button
                            onClick={() => {
                              setIsProfileOpen(true)
                              setSidebarOpen(false)
                              setMobileProfileDropdownOpen(false)
                            }}
                            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium text-slate-200 hover:bg-white/10 transition text-left cursor-pointer"
                          >
                            <User size={15} className="text-slate-400" />
                            Profile
                          </button>
                          <button
                            onClick={() => {
                              setIsSettingsOpen(true)
                              setSidebarOpen(false)
                              setMobileProfileDropdownOpen(false)
                            }}
                            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium text-slate-200 hover:bg-white/10 transition text-left cursor-pointer"
                          >
                            <Settings size={15} className="text-slate-400" />
                            Settings
                          </button>
                          <button
                            onClick={() => {
                              setMobileProfileDropdownOpen(false)
                              setSidebarOpen(false)
                              showToast('For help, contact support@novamind.ai', 'info')
                            }}
                            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium text-slate-200 hover:bg-white/10 transition text-left cursor-pointer"
                          >
                            <HelpCircle size={15} className="text-slate-400" />
                            Help
                          </button>
                          <div className="h-px bg-white/10 my-1" />
                          <button
                            onClick={() => {
                              setMobileProfileDropdownOpen(false)
                              setSidebarOpen(false)
                              void logout()
                            }}
                            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium text-rose-400 hover:bg-rose-500/10 transition text-left cursor-pointer"
                          >
                            <LogOut size={15} />
                            Logout
                          </button>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>

                  {/* Left: Blue Chat Button (Matching Image) */}
                  <button
                    onClick={() => {
                      void createChat()
                      setSidebarOpen(false)
                    }}
                    className="flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold text-sm shadow-xl active:scale-95 transition cursor-pointer"
                  >
                    <SquarePen size={18} className="text-white shrink-0" />
                    <span>Chat</span>
                  </button>

                  {/* Right: User Avatar Circular Button (Matching Image) */}
                  <button
                    onClick={() => setMobileProfileDropdownOpen(!mobileProfileDropdownOpen)}
                    className="size-10 rounded-full overflow-hidden border border-white/20 bg-slate-800 shrink-0 hover:border-white/40 active:scale-95 transition cursor-pointer"
                    title="User Account"
                  >
                    {user?.avatar ? (
                      <img src={user.avatar} alt="User Avatar" className="size-full object-cover" />
                    ) : (
                      <div className="grid size-full place-items-center text-white font-bold text-xs bg-indigo-600">
                        {user?.name?.[0]?.toUpperCase() || 'U'}
                      </div>
                    )}
                  </button>
                </div>
              </motion.aside>
            </div>
          )}
        </AnimatePresence>

        {/* MAIN PANEL CONTENT VIEWPORT */}
        <div
          className="flex-1 flex flex-col h-screen overflow-hidden transition-all duration-300 chat-bg min-w-0 relative"
          style={{
            paddingLeft: isFullscreen
              ? '0px'
              : (isDesktop || isTablet
                ? (sidebarCollapsed ? '64px' : (isTablet ? '240px' : '260px'))
                : '0px')
          }}
        >

          {/* FLOATING BACKGROUNDLESS TOP CONTROLS (Logo, Model Dropdown & Fullscreen) */}
          <div className="absolute top-0 left-0 right-0 z-30 px-3 md:px-6 py-3 flex items-center justify-between pointer-events-none select-none bg-transparent border-none">
            {/* Left: Mobile Sidebar Opener + Borderless Logo + Model Selector Dropdown */}
            <div className="flex items-center gap-2 pointer-events-auto">
              {!isFullscreen && (
                <button
                  type="button"
                  onClick={() => setSidebarOpen(true)}
                  className="flex md:hidden size-8.5 rounded-full bg-transparent hover:bg-white/10 text-slate-300 hover:text-white transition items-center justify-center cursor-pointer active:scale-95 shrink-0 border-none"
                  title="Open sidebar"
                >
                  <PanelLeft size={18} />
                </button>
              )}

              {/* Chatbot Borderless Logo Icon */}
              <div className="size-6 overflow-hidden rounded-md flex items-center justify-center shrink-0 border-none bg-transparent">
                <img src="/favicon.svg" alt="NovaMind Logo" className="size-full object-contain" />
              </div>

              {/* Model Dropdown Selector */}
              <ModelSelector
                selectedModelId={selectedModel.id}
                onSelectModel={(model) => setSelectedModel(model)}
              />
            </div>

            {/* Right: Borderless Fullscreen Toggle Button */}
            <div className="flex items-center gap-1.5 pointer-events-auto">
              <button
                type="button"
                onClick={toggleFullscreen}
                className="px-2.5 py-1.5 bg-transparent hover:bg-white/10 text-slate-300 hover:text-white transition rounded-xl flex items-center gap-1.5 text-xs font-medium cursor-pointer border-none"
                title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Chat'}
              >
                {isFullscreen ? (
                  <>
                    <Minimize2 size={15} className="text-indigo-400" />
                    <span className="hidden sm:inline">Exit Fullscreen</span>
                  </>
                ) : (
                  <>
                    <Maximize2 size={15} />
                    <span className="hidden sm:inline">Fullscreen</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* CHAT MESSAGES PANEL - Primary Vertical Scroll Container */}
          <div
            ref={chatViewportRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto scrollbar-thin px-3 sm:px-6 lg:px-8 pt-16 sm:pt-20 pb-44 sm:pb-52 md:pb-60 flex flex-col items-center gap-4 md:gap-6 bg-transparent"
          >
            <div className="w-full max-w-full sm:max-w-[720px] md:max-w-[780px] lg:max-w-[820px] mx-auto flex flex-col min-h-full justify-start">

              {isLoadingMessages ? (
                <div className="space-y-8 py-6 flex-1 select-none">
                  {[1, 2].map((i) => (
                    <div key={i} className={`flex gap-4 ${i % 2 === 0 ? 'flex-row-reverse justify-start' : ''}`}>
                      <div className="size-8 rounded-full bg-white/5 shrink-0 skeleton-shimmer" />
                      <div className="space-y-3 w-full max-w-[500px]">
                        <div className="h-3.5 rounded bg-white/5 w-1/4 skeleton-shimmer" />
                        <div className="h-20 rounded-xl bg-white/5 w-full skeleton-shimmer" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredMessages.length === 0 && !isSending && !isThinking ? (

                /* EMPTY STATE INTRO CARD: Personalized User Welcome Greeting */
                <div className="my-auto flex flex-col items-center justify-center text-center select-none px-4 py-8">
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
                  {filteredMessages.map((message: ExtendedMessage, index: number) => {
                    const isUser = message.role === 'user'
                    const isLastMessage = index === filteredMessages.length - 1
                    const isGeneratingThisMessage = isSending && isLastMessage && !isUser

                    return (
                      <motion.article
                        key={message.id}
                        id={`msg-${message.id}`}
                        data-msg-id={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`w-full ${isUser ? 'flex flex-col items-end' : 'flex flex-col items-start'}`}
                      >
                        {isUser ? (
                          <UserMessageBubble
                            message={message}
                            isEditing={editingMessageId === message.id}
                            editContent={editContent}
                            setEditContent={setEditContent}
                            onCancelEdit={() => setEditingMessageId(null)}
                            onSaveEdit={handleSaveEditPrompt}
                            userBubbleColor={uiSettings.userBubbleColor}
                            deletedAttachmentUrls={deletedAttachmentUrls}
                            onOpenImageViewer={(url, name) => {
                              setActiveImageViewerUrl(url)
                              setActiveImageViewerName(name)
                              setZoomScale(1)
                              setImageFullscreen(false)
                            }}
                            onOpenVideoPlayer={(url, name) => {
                              setActiveVideoPlayerUrl(url)
                              setActiveVideoPlayerName(name)
                            }}
                            onDownloadAttachment={handleDownloadAttachment}
                            onCopyLink={handleCopyLink}
                            onDeleteAttachment={handleDeleteAttachment}
                            onCopyPrompt={handleCopyResponse}
                            onSharePrompt={() => {
                              handleCopyLink(window.location.href)
                              showToast('Prompt link copied to clipboard', 'success')
                            }}
                            onStartEdit={(msg) => {
                              setEditingMessageId(msg.id)
                              setEditContent(msg.content)
                            }}
                          />
                        ) : (
                          /* Assistant Response (ChatGPT 100% Centered Layout matching Image 1) */
                          <div
                            className="w-full space-y-2 group relative assistant-message-card py-1 animate-fade-in-up"
                            style={{ contentVisibility: 'auto', containIntrinsicSize: '150px' }}
                          >
                            {/* Metadata Header with Inline AI Sparkles Icon */}
                            <div className="flex items-center justify-between text-[10px] font-semibold text-slate-400 select-none pb-1">
                              <div className="flex items-center gap-2">
                                <div className="size-5 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 p-[1px] shrink-0 flex items-center justify-center">
                                  <div className="size-full bg-[#121214] rounded-full flex items-center justify-center">
                                    <Sparkles size={10} className="text-indigo-400" />
                                  </div>
                                </div>
                                <span className="bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2 py-0.5 rounded-full font-mono text-[9px] uppercase tracking-wider font-bold">
                                  {selectedModel.name || 'NovaMind AI'}
                                </span>
                                {message.content && (
                                  <span className="text-[10px] text-slate-500 font-medium hidden sm:inline">
                                    {message.content.trim().split(/\s+/).filter(Boolean).length} words · {Math.max(1, Math.ceil(message.content.trim().split(/\s+/).filter(Boolean).length / 200))} min read
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-slate-500 font-medium">{formatTime(message.created_at)}</span>
                              </div>
                            </div>

                            {/* Message Body with Markdown support */}
                            <div className="text-sm sm:text-base text-[#ececec] font-normal leading-[1.8] tracking-wide select-text">
                              <MarkdownRenderer content={message.content} />
                            </div>

                            {/* Assistant Attachments - Image previews directly */}
                            {message.attachments && message.attachments.some((f) => f.type.startsWith('image/') && !deletedAttachmentUrls.includes(f.url)) && (
                              <div className="mt-3 flex flex-wrap gap-2 pt-2 border-t border-white/5 justify-start">
                                {message.attachments.filter((f) => f.type.startsWith('image/') && !deletedAttachmentUrls.includes(f.url)).map((file, idx) => (
                                  <div key={idx} className="relative group">
                                    <button
                                      onClick={() => {
                                        setActiveImageViewerUrl(file.url)
                                        setActiveImageViewerName(file.name)
                                        setZoomScale(1)
                                        setImageFullscreen(false)
                                      }}
                                      className="block overflow-hidden rounded-xl border border-white/10 hover:border-white/20 transition max-w-[280px] shadow-lg text-left"
                                    >
                                      <img src={file.url} alt={file.name} className="max-h-56 w-full object-cover rounded-xl" />
                                    </button>
                                    {/* Quick Actions overlay for images */}
                                    <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-[#1e1e1e]/85 backdrop-blur rounded-lg p-1 border border-white/10 shadow-lg">
                                      <button onClick={() => handleDownloadAttachment(file.url, file.name)} className="p-1 hover:bg-white/10 rounded text-slate-350 hover:text-white" title="Download"><FileDown size={11} /></button>
                                      <button onClick={() => handleCopyLink(file.url)} className="p-1 hover:bg-white/10 rounded text-slate-350 hover:text-white" title="Copy Link"><Copy size={11} /></button>
                                      <button onClick={() => handleDeleteAttachment(file.url)} className="p-1 hover:bg-rose-500/25 rounded text-rose-400 hover:text-rose-300" title="Delete"><Trash2 size={11} /></button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Assistant Attachments - Files rendering */}
                            {message.attachments && message.attachments.some((f) => !f.type.startsWith('image/') && !deletedAttachmentUrls.includes(f.url)) && (
                              <div className="mt-2.5 flex flex-wrap gap-2 justify-start">
                                {message.attachments.filter((f) => !f.type.startsWith('image/') && !deletedAttachmentUrls.includes(f.url)).map((file, idx) => {
                                  const isVideo = file.type.startsWith('video/')
                                  const isPdf = file.type === 'application/pdf' || file.name.endsWith('.pdf')

                                  return (
                                    <div
                                      key={idx}
                                      className="relative group flex items-center gap-3 rounded-xl border border-white/10 bg-slate-950/60 p-3 pr-4 hover:bg-slate-950 transition min-w-[220px] max-w-[280px]"
                                    >
                                      <div className="size-10 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                                        {isVideo ? (
                                          <Play size={18} className="text-indigo-400" />
                                        ) : isPdf ? (
                                          <FileText size={18} className="text-rose-400" />
                                        ) : (
                                          <FileText size={18} className="text-cyan-400" />
                                        )}
                                      </div>
                                      <div className="min-w-0 flex-1">
                                        <p className="truncate text-xs font-semibold text-white">{file.name}</p>
                                        <p className="text-[10px] text-slate-500 font-medium">{(file.size / 1024).toFixed(1)} KB</p>
                                      </div>
                                      {/* Quick Actions overlay for files */}
                                      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-[#212121] border border-white/10 rounded-lg p-1 shadow-lg">
                                        {isVideo ? (
                                          <button
                                            onClick={() => {
                                              setActiveVideoPlayerUrl(file.url)
                                              setActiveVideoPlayerName(file.name)
                                            }}
                                            className="p-1 hover:bg-white/10 rounded text-indigo-400"
                                            title="Play Video"
                                          >
                                            <Play size={11} />
                                          </button>
                                        ) : (
                                          <button
                                            onClick={() => window.open(file.url, '_blank')}
                                            className="p-1 hover:bg-white/10 rounded text-cyan-400"
                                            title="Open in Tab"
                                          >
                                            <ArrowUp size={11} className="rotate-45" />
                                          </button>
                                        )}
                                        <button onClick={() => handleDownloadAttachment(file.url, file.name)} className="p-1 hover:bg-white/10 rounded text-slate-300" title="Download"><FileDown size={11} /></button>
                                        <button onClick={() => handleCopyLink(file.url)} className="p-1 hover:bg-white/10 rounded text-slate-300" title="Copy Link"><Copy size={11} /></button>
                                        <button onClick={() => handleDeleteAttachment(file.url)} className="p-1 hover:bg-rose-500/20 rounded text-rose-400" title="Delete"><Trash2 size={11} /></button>
                                      </div>
                                    </div>
                                  )
                                })}
                              </div>
                            )}

                            {/* Actions toolbar: ONLY show after response is fully generated */}
                            {!isGeneratingThisMessage && (
                              <div className="flex items-center gap-1.5 sm:gap-2.5 mt-2.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200 text-slate-400 select-none">
                                {/* 1. Copy */}
                                <button
                                  onClick={() => handleCopyResponse(message.content)}
                                  className="p-1.5 rounded-lg hover:bg-white/10 hover:text-white transition duration-150 active:scale-95 cursor-pointer"
                                  title="Copy response"
                                >
                                  <Copy size={16} />
                                </button>

                                {/* 2. ThumbsUp */}
                                <button
                                  onClick={() => toggleLike(message.id)}
                                  className={`p-1.5 rounded-lg hover:bg-white/10 transition duration-150 active:scale-95 cursor-pointer ${likes[message.id] ? 'text-indigo-400 bg-indigo-500/10' : 'hover:text-white'
                                    }`}
                                  title="Good response"
                                >
                                  <ThumbsUp size={16} />
                                </button>

                                {/* 3. ThumbsDown */}
                                <button
                                  onClick={() => toggleDislike(message.id)}
                                  className={`p-1.5 rounded-lg hover:bg-white/10 transition duration-150 active:scale-95 cursor-pointer ${dislikes[message.id] ? 'text-rose-400 bg-rose-500/10' : 'hover:text-white'
                                    }`}
                                  title="Bad response"
                                >
                                  <ThumbsDown size={16} />
                                </button>

                                {/* 4. Share / Export */}
                                <button
                                  onClick={() => {
                                    handleCopyLink(window.location.href)
                                    showToast('Share link copied to clipboard', 'success')
                                  }}
                                  className="p-1.5 rounded-lg hover:bg-white/10 hover:text-white transition duration-150 active:scale-95 cursor-pointer"
                                  title="Share response"
                                >
                                  <Upload size={16} />
                                </button>

                                {/* 5. Regenerate */}
                                <button
                                  onClick={() => handleRegenerate(message)}
                                  className="p-1.5 rounded-lg hover:bg-white/10 hover:text-white transition duration-150 active:scale-95 cursor-pointer"
                                  title="Regenerate response"
                                >
                                  <RefreshCw size={16} />
                                </button>

                                {/* 6. More Options (...) */}
                                <div className="relative">
                                  <button
                                    onClick={() => setOpenDownloadId(openDownloadId === message.id ? null : message.id)}
                                    className="p-1.5 rounded-lg hover:bg-white/10 hover:text-white transition duration-150 active:scale-95 cursor-pointer"
                                    title="More options"
                                  >
                                    <MoreHorizontal size={16} />
                                  </button>

                                  {openDownloadId === message.id && (
                                    <>
                                      <div className="fixed inset-0 z-40" onClick={() => setOpenDownloadId(null)} />
                                      <div className="absolute left-0 bottom-full mb-2 z-50 w-44 rounded-2xl border border-white/10 bg-[#212121] p-1.5 shadow-2xl text-left select-none space-y-0.5">
                                        <button
                                          onClick={() => {
                                            handleEditPrompt(message)
                                            setOpenDownloadId(null)
                                          }}
                                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs rounded-xl hover:bg-white/10 hover:text-white transition font-medium text-slate-300 cursor-pointer"
                                        >
                                          <Edit3 size={14} className="text-indigo-400" />
                                          <span>Edit Prompt</span>
                                        </button>
                                        <button
                                          onClick={() => {
                                            downloadTXT(message.content)
                                            setOpenDownloadId(null)
                                          }}
                                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs rounded-xl hover:bg-white/10 hover:text-white transition font-medium text-slate-300 cursor-pointer"
                                        >
                                          <FileText size={14} className="text-slate-400" />
                                          <span>Download (.txt)</span>
                                        </button>
                                        <button
                                          onClick={() => {
                                            downloadMD(message.content)
                                            setOpenDownloadId(null)
                                          }}
                                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs rounded-xl hover:bg-white/10 hover:text-white transition font-medium text-slate-300 cursor-pointer"
                                        >
                                          <FileText size={14} className="text-purple-400" />
                                          <span>Download (.md)</span>
                                        </button>
                                        <button
                                          onClick={() => {
                                            downloadPDF(message.content)
                                            setOpenDownloadId(null)
                                          }}
                                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs rounded-xl hover:bg-white/10 hover:text-white transition font-medium text-slate-300 cursor-pointer"
                                        >
                                          <FileText size={14} className="text-rose-400" />
                                          <span>Download (.pdf)</span>
                                        </button>
                                      </div>
                                    </>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </motion.article>
                    )
                  })}

                  {/* Typing/Thinking indicators - directly below the prompt */}
                  {isThinking && (
                    <div className="flex gap-4 pt-2 select-none items-center">
                      <div className="size-8 rounded-full bg-slate-900 border border-white/10 overflow-hidden shrink-0 flex items-center justify-center">
                        <Sparkles size={14} className="text-indigo-400 animate-pulse" />
                      </div>
                      <div className="flex-1 py-2 px-1 flex items-center gap-1.5">
                        <span className="size-1.5 bg-slate-400 rounded-full animate-typing-dot" style={{ animationDelay: '0ms' }} />
                        <span className="size-1.5 bg-slate-400 rounded-full animate-typing-dot" style={{ animationDelay: '150ms' }} />
                        <span className="size-1.5 bg-slate-400 rounded-full animate-typing-dot" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  )}
                </div>

              )}

            </div>

            {/* Scroll bottom anchor with ample clearance above composer */}
            <div ref={messageEndRef} className="h-10 sm:h-14 shrink-0 pointer-events-none" />

            {/* Directional Mutually Exclusive Scroll FAB Buttons (Laptop & Desktop only) */}
            <div className="hidden md:flex fixed bottom-28 right-6 z-30 flex-col gap-2 pointer-events-auto">
              <AnimatePresence mode="wait">
                {showScrollTop && (
                  <motion.button
                    key="scroll-top"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    onClick={scrollToTop}
                    type="button"
                    title="Scroll to Top"
                    className="flex size-9 items-center justify-center rounded-full border border-white/10 bg-[#212121] text-slate-400 hover:bg-[#2f2f2f] hover:text-white shadow-xl transition duration-150 cursor-pointer"
                  >
                    <ChevronUp size={18} />
                  </motion.button>
                )}
                {showScrollBottom && (
                  <motion.button
                    key="scroll-bottom"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    onClick={scrollToBottom}
                    type="button"
                    title="Scroll to Bottom"
                    className="flex size-9 items-center justify-center rounded-full border border-white/10 bg-[#212121] text-slate-400 hover:bg-[#2f2f2f] hover:text-white shadow-xl transition duration-150 cursor-pointer"
                  >
                    <ChevronDown size={18} />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </div>



          {/* FIXED BOTTOM INPUT PANEL */}
          <footer
            className="fixed bottom-0 right-0 p-4 bg-transparent z-15 transition-all duration-300 pointer-events-none"
            style={{
              left: isFullscreen
                ? '0px'
                : (isDesktop || isTablet
                  ? (sidebarCollapsed ? '64px' : (isTablet ? '240px' : '260px'))
                  : '0px')
            }}
          >
            <div className="w-full max-w-full sm:max-w-[720px] md:max-w-[800px] lg:max-w-[850px] xl:max-w-[900px] mx-auto pointer-events-auto px-2 sm:px-0">

              {/* ChatGPT Message Composer */}
              <ChatMessageComposer
                prompt={prompt}
                setPrompt={setPrompt}
                pendingAttachments={pendingAttachments}
                setPendingAttachments={setPendingAttachments}
                onSend={handleSend}
                isSending={isSending}
                isThinking={isThinking}
                stopGeneration={stopGeneration}
                isUploadingFiles={isUploadingFiles}
                toggleSpeechRecognition={toggleSpeechRecognition}
                isListening={isListening}
                triggerFileInput={triggerFileInput}
                fileInputRef={fileInputRef}
                imageInputRef={imageInputRef}
                handleFileChange={handleFileChange}
                removePendingAttachment={removePendingAttachment}
                setIsPromptLibraryOpen={setIsPromptLibraryOpen}
                onOpenImageViewer={(url, name) => {
                  setActiveImageViewerUrl(url)
                  setActiveImageViewerName(name)
                  setZoomScale(1)
                  setImageFullscreen(false)
                }}
                showToast={showToast}
                textareaRef={textareaRef}
              />

              {/* Disclaimer */}
              <div className="mt-2 text-center select-none hidden sm:block">
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

      {/* Image Viewer Popup Modal */}
      {activeImageViewerUrl && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200">
          {/* Top Info Bar */}
          <div className="absolute top-4 left-6 right-6 flex items-center justify-between z-10 text-white select-none">
            <span className="text-sm font-semibold truncate max-w-lg">{activeImageViewerName}</span>
            <button
              onClick={() => setActiveImageViewerUrl(null)}
              className="rounded-full bg-white/10 hover:bg-white/20 p-2 text-white transition active:scale-95 cursor-pointer"
              title="Close image viewer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Main Viewer Area */}
          <div
            className="flex-1 w-full flex items-center justify-center overflow-auto select-none"
            onClick={() => setActiveImageViewerUrl(null)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="transition-transform duration-200 ease-out"
              style={{
                transform: `scale(${zoomScale})`,
                maxHeight: imageFullscreen ? '100vh' : '80vh',
                maxWidth: imageFullscreen ? '100vw' : '90vw',
              }}
            >
              <img
                src={activeImageViewerUrl}
                alt={activeImageViewerName || ''}
                className="max-h-[80vh] max-w-[90vw] object-contain rounded-lg shadow-2xl border border-white/10"
              />
            </div>
          </div>

          {/* Bottom Zoom / Control Panel */}
          <div className="absolute bottom-6 flex items-center gap-3 bg-[#212121]/90 backdrop-blur border border-white/10 px-4 py-2 rounded-full shadow-2xl z-10 select-none">
            <button
              onClick={() => setZoomScale(prev => Math.max(0.5, prev - 0.25))}
              className="p-2 text-slate-350 hover:text-white hover:bg-white/5 rounded-full transition active:scale-90 cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut size={16} />
            </button>
            <span className="text-xs font-semibold text-white px-1">{Math.round(zoomScale * 100)}%</span>
            <button
              onClick={() => setZoomScale(prev => Math.min(3, prev + 0.25))}
              className="p-2 text-slate-350 hover:text-white hover:bg-white/5 rounded-full transition active:scale-90 cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn size={16} />
            </button>
            <div className="h-4 w-px bg-white/10" />
            <button
              onClick={() => {
                setZoomScale(1)
                setImageFullscreen(false)
              }}
              className="p-2 text-slate-350 hover:text-white hover:bg-white/5 rounded-full transition active:scale-90 cursor-pointer"
              title="Reset Zoom"
            >
              <RefreshCw size={14} />
            </button>
            <button
              onClick={() => setImageFullscreen(!imageFullscreen)}
              className="p-2 text-slate-350 hover:text-white hover:bg-white/5 rounded-full transition active:scale-90 cursor-pointer"
              title={imageFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              {imageFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>
          </div>
        </div>
      )}

      {/* Video Player Popup Modal */}
      {activeVideoPlayerUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-4xl bg-[#0d0d0d] border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
            {/* Header */}
            <div className="px-6 py-4 flex items-center justify-between border-b border-white/5 bg-[#171717]/85 text-white select-none">
              <span className="text-sm font-semibold truncate max-w-lg">{activeVideoPlayerName}</span>
              <button
                onClick={() => setActiveVideoPlayerUrl(null)}
                className="rounded-full bg-white/5 hover:bg-white/10 p-1.5 text-slate-300 hover:text-white transition active:scale-95 cursor-pointer"
                title="Close video player"
              >
                <X size={16} />
              </button>
            </div>
            {/* Video Canvas */}
            <div className="bg-black aspect-video flex items-center justify-center">
              <video
                src={activeVideoPlayerUrl}
                controls
                autoPlay
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>
      )}

      {/* Code Interactive Artifact Sandbox Modal */}
      <CodePreviewModal
        isOpen={codePreviewState.isOpen}
        onClose={() => setCodePreviewState((prev) => ({ ...prev, isOpen: false }))}
        code={codePreviewState.code}
        language={codePreviewState.language}
      />

      {/* Claude-style Live Code Artifacts Sandbox Drawer */}
      <ArtifactsDrawer
        isOpen={artifactsDrawerState.isOpen}
        onClose={() => setArtifactsDrawerState((prev) => ({ ...prev, isOpen: false }))}
        codeContent={artifactsDrawerState.code}
        language={artifactsDrawerState.language}
      />

      {/* Prompt Templates Library Modal */}
      <PromptLibraryModal
        isOpen={isPromptLibraryOpen}
        onClose={() => setIsPromptLibraryOpen(false)}
        onSelectPrompt={(selectedText) => {
          setPrompt((prev) => (prev ? `${prev}\n\n${selectedText}` : selectedText))
          textareaRef.current?.focus()
        }}
      />

      {/* Navigation Command Palette (Ctrl + K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNewChat={() => void createChat()}
        onOpenPrompts={() => setIsPromptLibraryOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        onExportChat={() => {
          if (selectedChat) {
            exportChatToMarkdown(selectedChat.title, messages)
            showToast('Exported chat history to Markdown', 'success')
          } else {
            showToast('No active chat selected to export', 'error')
          }
        }}
        chats={chats}
        onSelectChat={(chat) => selectChat(chat)}
      />

      {/* Right-Side Question History Navigation Shortcut */}
      <QuestionNavShortcut messages={messages} chatContainerRef={chatViewportRef} />
    </main>
  )
}
