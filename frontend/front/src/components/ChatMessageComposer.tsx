import React, { useRef, useEffect, useState, useCallback, type FormEvent, type KeyboardEvent, type DragEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Mic, ArrowUp, Square, Paperclip, Sparkles, X, Image as ImageIcon, RefreshCw, Eye } from 'lucide-react'

export interface PendingAttachmentItem {
  id: string
  name: string
  type: string
  size: number
  file: File
  previewUrl?: string
  loading?: boolean
  error?: boolean
}

interface ChatMessageComposerProps {
  prompt: string
  setPrompt: (value: string | ((prev: string) => string)) => void
  pendingAttachments: PendingAttachmentItem[]
  setPendingAttachments: React.Dispatch<React.SetStateAction<PendingAttachmentItem[]>>
  onSend: (e?: FormEvent) => void
  isSending: boolean
  isThinking: boolean
  stopGeneration: () => void
  isUploadingFiles: boolean
  toggleSpeechRecognition: (callback: (text: string) => void) => void
  isListening: boolean
  triggerFileInput: (type: 'all' | 'image') => void
  fileInputRef: React.RefObject<HTMLInputElement | null>
  imageInputRef: React.RefObject<HTMLInputElement | null>
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  removePendingAttachment: (id: string) => void
  setIsPromptLibraryOpen: (open: boolean) => void
  onOpenImageViewer?: (url: string, name: string) => void
  showToast?: (message: string, type?: 'success' | 'error' | 'info') => void
  textareaRef?: React.RefObject<HTMLTextAreaElement | null>
}

export const ChatMessageComposer: React.FC<ChatMessageComposerProps> = ({
  prompt,
  setPrompt,
  pendingAttachments,
  setPendingAttachments,
  onSend,
  isSending,
  isThinking,
  stopGeneration,
  isUploadingFiles,
  toggleSpeechRecognition,
  isListening,
  triggerFileInput,
  fileInputRef,
  imageInputRef,
  handleFileChange,
  removePendingAttachment,
  setIsPromptLibraryOpen,
  onOpenImageViewer,
  showToast,
  textareaRef: externalTextareaRef,
}) => {
  const internalTextareaRef = useRef<HTMLTextAreaElement>(null)
  const textareaRef = externalTextareaRef || internalTextareaRef
  const [plusMenuOpen, setPlusMenuOpen] = useState(false)
  const [isDraggingOver, setIsDraggingOver] = useState(false)
  const [isMultiLine, setIsMultiLine] = useState(false)
  const dragCounterRef = useRef(0)

  // Adjust height & detect single-line vs multi-line expansion
  const adjustHeight = useCallback(() => {
    const el = textareaRef.current
    if (!el) return

    el.style.height = 'auto'
    const scrollH = el.scrollHeight

    const multiLineDetected = Boolean(prompt.includes('\n') || scrollH > 34 || pendingAttachments.length > 0)
    setIsMultiLine(multiLineDetected)

    if (multiLineDetected) {
      const targetH = Math.min(scrollH, 180)
      el.style.height = `${targetH}px`
      el.style.overflowY = scrollH > 180 ? 'auto' : 'hidden'
    } else {
      el.style.height = '28px'
      el.style.overflowY = 'hidden'
    }
  }, [prompt, pendingAttachments, textareaRef])

  useEffect(() => {
    adjustHeight()
  }, [adjustHeight])

  // Key Down Handler: Enter -> New line, Ctrl+Enter or Cmd+Enter -> Send
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      onSend()
    }
  }

  // Handle Drag & Drop events
  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounterRef.current += 1
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDraggingOver(true)
    }
  }

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounterRef.current -= 1
    if (dragCounterRef.current <= 0) {
      dragCounterRef.current = 0
      setIsDraggingOver(false)
    }
  }

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDraggingOver(false)
    dragCounterRef.current = 0

    const files = e.dataTransfer.files
    if (!files || files.length === 0) return

    const allowedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
    const newAttachments: PendingAttachmentItem[] = []

    Array.from(files).forEach((file: File) => {
      const isImg = file.type.startsWith('image/')
      if (isImg && !allowedFormats.includes(file.type.toLowerCase())) {
        showToast?.(`Unsupported image format: ${file.name}. Supported: JPG, PNG, WEBP, GIF.`, 'error')
        return
      }

      newAttachments.push({
        id: Math.random().toString(36).substring(2, 9),
        name: file.name,
        type: file.type,
        size: file.size,
        file,
        previewUrl: isImg ? URL.createObjectURL(file) : undefined,
        loading: false,
        error: false,
      })
    })

    if (newAttachments.length > 0) {
      setPendingAttachments((prev) => [...prev, ...newAttachments])
      showToast?.(`Added ${newAttachments.length} attachment${newAttachments.length > 1 ? 's' : ''}`, 'success')
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const handleVoiceTranscript = (text: string) => {
    setPrompt((prev) => (prev ? prev + ' ' + text : text))
    requestAnimationFrame(adjustHeight)
  }

  const canSend = Boolean(prompt.trim() || pendingAttachments.length > 0)

  // Plus Menu Popover Renderer
  const renderPlusButton = (buttonSizeClasses: string = 'size-8 sm:size-8.5') => (
    <div className="relative shrink-0 flex items-center">
      <button
        type="button"
        onClick={() => setPlusMenuOpen((prev) => !prev)}
        disabled={isSending || isUploadingFiles}
        className={`${buttonSizeClasses} rounded-full bg-white/10 hover:bg-white/15 text-slate-200 hover:text-white transition flex items-center justify-center shrink-0 cursor-pointer ${
          plusMenuOpen ? 'bg-white/20 text-white' : ''
        }`}
        title="Add attachments or templates"
      >
        <Plus
          size={18}
          className={`stroke-[2] transition-transform duration-200 ${
            plusMenuOpen ? 'rotate-45' : ''
          }`}
        />
      </button>

      {/* Plus Menu Popover */}
      <AnimatePresence>
        {plusMenuOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setPlusMenuOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute bottom-full left-0 mb-3 z-50 w-52 rounded-2xl border border-white/10 bg-[#212121] p-1.5 shadow-2xl space-y-0.5 select-none"
            >
              <button
                type="button"
                onClick={() => {
                  setPlusMenuOpen(false)
                  triggerFileInput('image')
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-200 hover:bg-white/10 hover:text-white transition text-left cursor-pointer"
              >
                <ImageIcon size={16} className="text-emerald-400 shrink-0" />
                <span>Upload Images</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setPlusMenuOpen(false)
                  triggerFileInput('all')
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-200 hover:bg-white/10 hover:text-white transition text-left cursor-pointer"
              >
                <Paperclip size={16} className="text-indigo-400 shrink-0" />
                <span>All Files & Documents</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setPlusMenuOpen(false)
                  setIsPromptLibraryOpen(true)
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-200 hover:bg-white/10 hover:text-white transition text-left cursor-pointer"
              >
                <Sparkles size={16} className="text-amber-400 shrink-0" />
                <span>Prompt Templates</span>
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )

  // Mic & Send Action Buttons Renderer
  const renderActionButtons = (buttonSizeClasses: string = 'size-8 sm:size-8.5') => (
    <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
      <button
        type="button"
        onClick={() => toggleSpeechRecognition(handleVoiceTranscript)}
        className={`${buttonSizeClasses} rounded-full flex items-center justify-center transition shrink-0 cursor-pointer ${
          isListening
            ? 'bg-red-500/20 text-red-400 animate-pulse'
            : 'text-slate-300 hover:bg-white/10 hover:text-white'
        }`}
        title="Voice dictation"
      >
        <Mic size={16} />
      </button>

      {isSending || isThinking ? (
        <button
          type="button"
          onClick={stopGeneration}
          className={`${buttonSizeClasses} rounded-full bg-white hover:bg-slate-200 text-black flex items-center justify-center transition-all duration-200 shadow-md cursor-pointer active:scale-95 shrink-0`}
          title="Pause / Stop task"
        >
          <Square size={12} className="fill-black text-black" />
        </button>
      ) : (
        <button
          type="submit"
          disabled={isUploadingFiles || !canSend}
          className={`${buttonSizeClasses} rounded-full flex items-center justify-center transition-all duration-200 shadow-md shrink-0 ${
            !canSend || isUploadingFiles
              ? 'bg-[#2563eb]/40 text-white/40 cursor-not-allowed'
              : 'bg-[#2563eb] hover:bg-[#1d4ed8] text-white active:scale-95 cursor-pointer'
          }`}
          title="Send message (Ctrl+Enter)"
        >
          <ArrowUp size={16} className="text-white stroke-[2.5]" />
        </button>
      )}
    </div>
  )

  return (
    <div
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={`relative w-full rounded-[26px] bg-[#212121] border transition-all duration-200 ease-out shadow-2xl ${
        isDraggingOver
          ? 'border-blue-500 bg-blue-500/10 ring-4 ring-blue-500/20'
          : 'border-white/10 hover:border-white/15 focus-within:border-white/25 focus-within:ring-2 focus-within:ring-blue-500/20'
      }`}
    >
      {/* Drag and drop overlay highlight label */}
      <AnimatePresence>
        {isDraggingOver && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="absolute inset-0 z-30 rounded-[26px] bg-[#212121]/90 backdrop-blur-sm border-2 border-dashed border-blue-400 flex flex-col items-center justify-center p-4 pointer-events-none"
          >
            <ImageIcon className="size-8 text-blue-400 animate-bounce mb-1" />
            <p className="text-sm font-semibold text-white">Drop images or files here</p>
            <p className="text-xs text-blue-300/80">Supports JPG, PNG, WEBP, GIF, PDF & docs</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden File Inputs */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        multiple
      />
      <input
        type="file"
        ref={imageInputRef}
        onChange={handleFileChange}
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        multiple
      />

      {!isMultiLine ? (
        /* SINGLE LINE SLEEK COLLAPSED MODE (Compact 48-52px height, items vertically centered in 1 row) */
        <form
          onSubmit={onSend}
          className="flex items-center justify-between gap-2 sm:gap-2.5 w-full min-h-[48px] sm:min-h-[50px] px-3 py-1.5"
        >
          {renderPlusButton('size-8.5')}

          <textarea
            ref={textareaRef}
            rows={1}
            value={prompt}
            onInput={adjustHeight}
            onChange={(e) => {
              setPrompt(e.target.value)
              adjustHeight()
            }}
            onKeyDown={handleKeyDown}
            disabled={isUploadingFiles}
            placeholder="Ask anything..."
            className="flex-1 resize-none bg-transparent px-1 py-0.5 text-sm sm:text-base leading-normal text-[#ececec] placeholder-[#8e8e93] focus:outline-none scrollbar-none font-sans overflow-hidden my-auto"
            style={{
              height: '28px',
              minHeight: '28px',
            }}
          />

          {renderActionButtons('size-8.5')}
        </form>
      ) : (
        /* MULTI-LINE EXPANDED CARD MODE (Auto-growing textarea up to 180px + bottom-aligned action buttons) */
        <form onSubmit={onSend} className="flex flex-col w-full p-2.5 sm:p-3 space-y-2.5">
          {/* TOP IMAGE & FILE ATTACHMENTS PREVIEW TRAY */}
          {pendingAttachments.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-none select-none"
            >
              {pendingAttachments.map((item) => {
                const isImg = item.type.startsWith('image/')
                return (
                  <div
                    key={item.id}
                    className="relative group shrink-0 transition-transform duration-150 hover:scale-[1.02]"
                  >
                    {isImg ? (
                      <div className="relative size-16 sm:size-18 rounded-2xl border border-white/12 bg-[#2b2b2b] overflow-hidden shadow-lg flex items-center justify-center">
                        {item.loading ? (
                          <div className="flex flex-col items-center justify-center gap-1">
                            <RefreshCw className="size-4 text-blue-400 animate-spin" />
                            <span className="text-[9px] text-slate-400">Loading</span>
                          </div>
                        ) : item.error || !item.previewUrl ? (
                          <div className="flex flex-col items-center justify-center p-1 text-center">
                            <span className="text-[10px] text-rose-400 font-medium">Load failed</span>
                            <button
                              type="button"
                              onClick={() => removePendingAttachment(item.id)}
                              className="mt-1 text-[9px] text-slate-400 underline hover:text-white"
                            >
                              Remove
                            </button>
                          </div>
                        ) : (
                          <>
                            <img
                              src={item.previewUrl}
                              alt={item.name}
                              className="size-full object-cover cursor-pointer"
                              onClick={() => onOpenImageViewer?.(item.previewUrl!, item.name)}
                            />

                            {/* Lightbox click overlay hint */}
                            <div
                              onClick={() => onOpenImageViewer?.(item.previewUrl!, item.name)}
                              className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex items-center justify-center cursor-pointer"
                            >
                              <Eye className="size-4 text-white drop-shadow" />
                            </div>

                            {/* File size badge at bottom left */}
                            <div className="absolute bottom-1 left-1 pointer-events-none rounded bg-black/70 px-1 py-0.5 text-[9px] text-white/90 font-mono">
                              {formatFileSize(item.size)}
                            </div>
                          </>
                        )}

                        {/* Top Right 'X' Remove button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            removePendingAttachment(item.id)
                          }}
                          className="absolute top-1 right-1 p-1 rounded-full bg-black/70 hover:bg-rose-600 text-white transition-all shadow-md active:scale-95 cursor-pointer z-10"
                          title="Remove image"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ) : (
                      /* Non-Image File Chip */
                      <div className="relative flex items-center gap-2.5 px-3 py-2 rounded-xl border border-white/12 bg-[#2b2b2b] text-xs text-white max-w-[200px] shadow-md group">
                        <Paperclip size={14} className="text-indigo-400 shrink-0" />
                        <div className="flex flex-col min-w-0 flex-1">
                          <span className="truncate font-medium text-slate-200">{item.name}</span>
                          <span className="text-[9px] text-slate-400">{formatFileSize(item.size)}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removePendingAttachment(item.id)}
                          className="rounded p-1 text-slate-400 hover:text-white hover:bg-white/10 transition"
                          title="Remove file"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </motion.div>
          )}

          {/* MIDDLE TEXTAREA AREA */}
          <div className="relative w-full flex items-start">
            <textarea
              ref={textareaRef}
              rows={1}
              value={prompt}
              onInput={adjustHeight}
              onChange={(e) => {
                setPrompt(e.target.value)
                adjustHeight()
              }}
              onKeyDown={handleKeyDown}
              disabled={isUploadingFiles}
              placeholder="Ask anything..."
              className="w-full resize-none bg-transparent px-1 py-0.5 text-sm sm:text-base leading-relaxed text-[#ececec] placeholder-[#8e8e93] focus:outline-none font-sans scrollbar-thin scrollbar-thumb-white/10 hover:scrollbar-thumb-white/20 transition-[height] duration-200 ease-out"
              style={{
                minHeight: '24px',
                maxHeight: '180px',
              }}
            />
          </div>

          {/* BOTTOM ACTION TOOLBAR - Icons stay aligned at bottom while expanding */}
          <div className="flex items-center justify-between pt-0.5 select-none">
            {renderPlusButton('size-8.5')}
            {renderActionButtons('size-8.5')}
          </div>
        </form>
      )}
    </div>
  )
}
