import { Redis } from '@upstash/redis'

// 创建 Redis 客户端实例
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

// Expiry time options (in seconds)
export const EXPIRY_OPTIONS = {
  '7d': 7 * 24 * 60 * 60,
  '30d': 30 * 24 * 60 * 60,
} as const

export type ExpiryOption = keyof typeof EXPIRY_OPTIONS

export interface ShareData {
  id: string
  title?: string
  dependencies: string
  setupCode: string
  testCases: Array<{
    id: string
    name: string
    code: string
    enabled: boolean
  }>
  results?: unknown[]
  asyncMode?: boolean
  expiryOption: ExpiryOption
  createdAt: string
}

export const SHARE_KEY_PREFIX = 'mitata:share:'

export function getShareKey(id: string): string {
  return `${SHARE_KEY_PREFIX}${id}`
} 