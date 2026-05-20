// Upstash Redis cache layer
// In production: import { Redis } from '@upstash/redis'
// and set VITE_UPSTASH_REDIS_URL + VITE_UPSTASH_REDIS_TOKEN

type CacheValue = string | number | boolean | object | null

class MockRedisClient {
  private store = new Map<string, { value: CacheValue; expiresAt: number | null }>()

  async get<T = CacheValue>(key: string): Promise<T | null> {
    const entry = this.store.get(key)
    if (!entry) return null
    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this.store.delete(key)
      return null
    }
    return entry.value as T
  }

  async set(key: string, value: CacheValue, options?: { ex?: number }): Promise<void> {
    this.store.set(key, {
      value,
      expiresAt: options?.ex ? Date.now() + options.ex * 1000 : null,
    })
  }

  async del(...keys: string[]): Promise<void> {
    keys.forEach((k) => this.store.delete(k))
  }

  async incr(key: string): Promise<number> {
    const current = (await this.get<number>(key)) ?? 0
    const next = current + 1
    await this.set(key, next)
    return next
  }

  async zadd(key: string, score: number, member: string): Promise<void> {
    const existing = (await this.get<Array<[number, string]>>(key)) ?? []
    const filtered = existing.filter(([, m]) => m !== member)
    filtered.push([score, member])
    await this.set(key, filtered)
  }

  async zrangebyscore(key: string, min: number, max: number): Promise<string[]> {
    const entries = (await this.get<Array<[number, string]>>(key)) ?? []
    return entries
      .filter(([score]) => score >= min && score <= max)
      .sort(([a], [b]) => a - b)
      .map(([, member]) => member)
  }

  async zrem(key: string, member: string): Promise<void> {
    const entries = (await this.get<Array<[number, string]>>(key)) ?? []
    await this.set(key, entries.filter(([, m]) => m !== member))
  }
}

export const redis = new MockRedisClient()

// ─── Cache keys ───────────────────────────────────────────────────────────────

export const CacheKeys = {
  session:          (userId: string)       => `session:${userId}`,
  lawyerStats:      (lawyerId: string)     => `lawyer:${lawyerId}:stats`,
  lawyerQueue:      (lawyerId: string)     => `lawyer:${lawyerId}:queue`,
  platformMetrics:  ()                     => 'platform:metrics',
  affiliateCode:    (code: string)         => `affiliate:${code}`,
  slaActive:        ()                     => 'sla:active',
  rateLimit:        (type: string, id: string) => `ratelimit:${type}:${id}`,
} as const

// ─── TTLs (seconds) ───────────────────────────────────────────────────────────

export const TTL = {
  SESSION:          24 * 3600,
  HOT_DATA:         5  * 60,
  AFFILIATE_LINK:   1  * 3600,
  PLATFORM_METRICS: 60,
} as const

// ─── Rate limiter ──────────────────────────────────────────────────────────────

export async function checkRateLimit(params: {
  key:      string
  limit:    number
  windowSec:number
}): Promise<{ allowed: boolean; remaining: number }> {
  const count = (await redis.get<number>(params.key)) ?? 0

  if (count >= params.limit) {
    return { allowed: false, remaining: 0 }
  }

  const newCount = await redis.incr(params.key)
  if (newCount === 1) {
    await redis.set(params.key, newCount, { ex: params.windowSec })
  }

  return { allowed: true, remaining: params.limit - newCount }
}

export const RATE_LIMITS = {
  consultation_submit:  { limit: 10,  windowSec: 3600     }, // 10/hour per user
  document_generate:    { limit: 20,  windowSec: 86400    }, // 20/day per user
  ai_assist:            { limit: 50,  windowSec: 86400    }, // 50/day per lawyer
  auth_login:           { limit: 5,   windowSec: 900      }, // 5/15min per IP
} as const

// ─── SLA monitoring via sorted set ────────────────────────────────────────────

export async function registerSLADeadline(consultationId: string, deadline: Date): Promise<void> {
  await redis.zadd(CacheKeys.slaActive(), deadline.getTime(), consultationId)
}

export async function getCriticalSLAConsultations(withinHours = 2): Promise<string[]> {
  const now   = Date.now()
  const until = now + withinHours * 3600 * 1000
  return redis.zrangebyscore(CacheKeys.slaActive(), now, until)
}

export async function removeSLADeadline(consultationId: string): Promise<void> {
  await redis.zrem(CacheKeys.slaActive(), consultationId)
}

// ─── Cache invalidation helpers ───────────────────────────────────────────────

export async function invalidateUser(userId: string): Promise<void> {
  await redis.del(CacheKeys.session(userId))
}

export async function invalidateLawyer(lawyerId: string): Promise<void> {
  await redis.del(
    CacheKeys.lawyerStats(lawyerId),
    CacheKeys.lawyerQueue(lawyerId)
  )
}

export async function invalidatePlatformMetrics(): Promise<void> {
  await redis.del(CacheKeys.platformMetrics())
}
