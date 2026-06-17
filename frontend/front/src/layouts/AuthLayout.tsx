import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { BrandMark } from '../components/BrandMark'
import heroImage from '../assets/hero.png'

interface AuthLayoutProps {
  children: ReactNode
  footer: ReactNode
  title: string
}

export function AuthLayout({ children, footer, title }: AuthLayoutProps) {
  return (
    <main className="grid min-h-screen grid-cols-1 bg-slate-950 text-white lg:grid-cols-[1.05fr_0.95fr]">
      <section className="hidden min-h-screen flex-col justify-between border-r border-white/10 p-8 lg:flex">
        <BrandMark />
        <div className="max-w-xl">
          <img
            src={heroImage}
            alt=""
            className="mb-10 h-52 w-52 object-contain opacity-90 drop-shadow-[0_24px_55px_rgba(45,212,191,0.2)]"
          />
          <h1 className="max-w-lg text-5xl font-semibold leading-tight text-white">
            NovaMind AI
          </h1>
          <p className="mt-5 max-w-md text-base leading-7 text-slate-300">
            Secure conversations, fast workspaces, and model-ready infrastructure in one dark SaaS cockpit.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-3 text-sm text-slate-300">
          <div className="rounded-lg border border-white/10 bg-white/5 p-3">
            <p className="font-semibold text-cyan-100">Sanctum</p>
            <p className="mt-1 text-xs text-slate-500">Token auth</p>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/5 p-3">
            <p className="font-semibold text-emerald-100">MySQL</p>
            <p className="mt-1 text-xs text-slate-500">Relational core</p>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/5 p-3">
            <p className="font-semibold text-rose-100">Laravel</p>
            <p className="mt-1 text-xs text-slate-500">API backend</p>
          </div>
        </div>
      </section>

      <section className="flex min-h-screen items-center justify-center px-4 py-8 sm:px-6">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center justify-between lg:hidden">
            <BrandMark />
            <Link className="text-sm text-cyan-200 hover:text-cyan-100" to="/login">
              Sign in
            </Link>
          </div>
          <div className="glass rounded-lg p-6 sm:p-8">
            <h2 className="text-2xl font-semibold text-white">{title}</h2>
            <div className="mt-7">{children}</div>
          </div>
          <div className="mt-6 text-center text-sm text-slate-400">{footer}</div>
        </div>
      </section>
    </main>
  )
}
