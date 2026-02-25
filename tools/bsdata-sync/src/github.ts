import type { GitHubCatalog, RateLimitInfo } from './types.js'

const GITHUB_API = 'https://api.github.com'
const DEFAULT_REPO = 'BSData/wh40k-10e'
const DEFAULT_BRANCH = 'main'

export interface GitHubOptions {
  repo?: string
  branch?: string
}

function parseRateLimitHeaders(headers: Headers): RateLimitInfo {
  return {
    remaining: parseInt(headers.get('x-ratelimit-remaining') ?? '60', 10),
    limit: parseInt(headers.get('x-ratelimit-limit') ?? '60', 10),
    resetAt: new Date(parseInt(headers.get('x-ratelimit-reset') ?? '0', 10) * 1000),
  }
}

/**
 * Fetch the latest commit SHA for the repo's default branch.
 * Used for change detection.
 */
export async function getLatestCommitSha(opts?: GitHubOptions): Promise<{ sha: string; rateLimit: RateLimitInfo }> {
  const repo = opts?.repo ?? DEFAULT_REPO
  const branch = opts?.branch ?? DEFAULT_BRANCH
  const url = `${GITHUB_API}/repos/${repo}/commits/${branch}`

  const res = await fetch(url, {
    headers: { Accept: 'application/vnd.github.v3+json' },
  })

  if (res.status === 403) {
    const rateLimit = parseRateLimitHeaders(res.headers)
    throw new Error(`GitHub rate limit exceeded. Resets at ${rateLimit.resetAt.toISOString()}`)
  }

  if (!res.ok) {
    throw new Error(`Failed to fetch commit SHA: ${res.status} ${res.statusText}`)
  }

  const data = await res.json() as { sha: string }
  return { sha: data.sha, rateLimit: parseRateLimitHeaders(res.headers) }
}

/**
 * List all .cat files in the repo root.
 */
export async function listCatalogFiles(opts?: GitHubOptions): Promise<{ catalogs: GitHubCatalog[]; rateLimit: RateLimitInfo }> {
  const repo = opts?.repo ?? DEFAULT_REPO
  const branch = opts?.branch ?? DEFAULT_BRANCH
  const url = `${GITHUB_API}/repos/${repo}/contents?ref=${branch}`

  const res = await fetch(url, {
    headers: { Accept: 'application/vnd.github.v3+json' },
  })

  if (res.status === 403) {
    const rateLimit = parseRateLimitHeaders(res.headers)
    throw new Error(`GitHub rate limit exceeded. Resets at ${rateLimit.resetAt.toISOString()}`)
  }

  if (!res.ok) {
    throw new Error(`Failed to list repo contents: ${res.status} ${res.statusText}`)
  }

  const items = await res.json() as Array<{ name: string; download_url: string; size: number; sha: string }>
  const rateLimit = parseRateLimitHeaders(res.headers)

  const catalogs: GitHubCatalog[] = items
    .filter((item) => item.name.endsWith('.cat'))
    .map((item) => ({
      name: item.name,
      faction: item.name.replace(/\.cat$/, '').replace(/-/g, ' '),
      downloadUrl: item.download_url,
      size: item.size,
      sha: item.sha,
    }))

  return { catalogs, rateLimit }
}

/**
 * Fetch the raw XML content of a catalog file.
 */
export async function fetchCatalogXml(downloadUrl: string): Promise<string> {
  const res = await fetch(downloadUrl)

  if (res.status === 403) {
    throw new Error('GitHub rate limit exceeded while fetching catalog XML')
  }

  if (!res.ok) {
    throw new Error(`Failed to fetch catalog: ${res.status} ${res.statusText}`)
  }

  return res.text()
}
