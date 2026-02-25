# CLAUDE.md -- tools/bsdata-sync

> Read the root CLAUDE.md for repo-wide conventions.

---

## What This Is

A local CLI tool that syncs BSData's Warhammer 40K 10th Edition catalog data from GitHub
into a local SQLite database and generates per-faction markdown files. Runs on-demand,
stores everything under `.local/bsdata/`. No connection to the deployed platform --
purely a local reference tool.

---

## What It Does

1. Checks the BSData/wh40k-10e repo's latest commit SHA against stored metadata
2. If changed, lists all `.cat` files via GitHub API
3. Fetches each catalog's raw XML
4. Parses XML into unit profiles (stats, weapons, abilities, points) using a stack-based parser
5. Imports all units into a local SQLite database (full replace per sync)
6. Generates per-faction markdown files with stat blocks, weapons, and abilities
7. Saves sync metadata (commit SHA, per-faction unit counts)

---

## Architecture

```
tools/bsdata-sync/
  src/
    index.ts              <- CLI entry point, orchestrates fetch → parse → store → markdown
    types.ts              <- UnitProfile, WeaponProfile, WeaponAbility, GitHubCatalog, SyncMetadata
    github.ts             <- GitHub API: list catalogs, fetch XML, commit SHA, rate limits
    github.test.ts
    parser.ts             <- BSData XML → UnitProfile[] (stack-based, regex extraction)
    parser.test.ts
    db.ts                 <- SQLite schema (4 tables), createTables, importData, query helpers
    db.test.ts
    metadata.ts           <- load/save metadata.json, commit SHA change detection
    metadata.test.ts
    markdown.ts           <- per-faction markdown generation + INDEX.md
    markdown.test.ts
  package.json
  tsconfig.json
  vitest.config.ts
```

### Output Structure

```
.local/bsdata/
  data.db               <- SQLite database (4 tables, indexed by faction)
  markdown/
    INDEX.md            <- links to all faction files
    space-marines.md    <- stat blocks, weapons, abilities, points
    orks.md
    ...
  metadata.json         <- commit SHA, per-faction unit counts
```

---

## Data Flow

```
GitHub API (BSData/wh40k-10e repo)
  → github.ts (list .cat files, fetch raw XML)
  → parser.ts (stack-based XML → UnitProfile[])
  → db.ts (importData → SQLite, full replace in transaction)
  → markdown.ts (generateAllMarkdown → per-faction .md files)
```

### Key Design Decisions

- **GitHub API, not git clone**: Plain HTTP fetches via GitHub's contents API. No git dependency, no local clone.
- **Commit SHA change detection**: Compares HEAD commit SHA against stored metadata. Skips sync if unchanged.
- **Full replace**: Each sync drops all rows and re-inserts. No incremental updates.
- **Stack-based XML parsing**: BSData XML has nested `<selectionEntry>` elements. Regex fails on nesting, so we use a depth-tracking stack to correctly extract top-level entries and strip nested ones.
- **Parser copied from tabletop-tools**: The parser originates from `packages/game-content/src/adapters/bsdata/parser.ts` in the main repo. Copied here since sync-data is a separate repo.
- **Rate limit awareness**: GitHub API responses include rate limit headers. The tool logs remaining requests and throws clearly when limits are hit.

---

## SQLite Schema

4 tables with foreign keys and indexes:

- **units** — id, faction, name, move, toughness, save, wounds, leadership, oc, points
- **weapons** — id, unit_id (FK → units), name, type, range_value, attacks, skill, strength, ap, damage
- **weapon_abilities** — id, weapon_id (FK → weapons), type, value
- **abilities** — id, unit_id (FK → units), name

Indexes: `idx_units_faction`, `idx_weapons_unit`, `idx_weapon_abilities_weapon`, `idx_abilities_unit`

---

## Dependencies

| Package | Purpose |
|---|---|
| better-sqlite3 | Local SQLite database |
| drizzle-orm | Type-safe schema (for future query expansion) |
| tsx | TypeScript execution |

---

## Running

```bash
# From repo root
cd tools/bsdata-sync && pnpm start

# Or directly
cd tools/bsdata-sync && npx tsx src/index.ts
```

Note: Requires internet access for GitHub API. Unauthenticated rate limit is 60 requests/hour.

---

## Testing

**58 tests** across 5 test files, all passing:

| File | Tests | What it covers |
|---|---|---|
| `parser.test.ts` | 18 | XML parsing: units, stats, weapons, abilities, nesting, edge cases |
| `github.test.ts` | 10 | Commit SHA fetch, catalog listing, XML fetch, rate limit handling |
| `metadata.test.ts` | 7 | Load/save metadata, change detection, corrupt file handling |
| `db.test.ts` | 11 | Table creation, import, re-import, factions, units with weapons/abilities |
| `markdown.test.ts` | 12 | Faction headings, stat blocks, weapons, abilities, INDEX.md generation |

```bash
cd tools/bsdata-sync && pnpm test
```
