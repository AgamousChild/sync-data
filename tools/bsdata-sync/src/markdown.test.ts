import { describe, expect, it, beforeEach, afterEach } from 'vitest'
import { existsSync, rmSync, mkdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { createTables, importData } from './db.js'
import { generateFactionMarkdown, generateAllMarkdown } from './markdown.js'
import type { UnitProfile } from './types.js'

const TEST_DIR = join(process.cwd(), '.test-tmp-markdown')
const DB_PATH = join(TEST_DIR, 'test.db')
const MD_DIR = join(TEST_DIR, 'markdown')

const SAMPLE_UNITS: UnitProfile[] = [
  {
    id: 'unit-001',
    faction: 'Iron Guard',
    name: 'Iron Warrior',
    move: 6,
    toughness: 4,
    save: 3,
    wounds: 2,
    leadership: 6,
    oc: 1,
    points: 75,
    weapons: [
      {
        name: 'Bolt Launcher',
        range: 24,
        attacks: 2,
        skill: 3,
        strength: 4,
        ap: -1,
        damage: 1,
        abilities: [{ type: 'BLAST' }],
      },
      {
        name: 'Combat Blade',
        range: 'melee',
        attacks: 3,
        skill: 3,
        strength: 4,
        ap: 0,
        damage: 1,
        abilities: [],
      },
    ],
    abilities: ['Heavy Armour'],
  },
  {
    id: 'unit-002',
    faction: 'Iron Guard',
    name: 'Storm Hulk',
    move: 8,
    toughness: 9,
    save: 2,
    wounds: 10,
    leadership: 6,
    oc: 3,
    points: 130,
    weapons: [
      {
        name: 'Scatter Cannon',
        range: 30,
        attacks: 'D6',
        skill: 4,
        strength: 7,
        ap: -1,
        damage: 2,
        abilities: [{ type: 'SUSTAINED_HITS', value: 1 }],
      },
    ],
    abilities: [],
  },
  {
    id: 'unit-003',
    faction: 'Star Knights',
    name: 'Scout',
    move: 7,
    toughness: 3,
    save: 5,
    wounds: 1,
    leadership: 7,
    oc: 1,
    points: 40,
    weapons: [],
    abilities: [],
  },
]

beforeEach(() => {
  if (existsSync(TEST_DIR)) rmSync(TEST_DIR, { recursive: true })
  mkdirSync(TEST_DIR, { recursive: true })
  createTables(DB_PATH)
  importData(DB_PATH, SAMPLE_UNITS)
})

afterEach(() => {
  if (existsSync(TEST_DIR)) rmSync(TEST_DIR, { recursive: true })
})

describe('generateFactionMarkdown', () => {
  it('includes faction heading', () => {
    const md = generateFactionMarkdown(DB_PATH, 'Iron Guard')
    expect(md).toContain('# Iron Guard')
  })

  it('includes unit count', () => {
    const md = generateFactionMarkdown(DB_PATH, 'Iron Guard')
    expect(md).toContain('2 units')
  })

  it('includes unit names as headings', () => {
    const md = generateFactionMarkdown(DB_PATH, 'Iron Guard')
    expect(md).toContain('### Iron Warrior')
    expect(md).toContain('### Storm Hulk')
  })

  it('includes stat block table', () => {
    const md = generateFactionMarkdown(DB_PATH, 'Iron Guard')
    expect(md).toContain('| 6" | 4 | 3+ | 2 | 6+ | 1 |')
  })

  it('includes points cost', () => {
    const md = generateFactionMarkdown(DB_PATH, 'Iron Guard')
    expect(md).toContain('**Points:** 75')
  })

  it('includes ranged weapons table', () => {
    const md = generateFactionMarkdown(DB_PATH, 'Iron Guard')
    expect(md).toContain('**Ranged Weapons**')
    expect(md).toContain('Bolt Launcher')
    expect(md).toContain('24"')
  })

  it('includes melee weapons table', () => {
    const md = generateFactionMarkdown(DB_PATH, 'Iron Guard')
    expect(md).toContain('**Melee Weapons**')
    expect(md).toContain('Combat Blade')
  })

  it('includes weapon abilities', () => {
    const md = generateFactionMarkdown(DB_PATH, 'Iron Guard')
    expect(md).toContain('BLAST')
    expect(md).toContain('SUSTAINED HITS 1')
  })

  it('includes unit abilities', () => {
    const md = generateFactionMarkdown(DB_PATH, 'Iron Guard')
    expect(md).toContain('- Heavy Armour')
  })
})

describe('generateAllMarkdown', () => {
  it('creates per-faction markdown files', () => {
    const result = generateAllMarkdown(DB_PATH, MD_DIR)
    expect(result.factionCount).toBe(2)
    expect(existsSync(join(MD_DIR, 'iron-guard.md'))).toBe(true)
    expect(existsSync(join(MD_DIR, 'star-knights.md'))).toBe(true)
  })

  it('creates INDEX.md with faction links', () => {
    generateAllMarkdown(DB_PATH, MD_DIR)
    const index = readFileSync(join(MD_DIR, 'INDEX.md'), 'utf-8')
    expect(index).toContain('# BSData 40K Unit Profiles')
    expect(index).toContain('[Iron Guard](./iron-guard.md)')
    expect(index).toContain('[Star Knights](./star-knights.md)')
  })

  it('returns correct file count (factions + INDEX)', () => {
    const result = generateAllMarkdown(DB_PATH, MD_DIR)
    expect(result.fileCount).toBe(3) // 2 factions + INDEX.md
  })
})
