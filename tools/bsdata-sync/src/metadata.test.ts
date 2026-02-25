import { describe, expect, it, beforeEach, afterEach } from 'vitest'
import { mkdirSync, rmSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { loadMetadata, saveMetadata, hasChanged } from './metadata.js'

const TEST_DIR = join(process.cwd(), '.test-tmp-metadata')
const META_PATH = join(TEST_DIR, 'metadata.json')

beforeEach(() => {
  if (existsSync(TEST_DIR)) rmSync(TEST_DIR, { recursive: true })
  mkdirSync(TEST_DIR, { recursive: true })
})

afterEach(() => {
  if (existsSync(TEST_DIR)) rmSync(TEST_DIR, { recursive: true })
})

describe('loadMetadata', () => {
  it('returns default metadata when file does not exist', () => {
    const meta = loadMetadata(META_PATH)
    expect(meta.commitSha).toBeNull()
    expect(meta.lastSyncedAt).toBeNull()
    expect(meta.factions).toEqual({})
  })

  it('returns default metadata for corrupt JSON', () => {
    const { writeFileSync } = require('node:fs')
    writeFileSync(META_PATH, 'not valid json', 'utf-8')
    const meta = loadMetadata(META_PATH)
    expect(meta.commitSha).toBeNull()
  })

  it('loads saved metadata correctly', () => {
    saveMetadata(META_PATH, {
      commitSha: 'abc123',
      lastSyncedAt: '2025-01-01T00:00:00Z',
      factions: { 'Test Faction': { unitCount: 10, syncedAt: '2025-01-01T00:00:00Z' } },
    })
    const meta = loadMetadata(META_PATH)
    expect(meta.commitSha).toBe('abc123')
    expect(meta.factions['Test Faction']!.unitCount).toBe(10)
  })
})

describe('saveMetadata', () => {
  it('creates directory if it does not exist', () => {
    const nestedPath = join(TEST_DIR, 'sub', 'dir', 'metadata.json')
    saveMetadata(nestedPath, {
      commitSha: 'def456',
      lastSyncedAt: null,
      factions: {},
    })
    const meta = loadMetadata(nestedPath)
    expect(meta.commitSha).toBe('def456')
  })
})

describe('hasChanged', () => {
  it('returns true when commit SHA differs', () => {
    const stored = { commitSha: 'old-sha', lastSyncedAt: null, factions: {} }
    expect(hasChanged(stored, 'new-sha')).toBe(true)
  })

  it('returns false when commit SHA matches', () => {
    const stored = { commitSha: 'same-sha', lastSyncedAt: null, factions: {} }
    expect(hasChanged(stored, 'same-sha')).toBe(false)
  })

  it('returns true when stored SHA is null', () => {
    const stored = { commitSha: null, lastSyncedAt: null, factions: {} }
    expect(hasChanged(stored, 'any-sha')).toBe(true)
  })
})
