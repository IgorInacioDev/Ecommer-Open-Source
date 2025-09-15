import { NextRequest, NextResponse } from 'next/server'
import { OrderDataType } from '../../../types/Datas'
import { HyperCashOrderResponseDataType, HyperCashOrderResponseType } from '../../../types/HyperCash'
import { createNocoOrder } from '../../db/createNocoOrder'
import formatOrderHyperCashData from '../../formatData/formatOrderHyperCashData'
import formatNocoOrderHyperCashData from '../../formatData/formatNocoOrderHyperCashData'
import { payloadSchema } from '../blackcat/schemas'
import getClientIP from '@/app/utils/getClientIP'

// --- In-memory guards (best-effort) ---
const RATE_LIMIT_WINDOW_MS = 60_000 // 1 min
const RATE_LIMIT_MAX = 10 // max requests per IP per window
const IDEMPOTENCY_TTL_MS = 10 * 60_000 // 10 min

const rateLimiter = new Map<string, { count: number; windowStart: number }>()
const idempotencyCache = new Map<string, { ts: number; response: any }>()

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const current = rateLimiter.get(ip)
  if (!current) {
    rateLimiter.set(ip, { count: 1, windowStart: now })
    return true
  }
  if (now - current.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateLimiter.set(ip, { count: 1, windowStart: now })
    return true
  }
  current.count += 1
  if (current.count > RATE_LIMIT_MAX) return false
  return true
}

function setIdempotent(key: string, response: any) {
  idempotencyCache.set(key, { ts: Date.now(), response })
}

function getIdempotent(key: string) {
  const entry = idempotencyCache.get(key)
  if (!entry) return null
  if (Date.now() - entry.ts > IDEMPOTENCY_TTL_MS) {
    idempotencyCache.delete(key)
    return null
  }
  return entry.response
}

async function fetchWithRetry(
  url: string,
  init: RequestInit,
  { timeoutMs = 12_000, retries = 2 }: { timeoutMs?: number; retries?: number } = {}
) {
  let lastErr: unknown
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController()
      const t = setTimeout(() => controller.abort(), timeoutMs)
      const res = await fetch(url, { ...init, signal: controller.signal })
      clearTimeout(t)
      if (res.status >= 500 && attempt < retries) {
        await new Promise((r) => setTimeout(r, 300 * (attempt + 1)))
        continue
      }
      return res
    } catch (e) {
      lastErr = e
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, 300 * (attempt + 1)))
        continue
      }
      throw e
    }
  }
  // Should not reach here
  throw lastErr instanceof Error ? lastErr : new Error('Unknown network error')
}

export async function POST(request: NextRequest) {
  try {
    // Rate limit per IP
    const ip = getClientIP(request) || request.headers.get('x-forwarded-for') || 'unknown'
    if (!checkRateLimit(String(ip))) {
      return NextResponse.json({ success: false, error: 'Too many requests' }, { status: 429 })
    }

    // Validação de payload no server
    const raw = await request.json().catch(() => null)
    const parsed = payloadSchema.safeParse(raw)

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request payload',
          issues: parsed.error.format(),
        },
        { status: 400 }
      )
    }

    const { orderData } = parsed.data as { orderData: OrderDataType }

    // Idempotency key
    const idempotencyKey =
      request.headers.get('Idempotency-Key') ||
      (orderData as any)?.externalRef ||
      `${orderData.customer?.document?.number || ''}-${orderData.items?.[0]?.externalRef || ''}`

    if (idempotencyKey) {
      const cached = getIdempotent(idempotencyKey)
      if (cached) {
        return NextResponse.json(cached)
      }
    }

    // Credenciais HyperCash
    const secretKey = process.env.HYPERCASH_SECRET_KEY
    if (!secretKey) {
      return NextResponse.json(
        { success: false, error: 'Configuração do servidor ausente (credenciais HyperCash)' },
        { status: 500 }
      )
    }

    const auth = 'Basic ' + Buffer.from('x:' + secretKey).toString('base64')

    const productsId = orderData.items.map((item) => ({ Id: Number(item.externalRef) }))

    const hyperCashOrderData = formatOrderHyperCashData(orderData)

    const hyperCashResponse = await fetchWithRetry(
      'https://api.hypercashbrasil.com.br/api/user/transactions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          accept: 'application/json',
          Authorization: auth,
        },
        body: JSON.stringify(hyperCashOrderData),
      },
      { timeoutMs: 12_000, retries: 2 }
    )

    if (!hyperCashResponse.ok) {
      const text = await hyperCashResponse.text().catch(() => '')
      return NextResponse.json(
        { success: false, error: `Hyper Cash API error: ${hyperCashResponse.status}`, details: text },
        { status: hyperCashResponse.status }
      )
    }

    const { data }: HyperCashOrderResponseType = await hyperCashResponse.json()
    const hyperCashData: HyperCashOrderResponseDataType = data

    const nocoOrderData = formatNocoOrderHyperCashData(hyperCashData)

    const customerOrderData = {
      name: hyperCashData.customer.name,
      email: hyperCashData.customer.email,
      phone: hyperCashData.customer.phone,
      document_number: hyperCashData.customer.document.number,
      document_type: hyperCashData.customer.document.type.toLowerCase(),
      external_ref: hyperCashData.customer.id.toString(),
    }

    const nocoResult = await createNocoOrder(nocoOrderData, customerOrderData)

    if (!nocoResult.success) {
      return NextResponse.json({ success: false, error: 'Failed to create order in NocoDB' }, { status: 500 })
    }

    const responseBody = { success: true, hyperCashData, nocoOrderId: nocoResult.orderId, productsId }
    if (idempotencyKey) setIdempotent(idempotencyKey, responseBody)
    return NextResponse.json(responseBody)
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || 'Internal Server Error' }, { status: 500 })
  }
}