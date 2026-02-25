import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { getLatestCommitSha, listCatalogFiles, fetchCatalogXml } from './github.js'

// Mock global fetch
const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

function makeHeaders(remaining = '58', limit = '60', reset = '1700000000') {
  return new Headers({
    'x-ratelimit-remaining': remaining,
    'x-ratelimit-limit': limit,
    'x-ratelimit-reset': reset,
  })
}

beforeEach(() => {
  mockFetch.mockReset()
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('getLatestCommitSha', () => {
  it('returns the commit SHA', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: makeHeaders(),
      json: async () => ({ sha: 'abc123def456' }),
    })

    const { sha } = await getLatestCommitSha()
    expect(sha).toBe('abc123def456')
  })

  it('includes rate limit info', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: makeHeaders('42', '60', '1700000000'),
      json: async () => ({ sha: 'abc123' }),
    })

    const { rateLimit } = await getLatestCommitSha()
    expect(rateLimit.remaining).toBe(42)
    expect(rateLimit.limit).toBe(60)
  })

  it('throws on rate limit (403)', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 403,
      headers: makeHeaders('0', '60', '1700000000'),
    })

    await expect(getLatestCommitSha()).rejects.toThrow('rate limit')
  })

  it('throws on non-OK response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      headers: makeHeaders(),
    })

    await expect(getLatestCommitSha()).rejects.toThrow('404')
  })
})

describe('listCatalogFiles', () => {
  it('returns only .cat files', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: makeHeaders(),
      json: async () => ([
        { name: 'Space-Marines.cat', download_url: 'https://raw.github.com/sm.cat', size: 50000, sha: 'sha1' },
        { name: 'Orks.cat', download_url: 'https://raw.github.com/orks.cat', size: 30000, sha: 'sha2' },
        { name: 'README.md', download_url: 'https://raw.github.com/readme.md', size: 100, sha: 'sha3' },
        { name: 'Warhammer 40,000.gst', download_url: 'https://raw.github.com/wh40k.gst', size: 8000, sha: 'sha4' },
      ]),
    })

    const { catalogs } = await listCatalogFiles()
    expect(catalogs).toHaveLength(2)
    expect(catalogs[0]!.name).toBe('Space-Marines.cat')
    expect(catalogs[1]!.name).toBe('Orks.cat')
  })

  it('converts dashes to spaces in faction name', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: makeHeaders(),
      json: async () => ([
        { name: 'Astra-Militarum.cat', download_url: 'https://example.com/am.cat', size: 40000, sha: 'sha1' },
      ]),
    })

    const { catalogs } = await listCatalogFiles()
    expect(catalogs[0]!.faction).toBe('Astra Militarum')
  })

  it('throws on rate limit (403)', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 403,
      headers: makeHeaders('0'),
    })

    await expect(listCatalogFiles()).rejects.toThrow('rate limit')
  })
})

describe('fetchCatalogXml', () => {
  it('returns the raw XML text', async () => {
    const xml = '<gameSystem id="test">content</gameSystem>'
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: async () => xml,
    })

    const result = await fetchCatalogXml('https://example.com/test.cat')
    expect(result).toBe(xml)
  })

  it('throws on rate limit', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 403,
    })

    await expect(fetchCatalogXml('https://example.com/test.cat')).rejects.toThrow('rate limit')
  })

  it('throws on non-OK response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    })

    await expect(fetchCatalogXml('https://example.com/test.cat')).rejects.toThrow('500')
  })
})
