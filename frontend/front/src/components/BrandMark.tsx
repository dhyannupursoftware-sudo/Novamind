interface BrandMarkProps {
  compact?: boolean
}

export function BrandMark({ compact = false }: BrandMarkProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="size-10 overflow-hidden rounded-lg bg-white/5 border border-white/10 flex items-center justify-center p-2.5">
        <img src="/favicon.svg" alt="NovaMind Logo" className="size-full object-contain" />
      </div>
      {!compact && (
        <div>
          <p className="text-sm font-semibold tracking-[0.18em] text-white uppercase">
            NovaMind
          </p>
          <p className="text-xs text-slate-500">AI workspace</p>
        </div>
      )}
    </div>
  )
}
