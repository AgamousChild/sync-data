# CLAUDE.md — sync-data

> Read SOUL.md first. Every decision here flows from it.

---

## What This Repo Is

sync-data is a companion repo to [tabletop-tools](C:\R\tabletop-tools). It holds local CLI tools
that pull external Warhammer 40K game data into structured, searchable local formats. No deployment.
No server. Just data, on-demand, on your machine.

Each tool has its own `CLAUDE.md` with full spec, architecture, and implementation detail.

---

## Repo Structure

```
sync-data/
  tools/
    gw-sync/             ← scrape GW PDFs → markdown (42 tests)
    wahapedia-sync/      ← Wahapedia CSVs → SQLite + markdown (49 tests)
    bsdata-sync/         ← BSData XML → SQLite + markdown (58 tests)
  .local/                ← output directory (gitignored, created at runtime)
    gw/
      pdfs/              ← downloaded PDF files
      markdown/          ← converted markdown + INDEX.md
      metadata.json      ← SHA-256 hashes, download timestamps
    wahapedia/
      csv/               ← raw downloaded CSVs + Excel spec
      markdown/          ← per-faction markdown + INDEX.md
      data.db            ← SQLite database (12 tables, indexed by faction)
      metadata.json      ← last_update timestamp, per-file row counts
    bsdata/
      data.db            ← SQLite database (4 tables, indexed by faction)
      markdown/          ← per-faction markdown + INDEX.md
      metadata.json      ← commit SHA, per-faction unit counts
```

---

## Tool Registry

| Tool | Tests | Purpose |
|---|---|---|
| gw-sync | 42 | Scrape GW downloads page for 40K PDFs, extract text, convert to markdown |
| wahapedia-sync | 49 | Pull Wahapedia CSVs into local SQLite + per-faction markdown |
| bsdata-sync | 58 | Pull BSData XML catalogs from GitHub into local SQLite + per-faction markdown |

---

## Stack

| Layer | Choice | Reason |
|---|---|---|
| Language | TypeScript | Throughout — no exceptions |
| Runtime | Node.js | Stable, full ecosystem compatibility |
| Test Runner | Vitest | Fast, Vite-native |
| Scraping | Playwright | Headless Chromium — GW's page is a JS SPA (gw-sync) |
| PDF Extraction | unpdf | pdf.js wrapper, no native deps (gw-sync) |
| Database | better-sqlite3 | Local SQLite, fast native bindings (wahapedia-sync) |
| ORM | Drizzle | Type-safe, SQLite-native (wahapedia-sync) |
| Execution | tsx | TypeScript CLI entry points |

---

## Data Boundary Rules

**No GW (Games Workshop) content is ever committed to this repository.**

Downloaded PDFs, extracted text, parsed CSVs, and the SQLite database all live under `.local/`
which is gitignored. The tools fetch this data at runtime and store it locally. Nothing from GW
or Wahapedia ever lands in committed source files.

**What this means in practice:**
- `.local/` is in `.gitignore` — no game data in version control
- PDFs are downloaded, not committed
- CSV data is fetched and imported into a local `.db` file, not committed
- Markdown output is generated locally, not committed

---

## Querying the Data

wahapedia-sync and bsdata-sync both output SQLite databases (`.local/wahapedia/data.db` and
`.local/bsdata/data.db`). Use any standard SQLite client for ad-hoc queries:

- **DB Browser for SQLite** — free GUI, browse and query
- **SQLiteStudio** — lighter weight alternative
- **VS Code SQLite Viewer** — stays in your editor
- **`sqlite3` CLI** — if you prefer the terminal

---

## Rules for Every Session

- Plan before touching anything — understand every layer first.
- No features that aren't needed yet.
- Validate before claiming anything.
- Keep the stack shallow. Don't add layers.
- Stop when it works. Don't polish what doesn't need polishing.

---

## Testing: TDD Required

**Tests are written before the code. No exceptions.**

The workflow for every change:

1. Write the test — define what the code must do
2. Run it — confirm it fails (red)
3. Write the code — make it pass
4. Run it again — confirm it passes (green)
5. Refactor if needed — tests still pass

Tests live next to the code they test (`foo.ts` / `foo.test.ts`).

The specific test file structure for each tool is documented in that tool's own CLAUDE.md.

**Repo total: 149 tests, all passing.**

```bash
# Run tests for a specific tool
cd tools/gw-sync && pnpm test
cd tools/wahapedia-sync && pnpm test
cd tools/bsdata-sync && pnpm test
```

---

## Current Status

All three tools are built and tested:

- **gw-sync** — 42 tests passing, full pipeline: scrape → download → parse → markdown
- **wahapedia-sync** — 49 tests passing, full pipeline: fetch CSVs → SQLite → markdown
- **bsdata-sync** — 58 tests passing, full pipeline: GitHub API → XML parse → SQLite → markdown
