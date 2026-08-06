import { NovaSettings } from '../components/ui/NovaSettings'

export function SettingsPage() {
  return (
    <main className="min-h-screen text-white bg-[#000000] font-sans relative overflow-x-hidden p-0 md:p-8 md:flex md:justify-center md:items-center">
      <div className="w-full min-h-screen md:min-h-0 md:max-w-4xl md:h-[82vh] md:rounded-[24px] md:border md:border-zinc-800/80 md:shadow-2xl md:overflow-hidden">
        <NovaSettings />
      </div>
    </main>
  )
}
