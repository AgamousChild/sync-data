/** Known Wahapedia CSV file names */
export const CSV_FILES = [
  'Last_update',
  'Factions',
  'Datasheets',
  'Datasheets_models',
  'Datasheets_abilities',
  'Datasheets_unit_composition',
  'Datasheets_wargear',
  'Datasheets_keywords',
  'Datasheets_options',
  'Datasheets_models_cost',
  'Datasheets_stratagems',
  'Datasheets_enhancements',
  'Datasheets_detachment_abilities',
  'Datasheets_leader',
  'Abilities',
  'Stratagems',
  'Detachment_abilities',
  'Detachments',
  'Enhancements',
  'Source',
] as const

export type CsvFileName = (typeof CSV_FILES)[number]

export const WAHAPEDIA_BASE_URL = 'https://wahapedia.ru/wh40k10ed'

/** Shape of each CSV file's rows */
export interface Faction {
  id: string
  name: string
  link: string
}

export interface Datasheet {
  id: string
  name: string
  faction_id: string
  source_id: string
  role: string
  legend: string
  transport: string
  virtual: string
  loadout: string
  leader_head: string
  leader_footer: string
  damaged_w: string
  damaged_description: string
  link: string
}

export interface DatasheetModel {
  datasheet_id: string
  line: string
  name: string
  M: string
  T: string
  Sv: string
  W: string
  Ld: string
  OC: string
  base_size: string
  inv_sv: string
  inv_sv_descr: string
  base_size_descr: string
}

export interface DatasheetAbility {
  datasheet_id: string
  line: string
  ability_id: string
  model: string
  name: string
  description: string
  type: string
  parameter: string
}

export interface DatasheetUnitComposition {
  datasheet_id: string
  line: string
  description: string
}

export interface DatasheetWargear {
  datasheet_id: string
  line: string
  line_in_wargear: string
  dice: string
  name: string
  description: string
  range: string
  type: string
  A: string
  BS_WS: string
  S: string
  AP: string
  D: string
}

export interface DatasheetKeyword {
  datasheet_id: string
  keyword: string
  model: string
  is_faction_keyword: string
}

export interface DatasheetOption {
  datasheet_id: string
  line: string
  button: string
  description: string
}

export interface DatasheetModelCost {
  datasheet_id: string
  line: string
  description: string
  cost: string
}

export interface DatasheetStratagem {
  datasheet_id: string
  stratagem_id: string
}

export interface DatasheetEnhancement {
  datasheet_id: string
  enhancement_id: string
}

export interface DatasheetDetachmentAbility {
  datasheet_id: string
  detachment_ability_id: string
}

export interface DatasheetLeader {
  leader_id: string
  attached_id: string
}

export interface Ability {
  id: string
  name: string
  legend: string
  faction_id: string
  description: string
}

export interface Stratagem {
  id: string
  name: string
  type: string
  cp_cost: string
  legend: string
  turn: string
  phase: string
  description: string
  faction_id: string
  detachment_id: string
  detachment: string
}

export interface DetachmentAbility {
  id: string
  name: string
  legend: string
  faction_id: string
  description: string
  detachment_id: string
  detachment: string
}

export interface Detachment {
  id: string
  faction_id: string
  name: string
  legend: string
  type: string
}

export interface Enhancement {
  id: string
  name: string
  description: string
  faction_id: string
  detachment_id: string
  cost: string
  legend: string
  detachment: string
}

export interface SourceEntry {
  id: string
  name: string
  type: string
  edition: string
  version: string
  errata_date: string
  errata_link: string
}

export interface LastUpdate {
  last_update: string
}

export interface SyncMetadata {
  lastUpdate: string | null
  lastSyncedAt: string | null
  csvFiles: Record<string, { downloadedAt: string; rowCount: number }>
}

export interface ParsedData {
  factions: Faction[]
  datasheets: Datasheet[]
  datasheetModels: DatasheetModel[]
  datasheetAbilities: DatasheetAbility[]
  datasheetUnitComposition: DatasheetUnitComposition[]
  datasheetWargear: DatasheetWargear[]
  datasheetKeywords: DatasheetKeyword[]
  datasheetOptions: DatasheetOption[]
  datasheetModelsCost: DatasheetModelCost[]
  datasheetStratagems: DatasheetStratagem[]
  datasheetEnhancements: DatasheetEnhancement[]
  datasheetDetachmentAbilities: DatasheetDetachmentAbility[]
  datasheetLeaders: DatasheetLeader[]
  abilities: Ability[]
  stratagems: Stratagem[]
  detachmentAbilities: DetachmentAbility[]
  detachments: Detachment[]
  enhancements: Enhancement[]
  sources: SourceEntry[]
}
