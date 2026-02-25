# CLAUDE.md -- tools/wahapedia-sync

> Read the root CLAUDE.md for platform-wide conventions.

---

## What This Is

A local CLI tool that syncs Wahapedia's 40K 10th Edition data into a local SQLite database
and generates per-faction markdown files. Runs on-demand, stores everything under `.local/wahapedia/`.
No connection to the deployed platform -- purely a local reference tool.

---

## What It Does

1. Checks Wahapedia's `Last_update.csv` timestamp against stored metadata
2. If changed, downloads all 20 pipe-delimited CSV files (factions, datasheets, models, abilities, wargear, keywords, options, costs, stratagems, enhancements, detachments, leaders, etc.)
3. Downloads the Excel data spec (non-critical, for reference)
4. Parses CSVs with the pipe-delimited parser
5. Imports all data into a local SQLite database (full replace per sync)
6. Generates per-faction markdown files with stat blocks, weapons, abilities, stratagems, and enhancements
7. Saves sync metadata (timestamp, row counts) to skip redundant downloads

---

## Architecture

```
tools/wahapedia-sync/
  src/
    index.ts              <- CLI entry point, orchestrates the full sync pipeline
    types.ts              <- CSV file names (20), row interfaces, ParsedData, SyncMetadata
    csv-parser.ts         <- pipe-delimited CSV parser + HTML stripper
    csv-parser.test.ts
    fetcher.ts            <- fetch CSVs from wahapedia.ru, download Excel spec
    fetcher.test.ts
    metadata.ts           <- load/save metadata.json, change detection
    metadata.test.ts
    db.ts                 <- Drizzle schema (19 tables), createTables, importData, query helpers
    db.test.ts
    markdown.ts           <- per-faction markdown generation + INDEX.md
    markdown.test.ts
  package.json
  tsconfig.json
  vitest.config.ts
```

### Output Structure

```
.local/wahapedia/
  csv/                    <- raw downloaded CSVs + Excel spec
  markdown/
    INDEX.md              <- links to all faction files
    space-marines.md      <- stat blocks, weapons, abilities, stratagems, enhancements
    orks.md
    ...
  data.db                 <- SQLite database (19 tables, indexed by faction/datasheet)
  metadata.json           <- last_update timestamp, per-file row counts
```

---

## CSV Files (20)

| File | Key fields | Notes |
|---|---|---|
| Last_update | last_update | Timestamp for change detection |
| Factions | id, name, link | |
| Datasheets | id, name, faction_id, role, legend, loadout, link | No more cost/unit_composition |
| Datasheets_models | datasheet_id, name, M, T, Sv, W, Ld, OC, inv_sv | Renamed: SV→Sv, LD→Ld, invul_save→inv_sv |
| Datasheets_abilities | datasheet_id, ability_id, name, description, type | Inline name/description/type/parameter |
| Datasheets_unit_composition | datasheet_id, line, description | |
| Datasheets_wargear | datasheet_id, name, range, type, A, BS_WS, S, AP, D | Inline weapon stats (no more wargear_id JOIN) |
| Datasheets_keywords | datasheet_id, keyword, model, is_faction_keyword | New |
| Datasheets_options | datasheet_id, line, button, description | New |
| Datasheets_models_cost | datasheet_id, description, cost | New |
| Datasheets_stratagems | datasheet_id, stratagem_id | New |
| Datasheets_enhancements | datasheet_id, enhancement_id | New |
| Datasheets_detachment_abilities | datasheet_id, detachment_ability_id | New |
| Datasheets_leader | leader_id, attached_id | New |
| Abilities | id, name, legend, faction_id, description | No more type/parameter |
| Stratagems | id, name, type, cp_cost, faction_id, detachment | detachment name string replaces source_id |
| Detachment_abilities | id, name, faction_id, description, detachment | detachment name string replaces type |
| Detachments | id, faction_id, name, legend, type | New |
| Enhancements | id, name, description, faction_id, cost, detachment | legend + detachment name string, no source_id/is_index_key |
| Source | id, name, type, edition, version, errata_date, errata_link | Added version/errata fields |

---

## Data Flow

```
wahapedia.ru CSVs (pipe-delimited)
  → csv-parser.ts (parsePipeCsv)
  → typed ParsedData (19 arrays)
  → db.ts (importData → SQLite 19 tables, full replace in transaction)
  → markdown.ts (generateAllMarkdown → per-faction .md files)
```

### Key Design Decisions

- **Pipe-delimited CSV**: Wahapedia uses `|` as delimiter, not commas. `parsePipeCsv` handles this.
- **HTML in fields**: Ability descriptions contain HTML tags. `stripHtml()` converts to plain text for markdown output.
- **Full replace**: Each sync drops all rows and re-inserts. No incremental updates.
- **Change detection**: Compares `Last_update.csv` timestamp against stored metadata. Skips sync if unchanged.
- **Inline weapon stats**: Weapon stats (range, A, BS_WS, S, AP, D) are inline in `Datasheets_wargear`. No JOIN needed — the old `Wargear_list` table is gone.
- **Inline ability details**: Ability name/description/type are inline in `Datasheets_abilities`. JOIN with `abilities` table is no longer needed for rendering.
- **New tables stored but not rendered**: Keywords, options, costs, detachments, leaders, and junction tables (datasheet_stratagems, datasheet_enhancements, datasheet_detachment_abilities) are imported into SQLite but not yet rendered to markdown.
- **SQLite indexes**: 17 indexes on faction_id and datasheet_id foreign keys for query performance.

---

## Dependencies

| Package | Purpose |
|---|---|
| better-sqlite3 | SQLite driver for local database |
| drizzle-orm | Type-safe schema and query helpers |
| exceljs | Read Excel data spec (optional reference) |
| tsx | TypeScript execution |

---

## Running

```bash
# From repo root
pnpm sync:wahapedia

# Or directly
cd tools/wahapedia-sync && pnpm start
```

---

## Testing

**50 tests** across 5 test files, all passing:

| File | Tests | What it covers |
|---|---|---|
| `csv-parser.test.ts` | 13 | Pipe parsing, header extraction, empty input, HTML stripping |
| `metadata.test.ts` | 8 | Load/save metadata, change detection, missing file handling |
| `fetcher.test.ts` | 7 | CSV fetching, last_update extraction, downloadAllCsvs (20 files), error handling |
| `db.test.ts` | 11 | Table creation (19 tables), data import, re-import replace, all 7 query helpers |
| `markdown.test.ts` | 11 | Faction heading, stat blocks, ranged/melee weapons, inline abilities, stratagems, enhancements, INDEX.md |

```bash
cd tools/wahapedia-sync && pnpm test
```

Note: `db.test.ts` and `markdown.test.ts` require `better-sqlite3` native bindings. If these
fail with a missing package error, run `pnpm install` from the tool directory to trigger the native build.
