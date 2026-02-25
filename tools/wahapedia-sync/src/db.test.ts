import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { mkdtempSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import {
  createTables,
  importData,
  getFactions,
  getDatasheetsByFaction,
  getModelsForDatasheet,
  getAbilitiesForDatasheet,
  getWargearForDatasheet,
  getStratagemsByFaction,
  getEnhancementsByFaction,
} from './db'
import type { ParsedData } from './types'

function emptyData(): ParsedData {
  return {
    factions: [],
    datasheets: [],
    datasheetModels: [],
    datasheetAbilities: [],
    datasheetUnitComposition: [],
    datasheetWargear: [],
    datasheetKeywords: [],
    datasheetOptions: [],
    datasheetModelsCost: [],
    datasheetStratagems: [],
    datasheetEnhancements: [],
    datasheetDetachmentAbilities: [],
    datasheetLeaders: [],
    abilities: [],
    stratagems: [],
    detachmentAbilities: [],
    detachments: [],
    enhancements: [],
    sources: [],
  }
}

function sampleData(): ParsedData {
  return {
    factions: [
      { id: 'SM', name: 'Space Marines', link: '/sm' },
      { id: 'ORK', name: 'Orks', link: '/ork' },
    ],
    datasheets: [
      {
        id: 'ds1', name: 'Intercessors', faction_id: 'SM', source_id: 'src1',
        role: 'Troops', legend: '', transport: '', virtual: '',
        loadout: '', leader_head: '', leader_footer: '',
        damaged_w: '', damaged_description: '', link: '',
      },
      {
        id: 'ds2', name: 'Boyz', faction_id: 'ORK', source_id: 'src1',
        role: 'Troops', legend: '', transport: '', virtual: '',
        loadout: '', leader_head: '', leader_footer: '',
        damaged_w: '', damaged_description: '', link: '',
      },
    ],
    datasheetModels: [
      {
        datasheet_id: 'ds1', line: '1', name: 'Intercessor',
        M: '6"', T: '4', Sv: '3+', W: '2', Ld: '6+', OC: '2',
        base_size: '32mm', inv_sv: '', inv_sv_descr: '', base_size_descr: '',
      },
    ],
    datasheetAbilities: [
      {
        datasheet_id: 'ds1', line: '1', ability_id: 'ab1',
        model: '', name: 'Oath of Moment', description: 'Re-roll hits',
        type: 'Faction', parameter: '',
      },
    ],
    datasheetUnitComposition: [
      { datasheet_id: 'ds1', line: '1', description: '5-10 Intercessors' },
    ],
    datasheetWargear: [
      {
        datasheet_id: 'ds1', line: '1', line_in_wargear: '1', dice: '',
        name: 'Bolt Rifle', description: '', range: '30"', type: 'Ranged',
        A: '2', BS_WS: '3+', S: '4', AP: '-1', D: '1',
      },
    ],
    datasheetKeywords: [
      { datasheet_id: 'ds1', keyword: 'Infantry', model: '', is_faction_keyword: 'false' },
    ],
    datasheetOptions: [
      { datasheet_id: 'ds1', line: '1', button: '', description: 'Any model can take a grenade launcher' },
    ],
    datasheetModelsCost: [
      { datasheet_id: 'ds1', line: '1', description: '5 models', cost: '80' },
    ],
    datasheetStratagems: [
      { datasheet_id: 'ds1', stratagem_id: 'st1' },
    ],
    datasheetEnhancements: [
      { datasheet_id: 'ds1', enhancement_id: 'en1' },
    ],
    datasheetDetachmentAbilities: [
      { datasheet_id: 'ds1', detachment_ability_id: 'da1' },
    ],
    datasheetLeaders: [
      { leader_id: 'ds1', attached_id: 'ds2' },
    ],
    abilities: [
      { id: 'ab1', name: 'Oath of Moment', legend: '', faction_id: 'SM', description: 'Re-roll hits' },
    ],
    stratagems: [
      {
        id: 'st1', name: 'Armour of Contempt', type: 'Battle Tactic', cp_cost: '1',
        legend: '', turn: 'Either', phase: 'Shooting', description: 'Improve AP',
        faction_id: 'SM', detachment_id: '', detachment: '',
      },
    ],
    detachmentAbilities: [
      { id: 'da1', name: 'Gladius Task Force', legend: '', faction_id: 'SM', description: 'Oath bonus', detachment_id: 'det1', detachment: 'Gladius' },
    ],
    detachments: [
      { id: 'det1', faction_id: 'SM', name: 'Gladius Task Force', legend: '', type: '' },
    ],
    enhancements: [
      { id: 'en1', name: 'Artificer Armour', description: '+1W', faction_id: 'SM', detachment_id: 'det1', cost: '10', legend: '', detachment: 'Gladius' },
    ],
    sources: [
      { id: 'src1', name: 'Index', type: 'Index', edition: '10th', version: '', errata_date: '', errata_link: '' },
    ],
  }
}

describe('database', () => {
  let tempDir: string
  let dbPath: string

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'wahapedia-db-'))
    dbPath = join(tempDir, 'data.db')
    createTables(dbPath)
  })

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true })
  })

  describe('createTables', () => {
    it('creates all tables', () => {
      const Database = require('better-sqlite3')
      const db = new Database(dbPath, { readonly: true })
      const tables = db
        .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")
        .all()
        .map((r: { name: string }) => r.name)
        .sort()
      db.close()

      expect(tables).toEqual([
        'abilities',
        'datasheet_abilities',
        'datasheet_detachment_abilities',
        'datasheet_enhancements',
        'datasheet_keywords',
        'datasheet_leaders',
        'datasheet_models',
        'datasheet_models_cost',
        'datasheet_options',
        'datasheet_stratagems',
        'datasheet_unit_composition',
        'datasheet_wargear',
        'datasheets',
        'detachment_abilities',
        'detachments',
        'enhancements',
        'factions',
        'sources',
        'stratagems',
      ])
    })
  })

  describe('importData', () => {
    it('imports all data types', () => {
      importData(dbPath, sampleData())

      expect(getFactions(dbPath)).toHaveLength(2)
      expect(getDatasheetsByFaction(dbPath, 'SM')).toHaveLength(1)
      expect(getDatasheetsByFaction(dbPath, 'ORK')).toHaveLength(1)
      expect(getModelsForDatasheet(dbPath, 'ds1')).toHaveLength(1)
    })

    it('replaces data on re-import', () => {
      importData(dbPath, sampleData())
      expect(getFactions(dbPath)).toHaveLength(2)

      const updated = emptyData()
      updated.factions = [{ id: 'TAU', name: "T'au Empire", link: '/tau' }]
      importData(dbPath, updated)

      const factions = getFactions(dbPath)
      expect(factions).toHaveLength(1)
      expect(factions[0].name).toBe("T'au Empire")
    })

    it('handles empty data', () => {
      importData(dbPath, emptyData())
      expect(getFactions(dbPath)).toHaveLength(0)
    })
  })

  describe('query helpers', () => {
    beforeEach(() => {
      importData(dbPath, sampleData())
    })

    it('getFactions returns all factions sorted by name', () => {
      const factions = getFactions(dbPath)
      expect(factions[0].name).toBe('Orks')
      expect(factions[1].name).toBe('Space Marines')
    })

    it('getDatasheetsByFaction filters by faction', () => {
      const sm = getDatasheetsByFaction(dbPath, 'SM')
      expect(sm).toHaveLength(1)
      expect(sm[0].name).toBe('Intercessors')
    })

    it('getModelsForDatasheet returns model stats', () => {
      const models = getModelsForDatasheet(dbPath, 'ds1')
      expect(models).toHaveLength(1)
      expect(models[0].M).toBe('6"')
      expect(models[0].T).toBe('4')
    })

    it('getAbilitiesForDatasheet returns inline ability details', () => {
      const abs = getAbilitiesForDatasheet(dbPath, 'ds1')
      expect(abs).toHaveLength(1)
      expect(abs[0].name).toBe('Oath of Moment')
      expect(abs[0].description).toBe('Re-roll hits')
    })

    it('getWargearForDatasheet returns inline weapon stats', () => {
      const wg = getWargearForDatasheet(dbPath, 'ds1')
      expect(wg).toHaveLength(1)
      expect(wg[0].name).toBe('Bolt Rifle')
      expect(wg[0].range).toBe('30"')
      expect(wg[0].A).toBe('2')
      expect(wg[0].BS_WS).toBe('3+')
    })

    it('getStratagemsByFaction filters by faction', () => {
      const strats = getStratagemsByFaction(dbPath, 'SM')
      expect(strats).toHaveLength(1)
      expect(strats[0].name).toBe('Armour of Contempt')
    })

    it('getEnhancementsByFaction filters by faction', () => {
      const enhs = getEnhancementsByFaction(dbPath, 'SM')
      expect(enhs).toHaveLength(1)
      expect(enhs[0].name).toBe('Artificer Armour')
    })
  })
})
