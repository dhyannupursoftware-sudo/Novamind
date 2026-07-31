import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Play, Code2, Copy, FileDown, ExternalLink, Laptop, Smartphone, Check, RefreshCw } from 'lucide-react'

interface ArtifactsDrawerProps {
  isOpen: boolean
  onClose: () => void
  codeContent: string
  language?: string
  title?: string
}

export function ArtifactsDrawer({
  isOpen,
  onClose,
  codeContent,
  language = 'html',
  title = 'Live Code Sandbox',
}: ArtifactsDrawerProps) {
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview')
  const [viewportMode, setViewportMode] = useState<'desktop' | 'mobile'>('desktop')
  const [copied, setCopied] = useState(false)
  const [iframeKey, setIframeKey] = useState(0)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const isPreviewable = ['html', 'htm', 'svg', 'javascript', 'jsx', 'tsx', 'css'].includes(
    language.toLowerCase()
  ) || codeContent.includes('<html') || codeContent.includes('<div') || codeContent.includes('<svg')

  const generateFullHTML = (rawCode: string) => {
    if (rawCode.includes('<html')) return rawCode
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { background-color: #0f172a; color: #f8fafc; font-family: system-ui, sans-serif; padding: 1rem; margin: 0; }
  </style>
</head>
<body>
  ${rawCode}
</body>
</html>`
  }

  useEffect(() => {
    if (isOpen) {
      setActiveTab(isPreviewable ? 'preview' : 'code')
    }
  }, [isOpen, isPreviewable, codeContent])

  const handleCopy = async () => {
    await navigator.clipboard.writeText(codeContent)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const ext = language === 'javascript' ? 'js' : language === 'typescript' ? 'ts' : language
    const blob = new Blob([codeContent], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `artifact-export.${ext || 'html'}`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleOpenNewTab = () => {
    const fullHtml = generateFullHTML(codeContent)
    const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    window.open(url, '_blank')
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop for smaller screens */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-xs z-[998] lg:hidden"
          />

          {/* Slide-over Drawer */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="fixed top-0 right-0 h-screen w-full lg:w-[50vw] xl:w-[45vw] bg-[#0d0d0d] border-l border-white/10 shadow-2xl z-[999] flex flex-col overflow-hidden"
          >
            {/* Header Toolbar */}
            <div className="h-[56px] px-4 border-b border-white/10 flex items-center justify-between bg-[#171717] shrink-0 select-none">
              <div className="flex items-center gap-3 min-w-0">
                <div className="size-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                  <Play size={16} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs font-bold text-white truncate">{title}</h3>
                  <p className="text-[10px] text-slate-400 font-medium truncate uppercase tracking-wider">
                    {language} Sandbox
                  </p>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-1.5">
                {/* Mode Selector Tabs */}
                <div className="flex items-center bg-white/5 p-1 rounded-xl border border-white/10 mr-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('preview')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                      activeTab === 'preview'
                        ? 'bg-indigo-500 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Play size={12} />
                    Preview
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('code')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                      activeTab === 'code'
                        ? 'bg-indigo-500 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Code2 size={12} />
                    Code
                  </button>
                </div>

                {/* Device Viewport Toggle */}
                {activeTab === 'preview' && (
                  <div className="hidden sm:flex items-center bg-white/5 p-1 rounded-xl border border-white/10 mr-2">
                    <button
                      type="button"
                      onClick={() => setViewportMode('desktop')}
                      className={`p-1 rounded-lg transition ${
                        viewportMode === 'desktop' ? 'bg-white/20 text-white' : 'text-slate-400'
                      }`}
                      title="Desktop View"
                    >
                      <Laptop size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewportMode('mobile')}
                      className={`p-1 rounded-lg transition ${
                        viewportMode === 'mobile' ? 'bg-white/20 text-white' : 'text-slate-400'
                      }`}
                      title="Mobile View"
                    >
                      <Smartphone size={14} />
                    </button>
                  </div>
                )}

                {/* Quick Actions */}
                <button
                  type="button"
                  onClick={() => setIframeKey((prev) => prev + 1)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
                  title="Reload Preview"
                >
                  <RefreshCw size={15} />
                </button>
                <button
                  type="button"
                  onClick={handleOpenNewTab}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
                  title="Open in new tab"
                >
                  <ExternalLink size={15} />
                </button>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
                  title="Copy Code"
                >
                  {copied ? <Check size={15} className="text-emerald-400" /> : <Copy size={15} />}
                </button>
                <button
                  type="button"
                  onClick={handleDownload}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
                  title="Download File"
                >
                  <FileDown size={15} />
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer ml-1"
                  title="Close Drawer"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Main Content Body */}
            <div className="flex-1 overflow-hidden relative bg-[#090a0f] flex items-center justify-center p-4">
              {activeTab === 'preview' ? (
                <div
                  className={`h-full transition-all duration-300 rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-[#0f172a] ${
                    viewportMode === 'mobile' ? 'w-[375px] max-h-[667px]' : 'w-full'
                  }`}
                >
                  <iframe
                    key={iframeKey}
                    ref={iframeRef}
                    title="Live Artifact Preview"
                    srcDoc={generateFullHTML(codeContent)}
                    className="w-full h-full border-0"
                    sandbox="allow-scripts allow-modals allow-forms allow-same-origin"
                  />
                </div>
              ) : (
                <div className="w-full h-full overflow-y-auto p-4 font-mono text-xs text-slate-200 bg-[#0d0d0d] rounded-2xl border border-white/10 leading-relaxed select-text">
                  <pre>{codeContent}</pre>
                </div>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
