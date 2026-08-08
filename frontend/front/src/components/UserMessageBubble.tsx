import { useState, useRef, useMemo, useEffect } from 'react'
import {
  ChevronDown,
  ChevronUp,
  Copy,
  FileDown,
  FileText,
  Play,
  Trash2,
  ArrowUp,
  Upload,
  Edit3
} from 'lucide-react'
import type { ExtendedMessage } from '../context/ChatContext'

interface UserMessageBubbleProps {
  message: ExtendedMessage
  isEditing: boolean
  editContent: string
  setEditContent: (val: string) => void
  onCancelEdit: () => void
  onSaveEdit: (msgId: number) => void
  userBubbleColor?: string
  deletedAttachmentUrls: string[]
  onOpenImageViewer: (url: string, name: string) => void
  onOpenVideoPlayer: (url: string, name: string) => void
  onDownloadAttachment: (url: string, name: string) => void
  onCopyLink: (url: string) => void
  onDeleteAttachment: (url: string) => void
  onCopyPrompt: (text: string) => void
  onSharePrompt: () => void
  onStartEdit: (msg: ExtendedMessage) => void
}

export function UserMessageBubble({
  message,
  isEditing,
  editContent,
  setEditContent,
  onCancelEdit,
  onSaveEdit,
  userBubbleColor,
  deletedAttachmentUrls,
  onOpenImageViewer,
  onOpenVideoPlayer,
  onDownloadAttachment,
  onCopyLink,
  onDeleteAttachment,
  onCopyPrompt,
  onSharePrompt,
  onStartEdit,
}: UserMessageBubbleProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isOverflowing, setIsOverflowing] = useState(false)
  const textContainerRef = useRef<HTMLDivElement>(null)

  // Determine if message is long based on text length or line breaks
  const isPotentiallyLong = useMemo(() => {
    const text = message.content || ''
    return text.length > 280 || text.split('\n').length > 5
  }, [message.content])

  // Measure actual DOM height to accurately detect overflow
  useEffect(() => {
    if (!textContainerRef.current) return
    const el = textContainerRef.current
    const hasHeightOverflow = el.scrollHeight > 160
    setIsOverflowing(hasHeightOverflow || isPotentiallyLong)
  }, [message.content, isPotentiallyLong])

  return (
    <div className="group relative flex flex-col items-end w-full space-y-1 min-w-0">
      <div
        className={`${
          isEditing
            ? 'w-full max-w-[92%] sm:max-w-[85%] md:max-w-[70%]'
            : 'max-w-[92%] sm:max-w-[85%] md:max-w-[70%] w-fit'
        } user-message-bubble rounded-[24px] px-4.5 py-2.5 sm:px-5 sm:py-2.5 shadow-sm relative select-text break-words overflow-wrap-anywhere min-w-0 animate-fade-in-up`}
        style={{
          backgroundColor:
            userBubbleColor && userBubbleColor !== 'default'
              ? userBubbleColor
              : undefined,
        }}
      >
        {isEditing ? (
          <div className="space-y-2.5 min-w-0">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full min-h-[80px] bg-slate-900 text-white rounded-lg p-2.5 text-sm focus:outline-none border border-indigo-500/40"
              autoFocus
            />
            <div className="flex justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={onCancelEdit}
                className="px-3 py-1.5 rounded-lg border border-white/10 text-slate-300 hover:bg-white/10 hover:text-white transition font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => onSaveEdit(message.id)}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-md transition cursor-pointer"
              >
                Submit
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col min-w-0">
            {/* User Prompt Text Content Container with Expandable Preview for Long Messages */}
            <div className="relative min-w-0">
              <div
                ref={textContainerRef}
                className={`min-w-0 max-w-full break-words overflow-wrap-anywhere ${
                  isOverflowing && !isExpanded
                    ? 'max-h-[150px] sm:max-h-[170px] overflow-hidden'
                    : isOverflowing && isExpanded
                    ? 'max-h-[500px] sm:max-h-[600px] overflow-y-auto scrollbar-thin pr-1'
                    : ''
                }`}
                style={{
                  wordBreak: 'break-word',
                  overflowWrap: 'anywhere',
                }}
              >
                <p className="whitespace-pre-wrap text-sm sm:text-base text-slate-100 font-normal leading-relaxed break-words overflow-wrap-anywhere min-w-0">
                  {message.content}
                </p>
              </div>

              {/* Bottom fade mask when collapsed */}
              {isOverflowing && !isExpanded && (
                <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-[#2f2f2f] to-transparent rounded-b-[24px]" />
              )}
            </div>

            {/* Show more / Show less toggle button for Long Prompts */}
            {isOverflowing && (
              <div className="mt-1 flex items-center justify-start select-none">
                <button
                  type="button"
                  onClick={() => setIsExpanded((prev) => !prev)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300 py-1 px-1.5 -ml-1 rounded transition hover:bg-white/5 active:scale-95 cursor-pointer"
                  title={isExpanded ? 'Show less' : 'Show more'}
                >
                  <span>{isExpanded ? 'Show less' : 'Show more'}</span>
                  {isExpanded ? (
                    <ChevronUp size={14} className="shrink-0" />
                  ) : (
                    <ChevronDown size={14} className="shrink-0" />
                  )}
                </button>
              </div>
            )}

            {/* User Attachments - Image previews directly */}
            {message.attachments &&
              message.attachments.some(
                (f) =>
                  f.type.startsWith('image/') &&
                  !deletedAttachmentUrls.includes(f.url)
              ) && (
                <div className="mt-2.5 flex flex-wrap gap-2 justify-end">
                  {message.attachments
                    .filter(
                      (f) =>
                        f.type.startsWith('image/') &&
                        !deletedAttachmentUrls.includes(f.url)
                    )
                    .map((file, idx) => (
                      <div key={idx} className="relative group/img">
                        <button
                          type="button"
                          onClick={() => onOpenImageViewer(file.url, file.name)}
                          className="block overflow-hidden rounded-xl border border-white/10 hover:border-white/20 transition max-w-[280px] shadow-lg text-left cursor-pointer"
                        >
                          <img
                            src={file.url}
                            alt={file.name}
                            className="max-h-56 w-full object-cover rounded-xl"
                          />
                        </button>
                        {/* Quick Actions overlay for images */}
                        <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover/img:opacity-100 transition-opacity duration-200 bg-[#1e1e1e]/85 backdrop-blur rounded-lg p-1 border border-white/10 shadow-lg">
                          <button
                            type="button"
                            onClick={() =>
                              onDownloadAttachment(file.url, file.name)
                            }
                            className="p-1 hover:bg-white/10 rounded text-slate-300 hover:text-white cursor-pointer"
                            title="Download"
                          >
                            <FileDown size={11} />
                          </button>
                          <button
                            type="button"
                            onClick={() => onCopyLink(file.url)}
                            className="p-1 hover:bg-white/10 rounded text-slate-300 hover:text-white cursor-pointer"
                            title="Copy Link"
                          >
                            <Copy size={11} />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteAttachment(file.url)}
                            className="p-1 hover:bg-rose-500/25 rounded text-rose-400 hover:text-rose-300 cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              )}

            {/* User Attachments - Files rendering */}
            {message.attachments &&
              message.attachments.some(
                (f) =>
                  !f.type.startsWith('image/') &&
                  !deletedAttachmentUrls.includes(f.url)
              ) && (
                <div className="mt-2.5 flex flex-wrap gap-2 justify-end">
                  {message.attachments
                    .filter(
                      (f) =>
                        !f.type.startsWith('image/') &&
                        !deletedAttachmentUrls.includes(f.url)
                    )
                    .map((file, idx) => {
                      const isVideo = file.type.startsWith('video/')
                      const isPdf =
                        file.type === 'application/pdf' ||
                        file.name.endsWith('.pdf')

                      return (
                        <div
                          key={idx}
                          className="relative group/file flex items-center gap-3 rounded-xl border border-white/10 bg-slate-950/60 p-3 pr-4 hover:bg-slate-950 transition min-w-[220px] max-w-[280px] text-left"
                        >
                          <div className="size-10 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                            {isVideo ? (
                              <Play size={18} className="text-indigo-400" />
                            ) : isPdf ? (
                              <FileText size={18} className="text-rose-400" />
                            ) : (
                              <FileText size={18} className="text-cyan-400" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-semibold text-white">
                              {file.name}
                            </p>
                            <p className="text-[10px] text-slate-500 font-medium">
                              {(file.size / 1024).toFixed(1)} KB
                            </p>
                          </div>
                          {/* Quick Actions overlay for files */}
                          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover/file:opacity-100 transition-opacity duration-200 bg-[#212121] border border-white/10 rounded-lg p-1 shadow-lg">
                            {isVideo ? (
                              <button
                                type="button"
                                onClick={() =>
                                  onOpenVideoPlayer(file.url, file.name)
                                }
                                className="p-1 hover:bg-white/10 rounded text-indigo-400 cursor-pointer"
                                title="Play Video"
                              >
                                <Play size={11} />
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => window.open(file.url, '_blank')}
                                className="p-1 hover:bg-white/10 rounded text-cyan-400 cursor-pointer"
                                title="Open in Tab"
                              >
                                <ArrowUp size={11} className="rotate-45" />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() =>
                                onDownloadAttachment(file.url, file.name)
                              }
                              className="p-1 hover:bg-white/10 rounded text-slate-300 cursor-pointer"
                              title="Download"
                            >
                              <FileDown size={11} />
                            </button>
                            <button
                              type="button"
                              onClick={() => onCopyLink(file.url)}
                              className="p-1 hover:bg-white/10 rounded text-slate-300 cursor-pointer"
                              title="Copy Link"
                            >
                              <Copy size={11} />
                            </button>
                            <button
                              type="button"
                              onClick={() => onDeleteAttachment(file.url)}
                              className="p-1 hover:bg-rose-500/20 rounded text-rose-400 cursor-pointer"
                              title="Delete"
                            >
                              <Trash2 size={11} />
                            </button>
                          </div>
                        </div>
                      )
                    })}
                </div>
              )}
          </div>
        )}
      </div>

      {/* 3 Hover Option Buttons below user bubble (Copy, Share, Edit) */}
      {!isEditing && (
        <div className="flex items-center gap-2 mt-1 mr-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-slate-400 select-none">
          {/* 1. Copy */}
          <button
            type="button"
            onClick={() => onCopyPrompt(message.content)}
            className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition duration-150 active:scale-95 cursor-pointer"
            title="Copy prompt"
          >
            <Copy size={15} />
          </button>

          {/* 2. Share */}
          <button
            type="button"
            onClick={onSharePrompt}
            className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition duration-150 active:scale-95 cursor-pointer"
            title="Share prompt"
          >
            <Upload size={15} />
          </button>

          {/* 3. Edit */}
          <button
            type="button"
            onClick={() => onStartEdit(message)}
            className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition duration-150 active:scale-95 cursor-pointer"
            title="Edit prompt"
          >
            <Edit3 size={15} />
          </button>
        </div>
      )}
    </div>
  )
}
