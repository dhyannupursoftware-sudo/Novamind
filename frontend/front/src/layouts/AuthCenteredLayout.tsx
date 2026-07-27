import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { BrandMark } from '../components/BrandMark'

interface AuthCenteredLayoutProps {
  children: ReactNode
}

export function AuthCenteredLayout({ children }: AuthCenteredLayoutProps) {
  return (
    <main className="relative min-h-screen w-full flex items-center justify-center bg-[#08090b] text-white px-4 py-12 overflow-x-hidden selection:bg-indigo-500/30 selection:text-white">
      {/* Background radial glowing orbs */}
      <div 
        className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_40%_30%,rgba(99,102,241,0.06)_0%,transparent_50%),radial-gradient(circle_at_70%_80%,rgba(139,92,246,0.04)_0%,transparent_45%)]" 
        aria-hidden="true" 
      />

      <div className="relative z-10 w-full max-w-[440px] flex flex-col items-center">
        {/* Brand logo at the top */}
        <div className="mb-8 animate-fade-in-up">
          <BrandMark />
        </div>

        {/* Auth Glassmorphic Card Container */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="w-full rounded-[30px] border border-white/[0.06] bg-[#101114]/75 backdrop-blur-3xl px-8 py-10 shadow-[0_24px_50px_-12px_rgba(0,0,0,0.6)] flex flex-col text-center"
        >
          {children}
        </motion.div>

        {/* Footer */}
        <p className="mt-8 text-center text-xs text-slate-500 max-w-[320px] leading-relaxed select-none">
          NovaMind Terms of Service and Privacy Policy apply. Designed for developers and intelligence builders.
        </p>
      </div>
    </main>
  )
}
