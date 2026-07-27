export interface ExportableMessage {
  id: number
  role: 'user' | 'assistant' | 'system'
  content: string
  created_at?: string | null
  attachments?: any[] | null
}

export function exportChatToMarkdown(title: string, messages: ExportableMessage[]) {
  const sanitizeTitle = title.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'chat_export'
  const dateStr = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  let mdContent = `# ${title}\n`
  mdContent += `*Exported on ${dateStr} from NovaMind AI*\n\n---\n\n`

  messages.forEach((msg) => {
    const roleLabel = msg.role === 'user' ? '👤 **User**' : '✨ **NovaMind AI**'
    const timestamp = msg.created_at
      ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : ''
    const header = timestamp ? `${roleLabel} *(${timestamp})*` : roleLabel

    mdContent += `### ${header}\n\n${msg.content}\n\n`

    if (msg.attachments && msg.attachments.length > 0) {
      mdContent += `**Attachments:**\n`
      msg.attachments.forEach((att) => {
        mdContent += `- [${att.name || 'File'}](${att.url || '#'})\n`
      })
      mdContent += `\n`
    }

    mdContent += `---\n\n`
  })

  const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${sanitizeTitle}_${Date.now()}.md`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function exportChatToJSON(title: string, messages: ExportableMessage[]) {
  const sanitizeTitle = title.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'chat_export'

  const data = {
    title,
    exported_at: new Date().toISOString(),
    app: 'NovaMind AI',
    messages: messages.map((m) => ({
      id: m.id,
      role: m.role,
      content: m.content,
      created_at: m.created_at,
      attachments: m.attachments || [],
    })),
  }

  const jsonString = JSON.stringify(data, null, 2)
  const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${sanitizeTitle}_${Date.now()}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
