import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'

/**
 * Extract text from a PDF using unpdf (pdf.js wrapper).
 */
export async function extractPdfText(pdfPath: string): Promise<string> {
  const { getDocumentProxy, extractText } = await import('unpdf')

  const buffer = readFileSync(pdfPath)
  const pdf = await getDocumentProxy(new Uint8Array(buffer))
  const { text } = await extractText(pdf, { mergePages: true })

  return text
}

/**
 * Convert extracted PDF text to markdown.
 * - ALL CAPS lines → ## Headings
 * - Bullet symbols → - lists
 * - Standalone page numbers stripped
 * - Excessive blank lines collapsed
 */
export function textToMarkdown(title: string, rawText: string): string {
  const lines: string[] = []
  lines.push(`# ${title}`)
  lines.push('')

  const rawLines = rawText.split('\n')

  for (const line of rawLines) {
    const trimmed = line.trim()

    if (!trimmed) {
      if (lines[lines.length - 1] !== '') {
        lines.push('')
      }
      continue
    }

    // Skip standalone page numbers
    if (/^\d+$/.test(trimmed)) continue

    // ALL CAPS lines (short enough to be headings) → H2
    if (
      trimmed === trimmed.toUpperCase() &&
      trimmed.length > 3 &&
      trimmed.length < 80 &&
      /[A-Z]/.test(trimmed)
    ) {
      lines.push(`## ${titleCase(trimmed)}`)
      lines.push('')
      continue
    }

    // Bullet symbols → markdown lists
    if (/^[•●■◆▪–—-]\s/.test(trimmed)) {
      lines.push(`- ${trimmed.replace(/^[•●■◆▪–—-]\s*/, '')}`)
      continue
    }

    lines.push(trimmed)
  }

  return lines.join('\n').replace(/\n{3,}/g, '\n\n').trim() + '\n'
}

/**
 * Convert ALL CAPS to Title Case.
 */
function titleCase(str: string): string {
  return str
    .toLowerCase()
    .replace(/(?:^|\s)\S/g, (c) => c.toUpperCase())
}

/**
 * Convert a title to a safe, lowercase, hyphenated filename (without extension).
 */
export function safeFileName(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export interface IndexEntry {
  title: string
  mdFileName: string
}

/**
 * Generate INDEX.md linking all parsed markdown files.
 */
export function generateIndex(outputDir: string, entries: IndexEntry[]): void {
  const lines: string[] = []
  lines.push('# Chapter Approved 2025')
  lines.push('')
  lines.push(`Generated: ${new Date().toISOString()}`)
  lines.push('')

  if (entries.length > 0) {
    for (const e of entries) {
      lines.push(`- [${e.title}](./${e.mdFileName})`)
    }
    lines.push('')
  }

  if (!existsSync(outputDir)) mkdirSync(outputDir, { recursive: true })
  writeFileSync(join(outputDir, 'INDEX.md'), lines.join('\n'), 'utf-8')
}

export interface ParseResult {
  markdownPath: string
  charCount: number
}

/**
 * Parse a PDF file to markdown and write to disk.
 */
export async function parsePdfToMarkdown(
  pdfPath: string,
  title: string,
  outputDir: string,
  mdFileName: string,
): Promise<ParseResult> {
  if (!existsSync(outputDir)) mkdirSync(outputDir, { recursive: true })

  const text = await extractPdfText(pdfPath)
  const markdown = textToMarkdown(title, text)
  const markdownPath = join(outputDir, mdFileName)

  writeFileSync(markdownPath, markdown, 'utf-8')

  return { markdownPath, charCount: markdown.length }
}
