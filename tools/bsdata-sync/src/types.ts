// ============================================================
// Core game content types (copied from tabletop-tools/packages/game-content)
// ============================================================
// These are platform-defined interfaces. No GW content lives
// here — only shape definitions.
// ============================================================

export interface WeaponProfile {
  name: string
  range: number | 'melee'
  attacks: number | string   // string for dice notation e.g. "D6"
  skill: number              // BS or WS — hit on this value or better
  strength: number
  ap: number                 // negative modifier to armor save
  damage: number | string    // string for dice notation e.g. "D3"
  abilities: WeaponAbility[]
}

export type WeaponAbility =
  | { type: 'SUSTAINED_HITS'; value: number }
  | { type: 'LETHAL_HITS' }
  | { type: 'DEVASTATING_WOUNDS' }
  | { type: 'TORRENT' }
  | { type: 'TWIN_LINKED' }
  | { type: 'BLAST' }
  | { type: 'REROLL_HITS_OF_1' }
  | { type: 'REROLL_HITS' }
  | { type: 'REROLL_WOUNDS' }
  | { type: 'HIT_MOD'; value: number }
  | { type: 'WOUND_MOD'; value: number }

export interface UnitProfile {
  id: string           // stable content ID (e.g. BSData entry ID)
  faction: string      // operator-defined faction string
  name: string         // unit name
  move: number
  toughness: number
  save: number         // armor save value (e.g. 3 means 3+)
  wounds: number
  leadership: number
  oc: number           // objective control
  weapons: WeaponProfile[]
  abilities: string[]  // free-text ability names
  points: number
}

// ============================================================
// GitHub API types
// ============================================================

export interface GitHubCatalog {
  name: string          // e.g. "Astra-Militarum.cat"
  faction: string       // e.g. "Astra Militarum" (name without .cat, dashes to spaces)
  downloadUrl: string   // raw GitHub content URL
  size: number          // bytes
  sha: string           // git blob SHA
}

export interface RateLimitInfo {
  remaining: number
  limit: number
  resetAt: Date
}

// ============================================================
// Sync metadata
// ============================================================

export interface SyncMetadata {
  commitSha: string | null
  lastSyncedAt: string | null
  factions: Record<string, { unitCount: number; syncedAt: string }>
}
