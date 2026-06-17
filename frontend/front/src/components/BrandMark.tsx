import { BrainCircuit } from 'lucide-react'

interface BrandMarkProps {
  compact?: boolean
}

export function BrandMark({ compact = false }: BrandMarkProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="grid size-10 place-items-center rounded-lg border border-cyan-300/25 bg-cyan-300/10 text-cyan-200 shadow-[0_0_28px_rgba(34,211,238,0.18)]">
        <BrainCircuit size={22} aria-hidden="true" />
      </div>
      {!compact && (
        <div>
          <p className="text-sm font-semibold tracking-[0.18em] text-cyan-100/80 uppercase">
            NovaMind
          </p>
          <p className="text-xs text-slate-400">AI workspace</p>
        </div>
      )}
    </div>
  )
}
