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

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy code: ', err)
    }
  }

  const displayLanguage = (() => {
    const lang = language.trim().toLowerCase()
    if (lang === 'js' || lang === 'javascript') return 'JavaScript'
    if (lang === 'ts' || lang === 'typescript') return 'TypeScript'
    if (lang === 'tsx' || lang === 'react') return 'React TSX'
    if (lang === 'php' || lang === 'laravel') return 'PHP/Laravel'
    if (lang === 'html') return 'HTML'
    if (lang === 'css') return 'CSS'
    if (lang === 'sql') return 'SQL'
    if (lang === 'json') return 'JSON'
    if (lang === 'bash' || lang === 'sh') return 'Terminal'
    if (lang === 'python' || lang === 'py') return 'Python'
    if (lang === 'docker' || lang === 'dockerfile') return 'Docker'
    if (lang === 'yaml' || lang === 'yml') return 'YAML'
    return language || 'Code'
  })()

  // Highlight the code using highlight.js
  const highlightedHtml = (() => {
    const lang = language.trim().toLowerCase()
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(code, { language: lang }).value
      } catch (e) {
        console.error(e)
      }
    }
    return hljs.highlightAuto(code).value
  })()

  const isWebCode = ['html', 'js', 'javascript', 'svg', 'xml', 'css'].includes(language.trim().toLowerCase())

  return (
    <div className="group relative my-6 flex flex-col rounded-2xl border border-white/[0.08] bg-[#0c0c0e] shadow-xl overflow-hidden text-left font-sans">
      {/* Code Block Header Badge bar */}
      <div className="flex items-center justify-between bg-white/[0.02] px-4 py-2.5 text-xs text-slate-400 border-b border-white/[0.06] select-none">
        <span className="font-mono text-[10px] tracking-wider uppercase font-semibold text-slate-400">
          {displayLanguage}
        </span>
        <div className="flex items-center gap-2">
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
                <span className="text-[10px]">Copy code</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code content viewport */}
      <div className="overflow-x-auto p-4 font-mono text-xs sm:text-sm leading-relaxed text-slate-300 scrollbar-thin">
        <pre className="whitespace-pre">
          <code
            className="hljs"
            dangerouslySetInnerHTML={{ __html: highlightedHtml }}
          />
        </pre>
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
          h1: ({ children }) => <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-8 mb-4 tracking-tight leading-snug">{children}</h1>,
          h2: ({ children }) => <h2 className="text-xl sm:text-2xl font-bold text-white mt-6 mb-3 tracking-tight leading-snug">{children}</h2>,
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
