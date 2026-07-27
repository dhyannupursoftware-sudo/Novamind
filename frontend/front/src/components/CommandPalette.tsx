import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Plus,
  Sparkles,
  Settings,
  User,
  FileDown,
  MessageSquare,
  X
} from 'lucide-react'

interface CommandItem {
  id: string
  title: string
  category: string
  icon: any
  action: () => void
}

interface CommandPaletteProps {
  isOpen: boolean
  onClose: () => void
  onNewChat: () => void
  onOpenPrompts: () => void
  onOpenSettings: () => void
  onOpenProfile: () => void
  onExportChat: () => void
  chats: any[]
  onSelectChat: (chat: any) => void
}

export function CommandPalette({
  isOpen,
  onClose,
  onNewChat,
  onOpenPrompts,
  onOpenSettings,
  onOpenProfile,
  onExportChat,
  chats,
  onSelectChat,
}: CommandPaletteProps) {
  const [query, setQuery] = useState('')

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        if (isOpen) {
          onClose()
        } else {
          // Trigger open via key
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const defaultCommands: CommandItem[] = [
    {
      id: 'new-chat',
      title: 'New Conversation',
      category: 'Actions',
      icon: Plus,
      action: () => {
        onNewChat()
        onClose()
      },
    },
    {
      id: 'prompt-library',
      title: 'Open Prompt Library',
      category: 'Tools',
      icon: Sparkles,
      action: () => {
        onOpenPrompts()
        onClose()
      },
    },
    {
      id: 'export-chat',
      title: 'Export Current Chat (.md / .json)',
      category: 'Tools',
      icon: FileDown,
      action: () => {
        onExportChat()
        onClose()
      },
    },
    {
      id: 'settings',
      title: 'Open Settings',
      category: 'Preferences',
      icon: Settings,
      action: () => {
        onOpenSettings()
        onClose()
      },
    },
    {
      id: 'profile',
      title: 'My Profile Account',
      category: 'Preferences',
      icon: User,
      action: () => {
        onOpenProfile()
        onClose()
      },
    },
  ]

  const chatCommands: CommandItem[] = chats.map((chat) => ({
    id: `chat-${chat.id}`,
    title: chat.title || 'Untitled Chat',
    category: 'Recent Chats',
    icon: MessageSquare,
    action: () => {
      onSelectChat(chat)
      onClose()
    },
  }))

  const allItems = [...defaultCommands, ...chatCommands]

  const filteredItems = allItems.filter((item) =>
    item.title.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 sm:pt-28 bg-black/75 backdrop-blur-md p-4">
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          className="w-full max-w-xl bg-[#0c0d12] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[70vh]"
        >
          {/* Search Bar Input */}
          <div className="relative flex items-center px-4 py-3 border-b border-white/10 bg-white/[0.02]">
            <Search className="text-slate-400 mr-3" size={18} />
            <input
              type="text"
              autoFocus
              placeholder="Type a command or search chats... (ESC to close)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-transparent text-white placeholder-slate-500 text-sm font-medium focus:outline-none"
            />
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white transition"
            >
              <X size={16} />
            </button>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-2 scrollbar-thin space-y-1">
            {filteredItems.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">No commands or chats matching "{query}"</div>
            ) : (
              filteredItems.map((item) => {
                const IconComp = item.icon
                return (
                  <div
                    key={item.id}
                    onClick={item.action}
                    className="flex items-center justify-between px-3.5 py-2.5 rounded-xl hover:bg-indigo-600/10 hover:border-indigo-500/20 border border-transparent transition cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 rounded-lg bg-white/5 group-hover:bg-indigo-500/20 text-slate-400 group-hover:text-indigo-300 transition">
                        <IconComp size={16} />
                      </div>
                      <span className="text-sm font-medium text-slate-200 group-hover:text-white transition">
                        {item.title}
                      </span>
                    </div>
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider group-hover:text-indigo-400 transition">
                      {item.category}
                    </span>
                  </div>
                )
              })
            )}
          </div>

          {/* Footer Shortcuts hint */}
          <div className="flex items-center justify-between px-4 py-2 bg-white/[0.02] border-t border-white/5 text-[11px] text-slate-500">
            <span>Navigation Command Palette</span>
            <div className="flex items-center gap-2">
              <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-slate-400 font-mono">↑↓</kbd> navigate
              <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-slate-400 font-mono">ESC</kbd> close
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
