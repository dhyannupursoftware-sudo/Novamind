import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BrainCircuit,
  ArrowRight,
  Sparkles,
  Code,
  History,
  Lock,
  ShieldCheck,
  Zap,
  MessageSquare,
  Phone,
  Mail,
  Play,
  Check,
  ChevronDown,
  Cpu,
  HelpCircle
} from 'lucide-react'
import { useAuth } from '../context/useAuth'

const localModels = [
  {
    name: 'Llama 3 (8B / 70B)',
    provider: 'Meta AI',
    description: 'Meta\'s state-of-the-art open-source LLM, perfect for general reasoning, text creation, and structured tasks.',
    status: 'Recommended',
    badgeColor: 'text-[#6366f1] bg-[#6366f1]/10 border-[#6366f1]/20',
    specs: '8B / 70B parameters • Context: 8K'
  },
  {
    name: 'DeepSeek Coder v2',
    provider: 'DeepSeek',
    description: 'An advanced open-weight code language model, delivering high performance on programming tasks and code edits.',
    status: 'Coding Specialist',
    badgeColor: 'text-[#22d3ee] bg-[#22d3ee]/10 border-[#22d3ee]/20',
    specs: '16B parameters • Context: 32K'
  },
  {
    name: 'Mistral (7B)',
    provider: 'Mistral AI',
    description: 'Compact yet powerful model designed for speed and efficiency. Performs exceptionally well in English and code logic.',
    status: 'High Performance',
    badgeColor: 'text-[#eab308] bg-[#eab308]/10 border-[#eab308]/20',
    specs: '7.3B parameters • Context: 32K'
  },
  {
    name: 'Phi-3 (Mini / Medium)',
    provider: 'Microsoft',
    description: 'Ultra-efficient small language model delivering logic capability equivalent to models twice its scale.',
    status: 'Lightweight & Fast',
    badgeColor: 'text-[#ec4899] bg-[#ec4899]/10 border-[#ec4899]/20',
    specs: '3.8B / 14B parameters • Context: 128K'
  }
]

const faqs = [
  {
    question: 'What is NovaMind AI?',
    answer: 'NovaMind AI is a state-of-the-art developer and learning cockpit designed to sync local model runs (like Ollama) with a high-fidelity web dashboard. It features rich code highlighting, database sync backups, settings configurations, and customizable profile analytics.'
  },
  {
    question: 'How do I run models locally?',
    answer: 'You can run models locally by downloading Ollama (ollama.com) on your computer, running a model (e.g. `ollama run llama3`), and ensuring that the Ollama port is accessible. NovaMind connects to the local Ollama API to run model tasks completely offline.'
  },
  {
    question: 'Is my conversational data private?',
    answer: 'Yes. When configured to run with local models, all queries, code generations, and reasoning tasks are executed completely on your local CPU/GPU infrastructure without ever sending data to cloud servers.'
  },
  {
    question: 'How does database sync operate?',
    answer: 'NovaMind uses a robust Laravel API backend synced with a MySQL database core. Your chat history, pinned workspace dialogues, and custom dashboard settings are stored securely in relational tables to prevent data loss.'
  },
  {
    question: 'Can I change my credentials or account details?',
    answer: 'Absolutely. By opening the premium Profile and Settings popups in your dashboard console, you can update your avatar, rename your display fields, adjust font sizing, toggle prompt saving parameters, or modify passwords.'
  }
]

export function HomePage() {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly')
  const [activeFaq, setActiveFaq] = useState<number | null>(null)

  // Smooth scroll helper
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const handleStartChatting = () => {
    if (isAuthenticated) {
      navigate('/dashboard')
    } else {
      navigate('/login')
    }
  }

  // Feature cards data
  const features = [
    {
      icon: MessageSquare,
      title: 'AI Chat Assistant',
      desc: 'Engage in natural, deep reasoning conversations on complex coding and math problems.',
      color: 'from-blue-500 to-cyan-400'
    },
    {
      icon: Code,
      title: 'Code Generation',
      desc: 'Instant high-quality code blocks in multiple languages with built-in syntax highlight templates.',
      color: 'from-purple-500 to-indigo-400'
    },
    {
      icon: History,
      title: 'Chat History',
      desc: 'Save and pin your previous dialogue runs to revisit your workspace anytime.',
      color: 'from-emerald-500 to-teal-400'
    },
    {
      icon: Zap,
      title: 'Local AI Support',
      desc: 'Connected to local engines like Ollama for high-speed, secure offline dialogue runs.',
      color: 'from-amber-500 to-orange-400'
    },
    {
      icon: Lock,
      title: 'Secure Authentication',
      desc: 'Built on top of robust Laravel Sanctum token protocols for absolute data safety.',
      color: 'from-rose-500 to-red-400'
    },
    {
      icon: ShieldCheck,
      title: 'Fast Responses',
      desc: 'Low-latency answer streaming makes conversation segment loads instant.',
      color: 'from-indigo-500 to-purple-400'
    },
    {
      icon: BrainCircuit,
      title: 'Smart Conversations',
      desc: 'Maintains context across chats for a highly personalized intelligence partner.',
      color: 'from-cyan-500 to-blue-400'
    },
    {
      icon: Play,
      title: 'Responsive Design',
      desc: 'Sleek, premium responsive layout scales flawlessly on desktop, tablets, and phones.',
      color: 'from-teal-500 to-emerald-400'
    }
  ]

  // Timeline steps data
  const timelineSteps = [
    {
      step: '01',
      title: 'Register Account',
      desc: 'Create your secure developer credentials in seconds to launch your workspace cockpit.'
    },
    {
      step: '02',
      title: 'Start New Chat',
      desc: 'Launch a dialogue session with a single click from the sidebar console panel.'
    },
    {
      step: '03',
      title: 'Ask Questions',
      desc: 'Input complex mathematical, logic, or programming questions directly into the input bar.'
    },
    {
      step: '04',
      title: 'Receive AI Responses',
      desc: 'Get streamed word-by-word answers, custom code files, and formatted markdown results.'
    }
  ]

  return (
    <div className="min-h-screen bg-[#171717] text-[#ececec] font-sans selection:bg-[#6366f1]/30 selection:text-white relative overflow-x-hidden">

      {/* STICKY HEADER */}
      <header className="sticky top-0 z-50 w-full border-b border-white/[0.05] bg-[#0d0d0d]/90 backdrop-blur-md transition-all duration-300">
        <div className="mx-auto flex w-full max-w-full items-center justify-between px-3 sm:px-10 h-18">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 sm:gap-3 select-none group shrink-0">
            <div className="size-9 sm:size-10 overflow-hidden rounded-lg bg-white/5 border border-white/10 flex items-center justify-center p-2 sm:p-2.5 group-hover:border-indigo-400/50 transition-colors duration-300">
              <img src="/favicon.svg" alt="Logo" className="size-full object-contain" />
            </div>
            <div>
              <span className="text-xs sm:text-sm font-bold tracking-[0.15em] text-white uppercase block">
                NovaMind
              </span>
              <span className="text-[9px] sm:text-[10px] text-slate-500 tracking-wider hidden sm:block">AI WORKSPACE</span>
            </div>
          </Link>

          {/* Header CTA Buttons (Visible on both mobile and desktop) */}
          <div className="flex items-center gap-1 sm:gap-3 shrink-0">
            <Link
              to="/login"
              className="text-[10px] sm:text-xs font-semibold text-slate-300 hover:text-white px-2 sm:px-3 py-1.5 transition duration-200 select-none"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold text-white bg-indigo-500 hover:bg-indigo-600 border border-indigo-500/30 hover:border-indigo-500/60 shadow-md transition-all duration-300 select-none"
            >
              <span className="sm:hidden">Sign Up</span>
              <span className="hidden sm:inline">Create Account</span>
            </Link>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section id="hero" className="relative mx-auto max-w-7xl px-6 pt-16 pb-24 md:py-32 grid md:grid-cols-12 gap-12 items-center z-10">
        
        {/* Hero Left Content Column */}
        <div className="md:col-span-6 space-y-6 text-left">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/5 text-indigo-400 text-xs font-semibold tracking-wide select-none"
          >
            <Sparkles size={12} className="animate-pulse" />
            <span>Introducing NovaMind AI v1.0</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-extrabold tracking-tight text-white leading-[1.2] sm:leading-[1.1]"
          >
            Your Personal AI Assistant for <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">Coding, Learning</span> & Productivity
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-lg font-medium"
          >
            Powered by local AI, smart conversations, code generation, and real-time assistance. Built inside a premium dark developer cockpit.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2"
          >
            <button
              onClick={handleStartChatting}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl text-sm font-bold text-white bg-indigo-500 hover:bg-indigo-600 shadow-[0_4px_28px_rgba(99,102,241,0.3)] hover:scale-[1.02] active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
            >
              Start Chatting
              <ArrowRight size={15} />
            </button>
            <button
              onClick={() => scrollToSection('features')}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl text-sm font-bold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 transition cursor-pointer"
            >
              Learn More
            </button>
          </motion.div>
        </div>

        {/* Hero Right Code Illustration Column */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="md:col-span-6 relative flex justify-center"
        >
          {/* Main Visual Box (Glowing Cockpit Mock) */}
          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#0d0d0d]/80 p-5 shadow-2xl relative z-10 backdrop-blur-sm select-none group hover:border-indigo-500/20 transition duration-300">
            
            {/* Header circles */}
            <div className="flex items-center gap-1.5 pb-4 border-b border-white/5">
              <span className="size-2.5 rounded-full bg-red-500/80" />
              <span className="size-2.5 rounded-full bg-yellow-500/80" />
              <span className="size-2.5 rounded-full bg-green-500/80" />
              <span className="text-[10px] text-slate-600 font-semibold uppercase tracking-wider ml-2">NovaMind Console Terminal</span>
            </div>

            {/* Simulated code container */}
            <div className="py-4 space-y-4 font-mono text-left text-xs text-slate-300">
              <div className="space-y-1">
                <p className="text-slate-500">// Initialize local Ollama AI model...</p>
                <p className="text-[#a78bfa]"><span className="text-[#f472b6]">const</span> assistant = <span className="text-[#f472b6]">await</span> NovaMind.<span className="text-[#38bdf8]">load</span>(<span className="text-[#34d399]">"nova-pro"</span>);</p>
              </div>

              {/* Floating dialog simulation block */}
              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 shadow-md space-y-2 relative overflow-hidden">
                <div className="flex items-center justify-between text-[9px] text-[#6366f1] font-bold">
                  <span>INPUT QUERY</span>
                  <span>ACTIVE RUN</span>
                </div>
                <p className="text-white text-xs">"Create a responsive navigation component in React"</p>
              </div>

              {/* Floating AI output bubble */}
              <div className="rounded-xl border border-[#22d3ee]/20 bg-[#22d3ee]/5 p-3.5 shadow-md space-y-2 relative overflow-hidden">
                <div className="flex items-center justify-between text-[9px] text-[#22d3ee] font-bold">
                  <span>NOVAMIND STREAMING</span>
                  <span className="flex items-center gap-1"><span className="size-1.5 bg-[#22d3ee] rounded-full animate-ping" />120 tokens/s</span>
                </div>
                <div className="h-px bg-white/5" />
                <p className="text-[11px] text-[#34d399] leading-normal font-semibold">✓ Generated responsive navbar code successfully.</p>
              </div>
            </div>


          </div>

          {/* Floating UI Badges */}
          <div className="hidden sm:flex absolute top-12 left-[-20px] z-20 bg-[#0d0d0d]/80 border border-white/10 rounded-xl px-3 py-2 text-xs items-center gap-2 shadow-lg hover:scale-105 transition duration-300 select-none">
            <span className="size-2 rounded-full bg-emerald-500" />
            <span className="font-semibold text-white">Ollama Local AI</span>
          </div>

          <div className="hidden sm:flex absolute bottom-10 right-[-10px] z-20 bg-[#0d0d0d]/80 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs items-center gap-2 shadow-lg hover:scale-105 transition duration-300 select-none">
            <Sparkles size={14} className="text-[#a78bfa]" />
            <span className="font-semibold text-white">Code Engine</span>
          </div>
        </motion.div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="relative max-w-7xl mx-auto px-6 py-24 z-10 border-t border-white/5">
        <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
          <h2 className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Premium Capabilities</h2>
          <p className="text-3xl font-extrabold text-white sm:text-4xl">
            Powering Your Intelligence Cockpit
          </p>
          <p className="text-base text-slate-400 font-medium">
            Explore state-of-the-art features packed into a glassmorphic dashboard configuration.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feat, idx) => {
            const Icon = feat.icon
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: idx * 0.05 }}
                className="group relative rounded-2xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] p-6 text-left shadow-lg transition-all duration-300 hover:border-indigo-500/20 hover:shadow-[0_8px_30px_rgba(99,102,241,0.06)] hover:scale-[1.01]"
              >
                {/* Glowing Card Highlight */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500/0 via-indigo-500/0 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition duration-300 pointer-events-none" />

                {/* Icon wrapper */}
                <div className={`size-10 rounded-lg bg-gradient-to-br ${feat.color} p-0.5 mb-5 shadow-lg group-hover:scale-110 transition duration-300`}>
                  <div className="size-full bg-[#0d0d0d] rounded-[7px] grid place-items-center text-white">
                    <Icon size={18} />
                  </div>
                </div>

                <h3 className="text-sm font-bold text-white mb-2">{feat.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-medium">{feat.desc}</p>
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* SUPPORTED MODELS SECTION */}
      <section id="models" className="relative max-w-7xl mx-auto px-6 py-24 z-10 border-t border-white/5">
        <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
          <h2 className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Model Infrastructure</h2>
          <p className="text-3xl font-extrabold text-white sm:text-4xl">
            Supported Local AI Models
          </p>
          <p className="text-base text-slate-400 font-medium">
            Connect NovaMind directly to your locally running engines via Ollama or custom API run configurations.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {localModels.map((model, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="group relative rounded-2xl border border-white/5 bg-[#0d0d0d] p-6 text-left shadow-lg hover:border-indigo-500/20 hover:scale-[1.01] transition-all duration-300"
            >
              <div className="flex items-start justify-between gap-4 flex-wrap sm:flex-nowrap">
                <div className="space-y-2">
                  <div className="flex items-center gap-2.5">
                    <span className="grid size-8 place-items-center rounded-lg bg-indigo-500/10 text-indigo-400">
                      <Cpu size={16} />
                    </span>
                    <div>
                      <h3 className="text-sm font-bold text-white">{model.name}</h3>
                      <p className="text-[10px] text-slate-500 font-medium">Developed by {model.provider}</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed font-medium pt-1.5">
                    {model.description}
                  </p>
                  <p className="text-[10px] text-indigo-400 font-mono pt-2">
                    {model.specs}
                  </p>
                </div>

                <span className={`shrink-0 text-[10px] font-bold px-2.5 py-1 rounded-full border ${model.badgeColor} uppercase tracking-wider select-none`}>
                  {model.status}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS SECTION (TIMELINE) */}
      <section id="how-it-works" className="relative max-w-7xl mx-auto px-6 py-24 z-10 border-t border-white/5 bg-transparent">
        <div className="text-center max-w-2xl mx-auto space-y-4 mb-20">
          <h2 className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Workflow</h2>
          <p className="text-3xl font-extrabold text-white sm:text-4xl">
            How NovaMind Operates
          </p>
          <p className="text-base text-slate-400 font-medium">
            Start run sessions in four simple steps and accelerate your cognitive workload.
          </p>
        </div>

        {/* Timeline container */}
        <div className="relative mx-auto max-w-5xl">
          {/* Vertical Connecting line on desktop */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-blue-500/20 via-indigo-500/20 to-purple-500/20 hidden md:block -translate-x-1/2" />

          <div className="space-y-12 md:space-y-24">
            {timelineSteps.map((step, idx) => {
              const isEven = idx % 2 === 0
              return (
                <div key={idx} className="relative grid md:grid-cols-12 items-center gap-8 md:gap-12 text-left">
                  
                  {/* Timeline Center check Node */}
                  <div className="absolute left-4 md:left-1/2 top-0 md:top-1/2 -translate-x-1/2 -translate-y-1/2 size-9 rounded-full bg-[#0d0d0d] border border-indigo-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.2)] z-20">
                    <span className="text-xs font-bold text-indigo-400">{step.step}</span>
                  </div>

                  {/* Left Column content */}
                  <div className={`md:col-span-5 pl-12 md:pl-0 ${isEven ? 'md:text-right' : 'md:col-start-7'}`}>
                    <motion.div
                      initial={{ opacity: 0, x: isEven ? -20 : 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, margin: '-100px' }}
                      transition={{ duration: 0.6 }}
                      className="space-y-2"
                    >
                      <span className="text-xs font-extrabold text-indigo-400 uppercase tracking-widest block">Step {idx + 1}</span>
                      <h3 className="text-lg font-bold text-white">{step.title}</h3>
                      <p className="text-xs text-slate-400 leading-relaxed max-w-md font-medium md:ml-auto md:mr-0">
                        {step.desc}
                      </p>
                    </motion.div>
                  </div>

                  {/* Right Column empty space or mock visual illustration placeholder */}
                  <div className={`hidden md:block md:col-span-5 ${isEven ? 'md:col-start-7' : 'md:text-right'}`}>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true, margin: '-100px' }}
                      transition={{ duration: 0.6 }}
                      className="inline-flex rounded-2xl border border-white/5 bg-white/[0.01] p-4 text-xs font-mono text-slate-500 select-none"
                    >
                      <span>// STATUS: READY TO WORK...</span>
                    </motion.div>
                  </div>

                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* SHOWCASE SECTION (CHAT CONSOLE SHOWCASE) */}
      <section id="showcase" className="relative max-w-5xl mx-auto px-6 py-24 z-10 border-t border-white/5">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Interface Preview</h2>
          <p className="text-3xl font-extrabold text-white sm:text-4xl">
            High Fidelity Dialogue Console
          </p>
          <p className="text-base text-slate-400 font-medium max-w-xl mx-auto">
            Experience our premium ChatGPT-style rendering equipped with responsive sidebars, custom code boxes, and Markdown formatting.
          </p>
        </div>

        {/* Console Box */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.7 }}
          className="rounded-2xl border border-white/10 bg-[#0d0d0d] shadow-2xl relative overflow-hidden select-text text-left max-w-4xl mx-auto"
        >
          {/* Header toolbar */}
          <div className="h-12 border-b border-white/5 px-4 flex items-center justify-between select-none shrink-0 bg-[#07090f]">
            <div className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-red-500/70" />
              <span className="size-2.5 rounded-full bg-yellow-500/70" />
              <span className="size-2.5 rounded-full bg-green-500/70" />
              <span className="text-[10px] text-slate-500 font-semibold tracking-widest uppercase ml-3">NovaMind Active Session</span>
            </div>
            <span className="text-[9px] text-[#22d3ee] bg-[#22d3ee]/10 px-2 py-0.5 rounded-md font-semibold tracking-wider">OLLAMA ENGINE</span>
          </div>

          {/* Messages list */}
          <div className="p-6 space-y-6 text-sm">
            
            {/* User Message */}
            <div className="flex justify-end">
              <div className="max-w-[80%] bg-[#2f2f2f] text-white rounded-2xl px-4 py-3 shadow-md border border-white/5">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 select-none text-[9px]">USER</p>
                <p className="text-slate-100 font-medium">Explain quicksort and write it in TypeScript.</p>
              </div>
            </div>

            {/* Assistant Message */}
            <div className="flex gap-4">
              <div className="size-8 rounded-full bg-slate-900 border border-white/10 overflow-hidden shrink-0 flex items-center justify-center select-none shadow-md">
                <Sparkles size={14} className="text-indigo-400" />
              </div>
              <div className="flex-1 space-y-4">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider select-none text-[9px]">NovaMind AI</p>
                  <p className="text-slate-300 leading-relaxed font-medium mt-1">
                    Quicksort is an efficient, divide-and-conquer sorting algorithm. It works by selecting a 'pivot' element and partitioning the other elements into two sub-arrays according to whether they are less than or greater than the pivot.
                  </p>
                </div>

                {/* Markdown code block preview */}
                <div className="rounded-xl border border-white/10 bg-[#07090f] overflow-hidden shadow-lg select-text font-mono text-xs">
                  <div className="h-9 bg-white/[0.02] border-b border-white/5 px-4 flex items-center justify-between text-[10px] text-slate-400 select-none">
                    <span>typescript</span>
                    <span className="text-[9px] text-indigo-400 font-semibold">Copy Code</span>
                  </div>
                  <pre className="p-4 overflow-x-auto text-[#a78bfa] leading-relaxed">
{`function quicksort<T>(arr: T[]): T[] {
  if (arr.length <= 1) return arr;
  const pivot = arr[arr.length - 1];
  const left = arr.filter(el => el < pivot);
  const right = arr.filter(el => el > pivot);
  return [...quicksort(left), pivot, ...quicksort(right)];
}`}
                  </pre>
                </div>
              </div>
            </div>

          </div>

          {/* Footer query bar preview */}
          <div className="p-4 border-t border-white/5 bg-[#07090f] select-none">
            <div className="rounded-xl bg-[#171717] px-4 py-2.5 flex items-center justify-between border border-white/5">
              <span className="text-slate-500 text-xs font-medium">Type a message or paste code files...</span>
              <div className="size-7 rounded-full bg-[#6366f1] grid place-items-center text-white">
                <ArrowRight size={13} />
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* PRICING & TIERS SECTION */}
      <section id="pricing" className="relative max-w-7xl mx-auto px-6 py-24 z-10 border-t border-white/5">
        <div className="text-center max-w-2xl mx-auto space-y-4 mb-12">
          <h2 className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Pricing & Subscription</h2>
          <p className="text-3xl font-extrabold text-white sm:text-4xl">
            Flexible Workspace Plans
          </p>
          <p className="text-base text-slate-400 font-medium">
            Use completely free with your local models, or upgrade for cloud power and teams.
          </p>

          {/* Toggle buttons */}
          <div className="pt-6 flex justify-center">
            <div className="relative p-1 rounded-xl bg-[#0d0d0d] border border-white/5 flex items-center">
              <button
                onClick={() => setBillingPeriod('monthly')}
                className={`relative px-4 py-2 rounded-lg text-xs font-bold transition-all duration-300 z-10 ${
                  billingPeriod === 'monthly' ? 'text-white' : 'text-slate-500'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingPeriod('yearly')}
                className={`relative px-4 py-2 rounded-lg text-xs font-bold transition-all duration-300 z-10 ${
                  billingPeriod === 'yearly' ? 'text-white' : 'text-slate-500'
                }`}
              >
                Yearly (Save 20%)
              </button>
              
              {/* Slider highlight */}
              <motion.div
                layoutId="activeTabSlider"
                className="absolute top-1 bottom-1 rounded-lg bg-indigo-500 shadow-md"
                animate={{
                  left: billingPeriod === 'monthly' ? 4 : '52%',
                  width: billingPeriod === 'monthly' ? '46%' : '45%'
                }}
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            </div>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {/* Card 1: Starter */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5 }}
            className="rounded-2xl border border-white/5 bg-[#0d0d0d] p-6 text-left flex flex-col justify-between hover:border-white/10 transition-all duration-300 relative group"
          >
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-white">Starter Local</h3>
                <p className="text-xs text-slate-500 font-medium mt-1">Perfect for developers running offline AI configurations.</p>
              </div>

              <div>
                <span className="text-3xl font-black text-white">$0</span>
                <span className="text-xs text-slate-500 font-medium"> / permanent</span>
              </div>

              <div className="h-px bg-white/5" />

              <ul className="space-y-3 text-xs text-slate-400 font-medium">
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-500 shrink-0" />
                  <span>Unlimited Local Ollama Chats</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-500 shrink-0" />
                  <span>Full Markdown & Code Editor view</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-500 shrink-0" />
                  <span>Pinned chats & history management</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-500 shrink-0" />
                  <span>Custom profile & settings widgets</span>
                </li>
              </ul>
            </div>

            <div className="pt-8">
              <button
                onClick={handleStartChatting}
                className="w-full py-2.5 rounded-xl border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-xs font-bold text-white transition duration-200"
              >
                Launch Console
              </button>
            </div>
          </motion.div>

          {/* Card 2: Pro (Featured) */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="rounded-2xl border border-indigo-500/40 bg-[#0d0d0d] p-6 text-left flex flex-col justify-between hover:border-indigo-500/60 shadow-[0_0_30px_rgba(99,102,241,0.08)] transition-all duration-300 relative group scale-[1.03] md:scale-[1.05]"
          >
            {/* Best value tag */}
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-500 text-white text-[9px] font-extrabold uppercase px-3 py-1 rounded-full tracking-wider shadow-md">
              Most Popular
            </span>

            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  Pro Cockpit
                  <Sparkles size={13} className="text-indigo-400 animate-pulse" />
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-1">For advanced reasoning, code builders, and data sync.</p>
              </div>

              <div>
                <span className="text-3xl font-black text-white">
                  ${billingPeriod === 'monthly' ? '15' : '12'}
                </span>
                <span className="text-xs text-slate-500 font-medium"> / month</span>
                {billingPeriod === 'yearly' && (
                  <p className="text-[9px] text-emerald-400 font-semibold mt-1">Billed annually ($144/yr)</p>
                )}
              </div>

              <div className="h-px bg-white/5" />

              <ul className="space-y-3 text-xs text-slate-300 font-medium">
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-indigo-400 shrink-0" />
                  <span>Everything in Starter plan</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-indigo-400 shrink-0" />
                  <span>Access to Hosted Cloud Models (Nova Pro)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-indigo-400 shrink-0" />
                  <span>High-speed prompt templates & sync</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-indigo-400 shrink-0" />
                  <span>Up to 10GB cloud relational DB backups</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-indigo-400 shrink-0" />
                  <span>Priority streaming response delivery</span>
                </li>
              </ul>
            </div>

            <div className="pt-8">
              <Link
                to="/register"
                className="block text-center w-full py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-xs font-bold text-white shadow-[0_4px_18px_rgba(99,102,241,0.25)] transition duration-200"
              >
                Go Pro Now
              </Link>
            </div>
          </motion.div>

          {/* Card 3: Enterprise */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="rounded-2xl border border-white/5 bg-[#0d0d0d] p-6 text-left flex flex-col justify-between hover:border-white/10 transition-all duration-300 relative group"
          >
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-white">Enterprise Vault</h3>
                <p className="text-xs text-slate-500 font-medium mt-1">For organizations requiring offline scale, sync, and security.</p>
              </div>

              <div>
                <span className="text-3xl font-black text-white">
                  ${billingPeriod === 'monthly' ? '49' : '39'}
                </span>
                <span className="text-xs text-slate-500 font-medium"> / user / mo</span>
                {billingPeriod === 'yearly' && (
                  <p className="text-[9px] text-emerald-400 font-semibold mt-1">Billed annually ($468/yr)</p>
                )}
              </div>

              <div className="h-px bg-white/5" />

              <ul className="space-y-3 text-xs text-slate-400 font-medium">
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-500 shrink-0" />
                  <span>Everything in Pro plan</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-500 shrink-0" />
                  <span>Unlimited team seats & sync folders</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-500 shrink-0" />
                  <span>Single Sign-On (SSO) configurations</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-500 shrink-0" />
                  <span>24/7 dedicated system support core</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-500 shrink-0" />
                  <span>Enterprise security encryption keys</span>
                </li>
              </ul>
            </div>

            <div className="pt-8">
              <a
                href="mailto:pateldhayan041@gmail.com"
                className="block text-center w-full py-2.5 rounded-xl border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-xs font-bold text-white transition duration-200"
              >
                Contact Sales
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ABOUT SECTION */}
      <section id="about" className="relative max-w-4xl mx-auto px-6 py-24 z-10 border-t border-white/5 text-center">
        <div className="space-y-6">
          <h2 className="text-xs font-bold text-indigo-400 uppercase tracking-widest">About NovaMind AI</h2>
          <p className="text-3xl font-extrabold text-white sm:text-4xl">
            Next Generation Cognitive Partner
          </p>
          <p className="text-base text-slate-400 leading-relaxed font-medium max-w-2xl mx-auto">
            NovaMind AI is a modern AI assistant designed to help users with coding, learning, productivity, and problem solving through intelligent conversations and a premium user experience. Built on modern tech integrations like React, Framer Motion, and Laravel, it offers speed, database backups, and custom settings widgets.
          </p>
          <div className="pt-4 flex justify-center gap-8 text-left select-none max-w-md mx-auto">
            <div className="border-l-2 border-indigo-500 pl-4">
              <span className="block text-2xl font-black text-white">120+</span>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">tokens/s run</span>
            </div>
            <div className="border-l-2 border-indigo-500 pl-4">
              <span className="block text-2xl font-black text-white">100%</span>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Local Privacy</span>
            </div>
            <div className="border-l-2 border-indigo-500 pl-4">
              <span className="block text-2xl font-black text-white">MYSQL</span>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Relational Sync</span>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ SECTION (INTERACTIVE ACCORDION) */}
      <section id="faq" className="relative max-w-4xl mx-auto px-6 py-24 z-10 border-t border-white/5">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Questions & Answers</h2>
          <p className="text-3xl font-extrabold text-white sm:text-4xl">
            Frequently Asked Questions
          </p>
          <p className="text-base text-slate-400 font-medium max-w-xl mx-auto">
            Find details on local configurations, privacy setups, database operations, and cockpit features.
          </p>
        </div>

        <div className="space-y-4 text-left max-w-3xl mx-auto">
          {faqs.map((faq, idx) => {
            const isOpen = activeFaq === idx
            return (
              <div
                key={idx}
                className="rounded-xl border border-white/5 bg-[#0d0d0d] overflow-hidden transition-colors duration-300"
              >
                <button
                  onClick={() => setActiveFaq(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between gap-4 px-6 py-4.5 text-left text-sm font-bold text-white hover:text-indigo-400 transition-colors duration-200 focus:outline-none"
                >
                  <span className="flex items-center gap-2.5">
                    <HelpCircle size={16} className="text-indigo-400 shrink-0" />
                    {faq.question}
                  </span>
                  <motion.span
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-slate-400 shrink-0"
                  >
                    <ChevronDown size={16} />
                  </motion.span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                    >
                      <div className="px-6 pb-5 pt-1 border-t border-white/[0.02] text-xs leading-relaxed text-slate-400 font-medium">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/[0.05] bg-[#0d0d0d] relative z-10 select-none">
        <div className="mx-auto max-w-7xl px-6 py-12 md:py-16 grid md:grid-cols-12 gap-8 items-start text-left">
          
          {/* Col 5: Dev details & logo */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="size-9 overflow-hidden rounded-lg bg-white/5 border border-white/10 flex items-center justify-center p-2">
                <img src="/favicon.svg" alt="Logo" className="size-full object-contain" />
              </div>
              <span className="text-sm font-bold tracking-[0.15em] text-white uppercase">
                NovaMind AI
              </span>
            </div>
            <div className="space-y-1.5 text-xs text-slate-400 font-medium">
              <p className="text-white font-bold">Developer Information:</p>
              <p>Name: Patel Dhyan</p>
              <p className="flex items-center gap-1.5 mt-1">
                <Mail size={12} className="text-indigo-400" />
                <a href="mailto:pateldhayan041@gmail.com" className="hover:text-white transition">pateldhayan041@gmail.com</a>
              </p>
              <p className="flex items-center gap-1.5">
                <Phone size={12} className="text-indigo-400" />
                <span>8347030968</span>
              </p>
            </div>
          </div>

          {/* Col 4: Quick Links */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-2 text-xs text-slate-400 font-medium">
              <li><button onClick={() => scrollToSection('hero')} className="hover:text-white transition cursor-pointer">Home</button></li>
              <li><button onClick={() => scrollToSection('features')} className="hover:text-white transition cursor-pointer">Features</button></li>
              <li><button onClick={() => scrollToSection('how-it-works')} className="hover:text-white transition cursor-pointer">How It Works</button></li>
              <li><button onClick={() => scrollToSection('showcase')} className="hover:text-white transition cursor-pointer">Showcase</button></li>
              <li><button onClick={() => scrollToSection('about')} className="hover:text-white transition cursor-pointer">About</button></li>
            </ul>
          </div>

          {/* Col 3: Social Links */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Social Links</h4>
            <div className="flex gap-4">
              <a href="https://github.com" target="_blank" rel="noreferrer" className="size-8 rounded-lg border border-white/5 bg-white/[0.01] hover:bg-indigo-500/10 hover:text-indigo-400 grid place-items-center transition text-slate-400" title="GitHub">
                <svg className="size-3.5 fill-current" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="size-8 rounded-lg border border-white/5 bg-white/[0.01] hover:bg-indigo-500/10 hover:text-indigo-400 grid place-items-center transition text-slate-400" title="Instagram">
                <svg className="size-3.5 fill-none stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </a>
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="size-8 rounded-lg border border-white/5 bg-white/[0.01] hover:bg-indigo-500/10 hover:text-indigo-400 grid place-items-center transition text-slate-400" title="Facebook">
                <svg className="size-3.5 fill-current" viewBox="0 0 24 24"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/></svg>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="size-8 rounded-lg border border-white/5 bg-white/[0.01] hover:bg-indigo-500/10 hover:text-indigo-400 grid place-items-center transition text-slate-400" title="Twitter / X">
                <svg className="size-3.5 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="size-8 rounded-lg border border-white/5 bg-white/[0.01] hover:bg-indigo-500/10 hover:text-indigo-400 grid place-items-center transition text-slate-400" title="LinkedIn">
                <svg className="size-3.5 fill-current" viewBox="0 0 24 24"><path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z"/></svg>
              </a>
            </div>
          </div>

        </div>

        {/* Bottom copyright row */}
        <div className="mx-auto max-w-7xl px-6 py-6 border-t border-white/5 text-center text-[10px] text-slate-500 font-semibold tracking-wide select-none">
          <p>© 2026 NovaMind AI. Developed by Patel Dhyan. All rights reserved.</p>
        </div>
      </footer>

    </div>
  )
}
