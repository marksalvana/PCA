/**
 * Sliding-window rate limiter, in-memory.
 *
 * Tracks request timestamps per key in a process-local Map. Within a
 * sliding `windowSec` window, allows up to `limit` events; rejects after.
 *
 * Limitations:
 *  - Per-process: in serverless/edge environments each cold instance has
 *    its own bucket. For accurate distributed limiting, swap this with
 *    @upstash/ratelimit + Upstash Redis. Same call shape so the
 *    swap is mechanical.
 *  - In-memory: bucket is gc'd lazily inside check() to avoid a separate
 *    interval timer.
 *
 * Use `keyForUser(userId, scope)` / `keyForIp(ip, email, scope)` so keys
 * are stable and namespaced.
 */

export interface RateLimitOptions {
  /** Max requests allowed within the window. */
  limit: number
  /** Sliding window length in seconds. */
  windowSec: number
}

export interface RateLimitResult {
  ok: boolean
  /** Number of requests still allowed in the current window. */
  remaining: number
  /** Unix-ms when the oldest request in the window will roll off. */
  resetAt: number
}

const buckets = new Map<string, number[]>()

export function checkRateLimit(key: string, opts: RateLimitOptions): RateLimitResult {
  const now = Date.now()
  const windowMs = opts.windowSec * 1000
  const cutoff = now - windowMs

  const arr = (buckets.get(key) ?? []).filter((ts) => ts > cutoff)
  const allowed = arr.length < opts.limit

  if (allowed) arr.push(now)
  buckets.set(key, arr)

  // Lazy cleanup: every ~1000 calls, garbage-collect empty buckets.
  if (Math.random() < 0.001) {
    for (const [k, ts] of buckets.entries()) {
      const filtered = ts.filter((t) => t > cutoff)
      if (filtered.length === 0) buckets.delete(k)
      else buckets.set(k, filtered)
    }
  }

  return {
    ok: allowed,
    remaining: Math.max(0, opts.limit - arr.length),
    resetAt: arr.length > 0 ? arr[0] + windowMs : now + windowMs,
  }
}

export function keyForUser(userId: string, scope: string): string {
  return `u:${userId}:${scope}`
}

export function keyForIp(ip: string | undefined | null, email: string | undefined | null, scope: string): string {
  // Combine IP and email so neither one alone can spam an unauthenticated
  // form. If both are missing, fall back to a shared bucket which will
  // saturate quickly under attack.
  const ipPart = (ip ?? 'no-ip').trim()
  const emailPart = (email ?? 'no-email').trim().toLowerCase()
  return `ip:${ipPart}:${emailPart}:${scope}`
}

/**
 * Format a user-facing rate-limit error message with retry hint.
 */
export function rateLimitError(result: RateLimitResult, what: string): string {
  const retryMs = Math.max(0, result.resetAt - Date.now())
  const retrySec = Math.ceil(retryMs / 1000)
  if (retrySec < 60) {
    return `Too many ${what}. Try again in ${retrySec}s.`
  }
  const retryMin = Math.ceil(retrySec / 60)
  return `Too many ${what}. Try again in about ${retryMin} minute${retryMin === 1 ? '' : 's'}.`
}
