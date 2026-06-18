/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useContext,
  useState,
  type ReactNode,
} from 'react'
import { api, errorMessage } from '../lib/api'
import type { Chat, Message, PaginatedResponse, ApiResource, UserSettings } from '../types/api'
import { useToast } from './ToastContext'
import { useAuth } from './useAuth'

// Extend Chat interface to support saved attribute
export interface ExtendedChat extends Chat {
  saved: boolean
}

// Extend Message interface to support attachments
export interface Attachment {
  name: string
  url: string
  type: string
  size: number
}

export interface ExtendedMessage extends Message {
  attachments?: Attachment[] | null
}

interface SpeechRecognitionAlternativeLike {
  transcript: string
}

interface SpeechRecognitionResultLike {
  isFinal: boolean
  0: SpeechRecognitionAlternativeLike
}

interface SpeechRecognitionEventLike {
  resultIndex: number
  results: ArrayLike<SpeechRecognitionResultLike>
}

interface SpeechRecognitionErrorEventLike {
  error: string
}

interface SpeechRecognitionLike {
  continuous: boolean
  interimResults: boolean
  lang: string
  onend: (() => void) | null
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null
  onresult: ((event: SpeechRecognitionEventLike) => void) | null
  start: () => void
  stop: () => void
}

interface SpeechRecognitionWindow extends Window {
  SpeechRecognition?: new () => SpeechRecognitionLike
  webkitSpeechRecognition?: new () => SpeechRecognitionLike
}

interface ChatContextValue {
  chats: ExtendedChat[]
  selectedChat: ExtendedChat | null
  messages: ExtendedMessage[]
  isLoadingChats: boolean
  isLoadingMessages: boolean
  isSending: boolean
  searchQuery: string
  setSearchQuery: (query: string) => void
  sortBy: 'date' | 'name'
  setSortBy: (sort: 'date' | 'name') => void
  filterSavedOnly: boolean
  setFilterSavedOnly: (saved: boolean) => void
  isProfileOpen: boolean
  setIsProfileOpen: (open: boolean) => void
  isSettingsOpen: boolean
  setIsSettingsOpen: (open: boolean) => void
  
  // Chat Actions
  loadChats: () => Promise<void>
  selectChat: (chat: ExtendedChat) => Promise<void>
  createChat: (title?: string) => Promise<ExtendedChat>
  renameChat: (chatId: number, title: string) => Promise<void>
  deleteChat: (chatId: number) => Promise<void>
  togglePinChat: (chat: ExtendedChat) => Promise<void>
  toggleSaveChat: (chat: ExtendedChat) => Promise<void>
  sendMessage: (content: string, attachments?: Attachment[]) => Promise<void>
  
  // Settings Actions
  settings: UserSettings
  updateSettings: (newSettings: Partial<UserSettings>) => Promise<void>
  isSavingSettings: boolean

  // File Upload Action
  uploadFile: (file: File) => Promise<Attachment>
  
  // Speech Recognition
  isListening: boolean
  toggleSpeechRecognition: (onTranscript: (text: string) => void) => void

  // Speech Playback (TTS)
  speakingMessageId: number | null
  speakText: (messageId: number, text: string) => void
  stopSpeaking: () => void
}

const ChatContext = createContext<ChatContextValue | undefined>(undefined)

function defaultSettings(userId = 0): UserSettings {
  return {
    id: 0,
    user_id: userId,
    theme: 'dark',
    language: 'en',
    model: 'nova-pro',
    notifications: true,
    updated_at: null,
  }
}

export function ChatProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const { showToast } = useToast()
  
  const [chats, setChats] = useState<ExtendedChat[]>([])
  const [selectedChat, setSelectedChat] = useState<ExtendedChat | null>(null)
  const [messages, setMessages] = useState<ExtendedMessage[]>([])
  
  const [isLoadingChats, setIsLoadingChats] = useState(false)
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [isSending, setIsSending] = useState(false)
  
  // Filtering & Sorting
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'date' | 'name'>('date')
  const [filterSavedOnly, setFilterSavedOnly] = useState(false)
  
  // Modals Visibility
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  
  // Settings
  const [settings, setSettings] = useState<UserSettings>(defaultSettings(user?.id))
  const [isSavingSettings, setIsSavingSettings] = useState(false)

  // Speech Recognition
  const [isListening, setIsListening] = useState(false)
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSettings(user?.settings ?? defaultSettings(user?.id))
    }, 0)

    return () => window.clearTimeout(timer)
  }, [user])

  // Initialize Speech Recognition
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const speechWindow = window as SpeechRecognitionWindow
      const SpeechRecognition =
        speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition()
        recognition.continuous = true
        recognition.interimResults = true
        recognition.lang =
          settings.language === 'en'
            ? 'en-US'
            : settings.language === 'es'
              ? 'es-ES'
              : settings.language === 'fr'
                ? 'fr-FR'
                : 'hi-IN'
        recognitionRef.current = recognition
      }
    }, 0)

    return () => window.clearTimeout(timer)
  }, [settings.language])

  // Load Chats list
  const loadChats = useCallback(async () => {
    setIsLoadingChats(true)
    try {
      const params = new URLSearchParams()
      params.append('sort_by', sortBy)
      if (searchQuery.trim()) {
        params.append('search', searchQuery)
      }
      if (filterSavedOnly) {
        params.append('saved', '1')
      }

      const { data } = await api.get<PaginatedResponse<ExtendedChat>>(`/chats?${params.toString()}`)
      setChats(data.data)
    } catch (err) {
      showToast(errorMessage(err), 'error')
    } finally {
      setIsLoadingChats(false)
    }
  }, [sortBy, searchQuery, filterSavedOnly, showToast])

  useEffect(() => {
    if (user) {
      const timer = window.setTimeout(() => {
        void loadChats()
      }, 0)

      return () => window.clearTimeout(timer)
    }

    return undefined
  }, [loadChats, user])

  // Select a chat
  const selectChat = useCallback(async (chat: ExtendedChat) => {
    setIsLoadingMessages(true)
    try {
      const { data } = await api.get<ApiResource<ExtendedChat>>(`/chats/${chat.id}`)
      setSelectedChat(data.data)
      setMessages(data.data.messages ?? [])
    } catch (err) {
      showToast(errorMessage(err), 'error')
    } finally {
      setIsLoadingMessages(false)
    }
  }, [showToast])

  // Create new chat
  const createChat = useCallback(async (title = 'New chat') => {
    try {
      const { data } = await api.post<ApiResource<ExtendedChat>>('/chats', { title })
      setChats((prev) => [data.data, ...prev])
      setSelectedChat(data.data)
      setMessages([])
      return data.data
    } catch (err) {
      showToast(errorMessage(err), 'error')
      throw err;
    }
  }, [showToast])

  // Rename a chat
  const renameChat = useCallback(async (chatId: number, title: string) => {
    try {
      const { data } = await api.patch<ApiResource<ExtendedChat>>(`/chats/${chatId}`, { title })
      setChats((prev) => prev.map((c) => (c.id === chatId ? { ...c, title: data.data.title } : c)))
      if (selectedChat?.id === chatId) {
        setSelectedChat((prev) => prev ? { ...prev, title: data.data.title } : null)
      }
      showToast('Conversation renamed', 'success')
    } catch (err) {
      showToast(errorMessage(err), 'error')
    }
  }, [selectedChat, showToast])

  // Delete a chat
  const deleteChat = useCallback(async (chatId: number) => {
    try {
      await api.delete(`/chats/${chatId}`)
      setChats((prev) => prev.filter((c) => c.id !== chatId))
      if (selectedChat?.id === chatId) {
        setSelectedChat(null)
        setMessages([])
      }
      showToast('Conversation deleted', 'success')
    } catch (err) {
      showToast(errorMessage(err), 'error')
    }
  }, [selectedChat, showToast])

  // Toggle pin chat
  const togglePinChat = useCallback(async (chat: ExtendedChat) => {
    try {
      const { data } = await api.patch<ApiResource<ExtendedChat>>(`/chats/${chat.id}`, {
        pinned: !chat.pinned,
      })
      
      setChats((prev) =>
        prev
          .map((c) => (c.id === chat.id ? data.data : c))
          .sort((a, b) => Number(b.pinned) - Number(a.pinned))
      )
      
      if (selectedChat?.id === chat.id) {
        setSelectedChat((prev) => prev ? { ...prev, pinned: data.data.pinned } : null)
      }
      
      showToast(data.data.pinned ? 'Chat pinned to top' : 'Chat unpinned', 'success')
    } catch (err) {
      showToast(errorMessage(err), 'error')
    }
  }, [selectedChat, showToast])

  // Toggle save chat
  const toggleSaveChat = useCallback(async (chat: ExtendedChat) => {
    try {
      const { data } = await api.patch<ApiResource<ExtendedChat>>(`/chats/${chat.id}`, {
        saved: !chat.saved,
      })
      
      setChats((prev) =>
        prev.map((c) => (c.id === chat.id ? data.data : c))
      )
      
      if (selectedChat?.id === chat.id) {
        setSelectedChat((prev) => prev ? { ...prev, saved: data.data.saved } : null)
      }
      
      showToast(data.data.saved ? 'Added to Saved Chats' : 'Removed from Saved Chats', 'success')
    } catch (err) {
      showToast(errorMessage(err), 'error')
    }
  }, [selectedChat, showToast])

  // Send message
  const sendMessage = useCallback(async (content: string, attachments: Attachment[] = []) => {
    if ((!content.trim() && attachments.length === 0) || isSending) return

    setIsSending(true)
    try {
      let activeChat = selectedChat
      if (!activeChat) {
        activeChat = await createChat(content.trim() ? content.trim() : 'Attachment Upload')
      }

      const { data } = await api.post<ApiResource<{ user: ExtendedMessage; assistant: ExtendedMessage }>>(`/chats/${activeChat.id}/messages`, {
        role: 'user',
        content: content.trim(),
        attachments: attachments.length > 0 ? attachments : null,
      })

      setMessages((prev) => [
        ...prev,
        data.data.user,
        ...(data.data.assistant ? [data.data.assistant] : []),
      ])

      // Trigger loadChats to refresh titles/counts/sorting on sidebar
      void loadChats()

      // Final synchronization
      const chatDetails = await api.get<ApiResource<ExtendedChat>>(`/chats/${activeChat.id}`)
      setSelectedChat(chatDetails.data.data)
      setMessages(chatDetails.data.data.messages ?? [])
      void loadChats()
    } catch (err) {
      showToast(errorMessage(err), 'error')
      if (selectedChat) {
        try {
          const chatDetails = await api.get<ApiResource<ExtendedChat>>(`/chats/${selectedChat.id}`)
          setSelectedChat(chatDetails.data.data)
          setMessages(chatDetails.data.data.messages ?? [])
        } catch {
          // Keep the original send error visible.
        }
      }
    } finally {
      setIsSending(false)
    }
  }, [selectedChat, createChat, loadChats, isSending, showToast])

  // Save/Update settings
  const updateSettings = useCallback(async (newSettings: Partial<UserSettings>) => {
    setIsSavingSettings(true)
    try {
      const payload = {
        theme: newSettings.theme ?? settings.theme,
        language: newSettings.language ?? settings.language,
        model: newSettings.model ?? settings.model,
        notifications: newSettings.notifications ?? settings.notifications,
      }
      const { data } = await api.patch<ApiResource<UserSettings>>('/settings', payload)
      setSettings(data.data)
      showToast('Settings saved successfully', 'success')
    } catch (err) {
      showToast(errorMessage(err), 'error')
    } finally {
      setIsSavingSettings(false)
    }
  }, [settings, showToast])

  // Upload file API integration
  const uploadFile = useCallback(async (file: File): Promise<Attachment> => {
    const formData = new FormData()
    formData.append('file', file)

    try {
      const { data } = await api.post<Attachment>('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      return data
    } catch (err) {
      showToast(errorMessage(err), 'error')
      throw err
    }
  }, [showToast])

  // Speech Recognition Controller
  const toggleSpeechRecognition = useCallback((onTranscript: (text: string) => void) => {
    const recognition = recognitionRef.current

    if (!recognition) {
      showToast('Speech recognition not supported in this browser.', 'error')
      return
    }

    if (isListening) {
      recognition.stop()
      setIsListening(false)
    } else {
      recognition.onresult = (event: SpeechRecognitionEventLike) => {
        let finalTranscript = ''
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript
          }
        }
        if (finalTranscript) {
          onTranscript(finalTranscript)
        }
      }
      recognition.onerror = (event: SpeechRecognitionErrorEventLike) => {
        showToast(`Speech recognition error: ${event.error}`, 'error')
        recognition.stop()
        setIsListening(false)
      }
      recognition.onend = () => {
        setIsListening(false)
      }

      recognition.start()
      setIsListening(true)
      showToast('Voice typing active. Speak clearly.', 'info')
    }
  }, [isListening, showToast])

  // Speech Playback (TTS)
  const [speakingMessageId, setSpeakingMessageId] = useState<number | null>(null)

  const stopSpeaking = useCallback(() => {
    window.speechSynthesis.cancel()
    setSpeakingMessageId(null)
  }, [])

  const speakText = useCallback((messageId: number, text: string) => {
    window.speechSynthesis.cancel()

    if (speakingMessageId === messageId) {
      setSpeakingMessageId(null)
      return
    }

    const cleanText = text
      .replace(/#+\s+/g, '')
      .replace(/\*\*|__/g, '')
      .replace(/\*|_/g, '')
      .replace(/`{3}[\s\S]*?`{3}/g, '[Code block]')
      .replace(/`([^`]+)`/g, '$1')

    const utterance = new SpeechSynthesisUtterance(cleanText)
    utterance.lang = settings.language === 'en' ? 'en-US' : settings.language === 'es' ? 'es-ES' : settings.language === 'fr' ? 'fr-FR' : 'hi-IN'

    utterance.onend = () => {
      setSpeakingMessageId(null)
    }
    utterance.onerror = () => {
      setSpeakingMessageId(null)
    }

    setSpeakingMessageId(messageId)
    window.speechSynthesis.speak(utterance)
  }, [speakingMessageId, settings.language])

  const contextValue = useMemo<ChatContextValue>(
    () => ({
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
      loadChats,
      selectChat,
      createChat,
      renameChat,
      deleteChat,
      togglePinChat,
      toggleSaveChat,
      sendMessage,
      settings,
      updateSettings,
      isSavingSettings,
      uploadFile,
      isListening,
      toggleSpeechRecognition,
      speakingMessageId,
      speakText,
      stopSpeaking,
    }),
    [
      chats,
      selectedChat,
      messages,
      isLoadingChats,
      isLoadingMessages,
      isSending,
      searchQuery,
      sortBy,
      filterSavedOnly,
      isProfileOpen,
      isSettingsOpen,
      loadChats,
      selectChat,
      createChat,
      renameChat,
      deleteChat,
      togglePinChat,
      toggleSaveChat,
      sendMessage,
      settings,
      updateSettings,
      isSavingSettings,
      uploadFile,
      isListening,
      toggleSpeechRecognition,
      speakingMessageId,
      speakText,
      stopSpeaking,
    ]
  )

  return <ChatContext.Provider value={contextValue}>{children}</ChatContext.Provider>
}

export function useChat() {
  const context = useContext(ChatContext)
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider')
  }
  return context
}
