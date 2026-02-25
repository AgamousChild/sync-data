# Plan: Add bsdata-sync tool

## Context

sync-data holds local CLI tools that pull external 40K game data into searchable local formats. Currently has gw-sync (GW PDFs → markdown) and wahapedia-sync (Wahapedia CSVs → SQLite + markdown).

tabletop-tools already has a client-only `data-import` app that fetches BSData XML from GitHub, parses it, and stores unit profiles in IndexedDB. We're building a CLI equivalent that stores into local SQLite — same data, searchable with any SQLite client.

## What bsdata-sync does

1. Hits GitHub API to list `.cat` files from `BSData/wh40k-10e` repo
2. Downloads each catalog's raw XML
3. Parses XML into unit profiles (stats, weapons, abilities, points)
4. Stores everything in a local SQLite database (`.local/bsdata/data.db`)
5. Generates per-faction markdown reference files
6. Saves metadata for change detection (commit SHA or file hashes)

## Key decision: the parser

The BSData XML parser lives in `tabletop-tools/packages/game-content/src/adapters/bsdata/parser.ts`. Since sync-data is a separate repo, we copy the parser and its types into bsdata-sync. It's ~200 lines of self-contained regex-based parsing with no external dependencies.

Files to copy from tabletop-tools:
- `packages/game-content/src/adapters/bsdata/parser.ts` → `tools/bsdata-sync/src/parser.ts`
- `packages/game-content/src/types.ts` → `tools/bsdata-sync/src/types.ts` (UnitProfile, WeaponProfile, WeaponAbility types)

## File structure

```
tools/bsdata-sync/
  src/
    index.ts              ← CLI entry point, orchestrates fetch → parse → store → markdown
    types.ts              ← UnitProfile, WeaponProfile, WeaponAbility + GitHubCatalog, SyncMetadata
    github.ts             ← List catalog files, fetch XML, rate limit handling
    github.test.ts
    parser.ts             ← BSData XML → UnitProfile[] (copied from game-content)
    parser.test.ts        ← (copied + adapted tests)
    db.ts                 ← Drizzle schema, table creation, import, query helpers
    db.test.ts
    markdown.ts           ← Per-faction markdown generation + INDEX.md
    markdown.test.ts
    metadata.ts           ← Load/save metadata, change detection (commit SHA)
    metadata.test.ts
  package.json
  tsconfig.json
  vitest.config.ts
  CLAUDE.md
```

## Output structure

```
.local/bsdata/
  data.db               ← SQLite database (units, weapons, abilities tables)
  markdown/
    INDEX.md            ← Links to all faction files
    space-marines.md    ← Unit stat blocks, weapons, abilities, points
    orks.md
    ...
  metadata.json         ← Last sync commit SHA, per-faction unit counts
```

## SQLite schema

Following wahapedia-sync's pattern (Drizzle schema + raw SQL creation):

- **units** — id, faction, name, move, toughness, save, wounds, leadership, oc, points
- **weapons** — id, unit_id (FK), name, range, attacks, skill, strength, ap, damage, type (ranged/melee)
- **weapon_abilities** — id, weapon_id (FK), type, value
- **abilities** — id, unit_id (FK), name

Indexes on faction, unit_id, weapon_id.

## Dependencies

| Package | Purpose |
|---|---|
| better-sqlite3 | Local SQLite |
| drizzle-orm | Type-safe schema + queries |
| tsx | TypeScript execution |
| vitest | Tests |

No Playwright needed — GitHub API is plain HTTP, no JS rendering.

## Change detection

- Store the repo's latest commit SHA in metadata.json
- On each run, fetch HEAD commit SHA via GitHub API
- If unchanged, skip sync entirely
- Full replace on change (drop + reimport, same as wahapedia-sync)

## Implementation order (TDD)

1. **types.ts** — copy UnitProfile/WeaponProfile/WeaponAbility from game-content, add GitHubCatalog + SyncMetadata
2. **parser.ts + parser.test.ts** — copy from game-content, adapt imports, verify tests pass
3. **github.ts + github.test.ts** — list catalogs, fetch XML, rate limit handling, commit SHA
4. **metadata.ts + metadata.test.ts** — load/save/change detection (follows existing pattern exactly)
5. **db.ts + db.test.ts** — schema, createTables, importData, query helpers (getFactions, getUnitsByFaction, getWeaponsByUnit, etc.)
6. **markdown.ts + markdown.test.ts** — per-faction markdown with stat blocks, weapons, abilities
7. **index.ts** — wire the pipeline together
8. **CLAUDE.md** — document what was built
9. **Update root CLAUDE.md + soul.md** — add bsdata-sync to registry and tool descriptions

## Verification

```bash
cd tools/bsdata-sync && pnpm test        # all tests pass
cd tools/bsdata-sync && pnpm start        # runs full sync, populates .local/bsdata/
# Open .local/bsdata/data.db in DB Browser to verify data
# Check .local/bsdata/markdown/ for generated faction files
```
