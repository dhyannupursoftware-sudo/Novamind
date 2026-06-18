import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { BrandMark } from '../components/BrandMark'
import heroImage from '../assets/hero.png'
import { ChevronLeft } from 'lucide-react'

interface AuthLayoutProps {
  children: ReactNode
  footer: ReactNode
  title: string
}

export function AuthLayout({ children, footer, title }: AuthLayoutProps) {
  return (
    <main className="grid min-h-screen grid-cols-1 bg-[#171717] text-white lg:grid-cols-[1.05fr_0.95fr] relative overflow-hidden">
      
      {/* LEFT SIDE PANEL (Desktop illustration cockpit) */}
      <section className="hidden min-h-screen flex-col justify-between border-r border-white/5 p-10 lg:flex relative z-10 bg-[#0d0d0d]">
        
        {/* Top Back Link */}
        <div className="flex items-center justify-between">
          <BrandMark />
          <Link
            to="/"
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-white transition duration-200 border border-white/5 bg-white/5 rounded-xl px-3.5 py-2"
          >
            <ChevronLeft size={13} />
            Back to Home
          </Link>
        </div>

        {/* Center brand presentation */}
        <div className="max-w-xl my-auto py-12 space-y-6">
          <img
            src={heroImage}
            alt="NovaMind AI Cockpit"
            className="mb-8 h-48 w-48 object-contain opacity-95 drop-shadow-[0_0_15px_rgba(255,255,255,0.03)] animate-none"
          />
          <h1 className="text-4xl font-extrabold tracking-tight text-white leading-tight">
            Explore the Next Gen <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">AI Cockpit</span>
          </h1>
          <p className="text-sm leading-relaxed text-slate-450 text-slate-400 max-w-sm font-medium">
            Secure conversations, fast workspaces, and model-ready infrastructure in one premium dark dashboard.
          </p>
        </div>

        {/* Bottom system details badges */}
        <div className="grid grid-cols-3 gap-3 text-xs text-slate-400">
          <div className="rounded-xl border border-white/5 bg-white/[0.01] p-3 shadow-lg">
            <p className="font-bold text-indigo-400">Laravel API</p>
            <p className="mt-0.5 text-[10px] text-slate-500">API Backend core</p>
          </div>
          <div className="rounded-xl border border-white/5 bg-white/[0.01] p-3 shadow-lg">
            <p className="font-bold text-indigo-400">MySQL Sync</p>
            <p className="mt-0.5 text-[10px] text-slate-500">Relational Sync</p>
          </div>
          <div className="rounded-xl border border-white/5 bg-white/[0.01] p-3 shadow-lg">
            <p className="font-bold text-indigo-400">Ollama local</p>
            <p className="mt-0.5 text-[10px] text-slate-500">Private AI runs</p>
          </div>
        </div>
      </section>

      {/* RIGHT SIDE FORM VIEW */}
      <section className="flex min-h-screen items-center justify-center px-4 py-8 sm:px-6 relative z-10">
        <div className="w-full max-w-md">
          
          {/* Mobile Back & Brand Row */}
          <div className="mb-8 flex items-center justify-between lg:hidden select-none">
            <BrandMark />
            <Link
              to="/"
              className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-400 hover:text-white transition duration-200 border border-white/5 bg-white/5 rounded-lg px-2.5 py-1.5"
            >
              <ChevronLeft size={10} />
              Home
            </Link>
          </div>

          {/* Card Wrapper */}
          <div className="rounded-2xl border border-white/5 bg-[#0d0d0d] p-6 sm:p-8 shadow-2xl relative overflow-hidden">

            <h2 className="text-xl font-extrabold text-white tracking-tight">{title}</h2>
            <div className="mt-6">{children}</div>
          </div>

          {/* Form footer link */}
          <div className="mt-5 text-center text-xs text-slate-400 font-semibold tracking-wide select-none">
            {footer}
          </div>
        </div>
      </section>
    </main>
  )
}
