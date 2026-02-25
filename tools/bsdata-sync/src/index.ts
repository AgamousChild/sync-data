import { resolve } from 'node:path'
import { loadMetadata, saveMetadata, hasChanged } from './metadata.js'
import { getLatestCommitSha, listCatalogFiles, fetchCatalogXml } from './github.js'
import { parseBSDataXml } from './parser.js'
import { createTables, importData, getUnitCountByFaction } from './db.js'
import { generateAllMarkdown } from './markdown.js'
import type { UnitProfile } from './types.js'

const ROOT_DIR = resolve(process.cwd(), '.local', 'bsdata')
const MD_DIR = resolve(ROOT_DIR, 'markdown')
const DB_PATH = resolve(ROOT_DIR, 'data.db')
const META_PATH = resolve(ROOT_DIR, 'metadata.json')

async function main() {
  console.log('BSData Sync')
  console.log('===========')
  console.log()

  // 1. Check for updates
  console.log('Checking for updates...')
  const metadata = loadMetadata(META_PATH)
  const { sha: remoteCommitSha, rateLimit } = await getLatestCommitSha()
  console.log(`  Remote commit: ${remoteCommitSha.slice(0, 12)}`)
  console.log(`  Stored commit: ${metadata.commitSha?.slice(0, 12) ?? '(none)'}`)
  console.log(`  Rate limit: ${rateLimit.remaining}/${rateLimit.limit} remaining`)

  if (!hasChanged(metadata, remoteCommitSha)) {
    console.log()
    console.log('No changes detected. Skipping sync.')
    return
  }

  console.log('  Changes detected — syncing...')
  console.log()

  // 2. List catalog files
  console.log('Listing catalog files...')
  const { catalogs, rateLimit: listRateLimit } = await listCatalogFiles()
  console.log(`  Found ${catalogs.length} catalogs`)
  console.log(`  Rate limit: ${listRateLimit.remaining}/${listRateLimit.limit} remaining`)
  console.log()

  // 3. Fetch and parse each catalog
  console.log('Fetching and parsing catalogs...')
  const allUnits: UnitProfile[] = []
  const allErrors: string[] = []
  let fetched = 0

  for (const catalog of catalogs) {
    try {
      const xml = await fetchCatalogXml(catalog.downloadUrl)
      const { units, errors } = parseBSDataXml(xml, catalog.faction)
      allUnits.push(...units)
      allErrors.push(...errors)
      fetched++
      console.log(`  ${catalog.faction}: ${units.length} units${errors.length > 0 ? ` (${errors.length} errors)` : ''}`)
    } catch (err) {
      console.error(`  ${catalog.faction}: FAILED — ${String(err)}`)
      allErrors.push(`Failed to fetch ${catalog.name}: ${String(err)}`)
    }
  }

  console.log(`  Fetched ${fetched}/${catalogs.length} catalogs, ${allUnits.length} total units`)
  if (allErrors.length > 0) {
    console.log(`  ${allErrors.length} parse errors (non-fatal)`)
  }
  console.log()

  // 4. Import into SQLite
  console.log('Importing into SQLite...')
  createTables(DB_PATH)
  importData(DB_PATH, allUnits)
  console.log(`  Database: ${DB_PATH}`)
  console.log()

  // 5. Generate markdown
  console.log('Generating markdown...')
  const mdResult = generateAllMarkdown(DB_PATH, MD_DIR)
  console.log(`  Generated ${mdResult.fileCount} files for ${mdResult.factionCount} factions`)
  console.log()

  // 6. Save metadata
  const factionMeta: Record<string, { unitCount: number; syncedAt: string }> = {}
  const factions = [...new Set(allUnits.map((u) => u.faction))].sort()
  for (const faction of factions) {
    factionMeta[faction] = {
      unitCount: getUnitCountByFaction(DB_PATH, faction),
      syncedAt: new Date().toISOString(),
    }
  }

  saveMetadata(META_PATH, {
    commitSha: remoteCommitSha,
    lastSyncedAt: new Date().toISOString(),
    factions: factionMeta,
  })

  console.log('Sync complete!')
  console.log(`  ${allUnits.length} units across ${factions.length} factions`)
}

main().catch((err) => {
  console.error('Sync failed:', err)
  process.exit(1)
})
