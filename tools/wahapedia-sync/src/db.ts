import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import Database from 'better-sqlite3'
import { eq, sql } from 'drizzle-orm'
import type {
  Faction,
  Datasheet,
  DatasheetModel,
  DatasheetAbility,
  DatasheetUnitComposition,
  DatasheetWargear,
  DatasheetKeyword,
  DatasheetOption,
  DatasheetModelCost,
  DatasheetStratagem,
  DatasheetEnhancement,
  DatasheetDetachmentAbility,
  DatasheetLeader,
  Ability,
  Stratagem,
  DetachmentAbility,
  Detachment,
  Enhancement,
  SourceEntry,
  ParsedData,
} from './types'

// --- Drizzle schema ---

export const factions = sqliteTable('factions', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  link: text('link').notNull().default(''),
})

export const datasheets = sqliteTable('datasheets', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  faction_id: text('faction_id').notNull(),
  source_id: text('source_id').notNull().default(''),
  role: text('role').notNull().default(''),
  legend: text('legend').notNull().default(''),
  transport: text('transport').notNull().default(''),
  virtual: text('virtual').notNull().default(''),
  loadout: text('loadout').notNull().default(''),
  leader_head: text('leader_head').notNull().default(''),
  leader_footer: text('leader_footer').notNull().default(''),
  damaged_w: text('damaged_w').notNull().default(''),
  damaged_description: text('damaged_description').notNull().default(''),
  link: text('link').notNull().default(''),
})

export const datasheetModels = sqliteTable('datasheet_models', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  datasheet_id: text('datasheet_id').notNull(),
  line: text('line').notNull().default(''),
  name: text('name').notNull(),
  M: text('M').notNull().default(''),
  T: text('T').notNull().default(''),
  Sv: text('Sv').notNull().default(''),
  W: text('W').notNull().default(''),
  Ld: text('Ld').notNull().default(''),
  OC: text('OC').notNull().default(''),
  base_size: text('base_size').notNull().default(''),
  inv_sv: text('inv_sv').notNull().default(''),
  inv_sv_descr: text('inv_sv_descr').notNull().default(''),
  base_size_descr: text('base_size_descr').notNull().default(''),
})

export const abilities = sqliteTable('abilities', {
  rowid: integer('rowid').primaryKey({ autoIncrement: true }),
  id: text('id').notNull(),
  name: text('name').notNull(),
  legend: text('legend').notNull().default(''),
  faction_id: text('faction_id').notNull().default(''),
  description: text('description').notNull().default(''),
})

export const datasheetAbilities = sqliteTable('datasheet_abilities', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  datasheet_id: text('datasheet_id').notNull(),
  line: text('line').notNull().default(''),
  ability_id: text('ability_id').notNull().default(''),
  model: text('model').notNull().default(''),
  name: text('name').notNull().default(''),
  description: text('description').notNull().default(''),
  type: text('type').notNull().default(''),
  parameter: text('parameter').notNull().default(''),
})

export const datasheetUnitComposition = sqliteTable('datasheet_unit_composition', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  datasheet_id: text('datasheet_id').notNull(),
  line: text('line').notNull().default(''),
  description: text('description').notNull().default(''),
})

export const datasheetWargear = sqliteTable('datasheet_wargear', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  datasheet_id: text('datasheet_id').notNull(),
  line: text('line').notNull().default(''),
  line_in_wargear: text('line_in_wargear').notNull().default(''),
  dice: text('dice').notNull().default(''),
  name: text('name').notNull().default(''),
  description: text('description').notNull().default(''),
  range: text('range').notNull().default(''),
  type: text('type').notNull().default(''),
  A: text('A').notNull().default(''),
  BS_WS: text('BS_WS').notNull().default(''),
  S: text('S').notNull().default(''),
  AP: text('AP').notNull().default(''),
  D: text('D').notNull().default(''),
})

export const datasheetKeywords = sqliteTable('datasheet_keywords', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  datasheet_id: text('datasheet_id').notNull(),
  keyword: text('keyword').notNull().default(''),
  model: text('model').notNull().default(''),
  is_faction_keyword: text('is_faction_keyword').notNull().default(''),
})

export const datasheetOptions = sqliteTable('datasheet_options', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  datasheet_id: text('datasheet_id').notNull(),
  line: text('line').notNull().default(''),
  button: text('button').notNull().default(''),
  description: text('description').notNull().default(''),
})

export const datasheetModelsCost = sqliteTable('datasheet_models_cost', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  datasheet_id: text('datasheet_id').notNull(),
  line: text('line').notNull().default(''),
  description: text('description').notNull().default(''),
  cost: text('cost').notNull().default(''),
})

export const datasheetStratagems = sqliteTable('datasheet_stratagems', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  datasheet_id: text('datasheet_id').notNull(),
  stratagem_id: text('stratagem_id').notNull().default(''),
})

export const datasheetEnhancementsTable = sqliteTable('datasheet_enhancements', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  datasheet_id: text('datasheet_id').notNull(),
  enhancement_id: text('enhancement_id').notNull().default(''),
})

export const datasheetDetachmentAbilities = sqliteTable('datasheet_detachment_abilities', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  datasheet_id: text('datasheet_id').notNull(),
  detachment_ability_id: text('detachment_ability_id').notNull().default(''),
})

export const datasheetLeaders = sqliteTable('datasheet_leaders', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  leader_id: text('leader_id').notNull(),
  attached_id: text('attached_id').notNull().default(''),
})

export const stratagems = sqliteTable('stratagems', {
  rowid: integer('rowid').primaryKey({ autoIncrement: true }),
  id: text('id').notNull(),
  name: text('name').notNull(),
  type: text('type').notNull().default(''),
  cp_cost: text('cp_cost').notNull().default(''),
  legend: text('legend').notNull().default(''),
  turn: text('turn').notNull().default(''),
  phase: text('phase').notNull().default(''),
  description: text('description').notNull().default(''),
  faction_id: text('faction_id').notNull().default(''),
  detachment_id: text('detachment_id').notNull().default(''),
  detachment: text('detachment').notNull().default(''),
})

export const detachmentAbilitiesTable = sqliteTable('detachment_abilities', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  legend: text('legend').notNull().default(''),
  faction_id: text('faction_id').notNull().default(''),
  description: text('description').notNull().default(''),
  detachment_id: text('detachment_id').notNull().default(''),
  detachment: text('detachment').notNull().default(''),
})

export const detachments = sqliteTable('detachments', {
  id: text('id').primaryKey(),
  faction_id: text('faction_id').notNull().default(''),
  name: text('name').notNull(),
  legend: text('legend').notNull().default(''),
  type: text('type').notNull().default(''),
})

export const enhancements = sqliteTable('enhancements', {
  rowid: integer('rowid').primaryKey({ autoIncrement: true }),
  id: text('id').notNull(),
  name: text('name').notNull(),
  description: text('description').notNull().default(''),
  faction_id: text('faction_id').notNull().default(''),
  detachment_id: text('detachment_id').notNull().default(''),
  cost: text('cost').notNull().default(''),
  legend: text('legend').notNull().default(''),
  detachment: text('detachment').notNull().default(''),
})

export const sources = sqliteTable('sources', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  type: text('type').notNull().default(''),
  edition: text('edition').notNull().default(''),
  version: text('version').notNull().default(''),
  errata_date: text('errata_date').notNull().default(''),
  errata_link: text('errata_link').notNull().default(''),
})

const schema = {
  factions,
  datasheets,
  datasheetModels,
  abilities,
  datasheetAbilities,
  datasheetUnitComposition,
  datasheetWargear,
  datasheetKeywords,
  datasheetOptions,
  datasheetModelsCost,
  datasheetStratagems,
  datasheetEnhancementsTable,
  datasheetDetachmentAbilities,
  datasheetLeaders,
  stratagems,
  detachmentAbilitiesTable,
  detachments,
  enhancements,
  sources,
}

export type WahapediaDb = ReturnType<typeof createWahapediaDb>

export function createWahapediaDb(dbPath: string) {
  const sqlite = new Database(dbPath)
  sqlite.pragma('journal_mode = WAL')
  sqlite.pragma('foreign_keys = ON')
  return drizzle(sqlite, { schema })
}

export function createTables(dbPath: string): void {
  const sqlite = new Database(dbPath)
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS factions (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      link TEXT NOT NULL DEFAULT ''
    );
    CREATE TABLE IF NOT EXISTS datasheets (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      faction_id TEXT NOT NULL,
      source_id TEXT NOT NULL DEFAULT '',
      role TEXT NOT NULL DEFAULT '',
      legend TEXT NOT NULL DEFAULT '',
      transport TEXT NOT NULL DEFAULT '',
      virtual TEXT NOT NULL DEFAULT '',
      loadout TEXT NOT NULL DEFAULT '',
      leader_head TEXT NOT NULL DEFAULT '',
      leader_footer TEXT NOT NULL DEFAULT '',
      damaged_w TEXT NOT NULL DEFAULT '',
      damaged_description TEXT NOT NULL DEFAULT '',
      link TEXT NOT NULL DEFAULT ''
    );
    CREATE TABLE IF NOT EXISTS datasheet_models (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      datasheet_id TEXT NOT NULL,
      line TEXT NOT NULL DEFAULT '',
      name TEXT NOT NULL,
      M TEXT NOT NULL DEFAULT '',
      T TEXT NOT NULL DEFAULT '',
      Sv TEXT NOT NULL DEFAULT '',
      W TEXT NOT NULL DEFAULT '',
      Ld TEXT NOT NULL DEFAULT '',
      OC TEXT NOT NULL DEFAULT '',
      base_size TEXT NOT NULL DEFAULT '',
      inv_sv TEXT NOT NULL DEFAULT '',
      inv_sv_descr TEXT NOT NULL DEFAULT '',
      base_size_descr TEXT NOT NULL DEFAULT ''
    );
    CREATE TABLE IF NOT EXISTS abilities (
      rowid INTEGER PRIMARY KEY AUTOINCREMENT,
      id TEXT NOT NULL,
      name TEXT NOT NULL,
      legend TEXT NOT NULL DEFAULT '',
      faction_id TEXT NOT NULL DEFAULT '',
      description TEXT NOT NULL DEFAULT ''
    );
    CREATE TABLE IF NOT EXISTS datasheet_abilities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      datasheet_id TEXT NOT NULL,
      line TEXT NOT NULL DEFAULT '',
      ability_id TEXT NOT NULL DEFAULT '',
      model TEXT NOT NULL DEFAULT '',
      name TEXT NOT NULL DEFAULT '',
      description TEXT NOT NULL DEFAULT '',
      type TEXT NOT NULL DEFAULT '',
      parameter TEXT NOT NULL DEFAULT ''
    );
    CREATE TABLE IF NOT EXISTS datasheet_unit_composition (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      datasheet_id TEXT NOT NULL,
      line TEXT NOT NULL DEFAULT '',
      description TEXT NOT NULL DEFAULT ''
    );
    CREATE TABLE IF NOT EXISTS datasheet_wargear (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      datasheet_id TEXT NOT NULL,
      line TEXT NOT NULL DEFAULT '',
      line_in_wargear TEXT NOT NULL DEFAULT '',
      dice TEXT NOT NULL DEFAULT '',
      name TEXT NOT NULL DEFAULT '',
      description TEXT NOT NULL DEFAULT '',
      range TEXT NOT NULL DEFAULT '',
      type TEXT NOT NULL DEFAULT '',
      A TEXT NOT NULL DEFAULT '',
      BS_WS TEXT NOT NULL DEFAULT '',
      S TEXT NOT NULL DEFAULT '',
      AP TEXT NOT NULL DEFAULT '',
      D TEXT NOT NULL DEFAULT ''
    );
    CREATE TABLE IF NOT EXISTS datasheet_keywords (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      datasheet_id TEXT NOT NULL,
      keyword TEXT NOT NULL DEFAULT '',
      model TEXT NOT NULL DEFAULT '',
      is_faction_keyword TEXT NOT NULL DEFAULT ''
    );
    CREATE TABLE IF NOT EXISTS datasheet_options (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      datasheet_id TEXT NOT NULL,
      line TEXT NOT NULL DEFAULT '',
      button TEXT NOT NULL DEFAULT '',
      description TEXT NOT NULL DEFAULT ''
    );
    CREATE TABLE IF NOT EXISTS datasheet_models_cost (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      datasheet_id TEXT NOT NULL,
      line TEXT NOT NULL DEFAULT '',
      description TEXT NOT NULL DEFAULT '',
      cost TEXT NOT NULL DEFAULT ''
    );
    CREATE TABLE IF NOT EXISTS datasheet_stratagems (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      datasheet_id TEXT NOT NULL,
      stratagem_id TEXT NOT NULL DEFAULT ''
    );
    CREATE TABLE IF NOT EXISTS datasheet_enhancements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      datasheet_id TEXT NOT NULL,
      enhancement_id TEXT NOT NULL DEFAULT ''
    );
    CREATE TABLE IF NOT EXISTS datasheet_detachment_abilities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      datasheet_id TEXT NOT NULL,
      detachment_ability_id TEXT NOT NULL DEFAULT ''
    );
    CREATE TABLE IF NOT EXISTS datasheet_leaders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      leader_id TEXT NOT NULL,
      attached_id TEXT NOT NULL DEFAULT ''
    );
    CREATE TABLE IF NOT EXISTS stratagems (
      rowid INTEGER PRIMARY KEY AUTOINCREMENT,
      id TEXT NOT NULL,
      name TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT '',
      cp_cost TEXT NOT NULL DEFAULT '',
      legend TEXT NOT NULL DEFAULT '',
      turn TEXT NOT NULL DEFAULT '',
      phase TEXT NOT NULL DEFAULT '',
      description TEXT NOT NULL DEFAULT '',
      faction_id TEXT NOT NULL DEFAULT '',
      detachment_id TEXT NOT NULL DEFAULT '',
      detachment TEXT NOT NULL DEFAULT ''
    );
    CREATE TABLE IF NOT EXISTS detachment_abilities (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      legend TEXT NOT NULL DEFAULT '',
      faction_id TEXT NOT NULL DEFAULT '',
      description TEXT NOT NULL DEFAULT '',
      detachment_id TEXT NOT NULL DEFAULT '',
      detachment TEXT NOT NULL DEFAULT ''
    );
    CREATE TABLE IF NOT EXISTS detachments (
      id TEXT PRIMARY KEY,
      faction_id TEXT NOT NULL DEFAULT '',
      name TEXT NOT NULL,
      legend TEXT NOT NULL DEFAULT '',
      type TEXT NOT NULL DEFAULT ''
    );
    CREATE TABLE IF NOT EXISTS enhancements (
      rowid INTEGER PRIMARY KEY AUTOINCREMENT,
      id TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      faction_id TEXT NOT NULL DEFAULT '',
      detachment_id TEXT NOT NULL DEFAULT '',
      cost TEXT NOT NULL DEFAULT '',
      legend TEXT NOT NULL DEFAULT '',
      detachment TEXT NOT NULL DEFAULT ''
    );
    CREATE TABLE IF NOT EXISTS sources (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT '',
      edition TEXT NOT NULL DEFAULT '',
      version TEXT NOT NULL DEFAULT '',
      errata_date TEXT NOT NULL DEFAULT '',
      errata_link TEXT NOT NULL DEFAULT ''
    );

    CREATE INDEX IF NOT EXISTS idx_datasheets_faction ON datasheets(faction_id);
    CREATE INDEX IF NOT EXISTS idx_datasheet_models_ds ON datasheet_models(datasheet_id);
    CREATE INDEX IF NOT EXISTS idx_datasheet_abilities_ds ON datasheet_abilities(datasheet_id);
    CREATE INDEX IF NOT EXISTS idx_datasheet_uc_ds ON datasheet_unit_composition(datasheet_id);
    CREATE INDEX IF NOT EXISTS idx_datasheet_wargear_ds ON datasheet_wargear(datasheet_id);
    CREATE INDEX IF NOT EXISTS idx_datasheet_keywords_ds ON datasheet_keywords(datasheet_id);
    CREATE INDEX IF NOT EXISTS idx_datasheet_options_ds ON datasheet_options(datasheet_id);
    CREATE INDEX IF NOT EXISTS idx_datasheet_models_cost_ds ON datasheet_models_cost(datasheet_id);
    CREATE INDEX IF NOT EXISTS idx_datasheet_stratagems_ds ON datasheet_stratagems(datasheet_id);
    CREATE INDEX IF NOT EXISTS idx_datasheet_enhancements_ds ON datasheet_enhancements(datasheet_id);
    CREATE INDEX IF NOT EXISTS idx_datasheet_detachment_abilities_ds ON datasheet_detachment_abilities(datasheet_id);
    CREATE INDEX IF NOT EXISTS idx_datasheet_leaders_leader ON datasheet_leaders(leader_id);
    CREATE INDEX IF NOT EXISTS idx_abilities_id ON abilities(id);
    CREATE INDEX IF NOT EXISTS idx_abilities_faction ON abilities(faction_id);
    CREATE INDEX IF NOT EXISTS idx_stratagems_id ON stratagems(id);
    CREATE INDEX IF NOT EXISTS idx_stratagems_faction ON stratagems(faction_id);
    CREATE INDEX IF NOT EXISTS idx_detachment_abilities_faction ON detachment_abilities(faction_id);
    CREATE INDEX IF NOT EXISTS idx_detachments_faction ON detachments(faction_id);
    CREATE INDEX IF NOT EXISTS idx_enhancements_id ON enhancements(id);
    CREATE INDEX IF NOT EXISTS idx_enhancements_faction ON enhancements(faction_id);
  `)
  sqlite.close()
}

/**
 * Drop all rows and re-insert from parsed data.
 * Uses a transaction for atomicity.
 */
export function importData(dbPath: string, data: ParsedData): void {
  const sqlite = new Database(dbPath)
  sqlite.pragma('journal_mode = WAL')

  const tables = [
    'factions', 'datasheets', 'datasheet_models', 'abilities',
    'datasheet_abilities', 'datasheet_unit_composition', 'datasheet_wargear',
    'datasheet_keywords', 'datasheet_options', 'datasheet_models_cost',
    'datasheet_stratagems', 'datasheet_enhancements', 'datasheet_detachment_abilities',
    'datasheet_leaders', 'stratagems', 'detachment_abilities', 'detachments',
    'enhancements', 'sources',
  ]

  const insertMany = sqlite.transaction(() => {
    // Drop all rows
    for (const table of tables) {
      sqlite.exec(`DELETE FROM ${table}`)
    }

    // Insert factions
    const insertFaction = sqlite.prepare(
      'INSERT INTO factions (id, name, link) VALUES (?, ?, ?)',
    )
    for (const row of data.factions) {
      insertFaction.run(row.id, row.name, row.link ?? '')
    }

    // Insert datasheets
    const insertDatasheet = sqlite.prepare(
      'INSERT INTO datasheets (id, name, faction_id, source_id, role, legend, transport, virtual, loadout, leader_head, leader_footer, damaged_w, damaged_description, link) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    )
    for (const row of data.datasheets) {
      insertDatasheet.run(
        row.id, row.name, row.faction_id, row.source_id ?? '', row.role ?? '',
        row.legend ?? '', row.transport ?? '', row.virtual ?? '',
        row.loadout ?? '', row.leader_head ?? '', row.leader_footer ?? '',
        row.damaged_w ?? '', row.damaged_description ?? '', row.link ?? '',
      )
    }

    // Insert datasheet models
    const insertModel = sqlite.prepare(
      'INSERT INTO datasheet_models (datasheet_id, line, name, M, T, Sv, W, Ld, OC, base_size, inv_sv, inv_sv_descr, base_size_descr) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    )
    for (const row of data.datasheetModels) {
      insertModel.run(
        row.datasheet_id, row.line ?? '', row.name, row.M ?? '', row.T ?? '',
        row.Sv ?? '', row.W ?? '', row.Ld ?? '', row.OC ?? '',
        row.base_size ?? '', row.inv_sv ?? '', row.inv_sv_descr ?? '',
        row.base_size_descr ?? '',
      )
    }

    // Insert abilities
    const insertAbility = sqlite.prepare(
      'INSERT INTO abilities (id, name, legend, faction_id, description) VALUES (?, ?, ?, ?, ?)',
    )
    for (const row of data.abilities) {
      insertAbility.run(
        row.id, row.name, row.legend ?? '', row.faction_id ?? '',
        row.description ?? '',
      )
    }

    // Insert datasheet abilities
    const insertDsAbility = sqlite.prepare(
      'INSERT INTO datasheet_abilities (datasheet_id, line, ability_id, model, name, description, type, parameter) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    )
    for (const row of data.datasheetAbilities) {
      insertDsAbility.run(
        row.datasheet_id, row.line ?? '', row.ability_id ?? '',
        row.model ?? '', row.name ?? '', row.description ?? '',
        row.type ?? '', row.parameter ?? '',
      )
    }

    // Insert datasheet unit composition
    const insertUc = sqlite.prepare(
      'INSERT INTO datasheet_unit_composition (datasheet_id, line, description) VALUES (?, ?, ?)',
    )
    for (const row of data.datasheetUnitComposition) {
      insertUc.run(row.datasheet_id, row.line ?? '', row.description ?? '')
    }

    // Insert datasheet wargear
    const insertDsWargear = sqlite.prepare(
      'INSERT INTO datasheet_wargear (datasheet_id, line, line_in_wargear, dice, name, description, range, type, A, BS_WS, S, AP, D) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    )
    for (const row of data.datasheetWargear) {
      insertDsWargear.run(
        row.datasheet_id, row.line ?? '', row.line_in_wargear ?? '',
        row.dice ?? '', row.name ?? '', row.description ?? '',
        row.range ?? '', row.type ?? '', row.A ?? '', row.BS_WS ?? '',
        row.S ?? '', row.AP ?? '', row.D ?? '',
      )
    }

    // Insert datasheet keywords
    const insertKeyword = sqlite.prepare(
      'INSERT INTO datasheet_keywords (datasheet_id, keyword, model, is_faction_keyword) VALUES (?, ?, ?, ?)',
    )
    for (const row of data.datasheetKeywords) {
      insertKeyword.run(
        row.datasheet_id, row.keyword ?? '', row.model ?? '',
        row.is_faction_keyword ?? '',
      )
    }

    // Insert datasheet options
    const insertOption = sqlite.prepare(
      'INSERT INTO datasheet_options (datasheet_id, line, button, description) VALUES (?, ?, ?, ?)',
    )
    for (const row of data.datasheetOptions) {
      insertOption.run(
        row.datasheet_id, row.line ?? '', row.button ?? '',
        row.description ?? '',
      )
    }

    // Insert datasheet models cost
    const insertModelCost = sqlite.prepare(
      'INSERT INTO datasheet_models_cost (datasheet_id, line, description, cost) VALUES (?, ?, ?, ?)',
    )
    for (const row of data.datasheetModelsCost) {
      insertModelCost.run(
        row.datasheet_id, row.line ?? '', row.description ?? '',
        row.cost ?? '',
      )
    }

    // Insert datasheet stratagems
    const insertDsStratagem = sqlite.prepare(
      'INSERT INTO datasheet_stratagems (datasheet_id, stratagem_id) VALUES (?, ?)',
    )
    for (const row of data.datasheetStratagems) {
      insertDsStratagem.run(row.datasheet_id, row.stratagem_id ?? '')
    }

    // Insert datasheet enhancements
    const insertDsEnhancement = sqlite.prepare(
      'INSERT INTO datasheet_enhancements (datasheet_id, enhancement_id) VALUES (?, ?)',
    )
    for (const row of data.datasheetEnhancements) {
      insertDsEnhancement.run(row.datasheet_id, row.enhancement_id ?? '')
    }

    // Insert datasheet detachment abilities
    const insertDsDetachAbility = sqlite.prepare(
      'INSERT INTO datasheet_detachment_abilities (datasheet_id, detachment_ability_id) VALUES (?, ?)',
    )
    for (const row of data.datasheetDetachmentAbilities) {
      insertDsDetachAbility.run(row.datasheet_id, row.detachment_ability_id ?? '')
    }

    // Insert datasheet leaders
    const insertLeader = sqlite.prepare(
      'INSERT INTO datasheet_leaders (leader_id, attached_id) VALUES (?, ?)',
    )
    for (const row of data.datasheetLeaders) {
      insertLeader.run(row.leader_id, row.attached_id ?? '')
    }

    // Insert stratagems
    const insertStrat = sqlite.prepare(
      'INSERT INTO stratagems (id, name, type, cp_cost, legend, turn, phase, description, faction_id, detachment_id, detachment) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    )
    for (const row of data.stratagems) {
      insertStrat.run(
        row.id, row.name, row.type ?? '', row.cp_cost ?? '', row.legend ?? '',
        row.turn ?? '', row.phase ?? '', row.description ?? '',
        row.faction_id ?? '', row.detachment_id ?? '', row.detachment ?? '',
      )
    }

    // Insert detachment abilities
    const insertDetach = sqlite.prepare(
      'INSERT INTO detachment_abilities (id, name, legend, faction_id, description, detachment_id, detachment) VALUES (?, ?, ?, ?, ?, ?, ?)',
    )
    for (const row of data.detachmentAbilities) {
      insertDetach.run(
        row.id, row.name, row.legend ?? '', row.faction_id ?? '',
        row.description ?? '', row.detachment_id ?? '', row.detachment ?? '',
      )
    }

    // Insert detachments
    const insertDetachment = sqlite.prepare(
      'INSERT INTO detachments (id, faction_id, name, legend, type) VALUES (?, ?, ?, ?, ?)',
    )
    for (const row of data.detachments) {
      insertDetachment.run(
        row.id, row.faction_id ?? '', row.name, row.legend ?? '', row.type ?? '',
      )
    }

    // Insert enhancements
    const insertEnh = sqlite.prepare(
      'INSERT INTO enhancements (id, name, description, faction_id, detachment_id, cost, legend, detachment) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    )
    for (const row of data.enhancements) {
      insertEnh.run(
        row.id, row.name, row.description ?? '', row.faction_id ?? '',
        row.detachment_id ?? '', row.cost ?? '', row.legend ?? '',
        row.detachment ?? '',
      )
    }

    // Insert sources
    const insertSource = sqlite.prepare(
      'INSERT INTO sources (id, name, type, edition, version, errata_date, errata_link) VALUES (?, ?, ?, ?, ?, ?, ?)',
    )
    for (const row of data.sources) {
      insertSource.run(
        row.id, row.name, row.type ?? '', row.edition ?? '',
        row.version ?? '', row.errata_date ?? '', row.errata_link ?? '',
      )
    }
  })

  insertMany()
  sqlite.close()
}

/**
 * Query helpers for reading data back out.
 */
export function getFactions(dbPath: string): Faction[] {
  const sqlite = new Database(dbPath, { readonly: true })
  const rows = sqlite.prepare('SELECT * FROM factions ORDER BY name').all() as Faction[]
  sqlite.close()
  return rows
}

export function getDatasheetsByFaction(dbPath: string, factionId: string): Datasheet[] {
  const sqlite = new Database(dbPath, { readonly: true })
  const rows = sqlite
    .prepare('SELECT * FROM datasheets WHERE faction_id = ? ORDER BY name')
    .all(factionId) as Datasheet[]
  sqlite.close()
  return rows
}

export function getModelsForDatasheet(dbPath: string, datasheetId: string): DatasheetModel[] {
  const sqlite = new Database(dbPath, { readonly: true })
  const rows = sqlite
    .prepare('SELECT * FROM datasheet_models WHERE datasheet_id = ? ORDER BY line')
    .all(datasheetId) as DatasheetModel[]
  sqlite.close()
  return rows
}

export function getAbilitiesForDatasheet(
  dbPath: string,
  datasheetId: string,
): DatasheetAbility[] {
  const sqlite = new Database(dbPath, { readonly: true })
  const rows = sqlite
    .prepare('SELECT * FROM datasheet_abilities WHERE datasheet_id = ? ORDER BY line')
    .all(datasheetId) as DatasheetAbility[]
  sqlite.close()
  return rows
}

export function getWargearForDatasheet(
  dbPath: string,
  datasheetId: string,
): DatasheetWargear[] {
  const sqlite = new Database(dbPath, { readonly: true })
  const rows = sqlite
    .prepare('SELECT * FROM datasheet_wargear WHERE datasheet_id = ? ORDER BY line')
    .all(datasheetId) as DatasheetWargear[]
  sqlite.close()
  return rows
}

export function getStratagemsByFaction(dbPath: string, factionId: string): Stratagem[] {
  const sqlite = new Database(dbPath, { readonly: true })
  const rows = sqlite
    .prepare('SELECT * FROM stratagems WHERE faction_id = ? ORDER BY name')
    .all(factionId) as Stratagem[]
  sqlite.close()
  return rows
}

export function getEnhancementsByFaction(dbPath: string, factionId: string): Enhancement[] {
  const sqlite = new Database(dbPath, { readonly: true })
  const rows = sqlite
    .prepare('SELECT * FROM enhancements WHERE faction_id = ? ORDER BY name')
    .all(factionId) as Enhancement[]
  sqlite.close()
  return rows
}
