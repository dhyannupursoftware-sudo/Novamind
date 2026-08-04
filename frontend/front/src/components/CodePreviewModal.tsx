import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Play, Code, Copy, Check, Download, Maximize2, Minimize2 } from 'lucide-react'

interface CodePreviewModalProps {
  isOpen: boolean
  onClose: () => void
  code: string
  language: string
}

export function CodePreviewModal({ isOpen, onClose, code, language }: CodePreviewModalProps) {
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview')
  const [copied, setCopied] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  if (!isOpen) return null

  const isHtmlSvgWeb = ['html', 'javascript', 'js', 'svg', 'xml', 'css'].includes(language.toLowerCase())

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (e) {
      console.error(e)
    }
  }

  const handleDownload = () => {
    const ext = language.toLowerCase() === 'javascript' ? 'js' : language.toLowerCase() === 'html' ? 'html' : 'txt'
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `artifact_${Date.now()}.${ext}`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Construct iframe html page
  const srcDoc = language.toLowerCase() === 'svg'
    ? `<!DOCTYPE html><html><body style="margin:0;display:flex;align-items:center;justify-content:center;height:100vh;background:#09090b;">${code}</body></html>`
    : code.includes('<html') || code.includes('<!DOCTYPE') || code.includes('<div') || code.includes('<script')
      ? code
      : `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; background-color: #0f172a; color: #f8fafc; padding: 1.5rem; }
  </style>
</head>
<body>
  ${code}
</body>
</html>`

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-2 sm:p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className={`flex flex-col bg-[#0c0d12] border border-white/10 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 ${
            isFullscreen ? 'w-full h-full rounded-none' : 'w-full max-w-5xl h-[88vh] sm:h-[85vh]'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-3 sm:px-5 py-2.5 sm:py-3.5 bg-white/[0.03] border-b border-white/10 select-none flex-wrap gap-2">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] sm:text-xs font-semibold uppercase tracking-wider shrink-0">
                <Code size={13} />
                <span className="truncate">{language || 'Code'}</span>
              </div>

              {/* Tabs */}
              {isHtmlSvgWeb && (
                <div className="flex items-center p-0.5 sm:p-1 bg-white/5 rounded-lg border border-white/5 text-[11px] sm:text-xs font-medium">
                  <button
                    onClick={() => setActiveTab('preview')}
                    className={`flex items-center gap-1 px-2 sm:px-3 py-1 rounded-md transition ${
                      activeTab === 'preview' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Play size={11} />
                    <span>Preview</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('code')}
                    className={`flex items-center gap-1 px-2 sm:px-3 py-1 rounded-md transition ${
                      activeTab === 'code' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Code size={11} />
                    <span>Source</span>
                  </button>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition"
                title="Copy Code"
              >
                {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
              </button>
              <button
                onClick={handleDownload}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition"
                title="Download Artifact File"
              >
                <Download size={16} />
              </button>
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition"
                title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              >
                {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition"
                title="Close"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Main Body */}
          <div className="flex-1 relative overflow-hidden bg-[#090a0f]">
            {activeTab === 'preview' && isHtmlSvgWeb ? (
              <iframe
                title="Code Sandbox Artifact Preview"
                srcDoc={srcDoc}
                className="w-full h-full border-0 bg-white"
                sandbox="allow-scripts allow-modals allow-forms allow-same-origin"
              />
            ) : (
              <pre className="w-full h-full p-5 overflow-auto font-mono text-xs sm:text-sm text-slate-200 leading-relaxed bg-[#0c0d14] scrollbar-thin">
                <code>{code}</code>
              </pre>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
