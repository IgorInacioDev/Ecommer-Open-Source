import { NextRequest, NextResponse } from 'next/server'
import { createNocoSession } from '@/app/api/db/session/createNocoSession'
import getClientIP from '@/app/utils/getClientIP'
import { SessionCreateDataType } from '@/app/types/Session'

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as SessionCreateDataType

    if (!body.ip) {
      body.ip = getClientIP(request)
    }

    const created = await createNocoSession(body)
    return NextResponse.json(created, { status: 200 })
  } catch (error) {
    console.error('Erro ao criar sessão:', error)
    return NextResponse.json({ error: 'Erro interno ao criar sessão' }, { status: 500 })
  }
}