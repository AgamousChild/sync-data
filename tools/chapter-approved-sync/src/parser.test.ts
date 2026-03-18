import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { mkdtempSync, rmSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { textToMarkdown, safeFileName, generateIndex, extractPdfText } from './parser'

describe('textToMarkdown', () => {
  it('adds title as H1', () => {
    const md = textToMarkdown('Primary Missions', 'Some text here.')
    expect(md).toMatch(/^# Primary Missions\n/)
  })

  it('converts ALL CAPS lines to H2 headings', () => {
    const md = textToMarkdown('Test', 'SUPPLY DROP\nScore VP for holding objectives.')
    expect(md).toContain('## Supply Drop')
  })

  it('converts bullet symbols to markdown lists', () => {
    const md = textToMarkdown('Test', '• First rule\n● Second rule\n— Third rule')
    expect(md).toContain('- First rule')
    expect(md).toContain('- Second rule')
    expect(md).toContain('- Third rule')
  })

  it('strips standalone page numbers', () => {
    const md = textToMarkdown('Test', 'Some text\n42\nMore text')
    expect(md).not.toMatch(/^42$/m)
  })

  it('collapses excessive blank lines', () => {
    const md = textToMarkdown('Test', 'Line 1\n\n\n\n\nLine 2')
    expect(md).not.toContain('\n\n\n')
  })

  it('preserves regular text', () => {
    const md = textToMarkdown('Test', 'This is a normal paragraph of rules text.')
    expect(md).toContain('This is a normal paragraph of rules text.')
  })

  it('does not convert short ALL CAPS to headers', () => {
    const md = textToMarkdown('Test', 'Use AP -1 for this weapon.')
    expect(md).not.toContain('## ')
  })

  it('trims leading/trailing whitespace from lines', () => {
    const md = textToMarkdown('Test', '  indented text  ')
    expect(md).toContain('indented text')
  })
})

describe('safeFileName', () => {
  it('lowercases the input', () => {
    expect(safeFileName('Primary Missions')).toBe('primary-missions')
  })

  it('replaces spaces with hyphens', () => {
    expect(safeFileName('Twist Cards')).toBe('twist-cards')
  })

  it('removes non-alphanumeric characters except hyphens', () => {
    expect(safeFileName('Challenger Cards!')).toBe('challenger-cards')
  })

  it('collapses multiple hyphens', () => {
    expect(safeFileName('Secondary Missions - Attacker')).toBe('secondary-missions-attacker')
  })

  it('trims leading/trailing hyphens', () => {
    expect(safeFileName(' --Test-- ')).toBe('test')
  })
})

describe('generateIndex', () => {
  let tempDir: string

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'ca-idx-'))
  })

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true })
  })

  it('creates INDEX.md with title and links', () => {
    generateIndex(tempDir, [
      { title: 'Primary Missions', mdFileName: 'primary-missions.md' },
      { title: 'Twist Cards', mdFileName: 'twist-cards.md' },
    ])

    const content = readFileSync(join(tempDir, 'INDEX.md'), 'utf-8')
    expect(content).toContain('# Chapter Approved 2025')
    expect(content).toContain('[Primary Missions](./primary-missions.md)')
    expect(content).toContain('[Twist Cards](./twist-cards.md)')
  })

  it('includes a generated timestamp', () => {
    generateIndex(tempDir, [])
    const content = readFileSync(join(tempDir, 'INDEX.md'), 'utf-8')
    expect(content).toContain('Generated:')
  })

  it('handles empty entries', () => {
    generateIndex(tempDir, [])
    const content = readFileSync(join(tempDir, 'INDEX.md'), 'utf-8')
    expect(content).toContain('# Chapter Approved 2025')
  })
})

describe('extractPdfText', () => {
  it('extracts text from a real PDF', async () => {
    const pdfPath = join(__dirname, '..', '..', 'ChapterApproved', '2025_TwistCards.pdf')
    const text = await extractPdfText(pdfPath)
    expect(text.length).toBeGreaterThan(100)
    // Twist cards should contain recognizable game text
    expect(text.toUpperCase()).toMatch(/TWIST|BATTLE|CARD/)
  })
})
