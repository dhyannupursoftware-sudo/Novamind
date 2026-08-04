import React, { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Check, Copy } from 'lucide-react'
import hljs from 'highlight.js'
import 'highlight.js/styles/github-dark.css'

interface CodeBlockProps {
  language: string
  code: string
}

export function CodeBlock({ language, code }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)
  const [wordWrap, setWordWrap] = useState(false)
  const [showLineNumbers, setShowLineNumbers] = useState(true)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy code: ', err)
    }
  }

  const langLower = language.trim().toLowerCase()
  const isTerminal = ['bash', 'sh', 'shell', 'terminal', 'cmd', 'powershell'].includes(langLower)

  const displayLanguage = (() => {
    if (langLower === 'js' || langLower === 'javascript') return 'JavaScript'
    if (langLower === 'ts' || langLower === 'typescript') return 'TypeScript'
    if (langLower === 'tsx' || langLower === 'react') return 'React TSX'
    if (langLower === 'php' || langLower === 'laravel') return 'PHP/Laravel'
    if (langLower === 'html') return 'HTML'
    if (langLower === 'css') return 'CSS'
    if (langLower === 'sql') return 'SQL'
    if (langLower === 'json') return 'JSON'
    if (isTerminal) return 'Terminal / Shell'
    if (langLower === 'python' || langLower === 'py') return 'Python'
    if (langLower === 'docker' || langLower === 'dockerfile') return 'Docker'
    if (langLower === 'yaml' || langLower === 'yml') return 'YAML'
    return language || 'Code'
  })()

  // Highlight the code using highlight.js
  const highlightedHtml = (() => {
    if (langLower && hljs.getLanguage(langLower)) {
      try {
        return hljs.highlight(code, { language: langLower }).value
      } catch (e) {
        console.error(e)
      }
    }
    return hljs.highlightAuto(code).value
  })()

  const isWebCode = ['html', 'js', 'javascript', 'svg', 'xml', 'css'].includes(langLower)
  const codeLines = code.split('\n')

  return (
    <div className="group relative my-6 flex flex-col rounded-2xl border border-white/[0.08] bg-[#0c0c0e] shadow-2xl overflow-hidden text-left font-sans">
      {/* Code Block Header */}
      <div className="flex items-center justify-between bg-white/[0.03] px-4 py-2.5 text-xs text-slate-400 border-b border-white/[0.06] select-none">
        {isTerminal ? (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span className="size-3 rounded-full bg-red-500/80 inline-block" />
              <span className="size-3 rounded-full bg-yellow-500/80 inline-block" />
              <span className="size-3 rounded-full bg-green-500/80 inline-block" />
            </div>
            <span className="ml-2 font-mono text-[11px] font-semibold text-slate-400">
              Terminal
            </span>
          </div>
        ) : (
          <span className="font-mono text-[10px] tracking-wider uppercase font-semibold text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20">
            {displayLanguage}
          </span>
        )}

        <div className="flex items-center gap-2">
          {/* Word Wrap Toggle */}
          <button
            type="button"
            onClick={() => setWordWrap((prev) => !prev)}
            className={`px-2 py-1 rounded-md text-[10px] font-mono font-semibold transition cursor-pointer ${
              wordWrap ? 'bg-white/15 text-white' : 'bg-white/5 text-slate-400 hover:text-white'
            }`}
            title="Toggle word wrap"
          >
            Wrap
          </button>

          {/* Line Numbers Toggle */}
          <button
            type="button"
            onClick={() => setShowLineNumbers((prev) => !prev)}
            className={`px-2 py-1 rounded-md text-[10px] font-mono font-semibold transition cursor-pointer ${
              showLineNumbers ? 'bg-white/15 text-white' : 'bg-white/5 text-slate-400 hover:text-white'
            }`}
            title="Toggle line numbers"
          >
            # Lines
          </button>

          {isWebCode && (
            <button
              type="button"
              onClick={() => {
                if ((window as any).__openCodePreview) {
                  (window as any).__openCodePreview(code, language)
                }
              }}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-600/20 border border-indigo-500/30 hover:bg-indigo-600/40 text-indigo-300 transition active:scale-95 duration-150 cursor-pointer font-semibold"
              title="Run Live Interactive Preview"
            >
              <span className="text-[10px]">▶ Live Preview</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 hover:text-white transition active:scale-95 duration-150 cursor-pointer font-semibold text-slate-300"
            title="Copy code"
          >
            {copied ? (
              <>
                <Check size={12} className="text-emerald-400" />
                <span className="text-[10px] text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy size={12} />
                <span className="text-[10px]">Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code Content Viewport */}
      <div className="overflow-x-auto p-4 font-mono text-xs sm:text-sm leading-relaxed text-slate-300 scrollbar-thin max-h-[550px] overflow-y-auto">
        <div className="flex">
          {showLineNumbers && (
            <div className="select-none pr-4 text-right text-slate-600 font-mono text-xs space-y-0.5 shrink-0 border-r border-white/5 mr-4">
              {codeLines.map((_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>
          )}
          <pre className={`flex-1 ${wordWrap ? 'whitespace-pre-wrap break-words' : 'whitespace-pre'}`}>
            <code
              className="hljs"
              dangerouslySetInnerHTML={{ __html: highlightedHtml }}
            />
          </pre>
        </div>
      </div>
    </div>
  )
}

// Recursive helper to extract raw text content from React children tree
function getInnerText(node: any): string {
  if (!node) return ''
  if (typeof node === 'string') return node
  if (Array.isArray(node)) return node.map(getInnerText).join('')
  if (node.props && node.props.children) return getInnerText(node.props.children)
  return ''
}

// Strip callout emoji prefix from the first child element recursively
function stripCalloutPrefix(children: React.ReactNode): React.ReactNode {
  if (!children) return children

  if (Array.isArray(children)) {
    return React.Children.map(children, (child, idx) => {
      if (idx === 0) return stripCalloutPrefix(child)
      return child
    })
  }

  const child = children as any
  if (child.props && child.props.children) {
    return React.cloneElement(child, {
      ...child.props,
      children: stripCalloutPrefix(child.props.children)
    })
  }

  if (typeof children === 'string') {
    const trimmed = children.trim()
    const prefixes = ['💡', '⚠️', '✅', '❌', '📌']
    for (const p of prefixes) {
      if (trimmed.startsWith(p)) {
        let rest = trimmed.substring(p.length)
        if (rest.startsWith(' ')) rest = rest.substring(1)
        return rest
      }
    }
  }

  return children
}

export function MarkdownRenderer({ content }: { content: string }) {
  // Strip out raw file contents text injected by frontend
  const cleanedContent = content.replace(/<file_content[^>]*>[\s\S]*?<\/file_content>/gi, '').trim()

  if (!cleanedContent) return null

  return (
    <div className="space-y-1 text-left font-sans">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Custom heading styles
          h1: ({ children }) => <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-8 mb-4 tracking-tight leading-snug border-l-4 border-indigo-500 pl-3.5">{children}</h1>,
          h2: ({ children }) => <h2 className="text-xl sm:text-2xl font-bold text-white mt-6 mb-3 tracking-tight leading-snug border-l-3 border-purple-500/80 pl-3">{children}</h2>,
          h3: ({ children }) => <h3 className="text-lg sm:text-xl font-semibold text-slate-100 mt-5 mb-2">{children}</h3>,
          h4: ({ children }) => <h4 className="text-base sm:text-lg font-semibold text-slate-200 mt-4 mb-2">{children}</h4>,
          h5: ({ children }) => <h5 className="text-sm sm:text-base font-semibold text-slate-350 mt-3 mb-1.5">{children}</h5>,
          h6: ({ children }) => <h6 className="text-xs sm:text-sm font-semibold text-slate-400 mt-3 mb-1">{children}</h6>,

          // Custom paragraph style
          p: ({ children }) => <p className="my-3.5 text-sm sm:text-base text-slate-300 leading-7 font-normal break-words">{children}</p>,

          // Custom lists styles
          ul: ({ children }) => <ul className="list-disc pl-6 my-4 space-y-2 text-slate-300">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal pl-6 my-4 space-y-2 text-slate-300">{children}</ol>,
          li: ({ children, className, ...props }) => (
            <li className={`text-sm sm:text-base leading-relaxed pl-1 ${className || ''}`} {...props}>
              {children}
            </li>
          ),

          // Custom link style
          a: ({ children, href }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-400 hover:text-indigo-300 underline underline-offset-4 decoration-indigo-400/30 hover:decoration-indigo-300 transition-all font-semibold duration-150"
            >
              {children}
            </a>
          ),

          // Custom checkbox / task list input style
          input: ({ type, checked, ...props }) => {
            if (type === 'checkbox') {
              return (
                <input
                  type="checkbox"
                  checked={checked}
                  readOnly
                  className="markdown-checkbox"
                  {...props}
                />
              )
            }
            return <input type={type} checked={checked} {...props} />
          },

          // Custom horizontal rule style
          hr: () => <hr className="my-6 border-t border-white/10" />,

          // Custom blockquote (Alert/Callout Card) parser
          blockquote: ({ children }) => {
            const rawText = getInnerText(children).trim()
            let calloutClass = 'callout-generic'
            let icon = '💬'

            if (rawText.startsWith('💡')) {
              calloutClass = 'callout-tip'
              icon = '💡'
            } else if (rawText.startsWith('⚠️')) {
              calloutClass = 'callout-warning'
              icon = '⚠️'
            } else if (rawText.startsWith('✅')) {
              calloutClass = 'callout-success'
              icon = '✅'
            } else if (rawText.startsWith('❌')) {
              calloutClass = 'callout-error'
              icon = '❌'
            } else if (rawText.startsWith('📌')) {
              calloutClass = 'callout-info'
              icon = '📌'
            }

            const strippedChildren = stripCalloutPrefix(children)

            return (
              <div className={`callout-box ${calloutClass} border-l-4 my-5`}>
                <div className="flex gap-3 items-start">
                  <span className="text-base select-none shrink-0 mt-0.5" aria-hidden="true">{icon}</span>
                  <div className="flex-1 text-sm sm:text-base font-normal leading-relaxed text-left">
                    {strippedChildren}
                  </div>
                </div>
              </div>
            )
          },

          // Custom table renderer
          table: ({ children }) => (
            <div className="overflow-x-auto my-6 rounded-2xl border border-white/[0.06] bg-[#101114]/60 shadow-[0_8px_32px_rgba(0,0,0,0.3)] scrollbar-thin">
              <table className="min-w-full divide-y divide-white/[0.08] text-left text-xs sm:text-sm">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => <thead className="bg-white/[0.03] text-white font-bold select-none">{children}</thead>,
          tbody: ({ children }) => <tbody className="divide-y divide-white/[0.04] text-slate-350">{children}</tbody>,
          tr: ({ children }) => <tr className="hover:bg-white/[0.01] transition-colors">{children}</tr>,
          th: ({ children }) => <th className="px-4 py-3.5 border-r border-white/[0.04] last:border-r-0 font-bold">{children}</th>,
          td: ({ children }) => <td className="px-4 py-3 border-r border-white/[0.04] last:border-r-0 font-normal leading-relaxed">{children}</td>,

          // Custom code highlighting blocks
          code: ({ className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || '')
            const codeText = String(children).replace(/\n$/, '')

            // Check if it is a block code tag (starts with language or has newlines)
            const isInline = !className && !String(children).includes('\n')

            if (match || !isInline) {
              return (
                <CodeBlock
                  language={match ? match[1] : 'plaintext'}
                  code={codeText}
                />
              )
            }

            return (
              <code
                className="bg-white/[0.08] text-indigo-200 px-1.5 py-0.5 rounded-md text-xs sm:text-sm font-mono border border-white/[0.05]"
                {...props}
              >
                {children}
              </code>
            )
          }
        }}
      >
        {cleanedContent}
      </ReactMarkdown>
    </div>
  )
}
