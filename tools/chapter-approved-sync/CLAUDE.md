# CLAUDE.md — tools/chapter-approved-sync

> Read the root CLAUDE.md for platform-wide conventions.

---

## What This Is

A local CLI tool that parses Chapter Approved 2025 PDFs (already on disk) into markdown.
No scraper, no downloader — just read PDFs → extract text → write markdown. Runs on-demand,
stores output under `.local/chapter-approved/`.

---

## What It Does

1. Reads 8 Chapter Approved 2025 PDFs from `tools/ChapterApproved/`
2. Extracts text from each PDF using `unpdf` (pdf.js wrapper)
3. Converts extracted text to markdown with formatting heuristics
4. Generates `INDEX.md` linking all output files
5. Writes everything to `.local/chapter-approved/markdown/`

---

## Architecture

```
tools/chapter-approved-sync/
  src/
    index.ts              <- CLI entry point: iterate PDFs → extract → markdown → INDEX.md
    parser.ts             <- PDF text extraction (unpdf) + text-to-markdown conversion
    parser.test.ts        <- Tests for markdown conversion, safeFileName, generateIndex, extractPdfText
  package.json
  tsconfig.json
  vitest.config.ts
```

### Output Structure

```
.local/chapter-approved/
  markdown/
    INDEX.md
    primary-missions.md
    challenger-cards.md
    twist-cards.md
    secondary-missions-attacker.md
    secondary-missions-defender.md
    deployment-zones.md
    terrain-layouts.md
    mission-deck-printable-spread.md
```

---

## Data Flow

```
tools/ChapterApproved/*.pdf (8 files, already on disk)
  → parser.ts (unpdf text extraction → markdown heuristics)
  → .local/chapter-approved/markdown/ (8 .md files + INDEX.md)
```

### Key Design Decisions

- **No scraper/downloader**: PDFs are local and static. Just re-parse on each run.
- **No metadata/change detection**: No need — files don't change.
- **All 8 PDFs processed**: Visual-heavy ones (deployment zones, terrain layouts, printable spread) produce sparse markdown. That's fine.
- **Self-contained**: Same pattern as gw-sync. Parser functions copied, not shared.

---

## PDFs

| PDF | Content | Text Quality |
|---|---|---|
| 2025_Primary Missions.pdf | Mission cards with VP conditions | Good |
| 2025_ChallengerCards.pdf | Challenger missions + stratagems | Good |
| 2025_TwistCards.pdf | Battle twist rules | Good |
| 2025_SecondaryMissions_Attacker.pdf | Secondary mission cards (attacker) | Good |
| 2025_SecondaryMissions_Defender.pdf | Secondary mission cards (defender) | Good |
| 2025_DeploymentZones.pdf | Deployment zone diagrams | Poor (mostly visual) |
| 2025_TerrainLayouts.pdf | Terrain layout diagrams | Poor (mostly visual) |
| 2025_MissionDeck_PrintableSpread.pdf | Card images for printing | Empty (images only) |

---

## Dependencies

| Package | Purpose |
|---|---|
| unpdf | PDF text extraction (pdf.js wrapper, no native deps) |
| tsx | TypeScript execution |

---

## Running

```bash
cd tools/chapter-approved-sync && pnpm start
```

---

## Testing

**17 tests** in 1 test file, all passing:

| File | Tests | What it covers |
|---|---|---|
| `parser.test.ts` | 17 | textToMarkdown (8), safeFileName (5), generateIndex (3), extractPdfText (1) |

```bash
cd tools/chapter-approved-sync && pnpm test
```
