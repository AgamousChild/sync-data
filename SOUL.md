# SOUL

## Why I'm Building This

This is a companion repo to tabletop-tools. It holds the local CLI tools that pull external game data (GW PDFs, Wahapedia CSVs) into structured, searchable local formats. No deployment. No server. Just data, on-demand, on your machine.

The goal is simple: useful, honest, and lean. Nothing more.

Built for myself first. If it works for others, it goes on GitHub — open source, no strings.

---

## What It Does

sync-data contains local CLI tools that fetch and transform external Warhammer 40K game data into usable local formats.

**gw-sync** scrapes the GW Warhammer Community downloads page for 40K PDFs (core rules, balance dataslates, faction packs), downloads them, extracts text, and converts each to markdown.

**wahapedia-sync** pulls Wahapedia's pipe-delimited CSV data into a local SQLite database and generates per-faction markdown reference files.

**bsdata-sync** fetches BSData catalog XML from GitHub, parses unit profiles (stats, weapons, abilities, points), stores them in a local SQLite database, and generates per-faction markdown.

All tools run on-demand, store everything locally, and use change detection to skip redundant work.

---

## How We Build

**Lean by design.** Few layers. A lean database. No bloat. If a feature isn't needed yet, it doesn't exist yet.

**Agile.** Build quickly, ship working pieces, iterate. A thing that works today beats a perfect thing that ships never.

**Evidence over intuition.** Statistics drive decisions — not hunches, not gut feelings, not "probably fine."

**Do one thing well.** No convolution. No feature creep. Each tool does one thing well. gw-sync pulls GW PDFs. wahapedia-sync pulls Wahapedia data. bsdata-sync pulls BSData catalogs. No tool tries to do two things.

**Respect the data.** Output should be clean, structured, and useful. The complexity lives inside; the output stays readable.

**No hoarding.** We don't store what we don't need. Downloaded data stays local and gitignored. The only data we keep is the data that matters.

---

## What Done Looks Like

Done doesn't mean perfect. Done means it works.

Every session ends when the thing we set out to build works — not when every edge case is handled, not when the code is polished to a mirror finish. We stop when it works. We come back when there's a real reason to.

We validate statistically before claiming anything. We add no features we don't need yet. We know exactly what we're solving before we touch anything.

---

## The Stack We Trust

- **TypeScript** throughout — no exceptions
- **Playwright** — headless Chromium for scraping dynamic pages (gw-sync)
- **unpdf** — PDF text extraction, no native deps (gw-sync)
- **better-sqlite3 + Drizzle** — local SQLite with type-safe queries (wahapedia-sync)
- **Vitest** — fast, Vite-native test runner
- **tsx** — TypeScript execution for CLI entry points

---

## Autonomy in the Implementation Phase

When we are in the implementation phase, and everything is operating normally, as intended, or it's a simple process that just needs approval — go ahead with it. Get what you need, get your dependencies, run your tests, fix your mistakes. If you are asking me every step "Do you want to proceed?" you are doing it wrong.

The exception to that rule is system and environmental problems. If a tool is misbehaving, a dependency won't resolve, or something in the environment is broken — stop. Don't continue to try workarounds and quick fixes. Find out what the overall issue is and fix that. For the `C:\R\sync-data` folder and the associated repo, you are authorized to act.

If you are fighting with a system issue and try three different fixes without success, put it on a list and move on. I will check in with you, and you can bring that list to me, and we can work on it together.

---

## The CLAUDE.md Feedback Loop

Every tool in this repo has a CLAUDE.md. These are living documents, not one-time design writeups. After every implementation phase, they get updated to reflect what actually exists.

**The loop:**
```
Plan → Build → Test → Update CLAUDE.md → Next phase
```

**What triggers an update:**
- A phase of implementation completes (scaffold, schema, routers, UI)
- A design decision gets settled during implementation that differs from what was planned
- Something turns out to work differently than the doc describes

**What a CLAUDE.md must contain:**
- What this app is and why it exists — traceable to SOUL.md
- Current state: what's built, what's planned, what's not started
- Actual file structure (real paths, real port numbers)
- Architecture decisions that were made, not just proposed
- Test coverage: what tests exist and what they verify
- Known limitations or design trade-offs

**Alignment check:**
Before closing out a phase, check: does every decision in the CLAUDE.md trace back to a principle in SOUL.md? If a decision exists that doesn't — it either needs a principle behind it, or it shouldn't be there.

The CLAUDE.md files are the connective tissue between what was planned and what was actually built. Keep them honest.

---

## Who I Am

The person building this is **Micah** (he/him). Claude can address him by name.

---

## How Claude and I Work Together

Plan before touching anything. Evaluate the full architecture. Understand every layer. Then — and only then — suggest changes.

Think before acting. Slow down. Consider the whole picture. Make sure any change fits smoothly within what already exists.

No rushing. Smooth and deliberate. Not too fast, not too harsh.

Educated plans only. No jumping into code without a well-thought-out implementation plan.

Efficiency over speed. Solve problems the right way, not the quick way.
