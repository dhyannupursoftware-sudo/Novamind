import { useState, useEffect, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { type ExtendedMessage } from '../context/ChatContext'
import { MessageSquare } from 'lucide-react'

interface QuestionNavShortcutProps {
  messages: ExtendedMessage[]
  chatContainerRef: React.RefObject<HTMLDivElement | null>
}

export function QuestionNavShortcut({ messages, chatContainerRef }: QuestionNavShortcutProps) {
  const [activeMessageId, setActiveMessageId] = useState<number | null>(null)
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Filter only user questions
  const userQuestions = useMemo(() => {
    return messages.filter((m) => m.role === 'user' && m.content && m.content.trim().length > 0)
  }, [messages])

  // IntersectionObserver to observe visible questions as user scrolls
  useEffect(() => {
    if (userQuestions.length === 0) return

    const container = chatContainerRef.current
    if (!container) return

    const observerOptions: IntersectionObserverInit = {
      root: container,
      rootMargin: '-10% 0px -60% 0px',
      threshold: 0.1,
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const idStr = entry.target.getAttribute('data-msg-id')
          if (idStr) {
            setActiveMessageId(Number(idStr))
          }
        }
      })
    }, observerOptions)

    userQuestions.forEach((msg) => {
      const el = document.getElementById(`msg-${msg.id}`)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [userQuestions, chatContainerRef])

  if (userQuestions.length === 0) return null

  const handleMouseEnter = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current)
      closeTimeoutRef.current = null
    }
    setIsPanelOpen(true)
  }

  const handleMouseLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setIsPanelOpen(false)
    }, 200)
  }

  const handleJumpToQuestion = (msgId: number) => {
    const el = document.getElementById(`msg-${msgId}`)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setActiveMessageId(msgId)
    }
  }

  // Clean prompt text snippet
  const getQuestionText = (content: string) => {
    const cleaned = content.replace(/<file_content[^>]*>[\s\S]*?<\/file_content>/gi, '').trim()
    return cleaned || 'Attached file query'
  }

  return (
    <div
      className="hidden md:flex fixed right-4 top-1/2 -translate-y-1/2 z-40 items-center select-none"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Floating Full Question History Panel */}
      <AnimatePresence>
        {isPanelOpen && (
          <motion.div
            initial={{ opacity: 0, x: 12, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 12, scale: 0.96 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="absolute right-10 top-1/2 -translate-y-1/2 w-[360px] sm:w-[400px] bg-[#121319]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-3.5 z-50 flex flex-col max-h-[60vh] overflow-hidden"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            {/* Panel Header */}
            <div className="flex items-center justify-between px-2 pb-2.5 mb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <MessageSquare size={14} className="text-indigo-400" />
                <span className="text-xs font-bold text-white tracking-wide uppercase">Question History</span>
              </div>
              <span className="text-[10px] font-semibold text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                {userQuestions.length} {userQuestions.length === 1 ? 'Question' : 'Questions'}
              </span>
            </div>

            {/* Questions List */}
            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1.5 custom-scroller">
              {userQuestions.map((msg, index) => {
                const isActive = activeMessageId === msg.id || (activeMessageId === null && index === userQuestions.length - 1)
                const qText = getQuestionText(msg.content)

                return (
                  <div
                    key={msg.id}
                    onClick={() => handleJumpToQuestion(msg.id)}
                    className={`flex items-start gap-2.5 p-2.5 rounded-xl border transition duration-150 cursor-pointer group ${
                      isActive
                        ? 'bg-indigo-600/15 border-indigo-500/40 text-white shadow-sm'
                        : 'bg-white/[0.02] border-white/5 text-slate-300 hover:bg-white/10 hover:text-white hover:border-white/15'
                    }`}
                  >
                    <span
                      className={`text-[10px] font-bold shrink-0 px-2 py-0.5 rounded-md mt-0.5 ${
                        isActive
                          ? 'bg-indigo-500 text-white shadow-sm'
                          : 'bg-white/10 text-slate-400 group-hover:bg-white/20 group-hover:text-white'
                      }`}
                    >
                      Q{index + 1}
                    </span>
                    <p className="text-xs leading-relaxed line-clamp-2 flex-1 font-medium break-words">
                      {qText}
                    </p>
                  </div>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Slim Vertical Question Markers Navigation Bar */}
      <div className="flex flex-col items-end gap-2 py-3 px-1.5 bg-[#0a0b10]/70 backdrop-blur-md rounded-full border border-white/[0.08] shadow-2xl max-h-[65vh] overflow-y-auto scrollbar-none transition-all duration-300">
        {userQuestions.map((msg, index) => {
          const isActive = activeMessageId === msg.id || (activeMessageId === null && index === userQuestions.length - 1)

          return (
            <div
              key={msg.id}
              className="flex items-center justify-end cursor-pointer py-0.5"
              onClick={() => handleJumpToQuestion(msg.id)}
            >
              <button
                type="button"
                aria-label={`Jump to question ${index + 1}`}
                className={`rounded-full transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'w-6 h-[3px] bg-white shadow-[0_0_10px_rgba(255,255,255,0.9)]'
                    : 'w-3.5 h-[2px] bg-white/20 hover:bg-white/40'
                }`}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
