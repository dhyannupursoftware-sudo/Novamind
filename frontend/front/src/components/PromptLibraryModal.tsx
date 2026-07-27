import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Sparkles, Code, PenTool, Briefcase, GraduationCap, Compass, ArrowRight, Search } from 'lucide-react'

interface PromptTemplate {
  id: string
  title: string
  category: string
  description: string
  prompt: string
  icon: any
}

const PROMPT_TEMPLATES: PromptTemplate[] = [
  {
    id: 'code-review',
    title: 'Code Security & Refactoring Review',
    category: 'Coding',
    description: 'Perform a comprehensive code review focusing on performance, security, and best practices.',
    prompt: 'Please review the following code for potential security vulnerabilities, performance bottlenecks, and clean code improvements:\n\n```\n// Paste code here\n```',
    icon: Code,
  },
  {
    id: 'html-app',
    title: 'Build Interactive Web App',
    category: 'Coding',
    description: 'Generate complete, self-contained single-file HTML/CSS/JavaScript interactive applications.',
    prompt: 'Build a complete single-file HTML/CSS/JS interactive dashboard widget for: [Describe feature/app]. Make it responsive, modern, with dark theme and glassmorphism styling.',
    icon: Code,
  },
  {
    id: 'tech-blog',
    title: 'Technical Blog Post Writer',
    category: 'Writing',
    description: 'Draft engaging, structured technical articles with code snippets and clear explanations.',
    prompt: 'Write an engaging 800-word technical blog post about [Topic]. Include code examples, key benefits, and a step-by-step tutorial section.',
    icon: PenTool,
  },
  {
    id: 'email-reply',
    title: 'Professional Executive Email Response',
    category: 'Business',
    description: 'Craft polished, persuasive, and clear business emails.',
    prompt: 'Draft a professional business email reply to address: [Context/Issue]. Keep the tone confident, polite, and action-oriented.',
    icon: Briefcase,
  },
  {
    id: 'explain-like-5',
    title: 'Explain Complex Concept (ELIF)',
    category: 'Education',
    description: 'Break down complicated technical or scientific topics using simple analogies.',
    prompt: 'Explain [Complex Concept] as if I am 10 years old. Use real-world analogies, simple terms, and bullet points for clarity.',
    icon: GraduationCap,
  },
  {
    id: 'brainstorm-startup',
    title: 'SaaS Feature & Architecture Brainstorming',
    category: 'Creative',
    description: 'Generate innovative feature ideas, database schemas, and API design for new software applications.',
    prompt: 'I am building a SaaS app for [Target Audience]. Brainstorm 5 unique features, database model relationships, and monetization strategies.',
    icon: Compass,
  },
]

interface PromptLibraryModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectPrompt: (promptText: string) => void
}

export function PromptLibraryModal({ isOpen, onClose, onSelectPrompt }: PromptLibraryModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [searchQuery, setSearchQuery] = useState<string>('')

  if (!isOpen) return null

  const categories = ['All', 'Coding', 'Writing', 'Business', 'Education', 'Creative']

  const filteredPrompts = PROMPT_TEMPLATES.filter((tmpl) => {
    const matchesCategory = selectedCategory === 'All' || tmpl.category === selectedCategory
    const matchesSearch =
      tmpl.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tmpl.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-3xl bg-[#0c0d12] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between px-6 py-4 bg-white/[0.03] border-b border-white/10 select-none">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Sparkles size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white leading-snug">Prompt Templates Library</h3>
                <p className="text-xs text-slate-400">Choose from curated prompts to boost productivity</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition"
            >
              <X size={18} />
            </button>
          </div>

          {/* Search & Filters */}
          <div className="p-6 border-b border-white/5 space-y-4 bg-[#0a0b0f]">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 transition"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                    selectedCategory === cat
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Templates Grid */}
          <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-4 scrollbar-thin bg-[#08090d]">
            {filteredPrompts.map((tmpl) => {
              const IconComp = tmpl.icon
              return (
                <div
                  key={tmpl.id}
                  onClick={() => {
                    onSelectPrompt(tmpl.prompt)
                    onClose()
                  }}
                  className="group relative p-4 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-indigo-500/[0.05] hover:border-indigo-500/40 transition-all duration-200 cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-md border border-indigo-500/20">
                        <IconComp size={12} />
                        {tmpl.category}
                      </span>
                    </div>
                    <h4 className="font-semibold text-white text-sm group-hover:text-indigo-300 transition">
                      {tmpl.title}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {tmpl.description}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center justify-end text-xs font-medium text-indigo-400 group-hover:translate-x-1 transition-transform">
                    <span>Use Template</span>
                    <ArrowRight size={14} className="ml-1" />
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
