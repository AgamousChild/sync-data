import { resolve } from 'node:path'
import { existsSync } from 'node:fs'
import { parsePdfToMarkdown, safeFileName, generateIndex } from './parser'
import type { IndexEntry } from './parser'

const REPO_ROOT = resolve(process.cwd(), '..', '..')
const PDF_DIR = resolve(REPO_ROOT, 'tools', 'ChapterApproved')
const OUTPUT_DIR = resolve(REPO_ROOT, '.local', 'chapter-approved', 'markdown')

const PDFS: { file: string; title: string }[] = [
  { file: '2025_Primary Missions.pdf', title: 'Primary Missions' },
  { file: '2025_ChallengerCards.pdf', title: 'Challenger Cards' },
  { file: '2025_TwistCards.pdf', title: 'Twist Cards' },
  { file: '2025_SecondaryMissions_Attacker.pdf', title: 'Secondary Missions (Attacker)' },
  { file: '2025_SecondaryMissions_Defender.pdf', title: 'Secondary Missions (Defender)' },
  { file: '2025_DeploymentZones.pdf', title: 'Deployment Zones' },
  { file: '2025_TerrainLayouts.pdf', title: 'Terrain Layouts' },
  { file: '2025_MissionDeck_PrintableSpread.pdf', title: 'Mission Deck (Printable Spread)' },
]

async function main() {
  console.log('Chapter Approved 2025 Sync')
  console.log('===========================')
  console.log()

  if (!existsSync(PDF_DIR)) {
    console.error(`PDF directory not found: ${PDF_DIR}`)
    process.exit(1)
  }

  const indexEntries: IndexEntry[] = []
  let processed = 0
  let skipped = 0

  for (const { file, title } of PDFS) {
    const pdfPath = resolve(PDF_DIR, file)
    const mdFileName = `${safeFileName(title)}.md`

    if (!existsSync(pdfPath)) {
      console.log(`  Skipped (not found): ${file}`)
      skipped++
      continue
    }

    console.log(`  Processing: ${title}`)

    try {
      const result = await parsePdfToMarkdown(pdfPath, title, OUTPUT_DIR, mdFileName)
      console.log(`    → ${(result.charCount / 1024).toFixed(1)} KB markdown`)
      indexEntries.push({ title, mdFileName })
      processed++
    } catch (err) {
      console.error(`    Error: ${err instanceof Error ? err.message : err}`)
    }
  }

  // Generate INDEX.md
  console.log()
  console.log('Generating INDEX.md...')
  generateIndex(OUTPUT_DIR, indexEntries)

  // Summary
  console.log()
  console.log('Done!')
  console.log(`  Processed: ${processed}`)
  console.log(`  Skipped: ${skipped}`)
  console.log(`  Output: ${OUTPUT_DIR}`)
}

main().catch((err) => {
  console.error('Sync failed:', err)
  process.exit(1)
})
