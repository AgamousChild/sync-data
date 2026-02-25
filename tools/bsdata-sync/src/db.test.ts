import { describe, expect, it, beforeEach, afterEach } from 'vitest'
import { existsSync, rmSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { createTables, importData, getFactions, getUnitsByFaction, getUnitCount, getUnitCountByFaction } from './db.js'
import type { UnitProfile } from './types.js'

const TEST_DIR = join(process.cwd(), '.test-tmp-db')
const DB_PATH = join(TEST_DIR, 'test.db')

const SAMPLE_UNITS: UnitProfile[] = [
  {
    id: 'unit-001',
    faction: 'Alpha Legion',
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
    faction: 'Alpha Legion',
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
        abilities: [{ type: 'BLAST' }, { type: 'SUSTAINED_HITS', value: 1 }],
      },
    ],
    abilities: ['Invulnerable Save'],
  },
  {
    id: 'unit-003',
    faction: 'Beta Corps',
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
})

afterEach(() => {
  if (existsSync(TEST_DIR)) rmSync(TEST_DIR, { recursive: true })
})

describe('createTables', () => {
  it('creates the database file', () => {
    expect(existsSync(DB_PATH)).toBe(true)
  })
})

describe('importData', () => {
  it('imports units into the database', () => {
    importData(DB_PATH, SAMPLE_UNITS)
    expect(getUnitCount(DB_PATH)).toBe(3)
  })

  it('full replace on re-import', () => {
    importData(DB_PATH, SAMPLE_UNITS)
    importData(DB_PATH, [SAMPLE_UNITS[0]!])
    expect(getUnitCount(DB_PATH)).toBe(1)
  })
})

describe('getFactions', () => {
  it('returns distinct factions sorted alphabetically', () => {
    importData(DB_PATH, SAMPLE_UNITS)
    const factions = getFactions(DB_PATH)
    expect(factions).toEqual(['Alpha Legion', 'Beta Corps'])
  })
})

describe('getUnitsByFaction', () => {
  it('returns units for a given faction', () => {
    importData(DB_PATH, SAMPLE_UNITS)
    const units = getUnitsByFaction(DB_PATH, 'Alpha Legion')
    expect(units).toHaveLength(2)
    expect(units.map((u) => u.name).sort()).toEqual(['Iron Warrior', 'Storm Hulk'])
  })

  it('returns empty array for unknown faction', () => {
    importData(DB_PATH, SAMPLE_UNITS)
    const units = getUnitsByFaction(DB_PATH, 'Unknown')
    expect(units).toHaveLength(0)
  })

  it('includes weapons with correct stats', () => {
    importData(DB_PATH, SAMPLE_UNITS)
    const units = getUnitsByFaction(DB_PATH, 'Alpha Legion')
    const warrior = units.find((u) => u.name === 'Iron Warrior')!
    expect(warrior.weapons).toHaveLength(2)

    const bolt = warrior.weapons.find((w) => w.name === 'Bolt Launcher')!
    expect(bolt.range).toBe(24)
    expect(bolt.attacks).toBe(2)
    expect(bolt.ap).toBe(-1)
    expect(bolt.abilities).toContainEqual({ type: 'BLAST' })

    const blade = warrior.weapons.find((w) => w.name === 'Combat Blade')!
    expect(blade.range).toBe('melee')
  })

  it('preserves dice notation for attacks and damage', () => {
    importData(DB_PATH, SAMPLE_UNITS)
    const units = getUnitsByFaction(DB_PATH, 'Alpha Legion')
    const hulk = units.find((u) => u.name === 'Storm Hulk')!
    const cannon = hulk.weapons.find((w) => w.name === 'Scatter Cannon')!
    expect(cannon.attacks).toBe('D6')
  })

  it('includes weapon abilities with values', () => {
    importData(DB_PATH, SAMPLE_UNITS)
    const units = getUnitsByFaction(DB_PATH, 'Alpha Legion')
    const hulk = units.find((u) => u.name === 'Storm Hulk')!
    const cannon = hulk.weapons.find((w) => w.name === 'Scatter Cannon')!
    expect(cannon.abilities).toContainEqual({ type: 'SUSTAINED_HITS', value: 1 })
  })

  it('includes unit abilities', () => {
    importData(DB_PATH, SAMPLE_UNITS)
    const units = getUnitsByFaction(DB_PATH, 'Alpha Legion')
    const warrior = units.find((u) => u.name === 'Iron Warrior')!
    expect(warrior.abilities).toContain('Heavy Armour')
  })
})

describe('getUnitCountByFaction', () => {
  it('returns count for a specific faction', () => {
    importData(DB_PATH, SAMPLE_UNITS)
    expect(getUnitCountByFaction(DB_PATH, 'Alpha Legion')).toBe(2)
    expect(getUnitCountByFaction(DB_PATH, 'Beta Corps')).toBe(1)
  })
})
