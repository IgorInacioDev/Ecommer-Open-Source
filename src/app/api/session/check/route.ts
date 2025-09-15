import { NextRequest, NextResponse } from 'next/server'
import { checkExistingSessionByIP } from '@/app/api/db/session/checkExistingSessionByIP'
import getClientIP from '@/app/utils/getClientIP'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    let ip = searchParams.get('ip') || ''

    if (!ip) {
      ip = getClientIP(request)
    }

    if (!ip) {
      return NextResponse.json({ error: 'IP não informado' }, { status: 400 })
    }

    const { count } = await checkExistingSessionByIP(ip)

    return NextResponse.json({ count }, { status: 200 })
  } catch (error) {
    console.error('Erro ao verificar sessão por IP:', error)
    return NextResponse.json({ error: 'Erro interno ao verificar sessão' }, { status: 500 })
  }
}