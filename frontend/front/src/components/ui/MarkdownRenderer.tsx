import React, { useState } from 'react'
import { Check, Copy } from 'lucide-react'

interface CodeBlockProps {
  language: string
  code: string
  isStreaming?: boolean
}

function highlightCode(code: string, language: string): React.ReactNode {
  const cleanLang = language.toLowerCase()

  if (!cleanLang || cleanLang === 'plaintext' || cleanLang === 'text') {
    return code
  }

  // Keywords for JS, TS, React, PHP, HTML/CSS
  const keywords = /\b(const|let|var|function|return|if|else|for|while|do|switch|case|break|continue|class|interface|type|export|import|from|as|default|extends|implements|new|this|typeof|instanceof|void|async|await|try|catch|finally|throw|public|private|protected|static|readonly|namespace|package|use|require|include|echo|print|die|exit|clone|eval|empty|isset|unset|list|array|fn|match|declare|strict_types|parent|self)\b/g

  // Keywords for SQL
  const sqlKeywords = /\b(select|insert|update|delete|from|where|join|left|right|inner|outer|on|group|by|having|order|limit|offset|and|or|not|null|is|in|like|between|exists|create|table|alter|drop|index|view|trigger|procedure|primary|key|foreign|references|unique|check|default|constraint|into|values|set)\b/gi

  // Strings
  const stringRegex = /("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`)/g

  // Comments
  const commentRegex = /(\/\/.*|\/\*[\s\S]*?\*\/|#.*)/g

  // Numbers
  const numberRegex = /\b(\d+(?:\.\d+)?)\b/g

  // PHP tags
  const phpTagRegex = /(<\?php|\?>)/g

  // Functions
  const functionRegex = /\b([a-zA-Z_]\w*)(?=\s*\()/g

  // Escape HTML
  let escaped = code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  const placeholders: string[] = []

  // Helper to convert index to spreadsheets-style alphabetical column ID (A, B, C... Z, AA...)
  const toAlphaId = (num: number): string => {
    let str = ''
    let n = num
    while (n >= 0) {
      str = String.fromCharCode((n % 26) + 65) + str
      n = Math.floor(n / 26) - 1
    }
    return str
  }

  const savePlaceholder = (val: string, type: string) => {
    const alphaId = toAlphaId(placeholders.length)
    const id = `___PLACEHOLDER_${alphaId}___`
    let cssClass = ''
    if (type === 'comment') cssClass = 'text-slate-500 italic'
    else if (type === 'string') cssClass = 'text-emerald-400 font-medium'

    placeholders.push(`<span class="${cssClass}">${val}</span>`)
    return id
  }

  // Hide comments and strings in placeholders
  escaped = escaped.replace(commentRegex, (m) => savePlaceholder(m, 'comment'))
  escaped = escaped.replace(stringRegex, (m) => savePlaceholder(m, 'string'))

  // Highlight Numbers FIRST before we inject class names like 'text-pink-400' which contain digits
  escaped = escaped.replace(numberRegex, '<span class="text-amber-400">$1</span>')

  // Highlight Keywords
  const selectedKeywords = cleanLang === 'sql' ? sqlKeywords : keywords
  escaped = escaped.replace(
    selectedKeywords,
    '<span class="text-pink-400 font-semibold">$1</span>'
  )

  // Highlight Functions
  escaped = escaped.replace(functionRegex, '<span class="text-sky-400">$1</span>')

  // Highlight PHP specific tag elements
  if (cleanLang === 'php' || cleanLang === 'laravel') {
    escaped = escaped.replace(phpTagRegex, '<span class="text-red-400 font-bold">$1</span>')
  }

  // Restore placeholders
  for (let i = 0; i < placeholders.length; i++) {
    const alphaId = toAlphaId(i)
    escaped = escaped.replace(`___PLACEHOLDER_${alphaId}___`, placeholders[i])
  }

  return <span dangerouslySetInnerHTML={{ __html: escaped }} />
}

export function CodeBlock({ language, code, isStreaming }: CodeBlockProps) {
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

  // Map backend language names to display names
  const displayLanguage = (() => {
    const lang = language.trim().toLowerCase()
    if (lang === 'js' || lang === 'javascript') return 'JavaScript'
    if (lang === 'ts' || lang === 'typescript') return 'TypeScript'
    if (lang === 'tsx' || lang === 'react') return 'React'
    if (lang === 'php' || lang === 'laravel') return 'PHP/Laravel'
    if (lang === 'html') return 'HTML'
    if (lang === 'css') return 'CSS'
    if (lang === 'sql') return 'SQL'
    if (lang === 'json') return 'JSON'
    return language || 'Code'
  })()

  return (
    <div className="group relative my-5 flex flex-col rounded-xl border border-white/10 bg-[#0d0d0d] shadow-lg overflow-hidden">
      {/* Code Block Header Badge bar */}
      <div className="flex items-center justify-between bg-white/[0.03] px-4 py-2 text-xs text-slate-400 border-b border-white/5 select-none">
        <span className="font-mono text-[10px] tracking-wider uppercase font-semibold text-slate-400">
          {displayLanguage}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2 py-1 rounded bg-white/5 hover:bg-white/10 hover:text-white transition active:scale-95 duration-150"
          title="Copy to clipboard"
        >
          {copied ? (
            <>
              <Check size={11} className="text-emerald-400" />
              <span className="text-[10px] text-emerald-400 font-semibold">Copied!</span>
            </>
          ) : (
            <>
              <Copy size={11} />
              <span className="text-[10px]">Copy code</span>
            </>
          )}
        </button>
      </div>

      {/* Code content viewport */}
      <div className="overflow-x-auto p-4 font-mono text-xs sm:text-sm leading-relaxed text-slate-300 scrollbar-thin">
        <pre className="whitespace-pre">
          <code>{highlightCode(code, language)}</code>
        </pre>
      </div>

      {isStreaming && (
        <div className="absolute bottom-1 right-2 flex items-center gap-1 select-none">
          <span className="size-1.5 rounded-full bg-indigo-500 animate-ping" />
        </div>
      )}
    </div>
  )
}

function parseInline(text: string): React.ReactNode[] {
  const regex = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g
  const segments = text.split(regex)

  return segments.map((seg, i) => {
    if (seg.startsWith('`') && seg.endsWith('`')) {
      return (
        <code
          key={i}
          className="bg-[#2f2f2f] px-1.5 py-0.5 rounded text-xs text-amber-400 font-mono"
        >
          {seg.slice(1, -1)}
        </code>
      )
    }
    if (seg.startsWith('**') && seg.endsWith('**')) {
      return (
        <strong key={i} className="font-bold text-white">
          {seg.slice(2, -2)}
        </strong>
      )
    }
    if (seg.startsWith('*') && seg.endsWith('*')) {
      return (
        <em key={i} className="italic text-slate-200">
          {seg.slice(1, -1)}
        </em>
      )
    }
    if (seg.startsWith('[') && seg.includes('](')) {
      const match = seg.match(/\[([^\]]+)\]\(([^)]+)\)/)
      if (match) {
        return (
          <a
            key={i}
            href={match[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-400 hover:text-indigo-300 underline font-medium"
          >
            {match[1]}
          </a>
        )
      }
    }
    return seg
  })
}

function parseNormalMarkdown(text: string): React.ReactNode[] {
  const lines = text.split('\n')
  const elements: React.ReactNode[] = []
  
  let currentList: { type: 'ul' | 'ol'; items: string[] } | null = null
  let currentTable: { headers: string[]; rows: string[][] } | null = null
  let currentQuote: string[] | null = null

  const flushList = (key: string | number) => {
    if (!currentList) return
    const ListTag = currentList.type
    elements.push(
      <ListTag
        key={key}
        className={
          currentList.type === 'ul'
            ? 'list-disc pl-6 my-4 space-y-1.5 text-slate-300'
            : 'list-decimal pl-6 my-4 space-y-1.5 text-slate-300'
        }
      >
        {currentList.items.map((item, idx) => (
          <li key={idx} className="text-sm sm:text-base leading-relaxed">
            {parseInline(item)}
          </li>
        ))}
      </ListTag>
    )
    currentList = null
  }

  const flushTable = (key: string | number) => {
    if (!currentTable) return
    elements.push(
      <div
        key={key}
        className="overflow-x-auto my-5 rounded-xl border border-white/10 bg-slate-950/40"
      >
        <table className="min-w-full divide-y divide-white/10 text-left text-xs sm:text-sm">
          <thead className="bg-white/5 text-white font-semibold">
            <tr>
              {currentTable.headers.map((h, idx) => (
                <th
                  key={idx}
                  className="px-4 py-3 border-r border-white/10 last:border-r-0"
                >
                  {parseInline(h)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-slate-350">
            {currentTable.rows.map((row, rIdx) => (
              <tr key={rIdx} className="hover:bg-white/[0.01] transition">
                {row.map((cell, cIdx) => (
                  <td
                    key={cIdx}
                    className="px-4 py-3 border-r border-white/10 last:border-r-0"
                  >
                    {parseInline(cell)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
    currentTable = null
  }

  const flushQuote = (key: string | number) => {
    if (!currentQuote) return
    elements.push(
      <blockquote
        key={key}
        className="border-l-4 border-indigo-500 bg-white/5 px-4 py-3 rounded-r-lg my-4 italic text-slate-300 text-sm sm:text-base"
      >
        {parseInline(currentQuote.join('\n'))}
      </blockquote>
    )
    currentQuote = null
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmed = line.trim()

    // Handle Table
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      flushList(i)
      flushQuote(i)

      const parts = trimmed
        .split('|')
        .map((p) => p.trim())
        .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1)

      if (!currentTable) {
        currentTable = { headers: parts, rows: [] }
      } else {
        const isSeparator = parts.every(
          (p) => /^:-*-*:?$/.test(p) || /^-+$/.test(p)
        )
        if (!isSeparator) {
          currentTable.rows.push(parts)
        }
      }
      continue
    } else {
      flushTable(i)
    }

    // Handle Bullet List
    if (trimmed.startsWith('* ') || trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
      flushQuote(i)
      const content = trimmed.substring(2)
      if (!currentList || currentList.type !== 'ul') {
        flushList(i)
        currentList = { type: 'ul', items: [content] }
      } else {
        currentList.items.push(content)
      }
      continue
    }

    // Handle Numbered List
    const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/)
    if (numMatch) {
      flushQuote(i)
      const content = numMatch[2]
      if (!currentList || currentList.type !== 'ol') {
        flushList(i)
        currentList = { type: 'ol', items: [content] }
      } else {
        currentList.items.push(content)
      }
      continue
    }

    // Flush list if no longer bullet/number list line
    flushList(i)

    // Handle Blockquotes
    if (trimmed.startsWith('>')) {
      const content = trimmed.substring(1).trim()
      if (!currentQuote) {
        currentQuote = [content]
      } else {
        currentQuote.push(content)
      }
      continue
    } else {
      flushQuote(i)
    }

    // Handle Headings
    const headingMatch = trimmed.match(/^(#{1,6})\s+(.*)/)
    if (headingMatch) {
      const level = headingMatch[1].length
      const headingText = headingMatch[2]
      let headingClass = 'text-white font-bold my-4 leading-snug '
      if (level === 1) headingClass += 'text-xl sm:text-2xl border-b border-white/10 pb-2'
      else if (level === 2) headingClass += 'text-lg sm:text-xl border-b border-white/5 pb-1'
      else if (level === 3) headingClass += 'text-base sm:text-lg'
      else headingClass += 'text-sm sm:text-base'

      const parsed = parseInline(headingText)
      if (level === 1) elements.push(<h1 key={i} className={headingClass}>{parsed}</h1>)
      else if (level === 2) elements.push(<h2 key={i} className={headingClass}>{parsed}</h2>)
      else if (level === 3) elements.push(<h3 key={i} className={headingClass}>{parsed}</h3>)
      else if (level === 4) elements.push(<h4 key={i} className={headingClass}>{parsed}</h4>)
      else if (level === 5) elements.push(<h5 key={i} className={headingClass}>{parsed}</h5>)
      else elements.push(<h6 key={i} className={headingClass}>{parsed}</h6>)
      continue
    }


    // Handle Horizontal Rules
    if (trimmed === '---' || trimmed === '***' || trimmed === '___') {
      elements.push(<hr key={i} className="my-6 border-t border-white/10" />)
      continue
    }

    // Handle Paragraphs
    if (trimmed !== '') {
      elements.push(
        <p
          key={i}
          className="my-3 text-sm sm:text-base text-slate-300 leading-relaxed font-normal"
        >
          {parseInline(line)}
        </p>
      )
    }
  }

  flushList('final-list')
  flushTable('final-table')
  flushQuote('final-quote')

  return elements
}

export function MarkdownRenderer({ content }: { content: string }) {
  // Strip out raw file contents text injected by frontend
  const cleanedContent = content.replace(/<file_content[^>]*>[\s\S]*?<\/file_content>/gi, '').trim()

  if (!cleanedContent) return null

  const parts: React.ReactNode[] = []
  let currentIndex = 0

  while (currentIndex < cleanedContent.length) {
    const openIndex = cleanedContent.indexOf('```', currentIndex)
    if (openIndex === -1) {
      parts.push(parseNormalMarkdown(cleanedContent.substring(currentIndex)))
      break
    }

    if (openIndex > currentIndex) {
      parts.push(parseNormalMarkdown(cleanedContent.substring(currentIndex, openIndex)))
    }

    const closeIndex = cleanedContent.indexOf('```', openIndex + 3)
    if (closeIndex === -1) {
      const codeContent = cleanedContent.substring(openIndex + 3)
      const firstNewLine = codeContent.indexOf('\n')
      let lang = 'plaintext'
      let code = codeContent
      if (firstNewLine !== -1 && firstNewLine < 15) {
        lang = codeContent.substring(0, firstNewLine).trim()
        code = codeContent.substring(firstNewLine + 1)
      }
      parts.push(
        <CodeBlock
          key={`code-${openIndex}`}
          language={lang}
          code={code}
          isStreaming={true}
        />
      )
      break
    } else {
      const codeContent = cleanedContent.substring(openIndex + 3, closeIndex)
      const firstNewLine = codeContent.indexOf('\n')
      let lang = 'plaintext'
      let code = codeContent
      if (firstNewLine !== -1 && firstNewLine < 15) {
        lang = codeContent.substring(0, firstNewLine).trim()
        code = codeContent.substring(firstNewLine + 1)
      }
      parts.push(
        <CodeBlock
          key={`code-${openIndex}`}
          language={lang}
          code={code}
          isStreaming={false}
        />
      )
      currentIndex = closeIndex + 3
    }
  }

  return <div className="space-y-2">{parts}</div>
}
