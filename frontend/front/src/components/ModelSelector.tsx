import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, ChevronDown, Check, Cpu, Zap } from 'lucide-react'

export interface AIModel {
  id: string
  name: string
  description: string
  isPro?: boolean
  icon: typeof Sparkles
}

export const AI_MODELS: AIModel[] = [
  {
    id: 'novamind-pro',
    name: 'NovaMind Pro',
    description: 'Our smartest model & more',
    isPro: true,
    icon: Sparkles,
  },
  {
    id: 'novamind-ai',
    name: 'NovaMind AI',
    description: 'Great for everyday tasks',
    isPro: false,
    icon: Zap,
  },
  {
    id: 'novamind-ultra',
    name: 'NovaMind Ultra',
    description: 'Deep reasoning & complex math logic',
    isPro: false,
    icon: Cpu,
  },
]

interface ModelSelectorProps {
  selectedModelId: string
  onSelectModel: (model: AIModel) => void
  compactMobile?: boolean
}

export function ModelSelector({ selectedModelId, onSelectModel, compactMobile = false }: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const currentModel = AI_MODELS.find((m) => m.id === selectedModelId) || AI_MODELS[1]

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative inline-block text-left select-none z-40" ref={menuRef}>
      {/* Header Dropdown Trigger Button */}
      {compactMobile ? (
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="flex items-center gap-1.5 text-sm sm:text-base font-bold tracking-tight text-white hover:text-slate-200 transition border-none cursor-pointer select-none group px-1 py-0.5"
        >
          <span>NovaMind AI</span>
          <ChevronDown
            size={14}
            className={`text-slate-300 transition-transform duration-200 group-hover:text-white ${
              isOpen ? 'rotate-180 text-white' : ''
            }`}
          />
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-transparent hover:bg-white/5 text-white transition border-none cursor-pointer active:scale-98 select-none group"
        >
          {/* Purple/Blue Gradient Lightning Bolt Icon */}
          <svg className="size-4.5 shrink-0" viewBox="0 0 24 24" fill="none">
            <path
              d="M13 2L3 14h7v8l11-12h-8V2z"
              fill="url(#header-lightning-grad)"
            />
            <defs>
              <linearGradient id="header-lightning-grad" x1="3" y1="2" x2="21" y2="22" gradientUnits="userSpaceOnUse">
                <stop stopColor="#a855f7" />
                <stop offset="1" stopColor="#3b82f6" />
              </linearGradient>
            </defs>
          </svg>

          {/* Chatbot Name: NovaMind AI */}
          <span className="text-sm font-bold tracking-tight text-white font-sans">
            NovaMind AI
          </span>

          {/* Dropdown Arrow */}
          <ChevronDown
            size={14}
            className={`text-slate-400 transition-transform duration-200 group-hover:text-white ${
              isOpen ? 'rotate-180 text-white' : ''
            }`}
          />
        </button>
      )}

      {/* ChatGPT-Style Model Selector Popup (Matching Image 2) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 mt-2 w-[calc(100vw-2rem)] sm:w-80 max-w-xs rounded-2xl border border-white/10 bg-[#262626] p-2 shadow-2xl backdrop-blur-xl z-50 select-none"
          >
            <div className="space-y-1">
              {AI_MODELS.map((model) => {
                const isSelected = model.id === currentModel.id
                const ModelIcon = model.icon
                return (
                  <div
                    key={model.id}
                    onClick={() => {
                      onSelectModel(model)
                      setIsOpen(false)
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-xl transition cursor-pointer ${
                      isSelected
                        ? 'bg-white/10 text-white'
                        : 'text-slate-300 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
                      <div className="size-8 rounded-xl bg-white/5 flex items-center justify-center shrink-0 text-slate-200">
                        <ModelIcon size={18} className={model.isPro ? 'text-purple-400' : 'text-slate-300'} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-white truncate">
                          {model.name}
                        </p>
                        <p className="text-xs text-slate-400 truncate">
                          {model.description}
                        </p>
                      </div>
                    </div>

                    {model.isPro ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          onSelectModel(model)
                          setIsOpen(false)
                        }}
                        className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition shrink-0 cursor-pointer border border-white/10"
                      >
                        Upgrade
                      </button>
                    ) : isSelected ? (
                      <Check size={18} className="text-indigo-400 shrink-0" />
                    ) : null}
                  </div>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
