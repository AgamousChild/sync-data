import Database from 'better-sqlite3'
import type { UnitProfile } from './types.js'

export function createTables(dbPath: string): void {
  const sqlite = new Database(dbPath)
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS units (
      id TEXT PRIMARY KEY,
      faction TEXT NOT NULL,
      name TEXT NOT NULL,
      move INTEGER NOT NULL DEFAULT 0,
      toughness INTEGER NOT NULL DEFAULT 0,
      save INTEGER NOT NULL DEFAULT 0,
      wounds INTEGER NOT NULL DEFAULT 1,
      leadership INTEGER NOT NULL DEFAULT 6,
      oc INTEGER NOT NULL DEFAULT 1,
      points INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS weapons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      unit_id TEXT NOT NULL REFERENCES units(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'ranged',
      range_value TEXT NOT NULL DEFAULT '0',
      attacks TEXT NOT NULL DEFAULT '1',
      skill INTEGER NOT NULL DEFAULT 4,
      strength INTEGER NOT NULL DEFAULT 4,
      ap INTEGER NOT NULL DEFAULT 0,
      damage TEXT NOT NULL DEFAULT '1'
    );

    CREATE TABLE IF NOT EXISTS weapon_abilities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      weapon_id INTEGER NOT NULL REFERENCES weapons(id) ON DELETE CASCADE,
      type TEXT NOT NULL,
      value INTEGER
    );

    CREATE TABLE IF NOT EXISTS abilities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      unit_id TEXT NOT NULL REFERENCES units(id) ON DELETE CASCADE,
      name TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_units_faction ON units(faction);
    CREATE INDEX IF NOT EXISTS idx_weapons_unit ON weapons(unit_id);
    CREATE INDEX IF NOT EXISTS idx_weapon_abilities_weapon ON weapon_abilities(weapon_id);
    CREATE INDEX IF NOT EXISTS idx_abilities_unit ON abilities(unit_id);
  `)
  sqlite.close()
}

/**
 * Drop all rows and re-insert from parsed unit profiles.
 * Uses a transaction for atomicity.
 */
export function importData(dbPath: string, units: UnitProfile[]): void {
  const sqlite = new Database(dbPath)
  sqlite.pragma('journal_mode = WAL')
  sqlite.pragma('foreign_keys = ON')

  const insertMany = sqlite.transaction(() => {
    sqlite.exec('DELETE FROM weapon_abilities')
    sqlite.exec('DELETE FROM weapons')
    sqlite.exec('DELETE FROM abilities')
    sqlite.exec('DELETE FROM units')

    const insertUnit = sqlite.prepare(
      'INSERT INTO units (id, faction, name, move, toughness, save, wounds, leadership, oc, points) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    )
    const insertWeapon = sqlite.prepare(
      'INSERT INTO weapons (unit_id, name, type, range_value, attacks, skill, strength, ap, damage) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    )
    const insertWeaponAbility = sqlite.prepare(
      'INSERT INTO weapon_abilities (weapon_id, type, value) VALUES (?, ?, ?)',
    )
    const insertAbility = sqlite.prepare(
      'INSERT INTO abilities (unit_id, name) VALUES (?, ?)',
    )

    for (const unit of units) {
      insertUnit.run(
        unit.id, unit.faction, unit.name, unit.move, unit.toughness,
        unit.save, unit.wounds, unit.leadership, unit.oc, unit.points,
      )

      for (const weapon of unit.weapons) {
        const type = weapon.range === 'melee' ? 'melee' : 'ranged'
        const rangeValue = weapon.range === 'melee' ? 'melee' : String(weapon.range)

        const result = insertWeapon.run(
          unit.id, weapon.name, type, rangeValue,
          String(weapon.attacks), weapon.skill, weapon.strength,
          weapon.ap, String(weapon.damage),
        )

        const weaponId = result.lastInsertRowid
        for (const ability of weapon.abilities) {
          const value = 'value' in ability ? ability.value : null
          insertWeaponAbility.run(weaponId, ability.type, value)
        }
      }

      for (const abilityName of unit.abilities) {
        insertAbility.run(unit.id, abilityName)
      }
    }
  })

  insertMany()
  sqlite.close()
}

// ---- Query helpers ----

export function getFactions(dbPath: string): string[] {
  const sqlite = new Database(dbPath, { readonly: true })
  const rows = sqlite
    .prepare('SELECT DISTINCT faction FROM units ORDER BY faction')
    .all() as Array<{ faction: string }>
  sqlite.close()
  return rows.map((r) => r.faction)
}

export function getUnitsByFaction(dbPath: string, faction: string): UnitProfile[] {
  const sqlite = new Database(dbPath, { readonly: true })

  const unitRows = sqlite
    .prepare('SELECT * FROM units WHERE faction = ? ORDER BY name')
    .all(faction) as Array<{
      id: string; faction: string; name: string; move: number; toughness: number;
      save: number; wounds: number; leadership: number; oc: number; points: number
    }>

  const units: UnitProfile[] = unitRows.map((row) => ({
    id: row.id,
    faction: row.faction,
    name: row.name,
    move: row.move,
    toughness: row.toughness,
    save: row.save,
    wounds: row.wounds,
    leadership: row.leadership,
    oc: row.oc,
    points: row.points,
    weapons: [],
    abilities: [],
  }))

  for (const unit of units) {
    const weaponRows = sqlite
      .prepare('SELECT * FROM weapons WHERE unit_id = ? ORDER BY name')
      .all(unit.id) as Array<{
        id: number; name: string; type: string; range_value: string;
        attacks: string; skill: number; strength: number; ap: number; damage: string
      }>

    unit.weapons = weaponRows.map((w) => {
      const abilityRows = sqlite
        .prepare('SELECT type, value FROM weapon_abilities WHERE weapon_id = ?')
        .all(w.id) as Array<{ type: string; value: number | null }>

      return {
        name: w.name,
        range: w.type === 'melee' ? 'melee' as const : parseInt(w.range_value, 10),
        attacks: /^\d+$/.test(w.attacks) ? parseInt(w.attacks, 10) : w.attacks,
        skill: w.skill,
        strength: w.strength,
        ap: w.ap,
        damage: /^\d+$/.test(w.damage) ? parseInt(w.damage, 10) : w.damage,
        abilities: abilityRows.map((a) =>
          a.value !== null ? { type: a.type, value: a.value } : { type: a.type },
        ) as UnitProfile['weapons'][0]['abilities'],
      }
    })

    const abilityRows = sqlite
      .prepare('SELECT name FROM abilities WHERE unit_id = ? ORDER BY name')
      .all(unit.id) as Array<{ name: string }>
    unit.abilities = abilityRows.map((a) => a.name)
  }

  sqlite.close()
  return units
}

export function getUnitCount(dbPath: string): number {
  const sqlite = new Database(dbPath, { readonly: true })
  const row = sqlite.prepare('SELECT COUNT(*) as count FROM units').get() as { count: number }
  sqlite.close()
  return row.count
}

export function getUnitCountByFaction(dbPath: string, faction: string): number {
  const sqlite = new Database(dbPath, { readonly: true })
  const row = sqlite
    .prepare('SELECT COUNT(*) as count FROM units WHERE faction = ?')
    .get(faction) as { count: number }
  sqlite.close()
  return row.count
}
