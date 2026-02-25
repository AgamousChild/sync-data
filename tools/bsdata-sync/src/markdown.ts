import { mkdirSync, writeFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { getFactions, getUnitsByFaction } from './db.js'
import type { UnitProfile, WeaponProfile } from './types.js'

export interface MarkdownResult {
  factionCount: number
  fileCount: number
}

function formatRange(range: number | 'melee'): string {
  return range === 'melee' ? 'Melee' : `${range}"`
}

function formatAttacks(attacks: number | string): string {
  return String(attacks)
}

function formatAbilities(weapon: WeaponProfile): string {
  if (weapon.abilities.length === 0) return '-'
  return weapon.abilities
    .map((a) => {
      if ('value' in a) return `${a.type.replace(/_/g, ' ')} ${a.value}`
      return a.type.replace(/_/g, ' ')
    })
    .join(', ')
}

function generateUnitMarkdown(unit: UnitProfile): string {
  const lines: string[] = []

  lines.push(`### ${unit.name}`)
  lines.push(`**Points:** ${unit.points}`)
  lines.push('')

  // Stat block
  lines.push('| M | T | Sv | W | Ld | OC |')
  lines.push('|---|---|----|----|----|----|')
  lines.push(`| ${unit.move}" | ${unit.toughness} | ${unit.save}+ | ${unit.wounds} | ${unit.leadership}+ | ${unit.oc} |`)
  lines.push('')

  // Ranged weapons
  const ranged = unit.weapons.filter((w) => w.range !== 'melee')
  if (ranged.length > 0) {
    lines.push('**Ranged Weapons**')
    lines.push('')
    lines.push('| Weapon | Range | A | BS | S | AP | D | Abilities |')
    lines.push('|--------|-------|---|----|---|----|---|-----------|')
    for (const w of ranged) {
      lines.push(`| ${w.name} | ${formatRange(w.range)} | ${formatAttacks(w.attacks)} | ${w.skill}+ | ${w.strength} | ${w.ap} | ${formatAttacks(w.damage)} | ${formatAbilities(w)} |`)
    }
    lines.push('')
  }

  // Melee weapons
  const melee = unit.weapons.filter((w) => w.range === 'melee')
  if (melee.length > 0) {
    lines.push('**Melee Weapons**')
    lines.push('')
    lines.push('| Weapon | A | WS | S | AP | D | Abilities |')
    lines.push('|--------|---|----|---|----|---|-----------|')
    for (const w of melee) {
      lines.push(`| ${w.name} | ${formatAttacks(w.attacks)} | ${w.skill}+ | ${w.strength} | ${w.ap} | ${formatAttacks(w.damage)} | ${formatAbilities(w)} |`)
    }
    lines.push('')
  }

  // Abilities
  if (unit.abilities.length > 0) {
    lines.push('**Abilities**')
    lines.push('')
    for (const a of unit.abilities) {
      lines.push(`- ${a}`)
    }
    lines.push('')
  }

  lines.push('---')
  lines.push('')

  return lines.join('\n')
}

export function generateFactionMarkdown(dbPath: string, faction: string): string {
  const lines: string[] = []
  const units = getUnitsByFaction(dbPath, faction)

  lines.push(`# ${faction}`)
  lines.push('')
  lines.push(`${units.length} units`)
  lines.push('')

  for (const unit of units) {
    lines.push(generateUnitMarkdown(unit))
  }

  return lines.join('\n')
}

export function generateAllMarkdown(dbPath: string, outputDir: string): MarkdownResult {
  if (!existsSync(outputDir)) mkdirSync(outputDir, { recursive: true })

  const factions = getFactions(dbPath)
  let fileCount = 0

  const indexLines: string[] = []
  indexLines.push('# BSData 40K Unit Profiles')
  indexLines.push('')
  indexLines.push(`Generated: ${new Date().toISOString()}`)
  indexLines.push('')
  indexLines.push('## Factions')
  indexLines.push('')

  for (const faction of factions) {
    const safeName = faction.replace(/[^a-zA-Z0-9 -]/g, '').replace(/\s+/g, '-').toLowerCase()
    const fileName = `${safeName}.md`

    const markdown = generateFactionMarkdown(dbPath, faction)
    writeFileSync(join(outputDir, fileName), markdown, 'utf-8')
    fileCount++

    indexLines.push(`- [${faction}](./${fileName})`)
  }

  indexLines.push('')
  writeFileSync(join(outputDir, 'INDEX.md'), indexLines.join('\n'), 'utf-8')
  fileCount++

  return { factionCount: factions.length, fileCount }
}
