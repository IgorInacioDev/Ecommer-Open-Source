import { NextRequest, NextResponse } from 'next/server'
import { BlackCatOrderDataType } from '../../../types/BlackCat'
import { OrderDataType } from '../../../types/Datas'
import { createNocoOrder } from '../../db/createNocoOrder'
import formatNocoOrderBlackCatData from '../../formatData/formatNocoOrderBlackCatData'
import { payloadSchema } from './schemas'
import getClientIP from '@/app/utils/getClientIP'

// --- In-memory guards (best-effort) ---
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 min
const RATE_LIMIT_MAX = 10; // max requests per IP per window
const IDEMPOTENCY_TTL_MS = 10 * 60_000; // 10 min

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

async function fetchWithRetry(url: string, init: RequestInit, { timeoutMs = 12_000, retries = 2 }: { timeoutMs?: number; retries?: number } = {}) {
  let lastErr: unknown
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController()
      const t = setTimeout(() => controller.abort(), timeoutMs)
      const res = await fetch(url, { ...init, signal: controller.signal })
      clearTimeout(t)
      if (res.status >= 500 && attempt < retries) {
        await new Promise(r => setTimeout(r, 300 * (attempt + 1)))
        continue
      }
      return res
    } catch (e) {
      lastErr = e
      if (attempt < retries) {
        await new Promise(r => setTimeout(r, 300 * (attempt + 1)))
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
          issues: parsed.error.format()
        },
        { status: 400 }
      )
    }

    const { orderData } = parsed.data as { orderData: OrderDataType }

    // Idempotency key: prefer header, fall back to externalRef if present
    const idempotencyKey = request.headers.get('Idempotency-Key') || (orderData as any)?.externalRef || `${orderData.customer?.document?.number || ''}-${orderData.items?.[0]?.externalRef || ''}`
    if (idempotencyKey) {
      const cached = getIdempotent(idempotencyKey)
      if (cached) {
        return NextResponse.json(cached)
      }
    }

    // Apenas PIX está disponível no momento

    // PIX / outros métodos (Black Cat)
    const publicKey = process.env.BLACKCAT_PUBLIC_KEY
    const secretKey = process.env.BLACKCAT_SECRET_KEY

    if (!publicKey || !secretKey) {
      return NextResponse.json({ success: false, error: 'Configuração do servidor ausente (credenciais Black Cat)' }, { status: 500 })
    }

    const auth = 'Basic ' + Buffer.from(`${publicKey}:${secretKey}`).toString('base64')

    const productsId = orderData.items.map(item => ({ Id: Number(item.externalRef) }))

    const blackCatResponse = await fetchWithRetry('https://api.blackcatpagamentos.com/v1/transactions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        accept: 'application/json',
        Authorization: auth
      },
      body: JSON.stringify(orderData),
    }, { timeoutMs: 12_000, retries: 2 })

    if (!blackCatResponse.ok) {
      const text = await blackCatResponse.text().catch(() => '')
      return NextResponse.json({ success: false, error: `Black Cat API error: ${blackCatResponse.status}`, details: text }, { status: blackCatResponse.status })
    }

    const blackCatData: BlackCatOrderDataType = await blackCatResponse.json()

    const nocoOrderData = formatNocoOrderBlackCatData(blackCatData)

    const customerOrderData = {
      name: blackCatData.customer.name,
      email: blackCatData.customer.email,
      phone: blackCatData.customer.phone,
      document_number: blackCatData.customer.document.number,
      document_type: blackCatData.customer.document.type,
      external_ref: blackCatData.customer.id.toString(),
    }

    const nocoResult = await createNocoOrder(nocoOrderData, customerOrderData)

    if (!nocoResult.success) {
      return NextResponse.json({ success: false, error: 'Failed to create order in NocoDB' }, { status: 500 })
    }

    const responseBody = { success: true, blackCatData, nocoOrderId: nocoResult.orderId, productsId }
    if (idempotencyKey) setIdempotent(idempotencyKey, responseBody)
    return NextResponse.json(responseBody)
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || 'Internal Server Error' }, { status: 500 })
  }
}