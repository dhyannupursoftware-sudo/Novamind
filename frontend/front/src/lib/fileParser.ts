import * as pdfjsLib from 'pdfjs-dist'
import mammoth from 'mammoth'

// Set worker source for PDF.js using cdnjs
pdfjsLib.GlobalWorkerOptions.workerSrc = '//cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.worker.min.js'

export interface VideoMetadata {
  duration: number
  width: number
  height: number
}

/**
 * Extracts metadata (duration and resolution) from a video file.
 */
export function getVideoMetadata(file: File): Promise<VideoMetadata> {
  return new Promise((resolve) => {
    const video = document.createElement('video')
    video.preload = 'metadata'
    video.src = URL.createObjectURL(file)
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(video.src)
      resolve({
        duration: video.duration || 0,
        width: video.videoWidth || 0,
        height: video.videoHeight || 0,
      })
    }
    video.onerror = () => {
      resolve({
        duration: 0,
        width: 0,
        height: 0,
      })
    }
  })
}

/**
 * Extracts raw text content from a text/CSV file.
 */
export function parseTextFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve((e.target?.result as string) || '')
    reader.onerror = (err) => reject(err)
    reader.readAsText(file)
  })
}

/**
 * Extracts raw text content from a PDF file page-by-page.
 */
export async function parsePdfFile(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer()
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer })
    const pdf = await loadingTask.promise
    let fullText = ''

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const textContent = await page.getTextContent()
      const pageText = textContent.items
        .map((item: any) => item.str || '')
        .join(' ')
      fullText += `[Page ${i}]\n${pageText}\n\n`
    }

    return fullText.trim()
  } catch (err) {
    console.error('PDF parsing error:', err)
    throw new Error('Failed to extract text from PDF document.')
  }
}

/**
 * Extracts raw text content from a DOCX file using mammoth.
 */
export async function parseDocxFile(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer()
    const result = await mammoth.extractRawText({ arrayBuffer })
    return result.value || ''
  } catch (err) {
    console.error('DOCX parsing error:', err)
    throw new Error('Failed to extract text from Word document.')
  }
}

/**
 * High-level parser that inspects file type and returns parsed text content or video metadata text.
 */
export async function parseFileContent(file: File): Promise<string> {
  const mime = file.type.toLowerCase()
  const extension = file.name.split('.').pop()?.toLowerCase() || ''

  if (mime.startsWith('text/') || extension === 'csv' || extension === 'txt' || extension === 'json' || extension === 'md') {
    return await parseTextFile(file)
  }

  if (mime === 'application/pdf' || extension === 'pdf') {
    return await parsePdfFile(file)
  }

  if (
    mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    extension === 'docx'
  ) {
    return await parseDocxFile(file)
  }

  if (mime.startsWith('video/') || ['mp4', 'mov', 'webm'].includes(extension)) {
    try {
      const meta = await getVideoMetadata(file)
      return `[Video Metadata - File Name: ${file.name}, Duration: ${meta.duration.toFixed(1)}s, Resolution: ${meta.width}x${meta.height}]`
    } catch {
      return `[Video Metadata - File Name: ${file.name}]`
    }
  }

  // Fallback for files that don't need text parsing (like images, which are processed on backend)
  return ''
}
